# "The Day It Rained Meat" (kentucky-meat-shower, English): quirky-tense mystery (brief). Pizzicato + ticks for the hook
# and the downpour, a calm pastoral morning (birds, crackling soap fire), a hushed tremolo for "nobody looked high enough",
# then the music drops to a high-altitude drone + wind (never dead air) for "The best explanation?", a low brass swell on
# "a flock of vultures", a ticking build, and a comic pizzicato sting with timpani gags on "the rest join in". Deadpan end:
# one held low note + a single pluck on "do", birds again, fade for the loop. SFX soft (-12 dB): splats, plops, a squawk,
# chewing, bubble pops, whip whooshes, wing flaps and one cartoon gag per vulture (each quieter).
import numpy as np, wave, json
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 1007 / 30                      # 33.57 s = voice 33.07 s + 15 f hold (loop)
N = int(round(DUR * SR)); NX = N + 4 * SR
rng = np.random.default_rng(1876)
NY = SR / 2 - 100
E8 = 60 / 104 / 2                    # 104 bpm eighths (quirky mystery)

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

def paper(d=0.22): return lp(bp(noise(d), 500, 2400) * ar(d, 0.015, 0.12), 2600) * 0.5
def drain(d=1.8): t = tt(d); fr = 260 - 140 * (t / d); return lp(sweep(fr, d) * 0.5 + bp(noise(d), 200, 700) * 0.3, 700) * ar(d, 0.15, 0.5) * 0.6
def coinslide(d=0.35): return lp(P(clink(86, 0.3) * 0.5, bp(noise(d), 600, 2200) * ar(d, 0.02, 0.2) * 0.3), 2600)
def boop(): return pop(300, 180, 0.2)
def shimmer(): return lp(P(clink(84, 1.6) * 0.4, pad0(clink(88, 1.6) * 0.35, 0.12), pad0(clink(91, 1.6) * 0.3, 0.24), pad0(clink(96, 1.6) * 0.25, 0.36)), 3000)
def birds(d):
    y = np.zeros(int(d * SR)); t = 0.4
    while t < d - 0.4:
        n = int(0.09 * SR); tw = np.sin(2 * np.pi * np.cumsum(2600 + 700 * np.sin(np.linspace(0, 9, n))) / SR) * ar(0.09, 0.015, 0.05)
        i = int(t * SR); y[i:i + n] += lp(tw, 3400) * 0.3; t += 0.6 + rng.random() * 1.2
    return y



def strings(ms, d, a=0.9, r=1.2, fc=900):     # low string section: saw-ish partials, slow bow, slight vibrato
    t = tt(d); out = np.zeros(len(t))
    for m in ms:
        for det in (-0.004, 0.0, 0.005):
            fr = note(m) * (1 + det) * (1 + 0.003 * np.sin(2 * np.pi * 5.0 * t + m)); ph = 2 * np.pi * np.cumsum(fr) / SR
            out += sum(np.sin(k * ph) / k for k in range(1, 7))
    return lp(out, fc) * ar(d, a, r) / (3 * len(ms))
def timp(f0=73, d=1.2):
    t = tt(d); return lp(P(sweep(f0 * (1 + 0.08 * np.exp(-t * 20)), d) * env(d, 0.008, 5), lp(noise(d), 300) * env(d, 0.008, 25) * 0.5), 500)
def roll(d, f0=73, a0=0.15, a1=1.0):
    y = np.zeros(int(d * SR) + SR); t = 0.0
    while t < d:
        g = a0 + (a1 - a0) * (t / d) ** 1.5; h = timp(f0, 0.5) * g * (0.8 + 0.4 * rng.random()); i = int(t * SR); y[i:i + len(h)] += h; t += 0.065
    return y
def jet(d=2.6, rise=True):                     # airliner pass: low roar, slow swell (no whine above 1.5 kHz)
    u = np.linspace(0, 1, int(d * SR)); x = lp(noise(d), 900) * 0.7 + bp(noise(d), 120, 400)
    return lp(x, 1200) * (np.sin(np.pi * u) ** 1.2 if rise else (1 - u) ** 1.5) * 0.6
def rumble(d): t = tt(d); return lp(noise(d), 160) * (0.7 + 0.3 * np.sin(2 * np.pi * 4.5 * t)) * ar(d, 0.2, 0.3)
def whir(d): t = tt(d); return lp(bp(noise(d), 250, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * t)), 900) * ar(d, 0.05, 0.1) * 0.6
def water(d): return lp(noise(d), 350) * ar(d, 0.3, 0.3) * 0.6
def wind(d): t = tt(d); return lp(noise(d), 300) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * t)) * ar(d, 0.5, 0.5)


