# "पट्टा लगाएको साथी": mock-epic nature documentary. Sly pizzicato + low reed under the facts, a big string swell for the lion
# that deflates into a squeaky toy, café murmur, a near-silent drop + low sting on "तपाईंप्रति होइन", night drone, D-major pizz outro.
# Not a loop: stems fade over the last 0.9 s. Writes music.wav + sfx.wav + work/sfx_cues.json.
import numpy as np, wave, json
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 1283 / 30
N = int(round(DUR * SR)); NX = N + 4 * SR
rng = np.random.default_rng(33)
NY = SR / 2 - 100

def lp(x, fc, o=2): return sosfilt(butter(o, min(fc, NY) / (SR / 2), 'low', output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc / (SR / 2), 'high', output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [max(20, lo) / (SR / 2), min(hi, NY) / (SR / 2)], 'band', output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.01, curve=4.0):
    t = tt(d); return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / d)
def ar(d, a, r): t = tt(d); return np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)
def P(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[: len(x)] += x
    return o
def note(m): return 440.0 * 2 ** ((m - 69) / 12)
def noise(d): return rng.standard_normal(int(d * SR))
def sweep(f, d): return np.sin(2 * np.pi * np.cumsum(f) / SR)
def pad0(x, t): return np.concatenate([np.zeros(int(t * SR)), x])
CUES = []
def place(buf, sig, t, pan=0.0, g=1.0, name=None):
    i = int(round(t * SR))
    if i < 0: sig = sig[-i:]; i = 0
    j = min(buf.shape[1], i + len(sig)); s = sig[: j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:j] += s * l * 1.414; buf[1, i:j] += s * r * 1.414
    if name: CUES.append((name, round(t, 3), round(t * 30)))
f = lambda fr: fr / 30

# ================= instruments =================
def pizz(m, d=0.5, bright=900):   # plucked string (Karplus-Strong), soft attack, low-passed
    fr = note(m); L = max(2, int(SR / fr)); n = int(d * SR)
    buf = lp(rng.uniform(-1, 1, L), bright * 1.5, 1); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % L]; buf[i % L] = 0.5 * (buf[i % L] + buf[(i + 1) % L]) * 0.996
    return lp(out, bright) * ar(d, 0.006, d * 0.5)
_pz = {}
def pz(m, d=0.5, bright=900):
    k = (m, round(d, 2), bright)
    if k not in _pz: _pz[k] = pizz(m, d, bright)
    return _pz[k]
def clar(m, d, vib=0.004):        # sly low reed: odd harmonics, breathy, low-passed
    t = tt(d); fr = note(m) * (1 + vib * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.3))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    x = np.sin(ph) + 0.33 * np.sin(3 * ph) + 0.14 * np.sin(5 * ph) + 0.06 * np.sin(7 * ph)
    return lp(x + 0.04 * bp(noise(d), 300, 1500), 1300) * ar(d, 0.06, min(0.25, d * 0.4))
def pad(ms, d, a=0.8, r=1.0, fc=600):
    x = sum(np.sin(2 * np.pi * note(m) * (1 + det) * tt(d)) for m in ms for det in (-0.003, 0.0, 0.004))
    return lp(x, fc) * ar(d, a, r) / len(ms)
def tick(): return lp(bp(noise(0.03), 1200, 3200) * env(0.03, 0.002, 8), 3200) * 0.5
def shaker(): return bp(noise(0.06), 2000, 3600) * ar(0.06, 0.012, 0.04) * 0.4
def marimba(m, d=0.45):
    t = tt(d); return (np.sin(2 * np.pi * note(m) * t) * env(d, 0.004, 7) + 0.25 * np.sin(2 * np.pi * note(m) * 4 * t) * env(d, 0.003, 16))
def sub(d=1.6, f0=60, f1=36): t = tt(d); return sweep(f1 + (f0 - f1) * np.exp(-t * 3), d) * env(d, 0.012, 3)


