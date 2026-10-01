"""Generate the runtime banner copies from the preserved originals.

The nine PNGs in `banners/` are the originals and are never modified. This
script writes optimised WebP copies into `public/assets/banners/`, which is
what the application actually loads (`/assets/banners/bannerN.webp`).

The PNGs total ~17.4 MB; the WebP copies total ~1.0 MB, which is the
difference between an 18 MB production build and a 1.6 MB one.

Run after changing any original:

    python scripts/optimise-banners.py

Requires Pillow (`pip install Pillow`).
"""

import glob
import os

from PIL import Image

SOURCE_DIR = "banners"
OUTPUT_DIR = "public/assets/banners"

# Banners never render wider than the 80rem (1280px) container, so a 2000px
# long edge still covers 2x displays with room to spare.
MAX_LONG_EDGE = 2000
QUALITY = 82


def main() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    before = after = 0

    for source in sorted(glob.glob(os.path.join(SOURCE_DIR, "*.png"))):
        name = os.path.splitext(os.path.basename(source))[0]
        image = Image.open(source).convert("RGB")

        width, height = image.size
        if width > MAX_LONG_EDGE:
            image = image.resize(
                (MAX_LONG_EDGE, round(height * MAX_LONG_EDGE / width)),
                Image.LANCZOS,
            )

        destination = os.path.join(OUTPUT_DIR, f"{name}.webp")
        image.save(destination, "WEBP", quality=QUALITY, method=6)

        source_bytes = os.path.getsize(source)
        output_bytes = os.path.getsize(destination)
        before += source_bytes
        after += output_bytes
        print(
            f"{name}: {source_bytes / 1048576:.2f} MB PNG -> "
            f"{output_bytes / 1024:.0f} KB WebP ({image.size[0]}x{image.size[1]})"
        )

    print(f"\nTotal {before / 1048576:.1f} MB -> {after / 1048576:.2f} MB")


if __name__ == "__main__":
    main()
