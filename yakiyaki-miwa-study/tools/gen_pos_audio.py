#!/usr/bin/env python3
"""Gera audio/pos.bin + audio/pos.js (falas do jogo do caixa). Mesmos requisitos de tools/gen_audio.py.
Uso: node tools/dump_pos.js > pos_clips.json
     python tools/gen_pos_audio.py pos_clips.json caminho/tohoku-f01-neutral.htsvoice
"""
import hashlib, json, os, re, subprocess, sys, tempfile
import numpy as np
import pyopenjtalk
from pyopenjtalk import HTSEngine
from scipy.io import wavfile

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'audio')
CACHE = os.environ.get('AUDIO_CACHE', os.path.join(ROOT, 'tools', '.audio_cache'))
SPEED = 0.95
clips = json.load(open(sys.argv[1], encoding='utf8'))
eng = HTSEngine(sys.argv[2].encode()); eng.set_speed(SPEED)
SR = eng.get_sampling_frequency()

def kata(s):
    return ''.join(chr(ord(c) + 0x60) if 'ぁ' <= c <= 'ゖ' else c for c in s)
def canon(s):
    s = kata(s).replace('ー', '').replace(' ', '').replace('ウ', 'ー').replace('オ', 'ー')
    return s
def pron(njd):
    return ''.join(n['pron'] for n in njd).replace('’', '')
def clean(t):
    t = re.sub(r'[〜～]', 'から', t)
    t = re.sub(r'(\d+)グラム', r'\1グラム', t)
    return t.strip()

os.makedirs(CACHE, exist_ok=True)
index, blob = {}, bytearray()
for c in clips:
    text, kana = clean(c['text']), c['kana']
    njd = pyopenjtalk.run_frontend(text)
    if canon(pron(njd)) != canon(kana):
        njd = pyopenjtalk.run_frontend(kana)
    labels = pyopenjtalk.make_label(njd)
    h = hashlib.sha1(f'pos|{pron(njd)}|{SPEED}'.encode()).hexdigest()[:10]
    fn = os.path.join(CACHE, 'pos_' + h + '.mp3')
    if not os.path.exists(fn):
        x = eng.synthesize(labels).astype(np.float64)
        thr = np.abs(x).max() * 0.02
        nz = np.where(np.abs(x) > thr)[0]
        pad = int(SR * 0.04)
        if len(nz):
            x = x[max(0, nz[0] - pad): nz[-1] + pad]
        x = (x / (np.abs(x).max() + 1e-9) * 0.9 * 32767).astype(np.int16)
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tf:
            wavfile.write(tf.name, SR, x)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tf.name, '-ac', '1', '-ar', '24000', '-b:a', '40k', fn], check=True)
        os.unlink(tf.name)
    data = open(fn, 'rb').read()
    index[c['text']] = [len(blob), len(data)]
    blob += data
open(os.path.join(OUT, 'pos.bin'), 'wb').write(bytes(blob))
with open(os.path.join(OUT, 'pos.js'), 'w', encoding='utf8') as fp:
    fp.write('/* gerado por tools/gen_pos_audio.py — falas do jogo do caixa; [início, tamanho] em audio/pos.bin */\n')
    fp.write('window.POS_AUDIO=' + json.dumps(index, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('clipes:', len(index), 'bytes:', len(blob))