def shehnai(m, d, vib=0.006):     # wedding reed (naumati colour): bright-ish odd+even harmonics, then low-passed hard
    t = tt(d); fr = note(m) * (1 + vib * np.sin(2 * np.pi * 6 * t) * np.minimum(1, t / 0.15))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    x = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.35 * np.sin(3 * ph) + 0.2 * np.sin(4 * ph)
    return lp(x, 1400) * ar(d, 0.03, min(0.12, d * 0.4))
def dhol(d=0.3, f0=110): t = tt(d); return lp(P(sweep(f0 * (1 + 0.4 * np.exp(-t * 40)), d) * env(d, 0.006, 7), bp(noise(d), 150, 600) * env(d, 0.006, 18) * 0.4), 900)
def pulse(m, d): t = tt(d); x = np.sin(2 * np.pi * note(m) * t) + 0.3 * np.sin(4 * np.pi * note(m) * t); return lp(x, 380) * ar(d, 0.012, d * 0.6)
def trem(ms, d, rate=7.0): t = tt(d); return pad(ms, d, 0.5, 0.6, 700) * (0.65 + 0.35 * np.sin(2 * np.pi * rate * t))

# ================= SFX: all soft, attacks >= 8 ms, low-passed =================
def zip_(d=0.34):                 # tape snapping shut: accelerating soft ticks + a rising breathy sweep
    n = int(d * SR); y = np.zeros(n); t = 0.0; k = 0
    while t < d - 0.02:
        c = lp(bp(noise(0.012), 600, 2600) * env(0.012, 0.002, 6), 2600) * (0.4 + 0.6 * t / d)
        i = int(t * SR); y[i:i + len(c)] += c[: max(0, n - i)]; t += 0.03 * (1 - 0.75 * t / d); k += 1
    u = np.linspace(0, 1, n); sw = np.zeros(n); x = noise(d); blk = 1024
    for s in range(0, n, blk): fc = 400 * (5 ** u[s]); sw[s:s + blk] = bp(x[s:s + blk], fc * 0.7, fc * 1.4, 1)
    return lp(y + 0.5 * sw * u ** 1.5 * ar(d, 0.02, 0.05), 3000)
def puff(d=0.35): return lp(noise(d), 700) * ar(d, 0.012, d * 0.8) * 0.6
def whoosh(d=0.6, lo=180, hi=1400, shape=1.4):
    n = int(d * SR); x = noise(d); u = np.linspace(0, 1, n); y = np.zeros(n); blk = 1024
    for s in range(0, n, blk): fc = lo * (hi / lo) ** np.sin(np.pi * u[s] * 0.5); y[s:s + blk] = bp(x[s:s + blk], fc * 0.6, fc * 1.5, 1)
    return y * np.sin(np.pi * u) ** shape
def whip(d=0.6):
    n = int(d * SR); x = noise(d); u = np.linspace(0, 1, n); y = np.zeros(n); blk = 512
    for s in range(0, n, blk): fc = 200 * (10) ** (u[s] ** 2); y[s:s + blk] = bp(x[s:s + blk], fc * 0.6, fc * 1.4, 1)
    return y * u ** 2.2 * np.minimum(1, (1 - u) * 30)
def whisper(d=0.45):
    t = tt(d); am = 0.5 + 0.5 * np.sin(2 * np.pi * (6 + 2 * rng.random()) * t + rng.random() * 6)
    return bp(noise(d), 1200, 3000) * am ** 2 * ar(d, 0.05, 0.15) * 0.6
def thunk(f0=95, d=0.5):          # palm on a wooden bench: low knock, no crack
    t = tt(d); return P(sweep(f0 * (1 + 0.6 * np.exp(-t * 30)), d) * env(d, 0.008, 9), lp(noise(d), 400) * env(d, 0.008, 22) * 0.5)
def clink(m=88, d=0.5):           # tea glass: soft, a few inharmonic partials under 3.5 kHz
    t = tt(d); fr = note(m)
    return sum(np.sin(2 * np.pi * fr * k * t) * a * env(d, 0.006, c) for k, a, c in [(1, 1, 9), (2.32, 0.4, 13), (3.1, 0.15, 18)]) * 0.5
