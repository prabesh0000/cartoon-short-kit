# "God-like" cinematic score + soft SFX for "मञ्जुश्रीको ताल". Writes music.wav + sfx.wav (levels set by mix.py).
import numpy as np, wave
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 32.209
N = int(DUR * SR) + 3 * SR
rng = np.random.default_rng(11)
fs = lambda f: f / 30.0
NY = SR / 2 - 100

def lp(x, fc, o=2): return sosfilt(butter(o, min(fc, NY) / (SR / 2), 'low', output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc / (SR / 2), 'high', output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [max(20, lo) / (SR / 2), min(hi, NY) / (SR / 2)], 'band', output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.005, rel=None, curve=4.0):
    t = tt(d); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(rel or d, 1e-4)); return e
def ar(d, a, r):  # attack / release envelope (sustain 1)
    t = tt(d); return np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)
def P(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[: len(x)] += x
    return o
def place(buf, sig, t, pan=0.0, g=1.0):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i >= buf.shape[1] or len(sig) == 0: return
    j = min(buf.shape[1], i + len(sig)); s = sig[: j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:j] += s * l * 1.414; buf[1, i:j] += s * r * 1.414
def note(m): return 440.0 * 2 ** ((m - 69) / 12)
def noise(d): return rng.standard_normal(int(d * SR))
def saw(freq, d, det=0.0, vib=0.0, vr=5.0):
    t = tt(d); f = freq * (1 + det) * (1 + vib * np.sin(2 * np.pi * vr * t + rng.random() * 6))
    ph = np.cumsum(f) / SR + rng.random(); return 2 * (ph % 1.0) - 1
def sine_sweep(f, d): return np.sin(2 * np.pi * np.cumsum(f) / SR)

# ---------------- instruments ----------------
def sub(d=3.0, f0=60, f1=28):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 3); return sine_sweep(f, d) * env(d, 0.004, d, 3.0)
def taiko(g=1.0, f0=95, d=0.9):
    t = tt(d); f = 52 + (f0 - 52) * np.exp(-t * 18)
    body = sine_sweep(f, d) * env(d, 0.002, d, 6)
    skin = lp(noise(0.08), 900) * env(0.08, 0.001, 0.08, 10) * 0.6
    return P(body, skin) * g
def rim(): return bp(noise(0.06), 1800, 6000) * env(0.06, 0.001, 0.06, 12) * 0.5
def hat(): return hp(noise(0.05), 7000) * env(0.05, 0.001, 0.05, 14) * 0.35
def braam(root=26, chord=(0, 7, 12, 15, 19), d=2.6, bright=2600):
    t = tt(d); x = np.zeros(len(t))
    for c in chord:
        for det in (-0.004, 0.0, 0.005): x += saw(note(root + c), d, det)
    dark, br = lp(x, 260, 2), lp(x, bright, 2)
    k = np.exp(-t * 2.2); y = dark * (1 - k) + br * k
    y = np.tanh(y * 0.6) * env(d, 0.03, d, 2.0); return y / (np.abs(y).max() + 1e-9)
def metal(d=1.6, base=310):
    return sum(np.sin(2 * np.pi * base * r * tt(d)) * env(d, 0.001, d, c) * a for r, a, c in [(1, 1, 4), (1.52, 0.7, 5), (2.37, 0.5, 6), (3.11, 0.35, 8), (4.7, 0.2, 10)]) * 0.3
def hit(scale=1.0, d=3.0):  # cinematic impact
    crack = bp(noise(0.25), 1500, 9000) * env(0.25, 0.001, 0.25, 9) * 0.5
    return P(sub(d) * 1.0, taiko(1.2, 110, 1.2), crack, metal(1.8) * 0.6) * scale
def riser(d, lo=200, hi=4000):
    t = tt(d); u = t / d; n = noise(d); y = np.zeros(len(t)); blk = 2048
    for s in range(0, len(t), blk):
        fc = lo * (hi / lo) ** u[s]; y[s:s + blk] = bp(n[s:s + blk], fc * 0.7, fc * 1.4, 1)
    tones = np.zeros(len(t))
    for k in range(4):  # shepard-like glide
        f = 110 * 2 ** k * 2 ** (u * 1.0); a = np.exp(-((np.log2(f / 440)) ** 2) / 1.2)
        tones += np.sin(2 * np.pi * np.cumsum(f) / SR) * a
    return (y * 0.8 + tones * 0.25) * (u ** 2.2)
