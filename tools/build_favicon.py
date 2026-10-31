"""Optional raster compatibility export of the existing original SVG mark.

Normal site builds use the committed assets and need only the standard library.
This artwork export uses Pillow when the mark itself is changed.
"""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
image = Image.new('RGBA', (128, 128))
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((0, 0, 127, 127), radius=24, fill='#172e30')
paths = [[(14,17),(14,47)],[(24,25),(24,47)],[(40,25),(40,47)],
         [(50,17),(50,47)],[(24,19),(40,19)],
         [(27,15),(23,19),(27,23)],[(37,15),(41,19),(37,23)]]
for points in paths:
    draw.line([(x*2,y*2) for x,y in points], fill='#d3ee85', width=6, joint='curve')
image.save(root/'assets/favicon.ico', format='ICO', sizes=[(16,16),(32,32),(48,48),(64,64)])
with Image.open(root/'assets/favicon.ico') as check:
    assert check.format == 'ICO' and check.ico.sizes() == {(16,16),(32,32),(48,48),(64,64)}
print('Built the original mark as a 16/32/48/64-pixel ICO fallback.')