def rise(d=0.9, f0=110, f1=230):  # low rising tone (dial), an octave down + low-passed
    t = tt(d); fr = f0 + (f1 - f0) * (t / d) ** 0.7; return lp(sweep(fr, d) + 0.3 * sweep(2 * fr, d), 800) * ar(d, 0.05, 0.25) * 0.5
def tock(m=72, d=0.18): t = tt(d); return lp(np.sin(2 * np.pi * note(m) * t) * env(d, 0.008, 12) + lp(noise(d), 900) * env(d, 0.008, 25) * 0.3, 1500)
def clunk(d=0.4): t = tt(d); return P(sweep(70 * (1 + 0.5 * np.exp(-t * 25)), d) * env(d, 0.01, 8), lp(noise(d), 500) * env(d, 0.01, 18) * 0.4)
def ding(m=79): return P(clink(m, 0.9) * 0.8, pad0(clink(m + 7, 0.9) * 0.5, 0.1))
def tink(): return clink(91, 0.6) * 0.8
def inflate(d=0.55):             # puffing up: soft rising air
    u = np.linspace(0, 1, int(d * SR)); x = noise(d); y = np.zeros(len(u)); blk = 1024
    for s in range(0, len(u), blk): fc = 250 * 3 ** u[s]; y[s:s + blk] = bp(x[s:s + blk], fc * 0.7, fc * 1.4, 1)
    return y * ar(d, 0.08, 0.15) * 0.7
def deflate(d=0.55):             # balloon going down: a soft, low "squeak" that falls
    t = tt(d); fr = 420 - 260 * (t / d) ** 0.8; fr = fr * (1 + 0.06 * np.sin(2 * np.pi * 23 * t))
    return lp(np.tanh(1.5 * sweep(fr, d)) * 0.6 + bp(noise(d), 300, 900) * 0.3, 1100) * ar(d, 0.03, 0.2) * 0.6
def crack(d=0.22): return lp(P(bp(noise(d), 500, 2200) * env(d, 0.008, 18), sweep(160 * np.ones(int(d * SR)), d) * env(d, 0.008, 14) * 0.5), 2400) * 0.7
def chime(): return P(clink(84, 1.2) * 0.6, pad0(clink(88, 1.2) * 0.45, 0.09), pad0(clink(91, 1.4) * 0.35, 0.18))
def release(d=1.2): return lp(bp(noise(d), 300, 1600), 1500) * ar(d, 0.25, 0.7) * 0.5
def pop(f0=520, f1=150, d=0.16):
    t = tt(d); return P(sweep(f1 + (f0 - f1) * np.exp(-t * 55), d) * env(d, 0.008, 9), lp(noise(d), 1500) * env(d, 0.009, 14) * 0.35)
def boing(d=0.6):                # tape springing loose: soft low spring, pitch wobble down
    t = tt(d); fr = 180 * (1 + 0.25 * np.exp(-t * 6) * np.sin(2 * np.pi * 14 * t)) * (1 - 0.25 * t / d)
    return lp(sweep(fr, d) + 0.3 * sweep(2 * fr, d), 900) * env(d, 0.01, 5) * 0.6
def tap(): d = 0.09; return lp(P(np.sin(2 * np.pi * 800 * tt(d)) * env(d, 0.008, 14), lp(noise(d), 1200) * env(d, 0.008, 20) * 0.4), 2500)
def murmur(d): t = tt(d); return bp(noise(d), 220, 800) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.1 * t) * np.sin(2 * np.pi * 0.31 * t)) * ar(d, 0.4, 0.4)
def room(d): return bp(noise(d), 120, 500) * ar(d, 0.3, 0.3) * 0.5


