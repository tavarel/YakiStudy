#!/usr/bin/env python3
"""Gera audio/*.mp3 e audio/index.js (áudio + pitch accent) para todas as cartas.

Requisitos (uma vez):
  pip install pyopenjtalk-prebuilt "numpy<2" scipy "setuptools<70"   (Python 3.11)
  voz:  git clone https://github.com/icn-lab/htsvoice-tohoku-f01   (CC BY 4.0)
  acentos: https://raw.githubusercontent.com/mifunetoshiro/kanjium/master/data/source_files/raw/accents.txt (CC BY-SA 4.0)
  ffmpeg no PATH

Uso:
  node tools/dump_cards.js > /tmp/cards.json
  python tools/gen_audio.py /tmp/cards.json caminho/tohoku-f01-neutral.htsvoice caminho/accents.txt
"""
import hashlib, json, os, re, subprocess, sys, tempfile
import numpy as np
import pyopenjtalk
from pyopenjtalk import HTSEngine
from scipy.io import wavfile

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'audio')
CACHE = os.environ.get('AUDIO_CACHE', os.path.join(ROOT, 'tools', '.audio_cache'))
PACK_MAX = 600 * 1024
SPEED = 0.92
VER = 'v2'

cards_path, voice_path, accents_path = sys.argv[1:4]
cards = json.load(open(cards_path, encoding='utf8'))
eng = HTSEngine(voice_path.encode())
eng.set_speed(SPEED)
SR = eng.get_sampling_frequency()

def k2h(s):
    return ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c for c in s)

ACC = {}
for line in open(accents_path, encoding='utf8'):
    parts = line.rstrip('\n').split('\t')
    if len(parts) < 3:
        continue
    w, r, a = parts[0], parts[1] or parts[0], parts[2]
    m = re.search(r'\d+', a)
    if m:
        ACC.setdefault(w, []).append((k2h(r), int(m.group())))

def clean(t):
    t = re.sub(r'[〜～〇○]', '', t)
    t = re.sub(r'[（）()・/]', '、', t)
    t = t.replace('A5', 'エーファイブ').replace('&', 'アンド')
    t = re.sub(r'(\d+)g', r'\1グラム', t)
    t = re.sub(r'\s+', '', t)
    t = re.sub(r'、+', '、', t).strip('、')
    return t

def pron(njd):
    return ''.join(n['pron'] for n in njd).replace('’', '')

VOW = {}
for row, v in (('アカサタナハマヤラワガザダバパァャヮ', 'a'), ('イキシチニヒミリギジヂビピィ', 'i'), ('ウクスツヌフムユルグズヅブプゥュヴ', 'u'),
               ('エケセテネヘメレゲゼデベペェ', 'e'), ('オコソトノホモヨロヲゴゾドボポォョ', 'o')):
    for ch in row:
        VOW[ch] = v
LONG = {'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ'}
def canon(s):
    """Normaliza leitura para comparar: katakana, vogais longas viram ー, は/へ/を como ワ/エ/オ."""
    s = ''.join(chr(ord(c) + 0x60) if '\u3041' <= c <= '\u3096' else c for c in s)
    s = s.replace('ヲ', 'オ').replace('ハ', 'ワ').replace('ヘ', 'エ')
    out, prev = [], None
    for c in s:
        if c == 'ー' or (prev and ((c == LONG[prev]) or (c == 'ウ' and prev == 'o') or (c == 'イ' and prev == 'e'))):
            out.append('ー')
            continue
        out.append(c)
        if c in VOW:
            prev = VOW[c]
        elif c not in 'ャュョァィゥェォ':
            prev = None
    return ''.join(out)

def njd_aps(njd):
    aps = []
    for n in njd:
        if n['pos'] == '記号' or n['mora_size'] == 0:
            if n['pos'] == '記号':
                aps.append(None)
            continue
        if n['chain_flag'] == 1 and aps and aps[-1] is not None:
            aps[-1][1] += n['mora_size']
        else:
            aps.append([n['acc'], n['mora_size']])
    return [a for a in aps if a is not None]

def pat(acc, n):
    if acc == 0:
        return 'L' + 'H' * (n - 1) if n > 1 else 'L'
    if acc == 1:
        return 'H' + 'L' * (n - 1)
    return 'L' + 'H' * (acc - 1) + 'L' * (n - acc)

SMALL = set('ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ')
def is_kana(c):
    return 'ぁ' <= c <= 'ゟ' or '゠' <= c <= 'ヿ'
def moras(s):
    out = []
    for c in s:
        if not is_kana(c) or c in '・゠':
            continue
        if c in SMALL and out:
            out[-1] += c
        else:
            out.append(c)
    return out

def label_moras(labels):
    """Lista de (a2, f1, f2) por mora; None = pausa."""
    res = []
    for l in labels:
        p3 = re.search(r'-(.+?)\+', l).group(1)
        if p3 in ('sil', 'pau'):
            res.append(None)
            continue
        a = re.search(r'/A:([\-\d]+)\+(\d+)\+(\d+)', l)
        f = re.search(r'/F:(\d+)_(\d+)', l)
        if p3 in 'aiueoAIUEO' or p3 in ('N', 'cl'):
            res.append((int(a.group(2)), int(f.group(1)), int(f.group(2))))
    return res

def hl(a2, f1, f2):
    if f2 == 0:
        return 'L' if a2 == 1 else 'H'
    if f2 == 1:
        return 'H' if a2 == 1 else 'L'
    return 'L' if a2 == 1 else ('H' if a2 <= f2 else 'L')

