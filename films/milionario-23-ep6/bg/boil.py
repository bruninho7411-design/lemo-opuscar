"""Line boil for the illustrated background plates (STYLE.md: everything boils, held frames are never dead):
three drawings per plate, each the plate warped by a smooth low-frequency displacement field (~2 px at plate scale,
~1.4 px on screen), cycled at 12 fps by main.js. usage: python bg/boil.py name1 name2 ...  (bg/<name>_v1.png → bg/<name>_0..2.jpg)"""
import sys, os, numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates
HERE = os.path.dirname(os.path.abspath(__file__))
for name in sys.argv[1:]:
    im = np.asarray(Image.open(os.path.join(HERE, f'{name}_v1.png')).convert('RGB')).astype(np.float32)
    h, w = im.shape[:2]; yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    for k in range(3):
        rng = np.random.default_rng(100 + k)
        f = lambda: gaussian_filter(rng.standard_normal((h // 4, w // 4)), 6)
        dx, dy = f(), f(); s = 2.0 / max(np.abs(dx).max(), np.abs(dy).max())
        up = lambda a: np.kron(a, np.ones((4, 4)))[:h, :w] * s
        DX, DY = up(dx), up(dy)
        out = np.stack([map_coordinates(im[..., c], [yy + DY, xx + DX], order=1, mode='nearest') for c in range(3)], -1)
        Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(HERE, f'{name}_{k}.jpg'), quality=92)
    print(name, w, h)