def revcym(d):
    t = tt(d); return hp(noise(d), 3500) * (t / d) ** 3 * 0.8
def stac(m, d=0.13):
    x = sum(saw(note(m), d, det) for det in (-0.003, 0, 0.004)) / 3
    return lp(x, 1900) * env(d, 0.004, d, 5)
def trem(ms, d, rate=11.0, a=0.8):
    t = tt(d); x = sum(saw(note(m), d, det, 0.004) for m in ms for det in (-0.002, 0.003))
    return lp(x, 3200) * (0.55 + 0.45 * np.sin(2 * np.pi * rate * t)) * ar(d, a, 0.5) / len(ms)
def pad(ms, d, a=0.8, r=0.8, fc=1500):
    x = sum(saw(note(m), d, det, 0.003) for m in ms for det in (-0.003, 0.0, 0.004))
    return lp(x, fc) * ar(d, a, r) / len(ms)
def choir(ms, d, a=0.7, r=0.9, vowel="ah"):
    F = {"ah": [(700, 1.0), (1220, 0.5), (2600, 0.25)], "oo": [(320, 1.0), (800, 0.4), (2300, 0.1)]}[vowel]
    x = sum(saw(note(m), d, det, 0.006, 5.2 + det * 100) for m in ms for det in (-0.004, -0.001, 0.002, 0.005))
    y = sum(bp(x, f * 0.85, f * 1.15, 2) * g for f, g in F)
    return y * ar(d, a, r) / len(ms)
def brass(m, d, a=0.05):
    x = sum(saw(note(m), d, det, 0.004) for det in (-0.003, 0.003)); t = tt(d)
    y = lp(x, 900) * 0.6 + lp(x, 2600) * 0.4 * np.minimum(1, t / 0.15); return np.tanh(y * 0.9) * ar(d, a, 0.12)
def heartbeat(): return P(sine_sweep(55 * np.ones(int(0.3 * SR)), 0.3) * env(0.3, 0.003, 0.3, 9), np.concatenate([np.zeros(int(0.27 * SR)), sine_sweep(50 * np.ones(int(0.3 * SR)), 0.3) * env(0.3, 0.003, 0.3, 9) * 0.7]))
def tick(hi=True): return P(bp(noise(0.02), 3000, 9000) * env(0.02, 0.0005, 0.02, 8), np.sin(2 * np.pi * (2100 if hi else 1600) * tt(0.03)) * env(0.03, 0.0005, 0.03, 12) * 0.5) * 0.4
def bell(m, d=2.0): return sum(np.sin(2 * np.pi * note(m) * r * tt(d)) * env(d, 0.001, d, c) * a for r, a, c in [(1, 1, 3), (2.76, 0.5, 5), (5.4, 0.25, 8), (8.9, 0.12, 11)])
def gong(d=5.0):
    t = tt(d); x = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * 0.7 * t) * 0.3) * a for f, a in [(82, 1), (137, 0.7), (201, 0.5), (263, 0.35), (431, 0.2), (617, 0.12)])
    return x * env(d, 0.01, d, 2.0) * np.minimum(1, t / 0.08) * 0.4
def drone(ms, d, fc=320): return lp(sum(saw(note(m), d, det) for m in ms for det in (-0.003, 0.004)), fc) * ar(d, 1.0, 0.8) / len(ms)

def reverb(x, d=2.4, wet=0.3, decay=3.0):
    t = tt(d); out = np.zeros_like(x)
    for ch in range(2):
        ir = rng.standard_normal(len(t)) * np.exp(-t * decay); ir = lp(ir, 6000); ir /= np.sqrt(np.sum(ir ** 2))
        out[ch] = x[ch] + wet * fftconvolve(x[ch], ir)[: x.shape[1]]
    return out