def chalk(d): return lp(bp(noise(d), 500, 1600) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 3.2 * tt(d)))), 1200) * ar(d, 0.05, 0.2) * 0.35
def street(d): t = tt(d); return (bp(noise(d), 180, 700) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.4 * t)) * 0.6 + lp(noise(d), 120) * 0.5) * ar(d, 0.4, 0.4)
def airhum(d): t = tt(d); return lp(sweep(np.full(len(t), 55.0), d) * 0.4 + bp(noise(d), 200, 600) * 0.25, 600) * ar(d, 0.4, 0.4)
def creak(d=0.5):
    t = tt(d); fr = 140 + 40 * np.sin(2 * np.pi * 1.5 * t); g = (np.sin(2 * np.pi * 38 * t) > 0.6).astype(float)
    return lp(sweep(fr, d) * g * 0.6 + bp(noise(d), 200, 700) * g * 0.3, 800) * ar(d, 0.03, 0.15)
def clack(): d = 0.12; return lp(P(np.sin(2 * np.pi * 175 * tt(d)) * env(d, 0.008, 12), lp(noise(d), 700) * env(d, 0.008, 22) * 0.5), 900)
def ching(): return lp(P(clink(79, 1.0) * 0.6, pad0(clink(84, 1.0) * 0.4, 0.07)), 2400)

def kick(d=0.32): t = tt(d); return lp(sweep(48 + 70 * np.exp(-t * 28), d) * env(d, 0.006, 6), 300)
def heart(): return P(sub(0.35, 58, 42) * 0.8, pad0(sub(0.3, 52, 40) * 0.55, 0.22))
def nightair(d): t = tt(d); return (lp(noise(d), 160) * 0.6 + bp(noise(d), 200, 500) * 0.15 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * t))) * ar(d, 0.4, 0.4)

def squeak(d=0.22):              # squeaky toy, low-passed (two short glides)
    t = tt(d); fr = 520 + 260 * np.sin(np.pi * t / d)
    return lp(sweep(fr, d) * ar(d, 0.012, 0.06), 1400) * 0.6
def growl(d=1.4):                # distant lion roar: low filtered noise + falling tone, far away
    t = tt(d); x = bp(noise(d), 90, 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * t)) + 0.5 * sweep(140 - 50 * t / d, d)
    return lp(x, 600) * ar(d, 0.12, 0.7)
def cups(d):                     # café cups: soft low clinks scattered
    out = np.zeros(int(d * SR))
    for k in range(int(d * 1.2)):
        s = lp(clink(76 + int(rng.integers(0, 5)), 0.3), 1800) * 0.25; i = int(rng.uniform(0, max(1, len(out) - len(s))))
        out[i:i + len(s)] += s
    return out
def brassy(ms, d, a=0.5, r=0.8):   # warm swell, low-passed
    x = sum(sum(np.sin(2 * np.pi * note(m) * h * tt(d)) / h ** 1.3 for h in (1, 2, 3, 4)) for m in ms)
    return lp(x, 900) * ar(d, a, r) / len(ms)
def timp(f0=55, d=0.9): t = tt(d); return lp(sweep(f0 * (1 + 0.15 * np.exp(-t * 20)), d) * env(d, 0.01, 4) + bp(noise(d), 60, 300) * env(d, 0.01, 14) * 0.3, 400)

M = np.zeros((2, NX))
# ---- hook: sly pizz walking bass (D minor) + reed, 0.15-4.2 s
Q = 60 / 104
SLY = [50, 53, 57, 53, 52, 55, 58, 55]
RESTS = [(2.6, 3.0), (3.25, 3.4), (11.45, 11.75), (27.1, 27.5), (1.85, 2.0)]
def walk(t0, t1, pat, g=0.6, oct=-12):
    t = t0; k = 0
    while t < t1:
        if not any(a <= t + 0.1 and t < b for a, b in RESTS): place(M, pz(pat[k % len(pat)] + oct, Q * 0.9, 700), t, -0.15, g)
        t += Q / 2; k += 1