def waves(d):                      # soft surf: low-passed noise with slow swells
    t = tt(d); return lp(noise(d), 420) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * t) ** 2) * ar(d, 0.6, 0.6)
def gulls(d, n=3, seed=0):         # distant gulls, very soft, low-passed
    y = np.zeros(int(d * SR)); r = np.random.default_rng(seed)
    for k in range(n):
        t0 = 0.5 + r.random() * max(0.1, d - 1.5); m = int(0.28 * SR); u = np.linspace(0, 1, m)
        fr = 1500 - 500 * u + 120 * np.sin(2 * np.pi * 9 * u); c = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * u) ** 2
        i = int(t0 * SR); y[i:i + m] += lp(c, 2200) * 0.35
    return y
def horn(d=1.6):                   # far ship horn: low, slow attack, under the speech band
    t = tt(d); x = sum(np.sin(2 * np.pi * 73.4 * k * t) / k for k in (1, 2)); return lp(x, 240, 4) * ar(d, 0.25, 0.6) * 0.7
def knock(): d = 0.16; t = tt(d); return lp(P(sweep(130 * (1 + 0.5 * np.exp(-t * 40)), d) * env(d, 0.008, 12), lp(noise(d), 600) * env(d, 0.008, 25) * 0.5), 700)
def engine(d): t = tt(d); return lp(sweep(np.full(len(t), 42.0), d) * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * t)) + lp(noise(d), 200) * 0.5, 260) * ar(d, 0.3, 0.5)
def scribble(d=0.35): return lp(bp(noise(d), 600, 1800) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * tt(d)))), 1100) * ar(d, 0.02, 0.1) * 0.4

def hum(d): t = tt(d); return lp(np.sin(2 * np.pi * 60 * t) * 0.6 + np.sin(2 * np.pi * 120 * t) * 0.3 + bp(noise(d), 100, 300) * 0.15, 260) * ar(d, 0.2, 0.2)
def zap(d=0.6): t = tt(d); fr = 180 + 300 * (t / d) ** 0.5; return lp(sweep(fr, d) * (0.5 + 0.5 * np.sin(2 * np.pi * 40 * t)) * 0.6 + bp(noise(d), 300, 1200) * 0.3, 1300) * ar(d, 0.02, 0.3)
def piano(m, d=0.35): return lp(marimba(m, d) + 0.3 * pz(m, d, 1400), 1500)


def gag(d=0.55):                  # cartoon "hurk": a falling, bubbly low formant (no realism)
    t = tt(d); fr = 210 - 120 * (t / d) ** 0.7; x = np.tanh(2 * sweep(fr, d)) * (0.6 + 0.4 * np.sin(2 * np.pi * 17 * t))
    return lp(x * 0.5 + bp(noise(d), 200, 700) * 0.35 * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * t)), 1100) * ar(d, 0.02, 0.2) * 0.7
def splat(): d = 0.16; t = tt(d); return lp(P(sweep(150 * (1 + 0.6 * np.exp(-t * 35)), d) * env(d, 0.008, 10), lp(noise(d), 800) * env(d, 0.008, 16) * 0.6), 1000)
def plop(): return P(lp(pop(240, 90, 0.22), 700), pad0(lp(bp(noise(0.3), 300, 1400) * ar(0.3, 0.01, 0.25), 1500) * 0.4, 0.04))
def squawk(d=0.32):
    t = tt(d); fr = 640 + 260 * np.sin(2 * np.pi * 3 * t / d) * np.exp(-t * 4); x = np.tanh(2.5 * sweep(fr, d)) + 0.3 * bp(noise(d), 600, 1800)
    return lp(x, 1800) * ar(d, 0.012, 0.12) * 0.5
def chew(): d = 0.09; return lp(bp(noise(d), 250, 900) * ar(d, 0.012, 0.05), 900) * 0.5
def flap(): d = 0.22; return lp(noise(d), 380) * ar(d, 0.015, 0.16) * 0.8
def crackle(d):
    y = lp(noise(d), 500) * 0.18; t = 0.05
    while t < d - 0.05:
        c = lp(bp(noise(0.015), 500, 2200) * env(0.015, 0.003, 6), 2200) * (0.3 + 0.5 * rng.random()); i = int(t * SR); y[i:i + len(c)] += c[: max(0, len(y) - i)]; t += 0.05 + rng.random() * 0.25
    return y * ar(d, 0.3, 0.3)