# ================= SFX =================
X = np.zeros((2, N))
def whoosh(d=0.6, lo=300, hi=3000, shape=1.5):
    n = int(d * SR); x = noise(d); u = np.linspace(0, 1, n); y = np.zeros(n); blk = 1024
    for s in range(0, n, blk):
        fc = lo * (hi / lo) ** (np.sin(np.pi * u[s] * 0.5)); y[s:s + blk] = bp(x[s:s + blk], fc * 0.6, fc * 1.5, 1)
    return y * np.sin(np.pi * u) ** shape
def swish(): return whoosh(0.35, 800, 6000, 2.0)
def thud(f0=70, d=0.5): t = tt(d); return P(sine_sweep(f0 * (1 + 1.5 * np.exp(-t * 25)), d) * env(d, 0.002, d, 8), lp(noise(d), 300) * env(d, 0.001, 0.12, 20) * 0.5)
def creak(d=0.6): t = tt(d); f = 90 + 50 * np.sin(2 * np.pi * 2.3 * t); return bp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 300, 1800) * np.sin(np.pi * t / d) * 0.3
def debris(d=0.6): return P(*[np.concatenate([np.zeros(int(rng.random() * d * 0.7 * SR)), bp(noise(0.03), 1500, 7000) * env(0.03, 0.001, 0.03, 10) * rng.random()]) for _ in range(12)])
def poof(): return P(lp(noise(0.5), 1400) * env(0.5, 0.004, 0.5, 6) * 0.8, P(*[np.concatenate([np.zeros(int(rng.random() * 0.3 * SR)), np.sin(2 * np.pi * (3000 + 3000 * rng.random()) * tt(0.12)) * env(0.12, 0.001, 0.12, 10) * 0.15]) for _ in range(5)]))
def shimmer(d=1.2, n=18): return P(*[np.concatenate([np.zeros(int(rng.random() * d * SR)), bell(96 + int(rng.random() * 12), 0.5) * 0.15]) for _ in range(n)])
def thunder(d=3.5): t = tt(d); crack = hp(noise(0.4), 1500) * env(0.4, 0.002, 0.4, 7); rumble = lp(noise(d), 180) * env(d, 0.05, d, 1.6) * (1 + 0.6 * np.sin(2 * np.pi * 1.7 * t)); return P(crack * 0.7, rumble * 1.4)
def shing(d=1.2): t = tt(d); return P(metal(d, 1400) * 1.4, hp(noise(0.3), 4000) * env(0.3, 0.003, 0.3, 6) * 0.4)
def step(): return lp(noise(0.08), 500) * env(0.08, 0.001, 0.08, 25) * 0.6
def jingle(): return P(*[np.concatenate([np.zeros(int(rng.random() * 0.06 * SR)), np.sin(2 * np.pi * (2500 + 2500 * rng.random()) * tt(0.08)) * env(0.08, 0.001, 0.08, 9) * 0.12]) for _ in range(4)])
def howl(d): t = tt(d); f = 500 + 250 * np.sin(2 * np.pi * 0.35 * t); return P(bp(noise(d), 300, 1500) * 0.6, np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.06) * ar(d, 0.8, 0.8)
def landing(scale=1.0): return P(thud(62, 0.6), metal(1.1, 420) * 0.7, debris(0.5) * 0.8, creak(0.7) * 0.8) * scale
def streak(d): t = tt(d); f = 900 + 500 * np.sin(2 * np.pi * 0.25 * t); return np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.05 * ar(d, 0.5, 0.5)

def bowl(m=50, d=7.0):  # singing bowl: slow beating partials
    t = tt(d); return sum(np.sin(2 * np.pi * note(m) * r * t) * (1 + 0.3 * np.sin(2 * np.pi * 3.1 * t)) * a for r, a in [(1, 1), (2.71, 0.45), (5.2, 0.18)]) * env(d, 0.02, d, 1.6) * 0.5
def timp_roll(t0, t1, g0=0.1, g1=0.5, f0=73):
    t = t0
    while t < t1: k = (t - t0) / max(1e-6, t1 - t0); place(M, lp(taiko(1.0, f0, 0.5), 600), t, (rng.random() - 0.5) * 0.4, g0 + (g1 - g0) * k ** 2); t += 0.07
