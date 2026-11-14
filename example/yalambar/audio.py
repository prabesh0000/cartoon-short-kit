# Cinematic thriller score + full SFX layer for "यलम्बरको शिर". Writes audio/music.wav + audio/sfx.wav (levels set by mix.py).
import numpy as np, wave
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 38.5306
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

# ================= MUSIC =================
M = np.zeros((2, N))
BT, S16 = 0.5, 0.125
OST = [0, 0, 12, 0, 0, 0, 10, 0, 0, 0, 8, 0, 0, 0, 7, 3]  # D minor ostinato offsets (one bar of 16ths)
def ostinato(t0, t1, root=38, g=0.5, bass=True):
    t, i = t0, 0
    while t < t1 - 0.01:
        place(M, stac(root + OST[i % 16]), t, -0.2 + 0.4 * (i % 2), g)
        if bass and i % 4 == 0: place(M, stac(root - 12, 0.22), t, 0, g * 0.9)
        t += S16; i += 1
def taiko_groove(t0, t1, g=0.6, dense=False):
    pat = [0, 0.375, 0.75, 1.0, 1.5, 1.75] if not dense else [0, 0.25, 0.375, 0.75, 1.0, 1.25, 1.5, 1.625, 1.75, 1.875]
    t = t0
    while t < t1 - 0.01:
        for p in pat:
            if t + p < t1: place(M, taiko(1.0 if p in (0, 1.0) else 0.65, 95 if p in (0, 1.0) else 120), t + p, (p - 1) * 0.3, g)
        for p in (0.5, 1.5):
            if t + p < t1: place(M, rim(), t + p, 0.3, g * 0.6)
        t += 2.0

# A — hook (0 .. 3.47): opening hit, drone, ticking clock, tension cluster
place(M, hit(1.0), 0.0, 0, 0.9); place(M, braam(26, (0, 7, 12, 15), 3.2), 0.0, 0, 0.6)
place(M, drone([26, 33], 6.0), 0.0, 0, 0.5)
for k in range(1, 7): place(M, tick(k % 2 == 0), k * 0.5, 0.4 if k % 2 else -0.4, 0.7)
place(M, trem([74, 75], 2.3, a=1.2), 1.2, 0, 0.18)
# B — boulder (3.47 .. 5.93): pulse, lift hits, riser
place(M, taiko(1.1), fs(104), 0, 0.7)
t = fs(104)
while t < fs(178) - 0.05: place(M, stac(38, 0.18), t, 0, 0.35 + 0.35 * (t - fs(104)) / 2.5); place(M, stac(26, 0.2), t, 0, 0.3); t += 0.25
place(M, taiko(1.2), fs(110), 0, 0.7); place(M, taiko(1.0, 110), fs(160), 0, 0.6)
place(M, riser(fs(178) - 4.4), 4.4, 0, 0.5); place(M, revcym(0.75), fs(178) - 0.75, 0, 0.6)
# C — Kurukshetra arrival (5.93 .. 8.23): braam + war drums + ostinato + brass stabs
place(M, hit(1.1), fs(178), 0, 0.95); place(M, braam(26, (0, 7, 12, 15, 19), 2.8), fs(178), 0, 0.8)
ostinato(fs(178), fs(247), 38, 0.45); taiko_groove(fs(178), fs(247), 0.55)
for tb in (fs(178), fs(178) + 1.0, fs(178) + 2.0): place(M, P(*[brass(m, 0.42) for m in (50, 53, 57)]), tb, 0, 0.25)
# D — dialogue suspense (8.23 .. 14.27): drone, soft pulse, ticks, high tremolo, riser to Krishna's realisation
place(M, drone([26, 33, 38], fs(428) - fs(247) + 0.5, 280), fs(247), 0, 0.45)
t = fs(247); k = 0
while t < fs(428) - 0.1:
    place(M, stac(38, 0.2), t, 0, 0.18); place(M, tick(k % 2 == 0), t + 0.25, 0.4 if k % 2 else -0.4, 0.45); t += 0.5; k += 1
