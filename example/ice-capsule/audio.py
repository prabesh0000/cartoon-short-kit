# "आइस चुरोटको बल": modern tense pulse + new soft SFX. The whole track is CIRCULAR: anything that rings past the
# end is wrapped onto the start, so the loop (f1099 -> f0) has no seam. Writes music.wav + sfx.wav (+ per-cue report).
import numpy as np, wave, json
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 1100 / 30                      # 36.667 s = the picture
N = int(round(DUR * SR)); NX = N + 4 * SR
rng = np.random.default_rng(7)
NY = SR / 2 - 100
E8 = DUR / 128                       # eighth note: 128 eighths fill the loop exactly (104.7 bpm)

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
def saw(freq, d, det=0.0, vib=0.0, vr=5.0):
    t = tt(d); f = freq * (1 + det) * (1 + vib * np.sin(2 * np.pi * vr * t + rng.random() * 6))
    ph = np.cumsum(f) / SR + rng.random(); return 2 * (ph % 1.0) - 1
def sweep(f, d): return np.sin(2 * np.pi * np.cumsum(f) / SR)
CUES = []
def place(buf, sig, t, pan=0.0, g=1.0, name=None):
    i = int(round(t * SR))
    if i < 0: sig = sig[-i:]; i = 0
    j = min(buf.shape[1], i + len(sig)); s = sig[: j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:j] += s * l * 1.414; buf[1, i:j] += s * r * 1.414
    if name: CUES.append((name, round(t, 3), round(t * 30)))

# ================= instruments (music) =================
def bass(m, d=0.26):   # filtered synth pluck for the pulse
    x = (saw(note(m), d, -0.003) + saw(note(m), d, 0.004)) / 2; t = tt(d)
    k = np.exp(-t * 18); return (lp(x, 700) * k + lp(x, 220) * (1 - k)) * env(d, 0.006, 5)
def pad(ms, d, a=0.6, r=0.9, fc=1300):
    x = sum(saw(note(m), d, det, 0.003) for m in ms for det in (-0.004, 0.0, 0.005)); return lp(x, fc) * ar(d, a, r) / len(ms)
def glass(m, d=1.2):    # icy pluck, partials kept under 3.5 kHz
    return sum(np.sin(2 * np.pi * note(m) * k * tt(d)) * a * env(d, 0.004, c) for k, a, c in [(1, 1, 5), (2.0, 0.35, 8), (3.0, 0.12, 11)])
def tick(): return lp(bp(noise(0.03), 1500, 3500) * env(0.03, 0.002, 8), 3500) * 0.5
def sub(d=2.0, f0=58, f1=34): t = tt(d); return sweep(f1 + (f0 - f1) * np.exp(-t * 3), d) * env(d, 0.01, 3)
def braam(ms, d=2.4, fc=700):
    x = sum(saw(note(m), d, det) for m in ms for det in (-0.004, 0.0, 0.005)); t = tt(d)
    y = lp(x, fc) * np.minimum(1, t / 0.08) * np.exp(-t * 1.2); return np.tanh(y * 0.5)
def riser(d, lo=150, hi=1800):
    t = tt(d); u = t / d; n = noise(d); y = np.zeros(len(t)); blk = 2048
    for s in range(0, len(t), blk): fc = lo * (hi / lo) ** u[s]; y[s:s + blk] = bp(n[s:s + blk], fc * 0.7, fc * 1.3, 1)
    return y * u ** 2

M = np.zeros((2, NX))
# chord plan over the circle: (start, end, pad notes, bass root)
PLAN = [(0.0, 4.8, [57, 60, 64, 71], 33), (4.8, 11.3, [53, 57, 60, 64, 72], 29), (11.47, 13.0, None, None),
        (13.0, 17.5, [50, 53, 57, 62], 26), (17.5, 26.6, [52, 56, 59, 65], 28), (26.6, 33.1, [57, 60, 64, 69], 33), (33.1, DUR, [57, 60, 64, 71], 33)]
for a, b, ch, root in PLAN:
    if ch is None: continue
    place(M, pad([m - 12 for m in ch], b - a + 0.9, a=0.5, r=0.9, fc=650), a, 0, 0.5)
# the pulse: one continuous grid of 128 eighths (so the wrap lines up); rests in the drop, half-time in the WHO section
for k in range(128):
    t = k * E8
    if 11.47 <= t < 13.0: continue
    root = next((r for a, b, ch, r in PLAN if a <= t < b and r), 33)
    half = 17.5 <= t < 26.6
    if half and k % 2: continue
    m = root + (12 if k % 8 == 6 else 0) + (7 if k % 8 == 3 else 0)
    place(M, bass(m, E8 * (2.0 if half else 0.95)), t, 0, 0.55 if half else 0.5)
