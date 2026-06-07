"""
Blender subprocess wrapper for the Diamond Drones 3D pipeline.

Invokes Blender headlessly via CLI with the diamond drone Blender script.
This is the orchestration layer — actual Blender logic lives in
backend/blender_scripts/pipeline.py (which uses bpy).

Pipeline:
    TRELLIS GLB → Blender ingest → diamond shader + lighting →
    GLB export + 360° turntable MP4 + 4K hero PNG

Requirements:
    Blender 4.5 LTS installed locally. Default Mac path:
        /Applications/Blender.app/Contents/MacOS/Blender

    Override via env BLENDER_BIN if installed elsewhere.
"""

import os
import subprocess
import uuid
from flask import current_app


DEFAULT_BLENDER_BIN = '/Applications/Blender.app/Contents/MacOS/Blender'


def get_blender_bin():
    """Locate the Blender executable."""
    env_path = os.environ.get('BLENDER_BIN')
    if env_path and os.path.exists(env_path):
        return env_path
    if os.path.exists(DEFAULT_BLENDER_BIN):
        return DEFAULT_BLENDER_BIN
    raise FileNotFoundError(
        f"Blender not found at {DEFAULT_BLENDER_BIN}. "
        "Install Blender 4.5 LTS from blender.org or set BLENDER_BIN env var."
    )


def render_3d_drone(input_glb, output_dir=None, render_mp4=True,
                    render_hero=True, traits=None):
    """Run the full Blender pipeline on a TRELLIS-generated GLB.

    Args:
        input_glb: Absolute path to TRELLIS output GLB
        output_dir: Where to save outputs. Defaults to
            UPLOAD_FOLDER/3d_outputs/renders/<uuid>/
        render_mp4: Generate 360° turntable MP4 (1080p, 6 sec)
        render_hero: Generate 4K hero PNG
        traits: dict of NFT traits (e.g. {'Diamond Cut': 'Princess'})
            passed through to Blender for cut-specific shading.

    Returns:
        dict with paths to:
            - polished_glb: refined GLB with our diamond shader
            - turntable_mp4: optional MP4 if render_mp4
            - hero_png: optional PNG if render_hero
            - blender_log: stdout from Blender run
    """
    blender_bin = get_blender_bin()

    if output_dir is None:
        run_id = uuid.uuid4().hex
        output_dir = os.path.join(
            current_app.config['UPLOAD_FOLDER'],
            '3d_outputs', 'renders', run_id
        )
    os.makedirs(output_dir, exist_ok=True)

    # Locate the pipeline script alongside backend/
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pipeline_script = os.path.join(
        backend_dir, 'blender_scripts', 'pipeline.py'
    )

    if not os.path.exists(pipeline_script):
        raise FileNotFoundError(
            f"Pipeline script missing at {pipeline_script}. "
            "Make sure backend/blender_scripts/pipeline.py exists."
        )

    # Build CLI args
    args = [
        blender_bin,
        '--background',
        '--python', pipeline_script,
        '--',  # everything after this passed to the script
        '--input', input_glb,
        '--output-dir', output_dir,
    ]
    if render_mp4:
        args.append('--render-mp4')
    if render_hero:
        args.append('--render-hero')
    if traits:
        # Pass per-NFT traits to drive scatter density + cut + carat tier
        cut = traits.get('Diamond Cut')
        if cut:
            args.extend(['--cut', cut])
        form = traits.get('Drone Form')
        if form:
            args.extend(['--form', form])
        carat = traits.get('Carat Weight')
        if carat:
            args.extend(['--carat', carat])

    # Run Blender (blocks until complete)
    result = subprocess.run(
        args,
        capture_output=True,
        text=True,
        timeout=1800,  # 30 min cap
    )

    log = result.stdout + '\n' + result.stderr

    if result.returncode != 0:
        raise Exception(f"Blender failed (exit {result.returncode}):\n{log}")

    # Expected outputs in output_dir
    polished_glb = os.path.join(output_dir, 'polished.glb')
    turntable_mp4 = os.path.join(output_dir, 'turntable.mp4')
    hero_png = os.path.join(output_dir, 'hero.png')

    return {
        'polished_glb': polished_glb if os.path.exists(polished_glb) else None,
        'turntable_mp4': turntable_mp4 if (render_mp4 and os.path.exists(turntable_mp4)) else None,
        'hero_png': hero_png if (render_hero and os.path.exists(hero_png)) else None,
        'blender_log': log,
        'output_dir': output_dir,
    }