def pitch(labels, mora_txt, njd):
    lm = label_moras(labels)
    seq = [x for x in lm if x is not None]
    if len(seq) != len(mora_txt):
        return None
    aps, i = [], 0
    cur = None
    for x in lm:
        if x is None:
            cur = None
            continue
        a2, f1, f2 = x
        if cur is None or a2 == 1:
            cur = [[], '', f2]
            aps.append(cur)
        cur[0].append(mora_txt[i]); cur[1] += hl(a2, f1, f2); i += 1
    na = njd_aps(njd)
    if [len(m) for m, _, _ in aps] == [n for _, n in na]:
        return [['.'.join(m), pat(acc, len(m)), acc] for (m, _, _), (acc, _) in zip(aps, na)]
    return [['.'.join(m), p, acc] for m, p, acc in aps]

DEBUG_IDS = set(os.environ.get('DEBUG', '').split(','))
os.makedirs(OUT, exist_ok=True)
os.makedirs(CACHE, exist_ok=True)
index, used = {}, set()
stats = {'dic': 0, 'est': 0, 'nopitch': 0}
for c in cards:
    plainC, readC = clean(c['plain']), clean(c['reading'])
    if not readC:
        continue
    njd_p, njd_r = pyopenjtalk.run_frontend(plainC), pyopenjtalk.run_frontend(readC)
    if canon(pron(njd_p)) == canon(readC):
        text, njd = plainC, njd_p
    else:
        rm = [''.join(chr(ord(ch) + 0x60) if '\u3041' <= ch <= '\u3096' else ch for ch in m) for m in moras(readC)]
        if sum(n['mora_size'] for n in njd_p) == len(rm) and len(rm):
            # mantém a segmentação/acento do texto em kanji, com a leitura da furigana
            i = 0
            for n in njd_p:
                k = n['mora_size']
                if k:
                    n['pron'] = n['read'] = ''.join(rm[i:i + k]); i += k
            text, njd = plainC + '#' + readC, njd_p
        else:
            text, njd = readC, njd_r
    acc, src = None, 'e'
    if not c.get('kanji'):
        for r, a in ACC.get(c['plain'], []):
            if r == k2h(c['reading']):
                acc = a; break
    if acc is not None and njd and all(n['pos'] != '記号' for n in njd):
        njd[0]['acc'] = acc; njd[0]['chain_flag'] = -1
        for n in njd[1:]:
            n['chain_flag'] = 1
        src = 'd'
    labels = pyopenjtalk.make_label(njd)
    h = hashlib.sha1(f'{text}|{acc}|{VER}|{SPEED}'.encode()).hexdigest()[:10]
    fn = h + '.mp3'
    used.add(fn)
    dst = os.path.join(CACHE, fn)
    if not os.path.exists(dst):
        x = eng.synthesize(labels).astype(np.float64)
        thr = np.abs(x).max() * 0.02
        nz = np.where(np.abs(x) > thr)[0]
        pad = int(SR * 0.06)
        if len(nz):
            x = x[max(0, nz[0] - pad): nz[-1] + pad]
        x = (x / (np.abs(x).max() + 1e-9) * 0.9 * 32767).astype(np.int16)
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tf:
            wavfile.write(tf.name, SR, x)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tf.name, '-ac', '1', '-ar', '24000', '-b:a', '40k', dst], check=True)
        os.unlink(tf.name)
    entry = {'f': fn}
    if not c.get('kanji'):
        mt = moras(readC)
        p = pitch(labels, mt, njd) or pitch(labels, moras(pron(njd)), njd)
        if p:
            entry['p'] = p; entry['s'] = src
            stats['dic' if src == 'd' else 'est'] += 1
        else:
            stats['nopitch'] += 1
    if os.environ.get('DEBUG') and c['id'] in DEBUG_IDS:
        print(c['id'], text, entry.get('p'))
    index[c['id']] = entry

# empacota os mp3 em poucos arquivos (o upload pelo site do GitHub aceita até 100 arquivos por vez)
for f in os.listdir(OUT):
    if f.endswith(('.mp3', '.bin')):
        os.unlink(os.path.join(OUT, f))
groups, order = {}, []
for cid in index:
    g = cid.split(':')[0]
    if g not in groups:
        groups[g] = []; order.append(g)
    groups[g].append(cid)
placed, packs, cur = {}, [], bytearray()
def flush():
    global cur
    if cur:
        packs.append(bytes(cur)); cur = bytearray()
for g in order:
    for cid in groups[g]:
        fn = index[cid].pop('f')
        if fn not in placed:
            data = open(os.path.join(CACHE, fn), 'rb').read()
            if len(cur) + len(data) > PACK_MAX:
                flush()
            placed[fn] = (len(packs), len(cur), len(data))
            cur += data
        k, o, n = placed[fn]
        index[cid].update({'k': k, 'o': o, 'n': n})
flush()
for i, b in enumerate(packs):
    open(os.path.join(OUT, 'p%d.bin' % i), 'wb').write(b)
with open(os.path.join(OUT, 'index.js'), 'w', encoding='utf8') as fp:
    fp.write('/* gerado por tools/gen_audio.py — voz: tohoku-f01 (CC BY 4.0); acentos: OpenJTalk + kanjium (CC BY-SA 4.0). k = pacote audio/p<k>.bin, o/n = posição e tamanho do mp3 */\n')
    fp.write('window.AUDIO_PACKS=%d;\n' % len(packs))
    fp.write('window.AUDIO=' + json.dumps(index, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('cartas:', len(index), 'mp3:', len(placed), 'pacotes:', len(packs), stats)