walk(0.15, 4.1, SLY, 0.9)
place(M, clar(50 - 12, 1.2), 3.6, 0.1, 0.35)
# ---- lion: big swell + timpani, 4.2-6.4
place(M, brassy([41, 48, 53, 57], 2.3, 0.9, 0.25), 4.0, 0, 0.45)
place(M, pad([29, 41], 2.4, 0.6, 0.3, 300), 4.0, 0, 0.6)
for k, t0 in enumerate([4.15, 4.6, 4.95, 5.2, 5.27]): place(M, timp(43 if k < 4 else 38), t0, 0, 0.5 + 0.1 * k)
# deflate at "अहिले" (6.4): swell stops, one tiny high-ish pluck pair in the pause after "कुकुर" (7.45-7.99)
place(M, pz(74 - 12, 0.3, 900), 7.5, 0.2, 0.35); place(M, pz(69 - 12, 0.4, 900), 7.66, 0.2, 0.35)
# ---- villain motif (her moments): low "dun-dun-duun", octave down, low-passed
def villain(t0, g=0.35):
    for i, (m, d) in enumerate([(38, 0.16), (39, 0.16), (37, 0.55)]): place(M, brassy([m, m + 7], d + 0.15, 0.03, 0.12), t0 + i * 0.2, 0.1, g)
villain(6.5); villain(19.05); villain(29.45, 0.3)
# ---- facts: pizz ostinato 7.95-14.2 (no octaves), curious plucks in pauses
FACT = [50, 50, 57, 50, 55, 50, 53, 57]
walk(7.95, 14.1, FACT, 0.5)
place(M, pad([38, 45, 50], 6.3, 0.8, 1.0, 450), 7.95, 0, 0.35)
for t0, ms in [(11.84, [62, 65]), (12.92, [65, 69]), (14.12, [62, 57])]:
    for i, m in enumerate(ms): place(M, pz(m - 12, 0.4, 700), t0 + i * 0.13, 0.25, 0.45)
# ---- phone + face + park: lighter pizz, 14.3-22.0
walk(14.3, 21.95, [50, 57, 53, 57, 52, 57, 55, 57], 0.38)
place(M, pad([43, 50, 55], 7.8, 0.8, 1.0, 450), 14.3, 0, 0.28)
# ---- counter: ticking ostinato 22.0-28.2
walk(22.0, 27.9, [45, 52, 45, 50, 45, 52, 45, 49], 0.42)
place(M, pad([45, 49, 52], 6.0, 0.6, 0.8, 450), 22.0, 0, 0.3)
# ---- good news: D major lift 28.25-31.1
walk(28.25, 31.0, [50, 54, 57, 54, 55, 59, 57, 54], 0.5)
place(M, pad([50, 54, 57], 3.0, 0.3, 0.6, 600), 28.25, 0, 0.3)
# ---- bad news: drop to near silence at 31.15, sting on "तपाईंप्रति" (f972 = 32.4), sad reed after 33.13
place(M, pad([38, 45], 1.3, 0.05, 0.6, 300), 31.15, 0, 0.18)
place(M, sub(2.2, 62, 30), f(972), 0, 0.8)
place(M, pad([33, 40, 45], 2.0, 0.02, 1.4, 420), f(972), 0, 0.32)
place(M, clar(57 - 12, 0.35), 33.15, 0.1, 0.3); place(M, clar(53 - 12, 0.55), 33.48, 0.1, 0.3)
# ---- night: soft drone + slow low pulse 33.6-38.0
place(M, pad([34, 41, 46], 4.6, 0.6, 1.0, 380), 33.55, 0, 0.3)
t = 34.0; k = 0
while t < 37.9: place(M, pulse([34, 34, 41, 34][k % 4], 0.55), t, 0, 0.4); t += 0.62; k += 1
# ---- outro: D-major pizz + warm swell into the unclip, final chord at 42.62
walk(38.0, 42.6, [50, 54, 57, 62, 57, 54, 55, 57], 0.5)
place(M, pad([50, 54, 57], 4.7, 0.6, 0.6, 600), 38.0, 0, 0.3)
place(M, brassy([50, 54, 57, 62], 1.5, 0.6, 0.5), 41.6, 0, 0.35)
for i, m in enumerate([50, 54, 57, 62]): place(M, pz(m - 12, 0.8, 900), 42.62 + i * 0.02, 0, 0.5)