place(M, trem([81, 82], fs(428) - 10.0, a=2.0), 10.0, 0, 0.14)
place(M, riser(fs(428) - 12.4, 150, 3000), 12.4, 0, 0.35)
# E — Krishna realises (14.27 .. 16.47): low hit, dark choir, heartbeat, swell into the scale
place(M, P(sub(2.0) * 0.7, taiko(1.0, 80)), fs(428), 0, 0.6)
place(M, choir([50, 53, 57, 62], fs(494) - fs(428) + 0.4, 0.6, 0.6, "oo"), fs(428), 0, 0.5)
for hb in (14.5, 15.3): place(M, heartbeat(), hb, 0, 0.6)
place(M, revcym(0.9), fs(494) - 0.9, 0, 0.7)
# F — the scale (16.47 .. 22.4): driving ostinato + taiko, accents on landings, building hats, brass motif, shepard riser
place(M, hit(1.0), fs(494), 0, 0.85)
ostinato(fs(494), fs(672), 38, 0.7); taiko_groove(fs(494), fs(606), 0.75); taiko_groove(fs(606), fs(672), 0.85, dense=True)
t = 18.5
while t < fs(672) - 0.05: place(M, hat(), t, 0.5, 0.5); t += 0.25 if t < fs(606) else 0.125
for i, m in enumerate([62, 65, 69, 67, 65, 64, 62, 57]): place(M, brass(m, 0.45), fs(500) + 1.0 + i * 0.5, -0.1, 0.22)
for f_, g in ((499, 0.7), (606, 0.8), (637, 0.9), (658, 1.0)): place(M, P(taiko(1.3, 120), sub(1.2) * 0.6), fs(f_), 0, g)
place(M, riser(fs(672) - 19.6, 300, 5000), 19.6, 0, 0.45); place(M, revcym(0.6), fs(672) - 0.6, 0, 0.6)
# G — drop: both armies gone (22.4 .. 26.47): sub drone, eerie highs, heartbeat accelerating, riser
place(M, sub(2.5) * 0.6, fs(672), 0, 0.6)
place(M, drone([26], fs(794) - fs(672) + 0.3, 160), fs(672), 0, 0.35)
place(M, trem([86, 87], fs(794) - fs(672), rate=6, a=1.5), fs(672), 0, 0.07)
place(M, choir([38, 45], fs(794) - fs(680), 1.2, 0.5, "oo"), fs(680), 0, 0.3)
for hb in (22.9, 23.9, 24.8, 25.5, 26.0): place(M, heartbeat(), hb, 0, 0.45)
place(M, riser(fs(794) - 25.0, 120, 4000), 25.0, 0, 0.35); place(M, revcym(0.9), fs(794) - 0.9, 0, 0.7)
# H — the chakra (26.47 .. 28.27): huge sting, storm choir, drum roll, flash hit
place(M, hit(1.3), fs(794), 0, 1.0); place(M, braam(26, (0, 1, 7, 12, 13), 3.0, 3200), fs(794), 0, 0.9)
place(M, choir([50, 53, 56, 62], fs(848) - fs(800), 0.4, 0.3), fs(800), 0, 0.55)
roll = [27.2];
while roll[-1] < fs(848) - 0.06: roll.append(roll[-1] + max(0.05, 0.22 * (1 - (roll[-1] - 27.2) / 1.1)))
for r_ in roll: place(M, taiko(0.7, 120, 0.4), r_, (rng.random() - 0.5) * 0.6, 0.45)
place(M, revcym(0.8), fs(848) - 0.8, 0, 0.8)
place(M, hit(1.4, 3.5), fs(848), 0, 1.0); place(M, braam(26, (0, 7, 12, 15, 19, 24), 2.5, 4000), fs(848), 0, 0.8)
# I — the flight (28.53 .. 32.2): epic choir, taiko, ostinato through Dm–Bb, soaring brass, riser to the landing
FL0 = fs(856)
place(M, choir([50, 53, 57, 62, 65], 2.0, 0.3, 0.3), FL0, 0, 0.6); place(M, choir([46, 53, 58, 62, 65], 1.9, 0.3, 0.5), FL0 + 2.0, 0, 0.6)
ostinato(FL0, FL0 + 2.0, 38, 0.45); ostinato(FL0 + 2.0, fs(966), 34, 0.45)
taiko_groove(FL0, fs(966), 0.55, dense=True)
for i, m in enumerate([69, 72, 74, 77, 76, 74, 72, 74]): place(M, brass(m, 0.48), FL0 + 0.1 + i * 0.45, 0.1, 0.28)
place(M, riser(fs(966) - 30.9, 300, 6000), 30.9, 0, 0.45); place(M, revcym(0.7), fs(966) - 0.7, 0, 0.7)
# J — landing + Indra Jatra finale (32.2 .. end): D-major braam, slow giant drums, choir of awe, bells, final gong
place(M, hit(1.2), fs(966), 0, 0.95); place(M, braam(26, (0, 7, 12, 16, 19), 3.0, 3000), fs(966), 0, 0.75)
FIN = fs(976)
place(M, choir([50, 54, 57, 62, 66], DUR - FIN + 0.5, 1.2, 0.3), FIN, 0, 0.5)
place(M, pad([38, 45, 50, 54], DUR - FIN + 0.5, 1.5, 0.3, 1200), FIN, 0, 0.35)
t = FIN + 0.5; k = 0
while t < DUR:
    place(M, taiko(1.0, 85, 1.2), t, 0, 0.55 + 0.25 * (t - FIN) / 6);
    if k % 2 == 1: place(M, taiko(0.6, 130, 0.5), t + 0.5, 0.3, 0.35)
    t += 1.0; k += 1
