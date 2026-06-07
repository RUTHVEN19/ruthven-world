"""
Three-stage 3D pipeline orchestrator for Diamond Drones.

Stage 1: BiRefNet — strip silk/velvet/tulle background, isolate drone
Stage 2: TRELLIS — convert 2D image into textured 3D GLB mesh
Stage 3: Blender — apply diamond shader + lighting, render outputs

Each stage is independently failable and resumable. Outputs are
keyed by the input filename so you can re-run individual drones
without redoing the entire 1000.
"""

import json
import os
from flask import current_app

from services import background_removal_service
from services import trellis_service
from services import blender_service


def process_drone(input_image_path, traits=None, render_mp4=True,
                  render_hero=True, save_intermediates=True):
    """Run the full 2D-to-3D pipeline on a single Diamond Drone.

    Args:
        input_image_path: Absolute path to FAL-generated 2D drone PNG
        traits: dict of NFT traits (passed to Blender for cut-specific shading)
        render_mp4: Generate 360° turntable MP4
        render_hero: Generate 4K hero PNG
        save_intermediates: Keep cutout + grey-comp + raw GLB

    Returns:
        dict with paths to all outputs and stage timings
    """
    import time
    timings = {}

    # Stage 1: background removal
    print(f"[3d-pipeline] Stage 1: removing background...")
    t0 = time.time()
    bg_result = background_removal_service.remove_background(input_image_path)
    timings['bg_removal_sec'] = time.time() - t0
    cutout_path = bg_result['absolute_path']
    print(f"  ↳ cutout saved: {cutout_path} ({timings['bg_removal_sec']:.1f}s)")

    # Composite on neutral grey for TRELLIS (cleanest input)
    grey_path = background_removal_service.composite_on_grey(cutout_path)
    print(f"  ↳ grey-backed: {grey_path}")

    # Stage 2: TRELLIS image-to-3D
    print(f"[3d-pipeline] Stage 2: TRELLIS image-to-3D...")
    t0 = time.time()
    trellis_result = trellis_service.generate_3d(grey_path)
    timings['trellis_sec'] = time.time() - t0
    raw_glb_path = trellis_result['absolute_path']
    print(f"  ↳ raw GLB: {raw_glb_path} ({timings['trellis_sec']:.1f}s)")

    # Stage 3: Blender finishing
    print(f"[3d-pipeline] Stage 3: Blender shading + render...")
    t0 = time.time()
    blender_result = blender_service.render_3d_drone(
        input_glb=raw_glb_path,
        render_mp4=render_mp4,
        render_hero=render_hero,
        traits=traits,
    )
    timings['blender_sec'] = time.time() - t0
    print(f"  ↳ Blender done ({timings['blender_sec']:.1f}s)")

    # Cleanup intermediates if not keeping
    if not save_intermediates:
        for p in [cutout_path, grey_path, raw_glb_path]:
            try:
                os.remove(p)
            except OSError:
                pass

    return {
        'source_image': input_image_path,
        'cutout': cutout_path if save_intermediates else None,
        'grey_input': grey_path if save_intermediates else None,
        'raw_glb': raw_glb_path if save_intermediates else None,
        'polished_glb': blender_result['polished_glb'],
        'turntable_mp4': blender_result['turntable_mp4'],
        'hero_png': blender_result['hero_png'],
        'output_dir': blender_result['output_dir'],
        'blender_log': blender_result['blender_log'],
        'timings': timings,
    }


def process_collection(metadata_path, limit=None, skip_existing=True):
    """Run the full pipeline over a collection's master_metadata.json.

    Args:
        metadata_path: Path to master_metadata.json from genesis full batch
        limit: Process only first N entries (None = all)
        skip_existing: Skip drones that already have a polished.glb output

    Returns:
        list of per-drone result dicts
    """
    with open(metadata_path) as f:
        master = json.load(f)

    if limit:
        master = master[:limit]

    folder = os.path.dirname(metadata_path)
    upload_root = current_app.config['UPLOAD_FOLDER']

    results = []
    for entry in master:
        # Reconstruct absolute image path
        img_abs = os.path.join(folder, entry['filename'])
        if not os.path.exists(img_abs):
            print(f"[3d-pipeline] missing image, skipping: {img_abs}")
            continue

        # Check if already processed
        traits = {t['trait_type']: t['value'] for t in entry['traits']}
        out_marker = os.path.join(
            upload_root, '3d_outputs', 'completed', f"{entry['id']:04d}.json"
        )
        if skip_existing and os.path.exists(out_marker):
            print(f"[3d-pipeline] #{entry['id']:04d} already done, skipping")
            continue

        try:
            result = process_drone(
                input_image_path=img_abs,
                traits=traits,
            )
            # Write a completion marker with the output paths
            os.makedirs(os.path.dirname(out_marker), exist_ok=True)
            with open(out_marker, 'w') as f:
                json.dump({
                    'id': entry['id'],
                    'name': entry['name'],
                    'rarity': entry['rarity'],
                    'traits': entry['traits'],
                    'outputs': {
                        'polished_glb': result['polished_glb'],
                        'turntable_mp4': result['turntable_mp4'],
                        'hero_png': result['hero_png'],
                    },
                    'timings': result['timings'],
                }, f, indent=2)
            results.append(result)
            print(f"[3d-pipeline] ✓ #{entry['id']:04d} complete")
        except Exception as e:
            print(f"[3d-pipeline] ✗ #{entry['id']:04d} failed: {e}")
            results.append({'id': entry['id'], 'error': str(e)})

    return results
