#!/usr/bin/env python3
"""Audio audit (run in a reel folder after audio.py + mix.py):  python3 audit.py
Prints: mix peak, start/end edges (abrupt cut if the last 50 ms is loud), bed vs voice during speech
(broadband and in the 300 Hz-4 kHz speech band, the one that matters for masking), and SFX onset
times as frames to compare with the picture cues."""
import sys, numpy as np
sys.path.insert(0, '.'); import mix as M
v = M.load('voice.mp3'); n = len(v); mu = M.fit(M.load('music.wav'), n); sx = M.fit(M.load('sfx.wav'), n)
gv = M.gated_rms(v); mu *= 0.5 * gv / M.gated_rms(mu); sx *= 0.25 * gv / M.gated_rms(sx)
sx *= min(1, 0.4 * np.abs(v).max() / np.abs(sx).max())
mix = v + mu + sx; SR = M.SR
print(f"mix peak {M.db(np.abs(mix).max()):.1f} dBFS | last 50 ms peak {M.db(np.abs(mix[-int(.05*SR):]).max()):.1f} dBFS | first 20 ms {M.db(np.abs(mix[:int(.02*SR)]).max()):.1f}")
print(f"music last 0.3 s RMS {M.db(np.sqrt(np.mean(mu[-int(.3*SR):]**2))):.1f} dBFS (abrupt end if high)")
w = int(0.2 * SR); bad = []; diffs = []
for i in range(0, n - w, w // 2):
    rv = np.sqrt(np.mean(v[i:i+w]**2)); rb = np.sqrt(np.mean((mu[i:i+w] + sx[i:i+w])**2))
    if rv > gv * 10 ** (-8/20): diffs.append(M.db(rb) - M.db(rv)); (M.db(rb) > M.db(rv) - 3) and bad.append((round(i/SR, 2), round(M.db(rb) - M.db(rv), 1)))
d = np.array(diffs); print(f"speech windows: {len(d)} | bed vs voice median {np.median(d):.1f} dB, 90th pct {np.percentile(d, 90):.1f} dB, max {d.max():.1f} dB")
print("windows where the bed is within 3 dB of the voice during real speech:", bad)
# SFX onsets (energy jumps) to compare with picture cues
e = np.array([np.sqrt(np.mean(sx[i:i+int(.05*SR)]**2)) for i in range(0, n - int(.05*SR), int(.05*SR))])
on = [round(k * 0.05, 2) for k in range(2, len(e)) if e[k] > 2.5 * (e[k-2] + 1e-5) and M.db(e[k]) > M.db(e.max()) - 24]
print("sfx onsets s:", on); print("   as frames:", [round(t*30) for t in on])
from scipy.signal import butter, sosfilt
sos = butter(4, [300 / (SR / 2), 4000 / (SR / 2)], 'band', output='sos')
vb, bb = sosfilt(sos, v), sosfilt(sos, mu + sx); d2 = []; worst = []
for i in range(0, n - w, w // 2):
    rv = np.sqrt(np.mean(v[i:i+w]**2))
    if rv > gv * 10 ** (-8/20):
        x = M.db(np.sqrt(np.mean(bb[i:i+w]**2))) - M.db(np.sqrt(np.mean(vb[i:i+w]**2))); d2.append(x)
        if x > -6: worst.append((round(i/SR, 1), round(x, 1)))
d2 = np.array(d2); print(f"SPEECH BAND 300-4k: bed vs voice median {np.median(d2):.1f} dB, 90th {np.percentile(d2, 90):.1f}, max {d2.max():.1f}; windows above -6 dB: {worst}")