def pluck(m, d=0.6): return lp(sum(saw(note(m), d, det) for det in (-0.002, 0.003)) / 2, 1600) * env(d, 0.003, d, 6)
def chirp(): d = 0.12; t = tt(d); f = 3000 + 1500 * np.sin(np.pi * t / d); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.01, d, 4) * 0.2
def bloop(f0=300): d = 0.18; t = tt(d); return np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2.5 * t / d)) / SR) * np.sin(np.pi * t / d) * 0.3

# ================= MUSIC: divine, cinematic (D) =================
M = np.zeros((2, N))
X = np.zeros((2, N))
# A — hook 0..4.94: low drone, Dm choir, singing bowl, high shimmer strings, timpani swell into the sword word
place(M, drone([26, 38, 45], 5.6, 300), 0.0, 0, 0.55)
place(M, choir([50, 57, 62, 65], 5.2, a=0.9, r=1.0, vowel="oo"), 0.0, 0, 0.42)
place(M, bowl(50, 7.0), 0.0, -0.2, 0.3)
place(M, lp(trem([81, 86], 4.8, rate=9, a=1.5), 2500), 0.2, 0, 0.07)
timp_roll(0.9, 1.88, 0.05, 0.35)
place(M, P(*[brass(m, 2.4, 0.25) for m in (50, 57, 62)]), 1.88, 0, 0.2); place(M, sub(2.5, 55, 32), 1.88, 0, 0.35)
# B — the lotus 4.94..9.37: Bb -> C choir, bells at the lotus, roll + riser into the strike
place(M, choir([46, 53, 58, 62, 65], 2.6, a=0.6, r=0.6, vowel="oo"), 4.8, 0, 0.55)
place(M, choir([48, 55, 60, 64, 67], 2.4, a=0.5, r=0.4, vowel="oo"), 7.1, 0, 0.55)
place(M, drone([22, 34], 2.6, 260), 4.8, 0, 0.45); place(M, drone([24, 36], 2.4, 260), 7.1, 0, 0.45)
for k, m in enumerate((74, 77, 81, 86)): place(M, bell(m, 2.6), 6.2 + k * 0.28, -0.4 + k * 0.25, 0.1)
timp_roll(7.9, 9.36, 0.06, 0.55); place(M, riser(2.0, 200, 3000), 7.37, 0, 0.35); place(M, revcym(0.8), 8.57, 0, 0.35)
# STRIKE 9.37: soft divine impact, D major braam + brass + full choir
place(M, lp(hit(0.9), 1800), 9.37, 0, 0.42); place(M, braam(26, (0, 7, 12, 16, 19), 3.4, 1400), 9.37, 0, 0.3)
place(M, P(*[brass(m, 2.6, 0.04) for m in (50, 57, 62, 66)]), 9.37, 0, 0.2)
place(M, choir([50, 57, 62, 66, 69], 5.4, a=0.15, r=1.4, vowel="oo"), 9.37, 0, 0.5)
# C — water and villages 10.34..14.7: flowing plucks, low strings, soft timpani pulse, bells for the settlements
place(M, pad([38, 50, 57, 62], 4.6, 0.8, 0.8, 1300), 10.2, 0, 0.4)
t = 10.34; i = 0; seqn = [62, 66, 69, 74, 69, 66]
while t < 14.6: place(M, lp(pluck(seqn[i % 6]), 1100), t, -0.3 + 0.6 * (i % 2), 0.12); t += 0.5; i += 1
for tb in (10.34, 11.46, 12.94): place(M, lp(taiko(0.9, 80, 0.8), 700), tb, 0, 0.35)
for k, m in enumerate((69, 74, 78)): place(M, bell(m, 2.0), 14.33 + k * 0.12, (k - 1) * 0.5, 0.16)
# D — science 14.7..18.93: airy pad, light pulse, reveal chime + choir on "ताल थियो"
place(M, pad([50, 57, 62, 66, 74], 4.4, 0.6, 0.8, 2600), 14.6, 0, 0.38)
t = 14.72; i = 0
while t < 18.1: place(M, pluck([74, 78, 81, 78][i % 4], 0.35), t, 0.3 * (1 if i % 2 else -1), 0.13); t += 0.25; i += 1
place(M, choir([62, 66, 69, 74], 1.6, a=0.08, r=1.0, vowel="oo"), 18.13, 0, 0.45); place(M, bell(86, 2.4), 18.13, 0, 0.25); place(M, sub(1.6, 60, 36), 18.13, 0, 0.3)
# E — the earthquake 19.0..23.25: dark minor drone, low tremolo, deep swell on "भूकम्पले"
place(M, drone([26, 33, 38], 4.4, 220), 18.9, 0, 0.6)
place(M, trem([50, 53, 57], 3.4, rate=7, a=1.4), 19.4, 0, 0.3)
timp_roll(20.0, 20.76, 0.05, 0.4, 62); place(M, lp(braam(26, (0, 7, 12, 15), 2.6, 900), 1000), 20.77, 0, 0.32)
place(M, choir([50, 53, 57, 62], 2.3, a=0.4, r=0.8, vowel="oo"), 20.9, 0, 0.45)
# F — today's street 23.25..29.2: warm pad + gentle pulse, then the big choir swell on "तालको पिँध"
place(M, pad([45, 57, 62, 66], 4.8, 0.6, 1.0, 1500), 23.2, 0, 0.36)
t = 23.25; i = 0
while t < 27.8: place(M, pluck([57, 62, 66, 62][i % 4], 0.4), t, 0.25 * (1 if i % 2 else -1), 0.14); t += 0.5; i += 1
place(M, riser(1.4, 150, 1200), 26.4, 0, 0.12)
place(M, choir([50, 57, 62, 66, 69, 74], 3.6, a=0.25, r=1.4, vowel="oo"), 27.8, 0, 0.5); place(M, bowl(50, 6.0), 27.8, 0.2, 0.4)
place(M, P(*[brass(m, 1.8, 0.2) for m in (50, 57, 62)]), 27.85, 0, 0.14); place(M, trem([86, 90], 3.0, rate=10, a=0.8), 27.9, 0, 0.12)
# G — the question 29.35..32.2: soft gong, held choir, high shimmer
place(M, gong(4.5), 29.33, 0, 0.42); place(M, choir([50, 57, 62, 65], 3.0, a=0.4, r=1.6, vowel="oo"), 29.3, 0, 0.45)
place(M, drone([26, 38], 3.0, 260), 29.3, 0, 0.4)