# ticking 16ths under the facts (17.5 - 33)
t = 17.5
while t < 33.0: place(M, tick(), t, 0.3 if int(t / E8) % 2 else -0.3, 0.06); t += E8
# icy plucks: hook + menthol (cool colour), the board
PAUSES = [(0.0, 0.0), (4.23, 4.84), (7.75, 8.24), (10.88, 11.46), (15.36, 15.78), (17.06, 17.69), (23.28, 23.76), (26.37, 26.97), (29.69, 30.18), (32.73, 33.36)]
for a_, b_ in PAUSES[1:]:
    for i, t in enumerate(np.arange(a_ + 0.02, b_ - 0.1, E8)): place(M, glass([83, 79, 76][i % 3], 0.9), t, 0.3 * (1 if i % 2 else -1), 0.07)
# the drop + the turn: "तर अचम्मको कुरा" (11.47) -> "पूरै चुरोटमा छ" (15.77)
place(M, sub(1.8, 50, 30), 11.47, 0, 0.5)
place(M, riser(2.6), 13.17, 0, 0.18)
place(M, lp(braam([26, 33, 38, 41], 3.0, 650), 900), 15.77, 0, 0.42); place(M, sub(2.4, 56, 32), 15.77, 0, 0.55)
# the slide deeper (30.4 ->): a falling bass line
for i, m in enumerate([45, 43, 41, 40, 38]): place(M, bass(m, 0.7), 30.37 + i * 0.42, 0, 0.35)

# ================= SFX: new designs, all soft (attacks >= 8-10 ms, low-passed at 3.6 kHz) =================
def pop(f0=620, f1=170, d=0.16):        # capsule pop: a round "plip", no click
    t = tt(d); body = sweep(f1 + (f0 - f1) * np.exp(-t * 55), d) * env(d, 0.008, 9)
    puff = lp(noise(d), 1800) * env(d, 0.009, 14) * 0.35
    glint = np.sin(2 * np.pi * 1760 * t) * env(d, 0.008, 18) * 0.08
    return P(body, puff, glint)
def hiss(d=1.4, lo=900, hi=3200):       # cold menthol air: airy, slow swell
    return bp(noise(d), lo, hi) * ar(d, 0.12, d * 0.7) * 0.6
def shimmer(d=1.4, n=10, lo=84, hi=95):  # icy sparkle (1-2 kHz glass plucks)
    return P(*[np.concatenate([np.zeros(int(rng.random() * d * 0.6 * SR)), glass(lo + int(rng.random() * (hi - lo)), 0.6) * 0.25]) for _ in range(n)])
def whisper(d=0.45):                    # rumour: breathy "sss-shh" syllables
    t = tt(d); am = 0.5 + 0.5 * np.sin(2 * np.pi * (6 + 2 * rng.random()) * t + rng.random() * 6)
    return bp(noise(d), 1400, 3400) * am ** 2 * ar(d, 0.05, 0.15) * 0.7
def whoosh(d=0.6, lo=180, hi=1600, shape=1.4):
    n = int(d * SR); x = noise(d); u = np.linspace(0, 1, n); y = np.zeros(n); blk = 1024
    for s in range(0, n, blk): fc = lo * (hi / lo) ** np.sin(np.pi * u[s] * 0.5); y[s:s + blk] = bp(x[s:s + blk], fc * 0.6, fc * 1.5, 1)
    return y * np.sin(np.pi * u) ** shape
def whip(d=0.5):                        # whip-zoom: a fast rising whoosh that ends on the pop
    n = int(d * SR); x = noise(d); u = np.linspace(0, 1, n); y = np.zeros(n); blk = 512
    for s in range(0, n, blk): fc = 200 * (12) ** (u[s] ** 2); y[s:s + blk] = bp(x[s:s + blk], fc * 0.6, fc * 1.4, 1)
    return y * u ** 2.2 * np.minimum(1, (1 - u) * 30)
def thud(f0=52, d=0.9): t = tt(d); return P(sweep(f0 * (1 + 1.2 * np.exp(-t * 22)), d) * env(d, 0.01, 6), lp(noise(d), 220) * env(d, 0.01, 18) * 0.5)
def heart():                            # lub-dub, very low
    one = lambda f, g: sweep(f * np.ones(int(0.22 * SR)), 0.22) * env(0.22, 0.012, 8) * g
    return P(one(58, 1.0), np.concatenate([np.zeros(int(0.24 * SR)), one(50, 0.7)]))