X = np.zeros((2, NX))
# ambience by setting
for a, b in [(0, 127), (191, 238), (370, 611), (814, 847), (934, 1007), (1141, 1283)]:
    place(X, murmur(f(b - a) + 0.2) * 0.5, f(a), 0, 0.22, "café murmur" if a == 0 else None)
    place(X, cups(f(b - a)), f(a), 0.3, 0.2, "café cups" if a == 0 else None)
place(X, lp(noise(f(64) + 0.2), 300) * ar(f(64) + 0.2, 0.2, 0.3), f(127), 0, 0.25, "savanna wind")
place(X, lp(noise(f(51) + 0.2), 260) * ar(f(51) + 0.2, 0.2, 0.3), f(611), 0, 0.18, "park air")
place(X, room(f(132)) * 0.6, f(238), 0, 0.3, "studio tone")
place(X, room(f(152)) * 0.6, f(662), 0, 0.3, None)
place(X, room(f(87)) * 0.5, f(847), 0, 0.25, "shop tone")
place(X, nightair(f(134) + 0.3), f(1007), 0, 0.5, "night air")
# hook
place(X, lp(sub(0.9, 70, 40), 300), 0.0, 0, 0.5, "soft open hit")
place(X, lp(growl(1.0), 500), f(8), -0.4, 0.3, "shadow roar")
place(X, lp(whoosh(0.25, 130, 800), 900), f(57), 0.4, 0.35, "leash tug")
place(X, lp(pop(300, 140, 0.14), 600), f(86), -0.3, 0.3, "shadow shrinks to a dog")
place(X, lp(whoosh(0.4, 120, 800), 900), f(122), 0, 0.3, "whoosh to the savanna")
place(X, lp(growl(1.4), 420), f(148), -0.2, 0.4, "lion roar")
place(X, squeak(0.22), f(224), 0.1, 0.4, "lap-dog squeak")
place(X, lp(whoosh(0.35, 120, 800), 900), f(233), 0, 0.3, "whoosh to the diagram")
place(X, pop(420, 160), f(276), 0.2, 0.4, "heart drops in")
for k in range(2): place(X, lp(whoosh(0.3, 100, 450), 500), f(343 + 3 * k), [-0.4, 0.4][k], 0.15, "two friends slide out" if k == 0 else None)
place(X, lp(pop(320, 140, 0.14), 650), f(372), 0, 0.35, "question pops")
place(X, lp(whoosh(0.3, 120, 800), 900), f(437), 0, 0.25, "phone up")
for k in range(5): place(X, tap() * 0.5, f(446 + 7 * k), 0.1, 0.2, "typing" if k == 0 else None)
place(X, lp(whoosh(0.25, 200, 1000), 1100), f(486), 0.2, 0.3, "message sent")
place(X, lp(P(sweep(np.full(int(0.3 * SR), 150.0), 0.3) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 18 * tt(0.3)))) * ar(0.3, 0.01, 0.05)), 500) * 0.7, f(516), 0.3, 0.35, "phone buzz")
place(X, lp(whoosh(0.3, 120, 700), 800), f(560), 0.2, 0.2, "head turns to her")
place(X, lp(chime(), 900) * 0.4, f(572), 0.3, 0.12, "her eye glint")
place(X, lp(whoosh(0.22, 120, 600), 700), f(586), 0.3, 0.3, "leash yank")
place(X, lp(chime(), 900) * 0.4, f(198), -0.2, 0.12, "glint in the booth")
place(X, lp(whoosh(0.35, 120, 800), 900), f(607), 0, 0.3, "match cut to the park")
for k in range(10): place(X, lp(tock(60, 0.1), 700) * 0.5, f(668 + 7 * k), 0.2, 0.18, "counter roll" if k == 0 else None)
place(X, ding(81) * 0.5, f(743), 0.2, 0.3, "89 ding")
place(X, lp(pop(300, 140, 0.14), 600), f(764), 0.2, 0.3, "two")
place(X, lp(whoosh(0.3, 120, 700), 800), f(805), 0, 0.22, "cut to him")
place(X, ching() * 0.7, f(836), 0.2, 0.35, "cash-register ching")
place(X, lp(whoosh(0.35, 130, 800), 900), f(843), 0, 0.28, "whoosh to the shop")
for k in range(3): place(X, pop(440 + 40 * k, 170), f(885 + 5 * k), [-0.2, 0.2, 0.4][k], 0.3, "hearts" if k == 0 else None)
place(X, lp(whoosh(0.3, 110, 700), 800), f(931), 0, 0.25, "cut to you alone")
place(X, lp(chime(), 700) * 0.4, f(999), 0, 0.15, "sad chime")
place(X, lp(whoosh(0.45, 110, 700), 800), f(1003), 0, 0.28, "whoosh to the night street")
place(X, lp(whoosh(0.3, 110, 700), 800), f(1076), 0, 0.25, "cut back to the café")
place(X, crack(0.2) * 0.6, f(1086), 0.3, 0.3, "heart cracks")
for k in range(3): place(X, lp(tock(55), 600), f(1086 + 10 * k), 0.4, 0.25, "footsteps" if k == 0 else None)
place(X, thunk(75, 0.4) * 0.7, f(1114), 0.3, 0.35, "sits down")
place(X, lp(whoosh(0.3, 120, 800), 900), f(1137), 0, 0.25, "phone up (share)")
place(X, tap(), f(1167), 0, 0.3, "tap contact")
place(X, lp(whoosh(0.25, 200, 1000), 1100), f(1186), 0.2, 0.3, "sent")
place(X, lp(whoosh(0.3, 120, 700), 800), f(1209), 0, 0.22, "cut to him")
place(X, pop(520, 180), f(1250), 0.1, 0.4, "leash unclips")
place(X, chime() * 0.5, f(1254), 0.2, 0.25, "freedom sparkle")
place(X, lp(boing(0.5), 700), f(1257), 0, 0.25, "jump")
def reverb(x, d=2.0, wet=0.25, decay=3.0):
    t = tt(d); out = x.copy()
    for ch in range(2):
        ir = rng.standard_normal(len(t)) * np.exp(-t * decay); ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2)); out[ch] += wet * fftconvolve(x[ch], ir)[: x.shape[1]]
    return out