# ================= SFX (soft: low-passed, slow attacks) =================
def amb(d, lo, hi, a=0.6, r=0.8): return bp(noise(d), lo, hi) * ar(d, a, r)
place(X, amb(9.5, 200, 1100), 0.0, 0, 0.25)                               # mountain wind on the rim
place(X, shimmer(1.0, 10), 1.9, 0.3, 0.3)                                  # sword flares
place(X, shimmer(0.6, 6), 0.1, -0.3, 0.35)                                  # title: "तरवार"
place(X, P(lp(noise(0.9), 140) * env(0.9, 0.03, 0.9, 3) * 0.8, bell(62, 1.2) * 0.25), 0.63, 0.3, 0.45)  # title: "भूकम्प?"
place(X, whoosh(1.4, 200, 2000, 1.0), 5.0, -0.3, 0.7)                     # glide over the water to the lotus
place(X, P(bell(81, 2.0), bell(88, 2.0) * 0.5) * 0.4, 6.6, 0, 0.17)        # the lotus
place(X, lp(whoosh(0.8, 250, 2400, 1.2), 1200), 7.45, 0.3, 0.45)                      # sweep back to Manjushri
place(X, whoosh(0.35, 400, 2500, 1.5), 9.1, 0.3, 0.6)                     # sword swing
place(X, P(thud(48, 1.2), lp(noise(1.2), 220) * env(1.2, 0.02, 1.2, 3) * 0.8), 9.37, 0, 0.9)  # the strike (low, soft)
gd = 0.8; place(X, bp(noise(gd), 120, 700) * ar(gd, 0.05, 0.4) * 0.7, 9.45, 0, 0.6)        # the halves grind apart
w = 5.2; place(X, bp(noise(w), 90, 600) * ar(w, 0.5, 1.4) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.6 * tt(w))), 9.6, 0, 0.6)  # rushing water (low rumble, under the voice)
for k in range(4): place(X, chirp(), 14.33 + k * 0.09, (rng.random() - 0.5), 0.25)  # birds over the new fields (in the pause)
place(X, riser(1.1, 150, 1500), 14.7, 0, 0.35)                            # the city rises
place(X, whoosh(0.7, 200, 1800, 1.2), 15.7, 0, 0.5)                       # cut to the cut-away
place(X, bell(93, 0.8) * 0.35, 16.25, -0.3, 0.4)                           # magnifier glint
place(X, lp(whoosh(0.5, 200, 1500, 1.2), 1200), 17.0, 0, 0.4)             # cut to the wide cut-away
wr = 1.2; place(X, lp(noise(wr), 500) * ar(wr, 0.5, 0.4) * 0.6, 17.85, 0, 0.45)  # the old lake fills back in
place(X, shimmer(1.2, 12), 18.1, 0, 0.5)                                    # ghost lake
place(X, whoosh(0.8, 200, 2000, 1.2), 18.85, 0, 0.55)                     # back in time
for k in range(16): place(X, tick(k % 2 == 0) * 0.5, 19.15 + k * 0.2, 0.25, 0.25)  # seismograph pen
rd = 3.0; place(X, lp(noise(rd), 160) * ar(rd, 0.4, 1.0) * (1 + 0.5 * np.sin(2 * np.pi * 2.3 * tt(rd))), 20.6, 0, 0.9)  # soft rumble
place(X, thud(40, 1.0), 21.85, 0, 0.55)                                   # the ridge gives way
w = 1.6; place(X, bp(noise(w), 90, 600) * ar(w, 0.4, 0.6), 22.0, 0, 0.5)
place(X, whoosh(0.8, 200, 2000, 1.2), 23.1, 0, 0.5)                       # to today
td = 4.6; place(X, lp(noise(td), 500) * ar(td, 0.4, 0.8) * 0.5, 23.25, 0, 0.35)  # traffic hum
for k in range(9): place(X, step() * 0.6, 23.4 + k * 0.48, 0.1, 0.3)
place(X, P(lp(noise(1.2), 600) * env(1.2, 0.05, 1.2, 3), bloop(260)), 27.85, 0, 0.6)  # into the water
wd = 4.3; place(X, lp(noise(wd), 700) * ar(wd, 0.5, 1.0) * 0.6, 27.9, 0, 0.35)          # underwater ambience
for k in range(10): place(X, bloop(250 + rng.random() * 300), 28.1 + rng.random() * 3.6, (rng.random() - 0.5) * 1.2, 0.35)
place(X, whoosh(0.6, 200, 1800, 1.2), 29.2, 0, 0.45)
place(X, bell(84, 1.2) * 0.5, 30.27, 0.2, 0.4)                             # "?" pops in the comma pause
X[0] = lp(X[0], 3800); X[1] = lp(X[1], 3800)