def paper(d=0.38):                      # report slides in
    return bp(noise(d), 500, 2600) * np.sin(np.pi * tt(d) / d) ** 1.5 * 0.6
def rise(d=0.9, f0=300, f1=620):        # chart bar grows: a soft rising tone
    t = tt(d); f = f0 + (f1 - f0) * (t / d) ** 0.7
    return (sweep(f, d) + 0.3 * sweep(2 * f, d)) * ar(d, 0.04, 0.25) * 0.5
def creak(d=0.32, f=95):                # wooden cradle: stick-slip creak, band-limited
    t = tt(d); ff = f * (1 + 0.25 * np.sin(2 * np.pi * 3.1 * t)) * (1 + 0.04 * rng.standard_normal(len(t)).cumsum() / np.sqrt(len(t)))
    x = np.sign(np.sin(2 * np.pi * np.cumsum(ff) / SR)); return bp(x, 280, 1500) * np.sin(np.pi * t / d) ** 2 * 0.35
def slide(d=2.0, f0=420, f1=130):       # "deeper": falling soft tone
    t = tt(d); f = f1 + (f0 - f1) * (1 - t / d) ** 1.5; return (sweep(f, d) + 0.25 * sweep(f * 1.5, d)) * ar(d, 0.1, 0.5) * 0.45
def tap(): d = 0.09; t = tt(d); return lp(P(sweep(900 * np.ones(len(t)), d) * env(d, 0.008, 14), lp(noise(d), 1200) * env(d, 0.008, 20) * 0.4), 2500)
def ding(): return P(glass(76, 0.9) * 0.7, np.concatenate([np.zeros(int(0.11 * SR)), glass(83, 1.0) * 0.6]))
def squeak(d=0.25): t = tt(d); f = 520 + 260 * t / d; return bp(np.sign(np.sin(2 * np.pi * np.cumsum(f * (1 + 0.1 * np.sin(2 * np.pi * 37 * t))) / SR)), 400, 1600) * ar(d, 0.04, 0.08) * 0.18
def amb(d, lo, hi, a=0.5, r=0.6): return bp(noise(d), lo, hi) * ar(d, a, r)
def murmur(d): t = tt(d); return bp(noise(d), 250, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.3 * t) * np.sin(2 * np.pi * 0.37 * t)) * ar(d, 0.4, 0.4)

