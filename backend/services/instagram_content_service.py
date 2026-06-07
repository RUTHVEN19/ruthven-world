"""
Instagram Content Generation Service for DIAMOND DRONES

Composites Diamond Drones, Drone Blondes, and film clips into
Instagram-ready formats: Reels (1080x1920), Feed (1080x1350),
Stories (1080x1920), and Carousels.
"""

import os
import json
import random
import subprocess
import shutil
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(BASE_DIR, 'assets')
FONTS_DIR = os.path.join(ASSETS_DIR, 'fonts')
OUTPUT_DIR = os.path.join(BASE_DIR, 'uploads', 'instagram')
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend', 'public')

# Asset paths
VAULT_DIR = os.path.join(FRONTEND_DIR, 'vault')
VAULT_THUMBS_DIR = os.path.join(VAULT_DIR, 'thumbs')
MARILYNS_DIR = os.path.join(FRONTEND_DIR, 'marilyns')
MARILYNS_WEB_DIR = os.path.join(MARILYNS_DIR, 'web')
FILMS_DIR = os.path.join(FRONTEND_DIR, 'films')
LOGOS_DIR = os.path.join(BASE_DIR, 'uploads', 'logos')
BLONDES_UPSCALED_DIR = os.path.join(BASE_DIR, 'uploads', 'drone_blondes_upscaled')

# Instagram dimensions
REEL_SIZE = (1080, 1920)      # 9:16 vertical
FEED_SIZE = (1080, 1350)      # 4:5 portrait
STORY_SIZE = (1080, 1920)     # 9:16 vertical
SQUARE_SIZE = (1080, 1080)    # 1:1 square
CAROUSEL_SIZE = (1080, 1350)  # 4:5 portrait

# Brand colours
BRAND_BLACK = (0, 0, 0)
BRAND_WHITE = (255, 255, 255)
BRAND_SILVER = (192, 192, 192)
BRAND_DIAMOND_BLUE = (185, 220, 255)


def _ensure_output_dirs():
    """Create output directories if they don't exist."""
    for subdir in ['reels', 'feed', 'stories', 'carousels', 'quote_cards', 'grids']:
        os.makedirs(os.path.join(OUTPUT_DIR, subdir), exist_ok=True)


def _get_brand_font(size=48, bold=False):
    """Load the brand font, falling back to a clean system font."""
    # Check for custom font first
    for ext in ['ttf', 'otf', 'TTF', 'OTF']:
        fonts = [f for f in os.listdir(FONTS_DIR) if f.endswith(f'.{ext}')] if os.path.exists(FONTS_DIR) else []
        if fonts:
            # If bold requested, look for bold variant
            if bold:
                bold_fonts = [f for f in fonts if 'bold' in f.lower() or 'Bold' in f]
                if bold_fonts:
                    return ImageFont.truetype(os.path.join(FONTS_DIR, bold_fonts[0]), size)
            return ImageFont.truetype(os.path.join(FONTS_DIR, fonts[0]), size)

    # Fallback to system fonts (macOS)
    fallbacks = [
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/SFNSMono.ttf',
        '/Library/Fonts/Arial.ttf',
    ]
    for path in fallbacks:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)

    return ImageFont.load_default()


def _get_logo():
    """Load the brand logo as a PIL Image. Prefers the translucent Diamond Drones logo."""
    logo_paths = [
        os.path.join(ASSETS_DIR, 'logos', 'diamond-drones-translucent.png'),
        os.path.join(LOGOS_DIR, 'the-drones-of-suburbia-invert.png'),
        os.path.join(LOGOS_DIR, 'the-drones-of-suburbia-invert2.png'),
    ]
    for path in logo_paths:
        if os.path.exists(path):
            return Image.open(path).convert('RGBA')
    return None