def save(name, x):
    x = x[:, : int(DUR * SR)]; x = x / max(1e-9, np.abs(x).max()) * 0.9
    with wave.open(name, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x.T * 32767).astype('<i2').tobytes())
M = reverb(M, 3.2, 0.4, 2.2); X = reverb(X, 1.8, 0.2, 3.5)
for ch in range(2): M[ch] = M[ch] - 0.65 * bp(M[ch], 500, 4000); X[ch] = X[ch] - 0.5 * bp(X[ch], 500, 4000)   # fixed EQ dip where the voice lives (no ducking)
nE = int(DUR * SR); fo = np.ones(N); fo[nE - int(0.9 * SR): nE] = np.linspace(1, 0, int(0.9 * SR)) ** 1.5; fo[nE:] = 0; fo[: int(0.01 * SR)] = np.linspace(0, 1, int(0.01 * SR))
M *= fo; X *= fo
save('music.wav', M); save('sfx.wav', X)
mm = M[:, : int(DUR * SR)].mean(0); pk = np.abs(mm).max()
for name, a, b in [("hook", 0, 4.9), ("lotus", 4.9, 9.3), ("strike", 9.37, 10.3), ("water", 10.3, 14.7), ("city", 14.7, 15.8), ("science", 15.9, 18.9), ("quake", 19, 23.2), ("street", 23.3, 27.8), ("lakefloor", 27.85, 29.3), ("question", 29.35, 32.2)]:
    s = mm[int(a * SR): int(b * SR)]; print(f"{name:10s} {20 * np.log10(np.sqrt(np.mean(s ** 2)) / pk):6.1f} dB")