X = np.zeros((2, NX)); f = lambda fr: fr / 30
# loop point: the squeeze, then the pop split across the end/start (peak lands on f0 after the wrap)
place(X, squeak(0.22), f(1092), 0.1, 0.5, "squeeze squeak")
place(X, pop(), DUR - 0.012, 0, 0.6, "POP (loop, wraps to 0:00)")
place(X, hiss(1.3), DUR + 0.03, -0.2, 0.55, "menthol hiss (wraps)")
place(X, shimmer(1.0, 7), DUR + 0.05, 0.2, 0.5, "icy sparkle (wraps)")
place(X, whoosh(0.55, 150, 1000), f(64), 0.2, 0.3, "pull-back whoosh")
# 2: the rumour
place(X, amb(4.9, 200, 700) * 0.6 + murmur(4.9) * 0.5, f(73), 0, 0.35, "tole ambience")
for i in range(3): place(X, whisper(0.45), f(78 + i * 15), -0.5 + i * 0.33, [0.45, 0.4, 0.35, 0.15][i], f"whisper {i + 1}")
# 3-4: inside the filter
place(X, whoosh(0.7, 150, 1200), f(141), -0.2, 0.55, "whoosh into the filter")
place(X, glass(88, 1.6) * 0.5, f(162), 0.2, 0.45, "menthol tag glint")
place(X, pop(520, 140, 0.18), f(250), 0, 0.5, "capsule bursts (pop)")
place(X, hiss(2.2, 900, 3000), f(252), 0, 0.38, "cold mist hiss")
place(X, shimmer(1.8, 12), f(254), 0, 0.5, "icy shimmer")
place(X, lp(P(glass(76, 0.5), np.concatenate([np.zeros(int(0.12 * SR)), glass(72, 0.5)]), np.concatenate([np.zeros(int(0.24 * SR)), glass(67, 0.8)])), 1500) * 0.5, f(262), -0.4, 0.2, "thermometer drops (cold tinks)")
place(X, lp(whoosh(0.9, 300, 1400, 1.2), 1800), f(299), 0, 0.3, "smoke lifts, light (air)")
# 5-6: the tower
place(X, whoosh(0.7, 150, 1200), f(336), 0, 0.55, "whoosh to the tower")
place(X, amb(6.4, 120, 500) * 0.8, f(340), 0, 0.3, "low wind at the tower")
place(X, thud(46, 1.2), f(473), 0, 0.8, "soft low hit: whole cigarette")
# 7-9: the room
place(X, whoosh(0.5, 200, 1400), f(527), 0, 0.45, "whoosh to the room")
place(X, whoosh(0.4, 200, 1200), f(633), 0.2, 0.3, "cut to the chart")
place(X, paper(), f(531), -0.3, 0.6, "report slides in")
for k in range(10): place(X, heart(), f(560) + k * 0.86, 0, 0.75 - 0.03 * k, "heartbeat" if k == 0 else None)
place(X, lp(rise(0.3, 200, 260), 900), f(637), 0.3, 0.4, "chart appears")
place(X, lp(rise(0.85, 150, 310), 900), f(652), 0.3, 0.45, "chart bar rises (+40%)")
for k, g in enumerate([1.0, 0.8, 0.55, 0.3]): place(X, creak(), f(720 + 15 * k) - 0.12, 0.25, 0.6 * g, f"cradle creak {k + 1}")
# 10-11: the board
place(X, whoosh(0.6, 200, 1400), f(805), 0, 0.45, "whoosh to the board")
place(X, shimmer(1.4, 9, 80, 91), f(815), -0.2, 0.45, "cold mist on the board")
place(X, lp(slide(2.2, 240, 70), 700), f(912), 0, 0.5, "deeper (falling tone)")
# 12-13: friends, the tag, the whip
place(X, whoosh(0.55, 200, 1400), f(991), 0, 0.45, "whoosh to the friends")
place(X, amb(3.4, 200, 700) * 0.6 + murmur(3.4) * 0.5, f(995), 0, 0.3, "tole ambience 2")
place(X, tap(), f(1046), 0.2, 0.55, "phone tap")
place(X, ding(), f(1048), 0.3, 0.4, "tag ding")
place(X, whoosh(0.4, 250, 1500), f(1065), 0, 0.4, "phone rises")
place(X, lp(whip(0.48), 2600), f(1080), 0, 0.6, "whip-zoom")

def wrap(x):  # circular: what rings past the end lands on the start
    y = x[:, :N].copy(); y[:, : NX - N] += x[:, N:]; return y
def reverb(x, d=2.0, wet=0.25, decay=3.0):
    t = tt(d); out = x.copy()
    for ch in range(2):
        ir = rng.standard_normal(len(t)) * np.exp(-t * decay); ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2)); out[ch] += wet * fftconvolve(x[ch], ir)[: x.shape[1]]
    return out
M = reverb(M, 2.6, 0.3, 2.4); X = reverb(X, 1.6, 0.18, 3.5)
for ch in range(2):  # filters run BEFORE the wrap, so they never restart at the seam
    M[ch] = M[ch] - 0.78 * bp(M[ch], 450, 4000)            # fixed dip where the voice lives (no ducking)
    X[ch] = lp(X[ch], 3600); X[ch] = X[ch] - 0.5 * bp(X[ch], 700, 3000)
M = wrap(M); X = wrap(X)

def save(name, x):
    x = x / max(1e-9, np.abs(x).max()) * 0.9
    with wave.open(name, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x.T * 32767).astype('<i2').tobytes())
save('music.wav', M); save('sfx.wav', X)
json.dump(CUES, open('work/sfx_cues.json', 'w'), ensure_ascii=False, indent=0)
mm = M.mean(0); pk = np.abs(mm).max()
for name, a, b in [("hook", 0, 4.8), ("menthol", 4.8, 11.3), ("drop", 11.5, 13.0), ("turn", 13.0, 17.5), ("WHO", 17.7, 26.4), ("board", 27, 33), ("tag", 33.2, 36.6)]:
    s = mm[int(a * SR): int(b * SR)]; print(f"music {name:8s} {20 * np.log10(np.sqrt(np.mean(s ** 2)) / pk):6.1f} dB")
print("seam check: |end - start| sample step", float(np.abs(M[:, -1] - M[:, 0]).max()), float(np.abs(X[:, -1] - X[:, 0]).max()))
