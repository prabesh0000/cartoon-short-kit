#!/usr/bin/env python3
"""Level-locked mix: music bed at 50 % of the voice level, SFX soft (25 %, peaks <= 0.4x voice).

Usage:
  python3 mix.py voice.mp3 music.wav sfx.wav [--out mix_raw.wav] [--music 0.5] [--sfx 0.25] [--sfx-peak 0.4]

- The voice is never changed (no EQ, no compression, no re-timing).
- Levels are gated RMS: 400 ms blocks every 100 ms, absolute gate -70 dBFS,
  relative gate -10 dB below the mean of the blocks that pass the absolute gate
  (the BS.1770 gating scheme, without K-weighting). Silence and gaps do not count,
  so each stem is measured only where it is actually sounding.
- music gain  = 0.5 x voice gated RMS / music gated RMS   (-6.0 dB vs voice)
- sfx gain    = 0.25 x voice gated RMS / sfx gated RMS (-12 dB), then lowered if needed so the
  loudest SFX peak is at most 0.4 x the voice peak (no hit pokes out over the narration).
- No ducking, no compression. If the summed mix would clip, ONE linear gain scales
  the whole mix (ratios stay exact). finish.sh then applies the loudness gain + limiter.
The output is as long as the voice. Prints measured levels; check music = -6.0 dB vs voice.
"""
import argparse, subprocess, sys, wave
import numpy as np

SR = 48000

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)

def fit(x, n):
    out = np.zeros(n); out[:min(n, len(x))] = x[:n]; return out

def gated_rms(x, block=0.4, hop=0.1, abs_db=-70.0, rel_db=-10.0):
    b, h = int(block * SR), int(hop * SR)
    if len(x) < b: x = np.pad(x, (0, b - len(x)))
    starts = np.arange(0, len(x) - b + 1, h)
    c = np.concatenate([[0.0], np.cumsum(x * x)])
    p = (c[starts + b] - c[starts]) / b                       # mean power per block
    p = p[p > 10 ** (abs_db / 10)]
    if p.size == 0: return 0.0
    p = p[p > p.mean() * 10 ** (rel_db / 10)]
    return float(np.sqrt(p.mean()))

db = lambda r: 20 * np.log10(max(r, 1e-12))

def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("voice"); ap.add_argument("music"); ap.add_argument("sfx")
    ap.add_argument("--out", default="mix_raw.wav")
    ap.add_argument("--music", dest="music_lvl", type=float, default=0.5, help="music level as a fraction of the voice (0.5 = -6 dB)")
    ap.add_argument("--sfx", dest="sfx_lvl", type=float, default=0.25, help="sfx level as a fraction of the voice")
    ap.add_argument("--sfx-peak", type=float, default=0.4, help="max sfx peak as a fraction of the voice peak")
    a = ap.parse_args()

    v = load(a.voice); N = len(v)
    m = fit(load(a.music), N); s = fit(load(a.sfx), N)
    Rv, Pv = gated_rms(v), float(np.abs(v).max())
    if Rv == 0: sys.exit("voice is silent")
    Rm, Rs = gated_rms(m), gated_rms(s)

    gm = a.music_lvl * Rv / Rm if Rm > 0 else 0.0
    gs = a.sfx_lvl * Rv / Rs if Rs > 0 else 0.0
    capped = False
    Ps = float(np.abs(s).max())
    if gs > 0 and gs * Ps > a.sfx_peak * Pv:
        gs = a.sfx_peak * Pv / Ps; capped = True

    mix = v + gm * m + gs * s
    pk = float(np.abs(mix).max()); g = 0.98 / pk if pk > 0.98 else 1.0   # one linear gain, ratios unchanged
    mix *= g
    write_wav(a.out, mix)

    # report from the stems as they sit in the mix
    vR = gated_rms(v * g)
    print(f"voice  gated RMS {db(vR):6.1f} dBFS   peak {db(Pv * g):6.1f} dBFS")
    if gm: print(f"music  {db(gated_rms(m * gm * g)) - db(vR):+5.1f} dB vs voice   (target {db(a.music_lvl):+.1f})")
    else:  print("music  silent stem, skipped")
    if gs:
        print(f"sfx    {db(gated_rms(s * gs * g)) - db(vR):+5.1f} dB vs voice   (target <= {db(a.sfx_lvl):+.1f})"
              f"   peak {db(Ps * gs * g):6.1f} dBFS{'  [capped at %.1f x voice peak]' % a.sfx_peak if capped else ''}")
    else:  print("sfx    silent stem, skipped")
    print(f"mix gain {db(g):+.1f} dB (anti-clip)   -> {a.out}  {N / SR:.2f}s")

if __name__ == "__main__":
    main()
