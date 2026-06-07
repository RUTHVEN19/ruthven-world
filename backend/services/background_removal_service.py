"""
Background removal service for the Diamond Drones 3D pipeline.

Uses FAL's BiRefNet v2 endpoint via the official fal-client SDK
(handles storage upload + queue + result retrieval cleanly).

Why BiRefNet (not rembg):
    Diamond drones have translucent / refractive surfaces (especially
    Crystalline form). rembg's classic U2Net struggles with transparent
    subjects. BiRefNet handles them cleanly.

Cost: ~$0.005 per image (~£4 for 1000 drones).
Speed: ~1-2 sec per image.
"""

import os
import uuid
import requests
import fal_client
from flask import current_app


BIREFNET_MODEL_ID = 'fal-ai/birefnet/v2'


def _ensure_fal_key():
    """fal_client reads FAL_KEY from env. Push it from Flask config."""
    key = current_app.config.get('FAL_KEY')
    if not key:
        raise ValueError("FAL_KEY not configured. Add it to your .env file.")
    os.environ['FAL_KEY'] = key


def remove_background(input_path):
    """Strip background from an image, returning path to PNG with alpha.

    Args:
        input_path: Absolute path to source PNG.

    Returns:
        dict with:
            - image_path: relative path under UPLOAD_FOLDER
            - image_url: served URL like /uploads/...
            - absolute_path: absolute filesystem path
    """
    _ensure_fal_key()

    # Upload via fal_client (handles signed URLs + retries internally)
    image_url = fal_client.upload_file(input_path)

    # Submit BiRefNet job (subscribe blocks until done)
    result = fal_client.subscribe(
        BIREFNET_MODEL_ID,
        arguments={'image_url': image_url},
        with_logs=False,
    )

    output_url = result.get('image', {}).get('url')
    if not output_url:
        raise Exception(f"BiRefNet returned unexpected shape: {result}")

    # Download cutout
    save_dir = os.path.join(
        current_app.config['UPLOAD_FOLDER'], 'sources', 'cutouts'
    )
    os.makedirs(save_dir, exist_ok=True)

    img_response = requests.get(output_url, timeout=60)
    img_response.raise_for_status()

    filename = f"cutout_{uuid.uuid4().hex}.png"
    abs_path = os.path.join(save_dir, filename)
    with open(abs_path, 'wb') as f:
        f.write(img_response.content)

    rel_path = os.path.join('sources', 'cutouts', filename)
    return {
        'image_path': rel_path,
        'image_url': f"/uploads/{rel_path}",
        'absolute_path': abs_path,
    }


def composite_on_grey(transparent_png_path, output_path=None, grey_value=128):
    """Composite a transparent-alpha PNG onto a flat grey background.

    TRELLIS produces cleanest 3D meshes when fed a subject on a neutral
    grey backdrop (vs. transparent or pure white).

    Args:
        transparent_png_path: PNG with alpha channel
        output_path: Where to save. If None, saves alongside input as `<name>_grey.png`.
        grey_value: 0-255 grey level. 128 = mid grey (TRELLIS optimal).

    Returns:
        Absolute path to grey-backed PNG.
    """
    from PIL import Image

    src = Image.open(transparent_png_path).convert('RGBA')
    bg = Image.new('RGB', src.size, (grey_value, grey_value, grey_value))
    bg.paste(src, mask=src.split()[3])  # alpha channel as mask

    if output_path is None:
        base, ext = os.path.splitext(transparent_png_path)
        output_path = f"{base}_grey.png"

    bg.save(output_path)
    return output_path
