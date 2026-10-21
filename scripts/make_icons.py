"""Generates public/icons/icon{16,32,48,128}.png.

A green tile with a white speech bubble whose messages are replaced by a
single closed bar: the chat is there, but hidden until you're ready.
"""
from pathlib import Path

from PIL import Image, ImageDraw

GREEN = (0, 168, 132, 255)
WHITE = (255, 255, 255, 255)
SIZE = 512
OUT = Path(__file__).resolve().parent.parent / "public" / "icons"


def draw() -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((16, 16, SIZE - 16, SIZE - 16), radius=112, fill=GREEN)
    # Speech bubble with a tail at the bottom left.
    d.rounded_rectangle((104, 120, 408, 352), radius=72, fill=WHITE)
    d.polygon([(150, 330), (128, 420), (230, 348)], fill=WHITE)
    # A single closed bar where the messages would be.
    d.rounded_rectangle((164, 214, 348, 258), radius=22, fill=GREEN)
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    big = draw()
    for size in (16, 32, 48, 128):
        big.resize((size, size), Image.LANCZOS).save(OUT / f"icon{size}.png")


if __name__ == "__main__":
    main()
