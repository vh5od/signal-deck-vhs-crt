import argparse
import json
import pathlib
import subprocess
import sys


ROOT = pathlib.Path(__file__).resolve().parent
SOURCE = ROOT.parent / "old-digital-camera.mp4"
DEFAULT_OUTPUT = ROOT.parent / "old-digital-camera-vhs-crt-ui.mp4"


def clamp(value, low, high):
    return max(low, min(high, float(value)))


def ffmpeg_path():
    bundled = ROOT / "bin" / "ffmpeg"
    if bundled.exists():
        return str(bundled)
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def build_filter(s):
    chroma_smear = clamp(s["chroma_smear"], 0, 100) * 0.08
    tape_wave = clamp(s["tape_wave"], 0, 100) * 0.045
    crease_amount = clamp(s["tape_crease"], 0, 100) / 100
    crease_speed = 0.18 + clamp(s["crease_speed"], 0, 100) * 0.012
    crease_shift = crease_amount * 15
    crease_width = 4 + crease_amount * 18
    discolor = clamp(s["crease_discoloration"], 0, 100) / 100 * 0.85
    jpeg_quality = clamp(s.get("jpeg_quality", 100), 1, 100)
    jpeg_strength = (100 - jpeg_quality) / 99
    black_crush = clamp(s.get("tone_low", 0), 0, 50)
    white_clip = clamp(s.get("tone_high", 255), 200, 255)
    ringing_amount = clamp(s.get("sharpen_amount", 0), 0, 10)
    ringing_width = clamp(s.get("sharpen_size", 2), 1, 5)
    cutoff_y = clamp(s.get("cutoff_y", 1), 0.01, 1)
    cutoff_i = clamp(s.get("cutoff_i", 0.1), 0.001, 0.1)
    cutoff_q = clamp(s.get("cutoff_q", 0.1), 0.001, 0.1)
    vertical_bleed = clamp(s.get("chroma_crosstalk", 0), 0, 0.95)
    chroma_shift = clamp(s.get("chroma_shift_x", 0), 0, 15)
    heisei_noise_y = clamp(s.get("heisei_noise_y", 0), 0, 0.1)
    heisei_noise_c = clamp(s.get("heisei_noise_c", 0), 0, 0.1)
    color_banding = clamp(s.get("color_banding", 0), 0, 100) / 100
    line_jitter_freq = clamp(s.get("jitter_freq", 0.05), 0.01, 0.2)
    line_jitter_amp = clamp(s.get("jitter_amp", 0), 0, 5)
    line_jitter_roughness = clamp(s.get("jitter_roughness", 0.3), 0.3, 10)
    head_rows = clamp(s.get("head_switch_rows", 0), 0, 100)
    head_pull = clamp(s.get("head_switch_pull", 0), 0, 50)
    head_noise = clamp(s.get("head_switch_noise", 0), 0, 1)
    cast_r = clamp(s.get("cast_r", 1), 0.8, 1.2)
    cast_g = clamp(s.get("cast_g", 1), 0.8, 1.2)
    cast_b = clamp(s.get("cast_b", 1), 0.8, 1.2)
    dropout_count = round(clamp(s.get("dropout_count", 0), 0, 50))
    dropout_length = clamp(s.get("dropout_max_len", 80), 10, 200)
    dropout_intensity = clamp(s.get("dropout_strength", s.get("dropout_noise_freq", 0)), 0, 1)

    ca = round(clamp(s["chromatic_aberration"], 0, 100) / 10)
    threshold = round(clamp(s["highlight_threshold"], 0, 255))
    bloom = clamp(s["bloom_strength"], 0, 100) / 100
    bloom_radius = clamp(s["bloom_radius"], 0.1, 30)
    exposure = clamp(s["overexposure"], 0, 100)
    brightness = exposure * 0.0004
    contrast = 1 + exposure * 0.0018
    glow = clamp(s["phosphor_glow"], 0, 100) / 100
    glow_radius = clamp(s["phosphor_blur"], 0.1, 20)
    scan = clamp(s["scanlines"], 0, 100)
    scan_depth = scan * 0.0042
    spacing = round(clamp(s["scanline_spacing"], 2, 10))
    curve = clamp(s["curvature"], 0, 100)
    k1 = -curve * 0.001
    k2 = curve * 0.00022
    vig = clamp(s["vignette"], 0, 100)
    vig_angle = 0.25 + vig * 0.00726
    jitter_px = clamp(s["horizontal_jitter"], 0, 100) * 0.1
    crop_margin = max(2, int(jitter_px * 2 + 4))

    # FFmpeg expressions approximate the referenced shader's time-varying tape
    # wave, moving crease and head-switch fault. Chroma is sampled over a
    # wider horizontal footprint than luma, echoing the shader's YIQ filtering.
    wave = (
        f"{tape_wave:.4f}*(0.65*sin(Y*0.055+T*1.7)"
        "+0.35*sin(Y*0.21-T*7.9))"
    )
    crease_center = f"H*(0.5+0.43*sin(T*{crease_speed:.4f}))"
    crease = (
        f"exp(-pow(Y-({crease_center}),2)/(2*pow({crease_width:.4f},2)))"
    )
    line_jitter = (
        f"{line_jitter_amp:.4f}*sin(floor(Y/{line_jitter_roughness:.4f})"
        f"*{line_jitter_freq * 6.2831853:.6f}+floor(T*24)*0.71)"
    )
    head = f"gt(Y,H-{head_rows:.4f})"
    head_drag = (
        f"({head})*{head_pull:.4f}*(0.65+0.35*sin(Y*0.36+floor(T*24)))"
    )
    sample_x = (
        f"clip(X+({wave})+({crease})*{crease_shift:.4f}"
        f"+({line_jitter})+({head_drag}),0,W-1)"
    )
    luma_radius = (1 - cutoff_y) * 1.5
    loss_i = 1 - (cutoff_i - 0.001) / 0.099
    loss_q = 1 - (cutoff_q - 0.001) / 0.099
    chroma_radius = max(
        0.1,
        chroma_smear + (loss_i * 8 + loss_q * 10) / 2,
    )
    cb_tape = (
        f"128+(cb(clip(({sample_x})-{chroma_shift:.4f},0,W-1),Y)-128)"
        f"*(1-({crease})*{discolor * 0.38:.4f})"
    )
    cr_tape = (
        f"128+(cr(clip(({sample_x})-{chroma_shift:.4f},0,W-1),Y)-128)"
        f"*(1-({crease})*{discolor * 0.22:.4f})"
    )

    dropout = ""
    if dropout_count and dropout_intensity:
        scratches = []
        for index in range(dropout_count):
            y_pos = f"mod({index * 73 + 19}+floor(T*11)*37,H)"
            x_pos = f"mod({index * 113 + 31}+floor(T*11)*53,W)"
            scratches.append(
                f"between(Y,{y_pos},({y_pos})+1)*"
                f"between(mod(X-({x_pos})+W,W),0,{dropout_length:.3f})"
            )
        dropout = (
            "+(" + "+".join(scratches) + ")"
            f"*{dropout_intensity * 72:.4f}*(0.45+0.55*abs(sin(X*2.7+Y)))"
        )

    tone_range = max(1, white_clip - black_crush)
    red_tone = f"clip((val-{black_crush:.3f})*255/{tone_range:.3f}*{cast_r:.4f},0,255)"
    green_tone = f"clip((val-{black_crush:.3f})*255/{tone_range:.3f}*{cast_g:.4f},0,255)"
    blue_tone = f"clip((val-{black_crush:.3f})*255/{tone_range:.3f}*{cast_b:.4f},0,255)"

    input_chain = (
        "[0:v]scale='if(gt(iw,ih),min(iw,1024),-2)':"
        "'if(gt(iw,ih),-2,min(ih,1024))':flags=area"
    )
    if jpeg_strength:
        factor = 1 + jpeg_strength * 1.5
        input_chain += (
            f",scale='trunc(iw/{factor:.5f}/2)*2':'trunc(ih/{factor:.5f}/2)*2':flags=area,"
            f"scale='trunc(iw*{factor:.5f}/2)*2':'trunc(ih*{factor:.5f}/2)*2':flags=neighbor"
        )
    if ringing_amount:
        unsharp_size = max(3, min(17, round(ringing_width) * 2 + 1))
        input_chain += (
            f",unsharp=luma_msize_x={unsharp_size}:luma_msize_y={unsharp_size}:"
            f"luma_amount={min(5, ringing_amount):.3f}"
        )
    input_chain += (
        f",format=rgb24,lutrgb=r='{red_tone}':g='{green_tone}':b='{blue_tone}',"
        "format=yuv444p,"
        f"geq=lum='clip(lum({sample_x},Y)+({crease})*{crease_amount * 18:.4f}{dropout}"
        f"+({head})*gt(0.5+0.5*sin(X*12.9898+Y*78.233+floor(T*24)),{1-head_noise:.4f})*72,16,238)':"
        f"cb='{cb_tape}':cr='{cr_tape}',"
        f"boxblur=lr={luma_radius:.2f}:lp=1:cr={chroma_radius:.2f}:cp=1"
    )
    if vertical_bleed:
        input_chain += f",gblur=sigma=0.01:sigmaV={vertical_bleed * 2.5:.3f}:planes=6"
    parts = [input_chain]
    if curve:
        parts[-1] += (
            f",lenscorrection=k1={k1:.4f}:k2={k2:.4f}:"
            "i=bilinear:fc=black"
        )
    parts[-1] += (
        f",format=rgb24,rgbashift=rh={ca}:bh={-ca}:edge=smear,"
        "split=3[sharp][soft][high]"
    )
    threshold_expr = f"if(gte(val,{threshold}),min(255,(val-{threshold})*3.3),0)"
    parts += [
        (
            f"[soft]gblur=sigma={glow_radius:.2f},"
            "eq=brightness=-0.035:saturation=1.08[glow]"
        ),
        (
            f"[high]lutrgb=r='{threshold_expr}':g='{threshold_expr}':"
            f"b='{threshold_expr}',gblur=sigma={bloom_radius:.2f},"
            "eq=brightness=0.025:saturation=0.85[halation]"
        ),
        (
            f"[sharp][glow]blend=all_mode=screen:all_opacity={glow:.3f}"
            "[softened]"
        ),
        (
            f"[softened][halation]blend=all_mode=screen:all_opacity={bloom:.3f},"
            f"eq=brightness={brightness:.4f}:contrast={contrast:.4f}:"
            "saturation=1.02,format=yuv444p"
        ),
    ]

    tail = ""
    if scan:
        light = 1 - scan_depth
        tail += (
            f",geq=lum='clip(lum(X,Y)*({light:.4f}+{scan_depth:.4f}*"
            f"gte(mod(Y,{spacing}),{max(1, spacing // 2)}))"
            "+4*exp(-pow(Y-mod(T*95,H),2)/1800),16,238)':"
            "cb='cb(X,Y)':cr='cr(X,Y)'"
        )
    if color_banding:
        tail += (
            f",geq=lum='lum(X,Y)':"
            f"cb='clip(cb(X,Y)+sin(Y*0.31+T*17)*{color_banding * 23:.4f},16,240)':"
            f"cr='clip(cr(X,Y)+sin(Y*0.27-T*13)*{color_banding * 28:.4f},16,240)'"
        )
    if vig:
        tail += f",vignette=angle={vig_angle:.4f}"
    tail += (
        f",crop=iw-{crop_margin}:ih:"
        f"x='{crop_margin / 2:.2f}+{jitter_px:.2f}*sin(t*9)':y=0,"
        f"scale=iw+{crop_margin}:ih:flags=bilinear"
    )
    total_noise = heisei_noise_y * 500
    if heisei_noise_y or heisei_noise_c:
        tail += (
            f",noise=c0s={round(total_noise * 0.1)}:"
            f"c1s={round(total_noise * 0.08 + heisei_noise_c * 50)}:"
            f"c2s={round(total_noise * 0.08 + heisei_noise_c * 50)}:"
            "allf=t+u:all_seed=117"
        )
    tail += ",format=yuv420p,setsar=1[v]"
    parts[-1] += tail
    return ";".join(parts)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=pathlib.Path, required=True)
    parser.add_argument("--source", type=pathlib.Path, default=SOURCE)
    parser.add_argument("--output", type=pathlib.Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--duration", type=float)
    args = parser.parse_args()
    settings = json.loads(args.config.read_text())

    command = [
        ffmpeg_path(), "-hide_banner", "-y", "-filter_threads", "4",
        "-i", str(args.source),
    ]
    if args.duration:
        command += ["-t", str(args.duration)]
    command += [
        "-filter_complex", build_filter(settings),
        "-map", "[v]", "-map", "0:a?",
        "-c:v", "libx264", "-preset", "medium", "-crf", "17",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
        "-progress", "pipe:1", "-nostats", str(args.output),
    ]
    process = subprocess.Popen(
        command, stdout=subprocess.PIPE, stderr=sys.stderr, text=True
    )
    assert process.stdout is not None
    for line in process.stdout:
        print(line.rstrip(), flush=True)
    raise SystemExit(process.wait())


if __name__ == "__main__":
    main()