for tb, m in ((33.3, 81), (34.7, 86), (fs(1076), 88), (37.3, 93)): place(M, bell(m, 2.4), tb, (rng.random() - 0.5), 0.2)
FINAL = 36.9
place(M, hit(1.2, 3.5), FINAL, 0, 0.95); place(M, gong(4.0), FINAL, 0, 0.9); place(M, braam(26, (0, 7, 12, 16, 19, 24), 3.0, 3500), FINAL, 0, 0.75)
place(M, revcym(0.8), FINAL - 0.8, 0, 0.6)

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

# ambience beds
place(X, lp(noise(fs(178)), 700) * 0.1, 0, 0)                         # mountain wind
place(X, lp(noise(fs(794) - fs(178)), 500) * 0.07, fs(178), 0)          # dusty plain wind
# cuts / transitions
for f_ in (104, 247, 331, 428, 976): place(X, swish(), fs(f_) - 0.2, 0, 0.7)
place(X, whoosh(0.7, 300, 6000), fs(178) - 0.55, 0, 1.0)               # into Kurukshetra
place(X, whoosh(0.9, 200, 7000, 1.2), fs(470), 0.2, 1.0)                # swoop to the scale
# boulder
place(X, P(lp(noise(0.5), 900) * env(0.5, 0.01, 0.5, 4) * 0.6, debris(0.5) * 0.6), fs(110), 0.3, 0.8)
place(X, whoosh(0.45, 300, 2000), fs(146), 0, 0.7); place(X, thud(60, 0.4), fs(160), 0, 0.8)
# march + armour
for k in range(int((247 - 180) / 15)): place(X, step(), fs(180 + k * 15), -0.3 if k % 2 else 0.3, 0.8); place(X, jingle(), fs(180 + k * 15), 0, 0.8)
# Krishna
place(X, shimmer(1.0, 12), fs(252), -0.3, 0.8)
place(X, P(bell(96, 1.0) * 0.5, bell(100, 1.0) * 0.3, shimmer(0.8, 10)), fs(451), -0.2, 0.9)
# jumps: takeoff whoosh (pitch up) + landing impact, growing each time
HOPS = [(487, 499, 0.8), (590, 606, 0.9), (626, 637, 1.0), (648, 658, 1.1), (724, 736, 0.8)]
for t0, t1, s in HOPS:
    place(X, whoosh(max(0.3, (t1 - t0) / 30 + 0.1), 500, 4500, 1.2), fs(t0) - 0.05, 0, 0.8 * s)
    place(X, landing(s) if t1 != 736 else P(thud(55, 0.6), debris(0.4)), fs(t1), 0.15, 0.9)
