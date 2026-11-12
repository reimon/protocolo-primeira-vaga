"""Converte fundo magenta (#FF00FF) em transparência e valida os PNGs em assets/sprites/."""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SPRITES = ROOT / "assets" / "sprites"
CHROMA = ["hero_sheet.png", "boss_ats.png"]
REQUIRED = CHROMA + ["mentor_portrait.png", "bg_buildings.png", "fg_promenade.png"]


def is_magenta(r, g, b):
    # Tolerante a compressão/antialias: magenta forte com verde baixo
    return r > 150 and b > 150 and g < 110 and abs(r - b) < 90


def key_out(path: Path):
    img = Image.open(path).convert("RGBA")
    px = img.load()
    w, h = img.size
    removed = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_magenta(r, g, b):
                px[x, y] = (0, 0, 0, 0)
                removed += 1
            elif r > 120 and b > 120 and g < 140 and r - g > 60 and b - g > 60:
                # Halo rosado nas bordas: remove tinta magenta
                px[x, y] = (min(r, g + 40), g, min(b, g + 40), a)
    bbox = img.getbbox()
    img.save(path)
    print(f"  chroma {path.name}: {removed} px transparentes, bbox={bbox}")


def main():
    missing = [f for f in REQUIRED if not (SPRITES / f).exists()]
    if missing:
        print("FALTANDO:", missing)
        sys.exit(1)
    for f in CHROMA:
        key_out(SPRITES / f)
    for f in REQUIRED:
        im = Image.open(SPRITES / f)
        print(f"  OK {f}: {im.size} {im.mode}")
    print("Todos os assets validados.")


if __name__ == "__main__":
    main()


def slice_hero():
    """Divide hero_sheet em 4 frames uniformes (alinhados pela base) -> hero_frames.png"""
    img = Image.open(SPRITES / "hero_sheet.png")
    w, h = img.size
    alpha = img.getchannel("A")
    cols = [any(alpha.getpixel((x, y)) > 0 for y in range(0, h, 2)) for x in range(w)]
    spans, start = [], None
    for x, c in enumerate(cols + [False]):
        if c and start is None:
            start = x
        elif not c and start is not None:
            if x - start > 20:
                spans.append((start, x))
            start = None
    # funde spans muito próximos até restarem 4
    while len(spans) > 4:
        gaps = [spans[i + 1][0] - spans[i][1] for i in range(len(spans) - 1)]
        i = gaps.index(min(gaps))
        spans[i:i + 2] = [(spans[i][0], spans[i + 1][1])]
    frames = [img.crop((a, 0, b, h)).crop(img.crop((a, 0, b, h)).getbbox()) for a, b in spans]
    cw = max(f.width for f in frames)
    ch = max(f.height for f in frames)
    sheet = Image.new("RGBA", (cw * len(frames), ch), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.paste(f, (i * cw + (cw - f.width) // 2, ch - f.height), f)
    sheet.save(SPRITES / "hero_frames.png")
    print(f"  hero_frames.png: {len(frames)} frames de {cw}x{ch}")


def crop_assets():
    fg = Image.open(SPRITES / "fg_promenade.png")
    fg.crop((0, 120, fg.width, fg.height)).save(SPRITES / "fg_promenade_strip.png")
    boss = Image.open(SPRITES / "boss_ats.png")
    boss.crop(boss.getbbox()).save(SPRITES / "boss_ats_trim.png")
    print("  fg_promenade_strip.png e boss_ats_trim.png gerados")


if __name__ == "__main__" and "--post" in sys.argv:
    slice_hero()
    crop_assets()