M = reverb(M, 1.8, 0.22, 3.0); X = reverb(X, 1.2, 0.15, 4.0)
for ch in range(2):
    M[ch] = M[ch] - 0.86 * bp(M[ch], 350, 4000)
    X[ch] = lp(X[ch], 3600); X[ch] = X[ch] - 0.5 * bp(X[ch], 700, 3000)
M = M[:, :N]; X = X[:, :N]
fade = np.ones(N); nf = int(0.9 * SR); fade[-nf:] = np.linspace(1, 0, nf) ** 2
M *= fade; X *= fade

def save(name, x):
    x = x / max(1e-9, np.abs(x).max()) * 0.9
    with wave.open(name, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x.T * 32767).astype('<i2').tobytes())
save('music.wav', M); save('sfx.wav', X)
json.dump(CUES, open('work/sfx_cues.json', 'w'), ensure_ascii=False, indent=0)
mm = M.mean(0); pk = np.abs(mm).max()
for name, a, b in [("hook", 0, 4.1), ("lion", 4.2, 6.3), ("facts", 8, 14), ("phone", 14.5, 21.9), ("counter", 22, 27.9), ("good", 28.3, 31.0), ("drop", 31.2, 32.3), ("sting", 32.4, 33.5), ("night", 33.6, 37.9), ("outro", 38, 42.6)]:
    s = mm[int(a * SR): int(b * SR)]; print(f"music {name:8s} {20 * np.log10(np.sqrt(np.mean(s ** 2)) / pk + 1e-9):6.1f} dB")
