# Per-cue SFX test: as mixed (same gains as mix.py), for each cue: speech-band (300 Hz-4 kHz) level of the SFX vs the
# voice in the cue's first 0.5 s, whether the voice is speaking there, and the cue's peak vs the voice peak.
import sys, json, numpy as np
sys.path.insert(0, '.'); import mix as M
from scipy.signal import butter, sosfilt
v = M.load('voice.mp3'); n = len(v); mu = M.fit(M.load('music.wav'), n); sx = M.fit(M.load('sfx.wav'), n); SR = M.SR
gv = M.gated_rms(v); mu *= 0.5 * gv / M.gated_rms(mu); sx *= 0.25 * gv / M.gated_rms(sx); sx *= min(1, 0.4 * np.abs(v).max() / np.abs(sx).max())
sos = butter(4, [300 / (SR / 2), 4000 / (SR / 2)], 'band', output='sos'); vb, sb = sosfilt(sos, v), sosfilt(sos, sx)
rms = lambda x: np.sqrt(np.mean(x ** 2)) + 1e-12
print(f"{'cue':34s} {'frame':>5s} {'voice?':>6s} {'band vs voice':>13s} {'peak/voicepk':>12s}  verdict")
for name, t, fr in json.load(open('work/sfx_cues.json')):
    t = t % (n / SR); i, j = int(t * SR), min(n, int((t + 0.5) * SR))
    if j - i < 100: i, j = 0, int(0.5 * SR)
    speaking = rms(v[i:j]) > gv * 10 ** (-12 / 20)
    d = M.db(rms(sb[i:j])) - M.db(rms(vb[i:j])) if speaking else M.db(rms(sb[i:j])) - M.db(gv)
    pk = np.abs(sx[i:j]).max() / np.abs(v).max()
    ok = (d <= -8 if speaking else d <= -6) and pk <= 0.41
    print(f"{name:34s} {fr:5d} {'yes' if speaking else 'pause':>6s} {d:+10.1f} dB {pk:10.2f}x  {'OK' if ok else 'CHECK'}")
