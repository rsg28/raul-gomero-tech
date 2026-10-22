"""Generate premium-looking component 'photo' cards for the PC explorer modal."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(r"C:\Users\rgome\OneDrive\Desktop\Archivos personales\graduate\website-tech\src\assets\components")
W, H = 900, 900

def font(size, bold=True):
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    try:
        return ImageFont.truetype(name, size)
    except Exception:
        return ImageFont.load_default()

def make_gradient(top_hex, bot_hex):
    top = tuple(int(top_hex[i:i+2], 16) for i in (1, 3, 5))
    bot = tuple(int(bot_hex[i:i+2], 16) for i in (1, 3, 5))
    img = Image.new("RGB", (W, H), top_hex)
    draw = ImageDraw.Draw(img)
    for y in range(H):
        r = int(top[0] + (bot[0] - top[0]) * y / H)
        g = int(top[1] + (bot[1] - top[1]) * y / H)
        b = int(top[2] + (bot[2] - top[2]) * y / H)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    return img

def make_card(filename, category, model, spec, top, bot, glow_rgb):
    """A premium-looking product card. Solid dark bg + a colored glow blob."""
    img = make_gradient(top, bot).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    # subtle grid
    for x in range(0, W, 60):
        draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 6), width=1)
    for y in range(0, H, 60):
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, 6), width=1)

    # big glow blob center-right
    r, g, b = glow_rgb
    for i, alpha in enumerate([25, 50, 90]):
        radius = 260 - i * 60
        draw.ellipse(
            (W // 2 - radius, H // 2 - radius, W // 2 + radius, H // 2 + radius),
            fill=(r, g, b, alpha),
        )

    # inner solid disc
    draw.ellipse((W // 2 - 140, H // 2 - 140, W // 2 + 140, H // 2 + 140), fill=(r, g, b, 200))

    # category pill top-left
    tag_font = font(28)
    tw = draw.textbbox((0, 0), category, font=tag_font)[2]
    draw.rounded_rectangle((50, 50, 50 + tw + 60, 118), radius=34, outline=(r, g, b, 240), width=3, fill=(r, g, b, 40))
    draw.text((80, 66), category, font=tag_font, fill=(255, 255, 255, 240))

    # centered model line
    model_font = font(52)
    mbox = draw.textbbox((0, 0), model, font=model_font)
    mw = mbox[2] - mbox[0]
    # wrap manually if wide
    if mw > W - 80:
        # break at last space before halfway
        half = len(model) // 2
        left_sp = model.rfind(" ", 0, half + 6)
        right_sp = model.find(" ", half)
        idx = left_sp if abs(half - left_sp) <= abs(half - right_sp) else right_sp
        if idx > 0:
            line1 = model[:idx].strip()
            line2 = model[idx:].strip()
            for i, line in enumerate([line1, line2]):
                w = draw.textbbox((0, 0), line, font=model_font)[2]
                draw.text(((W - w) / 2, H - 240 + i * 62), line, font=model_font, fill=(255, 255, 255))
        else:
            draw.text(((W - mw) / 2, H - 240), model, font=model_font, fill=(255, 255, 255))
    else:
        draw.text(((W - mw) / 2, H - 210), model, font=model_font, fill=(255, 255, 255))

    # spec below
    spec_font = font(26, bold=False)
    sbox = draw.textbbox((0, 0), spec, font=spec_font)
    sw = sbox[2] - sbox[0]
    draw.text(((W - sw) / 2, H - 110), spec, font=spec_font, fill=(203, 213, 225))

    # bottom footer accent line
    draw.line([(50, H - 50), (200, H - 50)], fill=(r, g, b, 220), width=4)

    img.convert("RGB").save(OUT / filename, quality=92)
    print(f"Saved {filename}")


# Component palette: (filename, category, model, spec, gradient-top, gradient-bot, glow-rgb)
COMPONENTS = [
    ("cpu.jpg",         "CPU",              "Intel Core Ultra 7 265KF", "20 cores · 5.5 GHz · LGA 1851",         "#001a33", "#001428", (0, 113, 197)),
    ("gpu.jpg",         "GPU",              "NVIDIA RTX 5060 Ti",    "Blackwell · 8GB GDDR7 · DLSS 4",           "#0a1f0a", "#0d1b0d", (118, 185, 0)),
    ("motherboard.jpg", "MOTHERBOARD",      "ASUS TUF B860M-PLUS",   "B860 · LGA 1851 · DDR5 · Wi-Fi 7",         "#1a0f2b", "#0f0a1a", (167, 139, 250)),
    ("ram.jpg",         "MEMORY",           "32GB DDR5",             "Dual channel · Room for 64/96GB",          "#0a1f24", "#0a1418", (34, 211, 238)),
    ("storage.jpg",     "STORAGE",          "2TB NVMe SSD",          "PCIe Gen 4 · Boot + code + VMs",           "#0f1f14", "#0a140d", (52, 211, 153)),
    ("cooler.jpg",      "CPU COOLING",      "AIO Liquid Cooler",     "Closed-loop · Mounted in CG530",           "#0a1120", "#0a0f1a", (96, 165, 250)),
    ("psu.jpg",         "POWER",            "850W 80+ Gold",         "Modular · Room for GPU upgrade",           "#1f1508", "#14100a", (245, 158, 11)),
    ("case.jpg",        "CASE",             "ARMOURY CG530",         "Mid Tower · 7x 120mm ARGB · Glass",        "#0f172a", "#0a1020", (148, 163, 184)),
    ("wireless.jpg",    "WIRELESS",         "Wi-Fi 7 + BT 5.4",      "320 MHz channels · Native to board",       "#0a1a24", "#0a1220", (56, 189, 248)),
    ("windows.jpg",     "OPERATING SYSTEM", "Windows 11 Pro",        "Hyper-V · BitLocker · Group Policy",       "#0a1424", "#0a0f1c", (0, 120, 212)),
]

for args in COMPONENTS:
    make_card(*args)

print("Done")
