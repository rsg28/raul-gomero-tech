"""Generate branded project cover images for the coord portfolio."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(r"C:\Users\rgome\OneDrive\Desktop\Archivos personales\graduate\website-coord\src\assets")
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


def font(size):
    try:
        return ImageFont.truetype("segoeuib.ttf", size)
    except Exception:
        try:
            return ImageFont.truetype("arial.ttf", size)
        except Exception:
            return ImageFont.load_default()


def center_text(draw, text, y, size, color=(255, 255, 255)):
    f = font(size)
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, y), text, font=f, fill=color)


def make_card(filename, tag, title, subtitle, top, bot, accent):
    img = make_gradient(top, bot).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")
    # accent shape (top-right circle, semi-transparent)
    draw.ellipse((W - 320, -160, W + 160, 320), fill=accent)
    # tag pill (outline only, top-left)
    tag_font = font(28)
    tw = draw.textbbox((0, 0), tag, font=tag_font)[2]
    draw.rounded_rectangle((60, 60, 60 + tw + 60, 128), radius=34, outline=(255, 255, 255, 230), width=3)
    draw.text((90, 76), tag, font=tag_font, fill=(255, 255, 255, 230))
    # title (center-ish)
    center_text(draw, title, H // 2 - 90, 84, (255, 255, 255))
    # subtitle
    center_text(draw, subtitle, H // 2 + 40, 36, (220, 220, 235))
    # small footer line
    draw.line([(60, H - 60), (200, H - 60)], fill=(255, 255, 255, 180), width=4)
    img.convert("RGB").save(OUT / filename)
    print(f"Saved {filename}")


def make_automation():
    make_card(
        "automation.png",
        "AUTOMATION",
        "Medical Report Pipeline",
        "Python · pandas · openpyxl · SQL",
        "#0F2E5C",
        "#1E3A8A",
        (99, 102, 241, 220),
    )


def make_surge():
    make_card(
        "surge_ops.png",
        "OPERATIONS",
        "StormHacks 2024 Registration",
        "500+ attendees · account systems · sign-up flows",
        "#1E1B4B",
        "#312E81",
        (167, 139, 250, 200),
    )


def make_toolkit():
    make_card(
        "toolkit.png",
        "TOOLING",
        "Personal Automation Toolkit",
        "Python · docx · PDF · Git · GitHub",
        "#134E4A",
        "#0F766E",
        (45, 212, 191, 220),
    )


def make_pc():
    make_card(
        "pc_build.png",
        "HARDWARE",
        "Custom Windows 11 Desktop",
        "Intel · RTX 5060 Ti · 32GB · Wi-Fi 7",
        "#3F1D38",
        "#831843",
        (244, 114, 182, 220),
    )


def make_coordination():
    make_card(
        "coordination.png",
        "COORDINATION",
        "TuSalud Multi-Site Support",
        "Records · access control · Excel · Jira",
        "#0C4A6E",
        "#075985",
        (56, 189, 248, 220),
    )


make_automation()
make_surge()
make_toolkit()
make_pc()
make_coordination()
print("Done")