# armies vanish: magic poofs in a wave
for k, f_ in enumerate([680, 684, 688, 690, 693, 696, 699, 702, 706, 710, 714, 718]): place(X, poof(), fs(f_), ((k % 5) - 2) * 0.35, 0.6)
# emptiness: wind howl + tumbleweed rustle
place(X, howl(fs(794) - fs(726)), fs(726), 0, 0.5)
place(X, bp(noise(1.8), 1500, 6000) * 0.15 * np.sin(np.linspace(0, np.pi, int(1.8 * SR))), fs(736), 0.3)
# storm + chakra
place(X, thunder(3.5), fs(790) - 0.05, -0.2, 1.0); place(X, thunder(2.5), 27.5, 0.4, 0.5)
place(X, shing(1.4), fs(800), 0, 0.9)
cd = fs(846) - fs(802); t = tt(cd)
whir = np.sin(2 * np.pi * np.cumsum(160 + 600 * (t / cd) ** 2) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(10 + 35 * t / cd) / SR))
place(X, bp(whir, 150, 4000) * np.minimum(1, t / 0.3) * 0.5, fs(802), 0)
place(X, whoosh(0.55, 600, 9000, 1.0), fs(834), 0, 1.0)
place(X, P(thud(45, 1.2) * 1.2, shimmer(1.2, 20), hp(noise(0.6), 2500) * env(0.6, 0.002, 0.6, 5) * 0.5), fs(848), 0, 1.0)
# the head flies: wind rush, fly-by whooshes, sparkle trail, whistle streak
fd = fs(966) - fs(856); t = tt(fd)
place(X, bp(noise(fd), 250, 3000) * (0.35 + 0.2 * np.sin(2 * np.pi * 0.8 * t)) * ar(fd, 0.3, 0.3), fs(856), 0, 0.8)
for k, tb in enumerate((29.0, 29.9, 30.8, 31.6)): place(X, whoosh(0.8, 250, 5000, 1.0), tb, -0.6 if k % 2 else 0.6, 0.9)
place(X, shimmer(fd, 40), fs(856), 0.2, 0.7); place(X, streak(fd), fs(856), 0, 1.0)
# landing in Kathmandu
place(X, P(thud(42, 1.0) * 1.3, debris(0.6), lp(noise(1.5), 200) * env(1.5, 0.01, 1.5, 3) * 0.8, bell(81, 2.0) * 0.4, shimmer(1.0, 16)), fs(966), 0, 1.0)
# Indra Jatra crowd: murmur, cheer swell, claps
cdur = DUR - fs(940); t = tt(cdur)
crowd = sum(bp(noise(cdur), 250 + 150 * k, 900 + 300 * k) for k in range(3))
swell = 0.35 + 0.65 * np.exp(-((t - (fs(1050) - fs(940))) / 1.3) ** 2) + 0.4 * np.exp(-((t - (36.9 - fs(940))) / 0.8) ** 2)
place(X, crowd * 0.1 * swell * np.minimum(1, t / 1.0), fs(940), 0)
for k in range(10): place(X, bp(noise(0.05), 900, 4000) * env(0.05, 0.001, 0.05, 10) * 0.25, fs(1036) + k * 0.18 + rng.random() * 0.05, (k % 3 - 1) * 0.6)

def save(name, x):
    x = x[:, : int(DUR * SR)]; x = x / max(1e-9, np.abs(x).max()) * 0.9
    with wave.open(name, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x.T * 32767).astype('<i2').tobytes())
M = reverb(M, 2.6, 0.32, 2.6); X = reverb(X, 1.8, 0.18, 3.5)
save('audio/music.wav', M); save('audio/sfx.wav', X)
# section levels (dB re. peak) to check the dynamics follow the story
mm = M[:, : int(DUR * SR)].mean(0); pk = np.abs(mm).max()
for name, a, b in [("hook", 0, 3.47), ("boulder", 3.47, 5.93), ("arrival", 5.93, 8.23), ("dialogue", 8.23, 14.27), ("scale", 16.47, 22.4), ("drop", 22.5, 26.4), ("chakra", 26.47, 28.27), ("flight", 28.53, 32.2), ("finale", 32.5, 38.5)]:
    s = mm[int(a * SR): int(b * SR)]; print(f"{name:9s} {20 * np.log10(np.sqrt(np.mean(s ** 2)) / pk):6.1f} dB")
