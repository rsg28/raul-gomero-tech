"""Generate branded project cover images for the tech portfolio."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(r"C:\Users\rgome\OneDrive\Desktop\Archivos personales\graduate\website-tech\src\assets")
W, H = 1200, 750


def make_gradient(top_hex, bot_hex):
    img = Image.new("RGB", (W, H), top_hex)
    top = tuple(int(top_hex[i:i+2], 16) for i in (1, 3, 5))
    bot = tuple(int(bot_hex[i:i+2], 16) for i in (1, 3, 5))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        r = int(top[0] + (bot[0] - top[0]) * y / H)
        g = int(top[1] + (bot[1] - top[1]) * y / H)
        b = int(top[2] + (bot[2] - top[2]) * y / H)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    return img


def font(size, bold=True):
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    try:
        return ImageFont.truetype(name, size)
    except Exception:
        try:
            return ImageFont.truetype("arial.ttf" if not bold else "arialbd.ttf", size)
        except Exception:
            return ImageFont.load_default()


def center_text(draw, text, y, size, color=(255, 255, 255), bold=True):
    f = font(size, bold=bold)
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, y), text, font=f, fill=color)


def make_comptia():
    """CompTIA A+ study branded card. Uses CompTIA red-ish orange accent."""
    img = make_gradient("#1A1F2E", "#0F172A").convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    # Subtle circuit-like grid pattern
    for x in range(0, W, 60):
        draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 8), width=1)
    for y in range(0, H, 60):
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, 8), width=1)

    # Big accent circle top-right (CompTIA red)
    draw.ellipse((W - 360, -180, W + 180, 360), fill=(220, 38, 38, 100))
    # Softer inner glow
    draw.ellipse((W - 280, -100, W + 100, 280), fill=(239, 68, 68, 80))

    # Tag pill top-left
    tag = "IT CERTIFICATION"
    tag_font = font(28)
    tw = draw.textbbox((0, 0), tag, font=tag_font)[2]
    draw.rounded_rectangle((60, 60, 60 + tw + 60, 128), radius=34, outline=(239, 68, 68, 240), width=3, fill=(239, 68, 68, 40))
    draw.text((90, 76), tag, font=tag_font, fill=(254, 226, 226, 240))

    # Big Cert badge look — "A+" centered in a circle
    cx, cy = W // 2, H // 2 - 50
    # outer ring
    draw.ellipse((cx - 130, cy - 130, cx + 130, cy + 130), outline=(239, 68, 68, 240), width=6)
    # inner solid
    draw.ellipse((cx - 110, cy - 110, cx + 110, cy + 110), fill=(220, 38, 38, 220))
    # "A+" text
    ap_font = font(140)
    bbox = draw.textbbox((0, 0), "A+", font=ap_font)
    apw = bbox[2] - bbox[0]
    aph = bbox[3] - bbox[1]
    draw.text((cx - apw // 2, cy - aph // 2 - 12), "A+", font=ap_font, fill=(255, 255, 255))

    # Title below the badge
    center_text(draw, "CompTIA A+ Core 1", H // 2 + 130, 62, (255, 255, 255))
    # Subtitle
    center_text(draw, "Self-study · hands-on hardware · in preparation", H // 2 + 210, 32, (203, 213, 225), bold=False)

    # Bottom-left tag: study areas
    areas = "Hardware  ·  Networking  ·  Mobile  ·  Virtualization  ·  Troubleshooting"
    area_font = font(22, bold=False)
    aw = draw.textbbox((0, 0), areas, font=area_font)[2]
    draw.text(((W - aw) / 2, H - 90), areas, font=area_font, fill=(148, 163, 184))

    # small footer line
    draw.line([(60, H - 60), (200, H - 60)], fill=(239, 68, 68, 220), width=4)

    img.convert("RGB").save(OUT / "comptia.png")
    print("Saved comptia.png")


def make_pc_build():
    """ARMOURY Vanguard I-358 hero card. Dark with purple/blue accent."""
    img = make_gradient("#0B1120", "#1E1B4B").convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    # subtle grid
    for x in range(0, W, 60):
        draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 8), width=1)
    for y in range(0, H, 60):
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, 8), width=1)

    # accent circles
    draw.ellipse((W - 380, -200, W + 200, 380), fill=(139, 92, 246, 90))
    draw.ellipse((-160, H - 320, 240, H + 80), fill=(96, 165, 250, 70))

    # tag pill
    tag = "CUSTOM PC BUILD"
    tag_font = font(28)
    tw = draw.textbbox((0, 0), tag, font=tag_font)[2]
    draw.rounded_rectangle((60, 60, 60 + tw + 60, 128), radius=34, outline=(196, 181, 253, 240), width=3, fill=(139, 92, 246, 40))
    draw.text((90, 76), tag, font=tag_font, fill=(237, 233, 254, 240))

    # Big title
    center_text(draw, "ARMOURY Vanguard I-358", H // 2 - 130, 76, (255, 255, 255))
    # Subtitle
    center_text(draw, "Intel Core Ultra 7 265KF  ·  RTX 5060 Ti  ·  32GB DDR5", H // 2 - 40, 34, (203, 213, 225), bold=False)
    center_text(draw, "2TB NVMe  ·  Wi-Fi 7  ·  AIO Liquid  ·  Windows 11 Pro", H // 2 + 10, 34, (203, 213, 225), bold=False)

    # bottom badge line
    badge = "Built, tuned, and used daily"
    bf = font(26)
    bw = draw.textbbox((0, 0), badge, font=bf)[2]
    draw.rounded_rectangle(((W - bw - 60) // 2, H // 2 + 90, (W + bw + 60) // 2, H // 2 + 150), radius=30, fill=(139, 92, 246, 60), outline=(196, 181, 253, 200), width=2)
    draw.text(((W - bw) // 2, H // 2 + 103), badge, font=bf, fill=(237, 233, 254))

    # small footer line
    draw.line([(60, H - 60), (200, H - 60)], fill=(196, 181, 253, 220), width=4)

    img.convert("RGB").save(OUT / "pc_build.png")
    print("Saved pc_build.png")


make_comptia()
make_pc_build()
print("Done")
