"""Turns scripts/.favicon-256.png (written by make-brand-images.mjs) into app/favicon.ico."""
import os
from PIL import Image

src = os.path.join(os.path.dirname(__file__), ".favicon-256.png")
Image.open(src).convert("RGBA").save(os.path.join(os.path.dirname(__file__), "..", "app", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
os.remove(src)
print("wrote app/favicon.ico")