def _add_brand_overlay(img, text=None, position='bottom', logo=True, trademark=True):
    """Add brand text and/or logo overlay to an image."""
    draw = ImageDraw.Draw(img)
    w, h = img.size

    if trademark and text is None:
        text = 'DIAMOND DRONES\u2122'

    if text:
        font = _get_brand_font(size=max(28, w // 25), bold=True)
        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

        if position == 'bottom':
            x = (w - tw) // 2
            y = h - th - 60
        elif position == 'top':
            x = (w - tw) // 2
            y = 40
        elif position == 'center':
            x = (w - tw) // 2
            y = (h - th) // 2
        else:
            x, y = 40, h - th - 60

        # Draw text shadow for readability
        for dx, dy in [(-2, -2), (-2, 2), (2, -2), (2, 2), (0, -2), (0, 2), (-2, 0), (2, 0)]:
            draw.text((x + dx, y + dy), text, font=font, fill=(0, 0, 0, 200))
        draw.text((x, y), text, font=font, fill=BRAND_WHITE)

    if logo:
        logo_img = _get_logo()
        if logo_img:
            # Scale logo to ~60% of image width for strong brand presence
            logo_w = int(w * 0.6)
            aspect = logo_img.height / logo_img.width
            logo_h = int(logo_w * aspect)
            logo_img = logo_img.resize((logo_w, logo_h), Image.LANCZOS)
            # Centre both horizontally and vertically
            x = (w - logo_w) // 2
            y = (h - logo_h) // 2
            img.paste(logo_img, (x, y), logo_img)

    return img


def _get_diamond_drones(count=1):
    """Get random Diamond Drone image paths from the vault."""
    if os.path.exists(VAULT_DIR):
        pngs = [f for f in os.listdir(VAULT_DIR) if f.endswith('.png')]
        if pngs:
            selected = random.sample(pngs, min(count, len(pngs)))
            return [os.path.join(VAULT_DIR, f) for f in selected]
    return []


def _get_drone_blondes(count=1, web=True):
    """Get random Drone Blonde image paths."""
    src_dir = MARILYNS_WEB_DIR if web else MARILYNS_DIR
    if os.path.exists(src_dir):
        imgs = [f for f in os.listdir(src_dir) if f.endswith(('.png', '.jpg'))]
        if imgs:
            selected = random.sample(imgs, min(count, len(imgs)))
            return [os.path.join(src_dir, f) for f in selected]
    return []


def _fit_image_to_canvas(img_path, canvas_size, bg_color=BRAND_BLACK):
    """Load an image and fit it centred onto a canvas of the given size, preserving aspect ratio."""
    canvas = Image.new('RGB', canvas_size, bg_color)
    img = Image.open(img_path).convert('RGB')

    cw, ch = canvas_size
    iw, ih = img.size
    scale = min(cw / iw, ch / ih)
    new_w, new_h = int(iw * scale), int(ih * scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)

    x = (cw - new_w) // 2
    y = (ch - new_h) // 2
    canvas.paste(img, (x, y))
    return canvas


def _create_cinematic_bars(img, bar_fraction=0.08):
    """Add cinematic letterbox bars to an image."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    bar_h = int(h * bar_fraction)
    draw.rectangle([0, 0, w, bar_h], fill=BRAND_BLACK)
    draw.rectangle([0, h - bar_h, w, h], fill=BRAND_BLACK)
    return img


# --- FEED POST GENERATORS ---

def generate_single_drone_post(drone_id=None, caption_text=None):
    """Generate a feed post featuring a single Diamond Drone."""
    _ensure_output_dirs()

    if drone_id:
        img_path = os.path.join(VAULT_DIR, f'{drone_id}.png')
        if not os.path.exists(img_path):
            img_path = _get_diamond_drones(1)[0]
    else:
        paths = _get_diamond_drones(1)
        if not paths:
            raise FileNotFoundError('No Diamond Drone images found')
        img_path = paths[0]
        drone_id = os.path.splitext(os.path.basename(img_path))[0]

    canvas = _fit_image_to_canvas(img_path, FEED_SIZE)
    canvas = _create_cinematic_bars(canvas)
    canvas = _add_brand_overlay(canvas, text=f'Diamond Drone #{drone_id}', position='bottom')

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    out_path = os.path.join(OUTPUT_DIR, 'feed', f'dd_{drone_id}_{timestamp}.jpg')
    canvas.save(out_path, 'JPEG', quality=95)

    return {
        'path': out_path,
        'type': 'feed',
        'drone_id': drone_id,
        'caption': caption_text or f'Diamond Drone #{drone_id}.\n\n1000 unique works. 4096 x 4096 pixels. Built to exist at archival scale.\n\ndronesofsuburbia.com\n\n#DiamondDrones #DronesOfSuburbia #CryptoArt #DigitalArt #NFTArt',
    }


def generate_drone_blonde_post(blonde_id=None, caption_text=None):
    """Generate a feed post featuring a single Drone Blonde."""
    _ensure_output_dirs()

    if blonde_id:
        img_path = os.path.join(MARILYNS_WEB_DIR, f'Drone Blonde {blonde_id}.jpg')
        if not os.path.exists(img_path):
            img_path = _get_drone_blondes(1)[0]
    else:
        paths = _get_drone_blondes(1)
        if not paths:
            raise FileNotFoundError('No Drone Blonde images found')
        img_path = paths[0]
        blonde_id = os.path.basename(img_path).replace('Drone Blonde ', '').replace('.jpg', '').replace('.png', '')

    canvas = _fit_image_to_canvas(img_path, FEED_SIZE)
    canvas = _create_cinematic_bars(canvas)
    canvas = _add_brand_overlay(canvas, text=f'Drone Blonde #{blonde_id}', position='bottom')

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    out_path = os.path.join(OUTPUT_DIR, 'feed', f'db_{blonde_id}_{timestamp}.jpg')
    canvas.save(out_path, 'JPEG', quality=95)

    return {
        'path': out_path,
        'type': 'feed',
        'blonde_id': blonde_id,
        'caption': caption_text or f'Drone Blonde #{blonde_id}.\n\n120 black and white photographs. 10 trait categories. Each one a standalone work.\n\ndronesofsuburbia.com\n\n#DroneBlondes #DiamondDrones #DronesOfSuburbia #NFTPhotography #BlackAndWhitePhotography',
    }


def generate_grid_post(count=4, collection='diamond_drones'):
    """Generate a 2x2 grid post showing variety."""
    _ensure_output_dirs()

    if collection == 'diamond_drones':
        paths = _get_diamond_drones(count)
        label = 'DIAMOND DRONES\u2122'
    else:
        paths = _get_drone_blondes(count, web=True)
        label = 'DRONE BLONDES'

    if len(paths) < count:
        raise FileNotFoundError(f'Not enough images found (need {count}, got {len(paths)})')

    # Create 2x2 grid
    cell_w, cell_h = FEED_SIZE[0] // 2, FEED_SIZE[1] // 2
    canvas = Image.new('RGB', FEED_SIZE, BRAND_BLACK)

    for i, path in enumerate(paths[:4]):
        img = Image.open(path).convert('RGB')
        img = img.resize((cell_w - 4, cell_h - 4), Image.LANCZOS)
        row, col = divmod(i, 2)
        x = col * cell_w + 2
        y = row * cell_h + 2
        canvas.paste(img, (x, y))

    canvas = _add_brand_overlay(canvas, text=label, position='bottom', logo=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    out_path = os.path.join(OUTPUT_DIR, 'feed', f'grid_{collection}_{timestamp}.jpg')
    canvas.save(out_path, 'JPEG', quality=95)

    return {
        'path': out_path,
        'type': 'feed_grid',
        'collection': collection,
        'caption': f'Same system, infinite variation.\n\n{label} — each one unique.\n\ndronesofsuburbia.com\n\n#DiamondDrones #DronesOfSuburbia #CryptoArt #GenerativeArt',
    }


# --- CAROUSEL GENERATORS ---

def generate_carousel(collection='diamond_drones', count=5, theme=None):
    """Generate a carousel of images for an Instagram carousel post."""
    _ensure_output_dirs()

    if collection == 'diamond_drones':
        paths = _get_diamond_drones(count)
        label = 'DIAMOND DRONES\u2122'
    else:
        paths = _get_drone_blondes(count, web=True)
        label = 'DRONE BLONDES'

    slides = []
    for i, path in enumerate(paths):
        canvas = _fit_image_to_canvas(path, CAROUSEL_SIZE)
        canvas = _create_cinematic_bars(canvas, bar_fraction=0.05)
        if i == 0:
            canvas = _add_brand_overlay(canvas, text=label, position='bottom')
        else:
            canvas = _add_brand_overlay(canvas, text=None, position='bottom', logo=True, trademark=False)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        out_path = os.path.join(OUTPUT_DIR, 'carousels', f'carousel_{collection}_{i}_{timestamp}.jpg')
        canvas.save(out_path, 'JPEG', quality=95)
        slides.append(out_path)

    return {
        'paths': slides,
        'type': 'carousel',
        'collection': collection,
        'count': len(slides),
        'caption': f'{label}\n\nSwipe through. Each one unique. Each one built to exist at archival scale.\n\ndronesofsuburbia.com\n\n#DiamondDrones #DronesOfSuburbia #CryptoArt #DigitalArt',
    }


# --- STORY GENERATORS ---

def generate_story(collection='diamond_drones', text_overlay=None):
    """Generate a story-sized image with optional text overlay."""
    _ensure_output_dirs()

    if collection == 'diamond_drones':
        paths = _get_diamond_drones(1)
    else:
        paths = _get_drone_blondes(1)

    if not paths:
        raise FileNotFoundError(f'No {collection} images found')

    canvas = _fit_image_to_canvas(paths[0], STORY_SIZE)

    # Add a gradient overlay for text readability
    gradient = Image.new('RGBA', STORY_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(gradient)
    for y in range(STORY_SIZE[1] // 2, STORY_SIZE[1]):
        alpha = int(180 * (y - STORY_SIZE[1] // 2) / (STORY_SIZE[1] // 2))
        draw.line([(0, y), (STORY_SIZE[0], y)], fill=(0, 0, 0, alpha))
    canvas = canvas.convert('RGBA')
    canvas = Image.alpha_composite(canvas, gradient)
    canvas = canvas.convert('RGB')

    if text_overlay:
        draw = ImageDraw.Draw(canvas)
        font = _get_brand_font(size=56)
        # Word wrap
        lines = _word_wrap(text_overlay, font, STORY_SIZE[0] - 120)
        y = STORY_SIZE[1] - 300
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=font)
            tw = bbox[2] - bbox[0]
            x = (STORY_SIZE[0] - tw) // 2
            draw.text((x, y), line, font=font, fill=BRAND_WHITE)
            y += bbox[3] - bbox[1] + 12

    canvas = _add_brand_overlay(canvas, text=None, logo=True, trademark=False)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    out_path = os.path.join(OUTPUT_DIR, 'stories', f'story_{collection}_{timestamp}.jpg')
    canvas.save(out_path, 'JPEG', quality=95)

    return {
        'path': out_path,
        'type': 'story',
        'collection': collection,
    }


# --- QUOTE CARD GENERATOR ---

def generate_quote_card(quote, attribution='Miss AL Simpson', bg_image_path=None):
    """Generate a quote card with brand styling."""
    _ensure_output_dirs()

    if bg_image_path and os.path.exists(bg_image_path):
        canvas = _fit_image_to_canvas(bg_image_path, FEED_SIZE)
        # Darken for text readability
        enhancer = ImageEnhance.Brightness(canvas)
        canvas = enhancer.enhance(0.3)
    else:
        canvas = Image.new('RGB', FEED_SIZE, BRAND_BLACK)

    draw = ImageDraw.Draw(canvas)
    w, h = FEED_SIZE

    # Quote text
    quote_font = _get_brand_font(size=44)
    lines = _word_wrap(f'"{quote}"', quote_font, w - 160)
    total_h = sum(draw.textbbox((0, 0), line, font=quote_font)[3] - draw.textbbox((0, 0), line, font=quote_font)[1] + 16 for line in lines)

    y = (h - total_h) // 2 - 40
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=quote_font)
        tw = bbox[2] - bbox[0]
        x = (w - tw) // 2
        draw.text((x, y), line, font=quote_font, fill=BRAND_WHITE)
        y += bbox[3] - bbox[1] + 16

    # Attribution
    attr_font = _get_brand_font(size=28)
    attr_text = f'-- {attribution}'
    bbox = draw.textbbox((0, 0), attr_text, font=attr_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, y + 30), attr_text, font=attr_font, fill=BRAND_SILVER)

    # Trademark at bottom
    tm_font = _get_brand_font(size=22)
    tm_text = 'DIAMOND DRONES\u2122'
    bbox = draw.textbbox((0, 0), tm_text, font=tm_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, h - 80), tm_text, font=tm_font, fill=BRAND_DIAMOND_BLUE)

    canvas = _add_brand_overlay(canvas, text=None, logo=True, trademark=False)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    out_path = os.path.join(OUTPUT_DIR, 'quote_cards', f'quote_{timestamp}.jpg')
    canvas.save(out_path, 'JPEG', quality=95)

    return {
        'path': out_path,
        'type': 'quote_card',
        'quote': quote,
        'caption': f'"{quote}"\n\n-- {attribution}\n\n#DiamondDrones #DronesOfSuburbia #CryptoArt #ArtWorld',
    }


# --- REEL / VIDEO GENERATORS ---

def generate_slideshow_reel(collection='diamond_drones', count=8, duration_per_image=2.5,
                            audio_path=None, output_name=None):
    """
    Generate an Instagram Reel from a slideshow of images with optional audio.
    Uses ffmpeg to composite images into a vertical 1080x1920 video.
    """
    _ensure_output_dirs()

    if collection == 'diamond_drones':
        paths = _get_diamond_drones(count)
    else:
        paths = _get_drone_blondes(count)

    if not paths:
        raise FileNotFoundError(f'No {collection} images found')

    # Prepare frames as temporary PNGs at reel size
    tmp_dir = os.path.join(OUTPUT_DIR, 'reels', '_tmp_frames')
    os.makedirs(tmp_dir, exist_ok=True)

    for i, path in enumerate(paths):
        canvas = _fit_image_to_canvas(path, REEL_SIZE)
        canvas = _create_cinematic_bars(canvas, bar_fraction=0.04)
        if i == 0:
            canvas = _add_brand_overlay(canvas, text='DIAMOND DRONES\u2122' if collection == 'diamond_drones' else 'DRONE BLONDES', position='center')
        else:
            canvas = _add_brand_overlay(canvas, text=None, logo=True, trademark=False)
        canvas.save(os.path.join(tmp_dir, f'frame_{i:04d}.jpg'), 'JPEG', quality=95)

    # Build ffmpeg concat input file
    concat_path = os.path.join(tmp_dir, 'concat.txt')
    with open(concat_path, 'w') as f:
        for i in range(len(paths)):
            f.write(f"file 'frame_{i:04d}.jpg'\n")
            f.write(f"duration {duration_per_image}\n")
        # Repeat last frame for ffmpeg concat demuxer
        f.write(f"file 'frame_{len(paths)-1:04d}.jpg'\n")

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    out_name = output_name or f'reel_{collection}_{timestamp}.mp4'
    out_path = os.path.join(OUTPUT_DIR, 'reels', out_name)

    # Build ffmpeg command
    total_duration = duration_per_image * len(paths)
    vf = f'scale={REEL_SIZE[0]}:{REEL_SIZE[1]}:force_original_aspect_ratio=decrease,pad={REEL_SIZE[0]}:{REEL_SIZE[1]}:(ow-iw)/2:(oh-ih)/2,fps=30'

    if audio_path and os.path.exists(audio_path):
        cmd = [
            'ffmpeg', '-y',
            '-f', 'concat', '-safe', '0', '-i', concat_path,
            '-i', audio_path,
            '-vf', vf,
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac', '-b:a', '192k',
            '-t', str(total_duration), '-shortest',
        ]
    else:
        cmd = [
            'ffmpeg', '-y',
            '-f', 'concat', '-safe', '0', '-i', concat_path,
            '-vf', vf,
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
            '-pix_fmt', 'yuv420p',
            '-an',
        ]

    cmd.append(out_path)

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f'ffmpeg failed: {result.stderr}')

    # Clean up temp frames
    shutil.rmtree(tmp_dir, ignore_errors=True)

    return {
        'path': out_path,
        'type': 'reel',
        'collection': collection,
        'duration': duration_per_image * len(paths),
        'frame_count': len(paths),
        'caption': f'DIAMOND DRONES\u2122\n\n1000 unique works. Each one a portrait of suburban transcendence.\n\ndronesofsuburbia.com\n\n#DiamondDrones #DronesOfSuburbia #CryptoArt #DigitalArt #NFTArt #Reels',
    }


def generate_film_clip_reel(film_name, clip_start=0, clip_duration=20,
                            audio_path=None, audio_start=0, overlay_text=None):
    """
    Create an Instagram Reel from a film clip with optional audio overlay.
    The film is cropped/padded to 9:16 vertical format.
    """
    _ensure_output_dirs()

    # Find the film
    film_path = None
    for f in os.listdir(FILMS_DIR):
        if film_name.lower() in f.lower() and f.endswith('.mp4'):
            film_path = os.path.join(FILMS_DIR, f)
            break

    if not film_path:
        raise FileNotFoundError(f'Film not found: {film_name}')

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    out_path = os.path.join(OUTPUT_DIR, 'reels', f'film_reel_{film_name}_{timestamp}.mp4')

    # Build the video filter: crop to 9:16 centre, scale to 1080x1920
    vf = "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920,fps=30"

    cmd = [
        'ffmpeg', '-y',
        '-ss', str(clip_start),
        '-i', film_path,
    ]

    if audio_path and os.path.exists(audio_path):
        cmd.extend(['-ss', str(audio_start), '-i', audio_path])
        cmd.extend([
            '-filter_complex',
            f'[0:v]{vf}[v];[1:a]atrim=0:{clip_duration},afade=t=in:st=0:d=1,afade=t=out:st={clip_duration-1}:d=1[a]',
            '-map', '[v]', '-map', '[a]',
        ])
    else:
        cmd.extend(['-vf', vf])
        if _film_has_audio(film_path):
            cmd.extend(['-c:a', 'aac', '-b:a', '192k'])
        else:
            cmd.extend(['-an'])

    cmd.extend([
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-t', str(clip_duration),
        out_path,
    ])

    # Note: Text overlay is applied as a post-processing step using Pillow
    # since this ffmpeg build doesn't include libfreetype/drawtext

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f'ffmpeg failed: {result.stderr}')

    return {
        'path': out_path,
        'type': 'reel',
        'film': film_name,
        'duration': clip_duration,
        'caption': f'DIAMOND DRONES\u2122\n\nFrom the films.\n\ndronesofsuburbia.com/drones/cinema\n\n#DiamondDrones #DronesOfSuburbia #CryptoArt #DigitalArt',
    }


def generate_chorus_reel(film_clip_path, audio_path, audio_start=0, clip_duration=20,
                         overlay_text='DIAMOND DRONES\u2122'):
    """
    Create a Reel combining a user-provided 20-second film clip with the main chorus audio.
    This is the primary promotional format: film visuals + chorus hook.
    """
    _ensure_output_dirs()

    if not os.path.exists(film_clip_path):
        raise FileNotFoundError(f'Film clip not found: {film_clip_path}')
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f'Audio not found: {audio_path}')

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    out_path = os.path.join(OUTPUT_DIR, 'reels', f'chorus_reel_{timestamp}.mp4')

    vf = "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920,fps=30"

    cmd = [
        'ffmpeg', '-y',
        '-i', film_clip_path,
        '-ss', str(audio_start), '-i', audio_path,
        '-filter_complex',
        f'[0:v]{vf}[v];[1:a]atrim=0:{clip_duration},afade=t=in:st=0:d=0.5,afade=t=out:st={clip_duration-1}:d=1[a]',
        '-map', '[v]', '-map', '[a]',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
        '-c:a', 'aac', '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-t', str(clip_duration),
        out_path,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f'ffmpeg failed: {result.stderr}')

    return {
        'path': out_path,
        'type': 'reel',
        'duration': clip_duration,
        'caption': f'DIAMOND DRONES\u2122\n\nDigital diamonds. A new generation.\n\ndronesofsuburbia.com\n\n#DiamondDrones #DronesOfSuburbia #CryptoArt #DigitalArt #Reels',
    }


# --- BATCH CONTENT GENERATION ---

def generate_content_batch(phase='pre_launch', count=7):
    """
    Generate a week's worth of content for a given campaign phase.
    Returns a list of content items with paths, types, and captions.
    """
    _ensure_output_dirs()
    batch = []

    if phase == 'pre_launch':
        # Mystery / teaser content
        for i in range(min(count, 3)):
            item = generate_single_drone_post()
            item['schedule_note'] = f'Pre-launch teaser {i+1} — reveal gradually'
            batch.append(item)
        for i in range(min(count - 3, 2)):
            item = generate_quote_card(
                random.choice(BRAND_QUOTES),
                attribution='Miss AL Simpson'
            )
            item['schedule_note'] = 'Quote card — thought leadership'
            batch.append(item)
        if count > 5:
            item = generate_grid_post(4, 'diamond_drones')
            item['schedule_note'] = 'Grid post — show variety'
            batch.append(item)
        if count > 6:
            item = generate_story(text_overlay='Something is being built.')
            item['schedule_note'] = 'Story — cryptic tease'
            batch.append(item)

    elif phase == 'phase1_site_launch':
        batch.append(generate_single_drone_post(caption_text='The world is open.\n\ndronesofsuburbia.com is not a mint page. It\'s a universe.\n\nSix zones. One vision. Walk through it.\n\n#DiamondDrones #DronesOfSuburbia'))
        batch.append(generate_grid_post(4, 'diamond_drones'))
        batch.append(generate_quote_card('I didn\'t want to build a website. I wanted to build a feeling.'))
        for _ in range(min(count - 3, 4)):
            batch.append(generate_single_drone_post())

    elif phase == 'phase2_drone_blondes':
        for i in range(min(count, 4)):
            batch.append(generate_drone_blonde_post())
        if count > 4:
            batch.append(generate_grid_post(4, 'drone_blondes'))
        if count > 5:
            batch.append(generate_quote_card('120 photographs. That\'s all.'))

    elif phase == 'phase4_diamond_drones':
        for i in range(min(count, 4)):
            batch.append(generate_single_drone_post())
        if count > 4:
            batch.append(generate_grid_post(4, 'diamond_drones'))
        if count > 5:
            batch.append(generate_carousel('diamond_drones', 5))
        if count > 6:
            batch.append(generate_quote_card('Every drone has a story. Every suburb has a secret.'))

    return batch


# --- UTILITY ---

def _word_wrap(text, font, max_width):
    """Wrap text to fit within max_width pixels."""
    words = text.split()
    lines = []
    current_line = []

    dummy_img = Image.new('RGB', (1, 1))
    draw = ImageDraw.Draw(dummy_img)

    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    if current_line:
        lines.append(' '.join(current_line))
    return lines


def _film_has_audio(film_path):
    """Check if a video file has an audio stream."""
    result = subprocess.run(
        ['ffprobe', '-v', 'quiet', '-select_streams', 'a', '-show_entries', 'stream=codec_type', '-of', 'json', film_path],
        capture_output=True, text=True, timeout=10
    )
    try:
        data = json.loads(result.stdout)
        return len(data.get('streams', [])) > 0
    except (json.JSONDecodeError, KeyError):
        return False


def list_available_assets():
    """List all available assets for content generation."""
    assets = {
        'diamond_drones': [],
        'drone_blondes': [],
        'films': [],
        'audio': [],
        'logos': [],
    }

    if os.path.exists(VAULT_DIR):
        assets['diamond_drones'] = [f for f in os.listdir(VAULT_DIR) if f.endswith('.png')]

    if os.path.exists(MARILYNS_WEB_DIR):
        assets['drone_blondes'] = [f for f in os.listdir(MARILYNS_WEB_DIR) if f.endswith(('.jpg', '.png'))]

    if os.path.exists(FILMS_DIR):
        assets['films'] = [f for f in os.listdir(FILMS_DIR) if f.endswith('.mp4')]

    # Check for audio files
    audio_path = os.path.join(MARILYNS_DIR, 'diamond-drones.mp3')
    if os.path.exists(audio_path):
        assets['audio'].append('diamond-drones.mp3')

    if os.path.exists(LOGOS_DIR):
        assets['logos'] = os.listdir(LOGOS_DIR)

    return assets


# Brand quotes for quote cards (from campaign strategy)
BRAND_QUOTES = [
    "I've spent two years building something that doesn't exist yet in this space. Not a collection. A world.",
    "Every drone has a story. Every suburb has a secret. Every collector will walk through the door differently.",
    "I didn't want to build a website. I wanted to build a feeling.",
    "The kind you get walking into a gallery alone at night -- everything lit, no one watching, the art breathing.",
    "What happens when you treat an NFT collection like a film production?",
    "This is art first, always.",
    "You don't scroll through this collection. You walk through it.",
    "Digital diamonds for a new generation.",
    "Not a thumbnail collection. Built to exist at archival scale.",
    "The album isn't background music for a mint. It's the third body of work in a trilogy.",
    "Why release music as an NFT? Because I want my collectors to own the art, not rent it.",
    "120 photographs. That's all.",
    "The closer you look, the more the suburbs dissolve.",
]