def brass(ms, d, a=0.35, r=0.6, fc=650):    # low brass swell: bright partials, slow attack, low-passed (under the speech band)
    t = tt(d); out = np.zeros(len(t))
    for m in ms:
        ph = 2 * np.pi * note(m) * t; out += sum(np.sin(k * ph) / k ** 0.8 for k in range(1, 8))
    return lp(out, fc) * ar(d, a, r) / len(ms)

M = np.zeros((2, NX))
# beds (strings/pads) per section; pizz ostinato density per section
SECT = [(0.0, f(141), 38, [26, 38, 45, 50], 0.42, "hook"),         # D minor, curious, ticking
        (f(141), f(362), 43, [31, 43, 47, 50], 0.3, "morning"),   # G major, pastoral, light
        (f(362), f(590), 38, [26, 38, 45, 50], 0.48, "rain"),     # D minor, busy
        (f(590), f(672), 38, [26, 38, 45], 0.0, "hush"),          # tremolo, rising
        (f(672), f(782), 38, [26, 33], 0.0, "explain"),           # drone + wind (no beat)
        (f(782), f(852), 38, [26, 38, 45, 50], 0.38, "build"),    # ticking build
        (f(852), f(932), 41, [29, 41, 45, 48], 0.5, "sting"),     # F major comic sting
        (f(932), DUR + 0.01, 38, [26, 38], 0.0, "deadpan")]       # held low note
for a, b, root, ch, g, name in SECT:
    d = b - a + 0.6
    if name == "hush": place(M, trem([38, 45, 50], d, 6.0), a, 0, 0.34); place(M, rise(b - a, 90, 180), a + 0.3, 0, 0.25)
    elif name == "explain": place(M, pad(ch, d, 0.15, 0.8, 220), a, 0, 0.2); place(M, strings([26, 33, 38], d, 0.4, 0.8, 320), a, 0, 0.1)
    elif name == "deadpan": place(M, strings([26, 38], d, 0.05, 0.7, 380), a, 0, 0.32)
    else: place(M, strings(ch, d, 0.05 if a == 0 else 0.25, 0.7, 520), a, 0, 0.36 if name != "morning" else 0.3)
PAT = {"hook": [0, 0, 7, 0, 5, 0, 7, 3], "morning": [0, 4, 7, 4, 0, 4, 7, 12], "rain": [0, 7, 0, 5, 0, 7, 3, 5], "build": [0, 0, 0, 1, 0, 0, 0, 3], "sting": [12, 7, 4, 0, 7, 4, 0, -5]}
k = 0; t = 0.0
while t < DUR - 0.8:
    sec = next(x for x in SECT if x[0] <= t < x[1]); root, g, name = sec[2], sec[4], sec[5]
    if g > 0:
        p = PAT[name][k % 8]
        if name == "morning":
            if k % 2 == 0: place(M, pz(root + 12 + p, 0.4, 800), t, 0.25 * np.sin(k), g * 0.5)
        else: place(M, pz(root + p, 0.3, 700), t, 0.2 * np.sin(k), g * 0.6); place(M, pulse(root - 12 + (p if p >= 0 else 0), E8 * 0.7), t, 0, g * 0.5)
        if name in ("hook", "rain", "build") and k % 2 == 1: place(M, lp(tick(), 2600), t, 0.3, 0.1 if name != "build" else 0.06 + 0.12 * (t - sec[0]) / (sec[1] - sec[0]))
    t += E8; k += 1
place(M, brass([38, 45], 1.6, 0.5, 0.8, 480), f(392), 0, 0.16)                      # "it poured meat"
place(M, lp(clar(50, 0.6), 900), f(476), 0, 0.12); place(M, lp(clar(48, 0.6), 900), f(520), 0, 0.12); place(M, lp(clar(45, 0.7), 900), f(556), 0, 0.12)  # sly bassoon on the tasting
place(M, brass([26, 33, 38], 2.6, 0.9, 1.0, 460), f(722), 0, 0.26)             # "a flock of vultures" swell
place(M, timp(49, 1.4), f(754) - 0.01, 0, 0.32)
for i, fr in enumerate((858, 868, 884)): place(M, timp(53 - 2 * i, 0.9), f(fr), 0, 0.26)   # each gag lands on a timp hit
place(M, pz(50, 0.8, 600), f(978) - 0.01, 0, 0.3)                              # the single pluck on "do"

