"""
prepare_dataset.py  (v2 - fast download, no large archives)
============================================================
Real food images  → scraped from Open Food Facts CDN (small JPEGs, fast)
AI fake images    → CIFAKE dataset via Hugging Face (streams 32×32 GIFs)

Usage:
    python prepare_dataset.py
    python prepare_dataset.py --real-count 300 --ai-count 300
"""

import os
import argparse
import time
import random
import urllib.request
from pathlib import Path
from io import BytesIO

from PIL import Image

DATASET_DIR = Path("dataset")
REAL_DIR    = DATASET_DIR / "real"
AI_DIR      = DATASET_DIR / "ai"
TARGET_SIZE = (224, 224)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def ensure_dirs():
    REAL_DIR.mkdir(parents=True, exist_ok=True)
    AI_DIR.mkdir(parents=True,   exist_ok=True)


def count_images(folder: Path):
    return len([f for f in folder.iterdir()
                if f.suffix.lower() in (".jpg", ".jpeg", ".png")])


def save_image(img: Image.Image, path: Path):
    img = img.convert("RGB").resize(TARGET_SIZE, Image.LANCZOS)
    img.save(path, "JPEG", quality=90)


# ─── Real food images: Open Food Facts public CDN ─────────────────────────────
# Open Food Facts product images are freely licensed and cover every type of
# packaged / restaurant food globally, including Indian food.
# We use their public API to fetch random product image URLs.

OFF_API = "https://world.openfoodfacts.org/cgi/search.pl"
OFF_IMAGE_BASE = "https://images.openfoodfacts.org/images/products"

SEARCH_TERMS = [
    "pizza", "burger", "rice", "chicken", "pasta", "salad",
    "biryani", "curry", "soup", "sandwich", "cake", "bread",
    "noodle", "sushi", "taco", "ramen", "steak", "fish",
    "chocolate", "cereal", "yogurt", "cheese", "egg",
    "paneer", "dal", "roti", "dosa", "idli",
]


def fetch_real_images(target: int):
    """Downloads real food product images from Open Food Facts CDN."""
    import urllib.parse
    import json

    saved = 0
    tried_terms = list(SEARCH_TERMS)
    random.shuffle(tried_terms)
    term_idx = 0

    headers = {"User-Agent": "FoodShieldProject/1.0 (educational use)"}

    while saved < target:
        term = tried_terms[term_idx % len(tried_terms)]
        term_idx += 1

        params = urllib.parse.urlencode({
            "action": "process",
            "search_terms": term,
            "json": 1,
            "page_size": 50,
            "fields": "image_front_url",
            "page": random.randint(1, 5),
        })
        url = f"{OFF_API}?{params}"

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            print(f"  [API warn] search '{term}': {e}")
            time.sleep(1)
            continue

        products = data.get("products", [])
        random.shuffle(products)

        for p in products:
            img_url = p.get("image_front_url", "")
            if not img_url or not img_url.startswith("http"):
                continue
            try:
                req = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(req, timeout=10) as r:
                    raw = r.read()
                img = Image.open(BytesIO(raw))
                out_path = REAL_DIR / f"real_{saved:05d}.jpg"
                save_image(img, out_path)
                saved += 1
                if saved % 50 == 0:
                    print(f"   {saved}/{target} real images saved …")
                if saved >= target:
                    break
            except Exception:
                continue

        time.sleep(0.5)   # be polite to the API

    print(f"✅ {saved} real food images saved to '{REAL_DIR}'\n")


# ─── AI fake images: CIFAKE via Hugging Face streaming ────────────────────────

def fetch_ai_images(target: int):
    """Downloads CIFAKE FAKE images (AI-generated) from Hugging Face Datasets."""
    try:
        from datasets import load_dataset
    except ImportError:
        os.system("pip install datasets -q")
        from datasets import load_dataset

    print(f"📥 Streaming {target} AI (CIFAKE FAKE) images from Hugging Face …")
    ds = load_dataset(
        "dragonintelligence/CIFAKE-image-dataset",
        split="train",
        streaming=True,
    )

    saved = 0
    for sample in ds:
        if sample.get("label") != 0:    # label=0 → FAKE in this dataset
            continue
        try:
            img = sample["image"]
            if not isinstance(img, Image.Image):
                img = Image.fromarray(img)
            out_path = AI_DIR / f"ai_{saved:05d}.jpg"
            save_image(img, out_path)
            saved += 1
            if saved % 100 == 0:
                print(f"   {saved}/{target} AI images saved …")
            if saved >= target:
                break
        except Exception:
            continue

    print(f"✅ {saved} AI fake images saved to '{AI_DIR}'\n")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Prepare FoodShield ML dataset (fast)")
    parser.add_argument("--real-count", type=int, default=400)
    parser.add_argument("--ai-count",   type=int, default=400)
    args = parser.parse_args()

    ensure_dirs()

    existing_real = count_images(REAL_DIR)
    existing_ai   = count_images(AI_DIR)

    print("=" * 55)
    print("  FoodShield — Dataset Preparation (fast mode)")
    print("=" * 55)
    print(f"  Real images already present : {existing_real}")
    print(f"  AI images already present   : {existing_ai}\n")

    real_needed = max(0, args.real_count - existing_real)
    ai_needed   = max(0, args.ai_count   - existing_ai)

    if real_needed > 0:
        print(f"📥 Fetching {real_needed} real food images (Open Food Facts) …")
        fetch_real_images(real_needed)
    else:
        print(f"⏭️  Already have {existing_real} real images. Skipping.\n")

    if ai_needed > 0:
        fetch_ai_images(ai_needed)
    else:
        print(f"⏭️  Already have {existing_ai} AI images. Skipping.\n")

    r = count_images(REAL_DIR)
    a = count_images(AI_DIR)

    print("=" * 55)
    print(f"  Dataset ready!")
    print(f"  Real : {r}  →  {REAL_DIR}")
    print(f"  AI   : {a}  →  {AI_DIR}")
    print("=" * 55)
    print("\nNext:  python train.py\n")


if __name__ == "__main__":
    main()
