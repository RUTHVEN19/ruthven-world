"""
TRELLIS image-to-3D service for the Diamond Drones pipeline.

Uses FAL's hosted TRELLIS endpoint via the official fal-client SDK.
Takes a 2D drone PNG (background removed + composited on grey)
and returns a textured GLB mesh ready for Blender post-processing.

Output: GLB file with embedded textures.
Speed: ~30-90 sec per generation.
Cost: ~$0.10-0.20 per generation.
"""

import os
import uuid
import requests
import fal_client
from flask import current_app


TRELLIS_MODEL_ID = 'fal-ai/trellis'

# TRELLIS quality settings — tuned for diamond drones
DEFAULT_PARAMS = {
    'ss_guidance_strength': 7.5,    # sparse-structure guidance
    'ss_sampling_steps': 12,        # sparse-structure sampler steps
    'slat_guidance_strength': 3.0,  # SLAT (latent) guidance
    'slat_sampling_steps': 12,      # SLAT sampler steps
    'mesh_simplify': 0.95,          # 0=full detail, 1=heavily simplified
    'texture_size': 1024,           # texture resolution
}


def _ensure_fal_key():
    """fal_client reads FAL_KEY from env. Push it from Flask config."""
    key = current_app.config.get('FAL_KEY')
    if not key:
        raise ValueError("FAL_KEY not configured. Add it to your .env file.")
    os.environ['FAL_KEY'] = key


def generate_3d(input_image_path, params=None):
    """Convert a 2D drone image into a textured 3D GLB mesh.

    Args:
        input_image_path: Absolute path to the cutout PNG (transparent
            or grey-backed). Subject should be isolated and centered.
        params: dict of TRELLIS overrides. None = use DEFAULT_PARAMS.

    Returns:
        dict with:
            - glb_path: relative path under UPLOAD_FOLDER
            - glb_url: served URL
            - absolute_path: absolute filesystem path
            - source_image: input path (for traceability)
    """
    _ensure_fal_key()

    # Upload via fal_client
    image_url = fal_client.upload_file(input_image_path)

    settings = {**DEFAULT_PARAMS, **(params or {})}
    arguments = {'image_url': image_url, **settings}

    # subscribe blocks until completion (handles polling internally)
    result = fal_client.subscribe(
        TRELLIS_MODEL_ID,
        arguments=arguments,
        with_logs=False,
    )

    # TRELLIS returns model_mesh.url for the GLB
    glb_url = (
        result.get('model_mesh', {}).get('url')
        or result.get('glb', {}).get('url')
    )
    if not glb_url:
        raise Exception(f"TRELLIS returned unexpected shape: {result}")

    # Download GLB
    save_dir = os.path.join(
        current_app.config['UPLOAD_FOLDER'], '3d_outputs', 'meshes'
    )
    os.makedirs(save_dir, exist_ok=True)

    glb_response = requests.get(glb_url, timeout=180)
    glb_response.raise_for_status()

    filename = f"mesh_{uuid.uuid4().hex}.glb"
    abs_path = os.path.join(save_dir, filename)
    with open(abs_path, 'wb') as f:
        f.write(glb_response.content)

    rel_path = os.path.join('3d_outputs', 'meshes', filename)
    return {
        'glb_path': rel_path,
        'glb_url': f"/uploads/{rel_path}",
        'absolute_path': abs_path,
        'source_image': input_image_path,
    }