X = np.zeros((2, NX))
yard = [(f(141), f(590)), (f(932), DUR)]
for a, b in yard: place(X, crackle(b - a), a, -0.2, 0.12, "fire crackle" if a == f(141) else None); place(X, birds(b - a), a, 0.3, 0.22, "farm birds" if a == f(141) else None)
place(X, wind(f(932) - f(672)), f(672), 0, 0.2, "high wind")
place(X, lp(whoosh(0.45, 150, 900), 1000), f(46), 0, 0.2, "steak past the lens")
place(X, plop(), f(118), 0.2, 0.3, "kettle plop"); place(X, plop(), f(338), 0.2, 0.26, "kettle plop 2")
place(X, lp(whoosh(0.5, 120, 700), 800), f(136), 0, 0.16, "time flash")
for i in range(34): place(X, splat() * (0.6 + 0.4 * rng.random()), f(372 + 2.7 * i + 3 * rng.random()), rng.uniform(-0.6, 0.6), 0.14, "splats" if i == 0 else None)
place(X, lp(squawk(0.28), 1300), f(443), -0.2, 0.1, "squawk")
for fr in list(range(478, 512, 5)) + list(range(522, 545, 5)) + list(range(554, 568, 5)): place(X, chew(), f(fr), -0.1, 0.12, "chewing" if fr == 478 else None)
place(X, lp(pop(340, 150), 900), f(518), -0.2, 0.16, "bubble pop"); place(X, lp(pop(360, 160), 900), f(553), 0.2, 0.16)
place(X, lp(whip(0.4), 1400), f(538), 0, 0.12, "whip A->B")
place(X, lp(whoosh(1.4, 120, 800), 900), f(626), 0, 0.2, "crane up")
place(X, lp(whoosh(1.0, 150, 1000), 1100), f(696), 0, 0.24, "cloud fly-through")
for fr in (735, 768, 800, 812): place(X, flap(), f(fr), rng.uniform(-0.4, 0.4), 0.18, "wing flap" if fr == 735 else None)
place(X, gag(), f(830), 0.1, 0.3, "gag 1")
place(X, lp(gag(0.4), 700), f(858), -0.2, 0.09, "gag 2")
place(X, lp(gag(0.4), 700), f(868), 0.2, 0.09, "gag 3")
for i in range(6): place(X, lp(gag(0.35), 900), f(888 + 3 * i), rng.uniform(-0.6, 0.6), 0.05 * (1 - 0.13 * i), "gag chain" if i == 0 else None)
place(X, P(splat(), pad0(lp(pop(260, 120, 0.18), 700) * 0.6, 0.0)), f(951), 0.2, 0.22, "chunk on the ladle")
place(X, lp(whoosh(0.7, 140, 800), 900), f(984), 0, 0.16, "tilt to the sky")

def reverb(x, d=2.0, wet=0.25, decay=3.0):
    t = tt(d); out = x.copy()
    for ch in range(2):
        ir = rng.standard_normal(len(t)) * np.exp(-t * decay); ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2)); out[ch] += wet * fftconvolve(x[ch], ir)[: x.shape[1]]
    return out
M = reverb(M, 1.4, 0.2, 3.5); X = reverb(X, 1.0, 0.12, 4.5)
for ch in range(2):
    M[ch] = M[ch] - 0.86 * bp(M[ch], 350, 4000)
    X[ch] = lp(X[ch], 3600); X[ch] = X[ch] - 0.5 * bp(X[ch], 700, 3000)
M = M[:, :N].copy(); X = X[:, :N].copy()
fade = np.ones(N); nf = int(0.9 * SR); fade[-nf:] = np.cos(np.linspace(0, np.pi / 2, nf)) ** 2
M *= fade; X *= fade
def save(name, x):
    x = x / max(1e-9, np.abs(x).max()) * 0.9
    with wave.open(name, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x.T * 32767).astype('<i2').tobytes())
save('music.wav', M); save('sfx.wav', X)
json.dump(CUES, open('work/sfx_cues.json', 'w'), ensure_ascii=False, indent=0)
mm = M.mean(0); pk = np.abs(mm).max()
for a, b, *_ , name in SECT:
    s = mm[int(a * SR): int(min(b, DUR) * SR)]; print(f"music {name:8s} {a:5.1f}-{min(b, DUR):5.1f}s {20 * np.log10(np.sqrt(np.mean(s ** 2)) / pk + 1e-9):6.1f} dB")
