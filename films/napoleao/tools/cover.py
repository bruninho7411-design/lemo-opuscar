"""Cover (capa) for an episode: 1080x1920 JPEG, text kept inside the 3:4 grid crop (y 240-1680).
usage: python3 tools/cover.py ep01      reads ep.json "cover": {img, focus:[x,y], zoom, lines:[...], hi: index of yellow line}
"""
import sys, os, json
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

EP = sys.argv[1]; HERE = os.path.abspath(EP); SERIES = os.path.dirname(HERE)
ep = json.load(open(f'{HERE}/ep.json')); cv = ep['cover']
W, H = 1080, 1920
FONT = f'{SERIES}/player/fonts/LuckiestGuy-Regular.ttf'
YEL, INK = (255, 210, 63), (17, 17, 17)

im = Image.open(f"{HERE}/img/{cv['img']}.jpg").convert('RGB')
z = cv.get('zoom', 1.0); fx, fy = cv.get('focus', [.5, .5])
base = max(W / im.width, H / im.height) * z
im = im.resize((round(im.width * base), round(im.height * base)), Image.LANCZOS)
x = min(max(0, round(fx * im.width - W / 2)), im.width - W); y = min(max(0, round(fy * im.height - H / 2)), im.height - H)
im = im.crop((x, y, x + W, y + H))
im = ImageEnhance.Brightness(im).enhance(cv.get('bright', 1.0)); im = ImageEnhance.Color(im).enhance(1.15); im = ImageEnhance.Contrast(im).enhance(1.08)

# dark band behind the title (top) and the tag (bottom) for contrast
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
for i in range(700):
    a = int(170 * (1 - i / 700) ** 1.6); d.line([(0, 240 + i - 240), (W, 240 + i - 240)], fill=(0, 0, 0, a))
for i in range(520):
    a = int(190 * (i / 520) ** 1.8); d.line([(0, H - 520 + i), (W, H - 520 + i)], fill=(0, 0, 0, a))
im = Image.alpha_composite(im.convert('RGBA'), ov)
d = ImageDraw.Draw(im)

def text(s, cx, cy, size, fill, stroke=None, maxw=980):
    f = ImageFont.truetype(FONT, size)
    while d.textlength(s, font=f) > maxw and size > 40: size -= 4; f = ImageFont.truetype(FONT, size)
    sw = stroke or max(6, size // 9)
    d.text((cx + size * .05, cy + size * .07), s, font=f, anchor='mm', fill=(0, 0, 0, 200), stroke_width=sw, stroke_fill=(0, 0, 0, 200))
    d.text((cx, cy), s, font=f, anchor='mm', fill=fill, stroke_width=sw, stroke_fill=INK)
    return size

# "DIA X" huge, then the episode title lines
text(f"DIA {ep['day']}", W / 2, 420, 300, YEL, 22)
y = 650
for i, ln in enumerate(cv['lines']):
    s = text(ln, W / 2, y, 128, YEL if i == cv.get('hi', -1) else (255, 255, 255)); y += s * 1.08
# bottom tag inside the 3:4 crop
tag = 'APOCALIPSE ZUMBI'
f = ImageFont.truetype(FONT, 58); tw = d.textlength(tag, font=f)
bx, by = W / 2 - tw / 2 - 34, 1500
d.rounded_rectangle([bx, by, bx + tw + 68, by + 96], 28, fill=(229, 72, 77), outline=INK, width=6)
d.text((W / 2, by + 52), tag, font=f, anchor='mm', fill=(255, 255, 255))
f2 = ImageFont.truetype(FONT, 50); ep_t = f"EP {ep['day']}/30"
d.text((W / 2, 1640), ep_t, font=f2, anchor='mm', fill=(255, 255, 255), stroke_width=6, stroke_fill=INK)
os.makedirs(f'{HERE}/out', exist_ok=True)
out = f"{HERE}/out/CAPA_EP{ep['day']:02d}.jpg"
im.convert('RGB').save(out, quality=93); print(out)
