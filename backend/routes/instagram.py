"""
Instagram Marketing Routes for DIAMOND DRONES

API endpoints for content generation, scheduling, publishing,
and analytics. Powers the automated Instagram marketing pipeline.
"""

import os
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from datetime import datetime

instagram_bp = Blueprint('instagram', __name__)

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads', 'instagram')


# --- CONTENT GENERATION ---

@instagram_bp.route('/instagram/generate/feed', methods=['POST'])
def generate_feed():
    """Generate a feed post. Body: {collection, id, caption}"""
    from services.instagram_content_service import generate_single_drone_post, generate_drone_blonde_post

    data = request.json or {}
    collection = data.get('collection', 'diamond_drones')
    caption = data.get('caption')

    if collection == 'drone_blondes':
        result = generate_drone_blonde_post(blonde_id=data.get('id'), caption_text=caption)
    else:
        result = generate_single_drone_post(drone_id=data.get('id'), caption_text=caption)

    return jsonify(result)


@instagram_bp.route('/instagram/generate/grid', methods=['POST'])
def generate_grid():
    """Generate a grid post. Body: {collection, count}"""
    from services.instagram_content_service import generate_grid_post

    data = request.json or {}
    result = generate_grid_post(
        count=data.get('count', 4),
        collection=data.get('collection', 'diamond_drones'),
    )
    return jsonify(result)


@instagram_bp.route('/instagram/generate/carousel', methods=['POST'])
def generate_carousel_route():
    """Generate a carousel. Body: {collection, count}"""
    from services.instagram_content_service import generate_carousel

    data = request.json or {}
    result = generate_carousel(
        collection=data.get('collection', 'diamond_drones'),
        count=data.get('count', 5),
    )
    return jsonify(result)


@instagram_bp.route('/instagram/generate/story', methods=['POST'])
def generate_story_route():
    """Generate a story. Body: {collection, text_overlay}"""
    from services.instagram_content_service import generate_story

    data = request.json or {}
    result = generate_story(
        collection=data.get('collection', 'diamond_drones'),
        text_overlay=data.get('text_overlay'),
    )
    return jsonify(result)


@instagram_bp.route('/instagram/generate/quote', methods=['POST'])
def generate_quote():
    """Generate a quote card. Body: {quote, attribution, bg_image_path}"""
    from services.instagram_content_service import generate_quote_card

    data = request.json or {}
    result = generate_quote_card(
        quote=data.get('quote', 'Digital diamonds for a new generation.'),
        attribution=data.get('attribution', 'Miss AL Simpson'),
        bg_image_path=data.get('bg_image_path'),
    )
    return jsonify(result)


@instagram_bp.route('/instagram/generate/reel', methods=['POST'])
def generate_reel():
    """Generate a slideshow reel. Body: {collection, count, duration_per_image}"""
    from services.instagram_content_service import generate_slideshow_reel

    data = request.json or {}
    audio = data.get('audio_path')
    if not audio:
        audio = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            '..', 'frontend', 'public', 'marilyns', 'diamond-drones.mp3'
        )
        if not os.path.exists(audio):
            audio = None

    result = generate_slideshow_reel(
        collection=data.get('collection', 'diamond_drones'),
        count=data.get('count', 8),
        duration_per_image=data.get('duration_per_image', 2.5),
        audio_path=audio,
    )
    return jsonify(result)


@instagram_bp.route('/instagram/generate/film-reel', methods=['POST'])
def generate_film_reel():
    """Generate a film clip reel. Body: {film_name, clip_start, clip_duration, audio_path}"""
    from services.instagram_content_service import generate_film_clip_reel

    data = request.json or {}
    result = generate_film_clip_reel(
        film_name=data.get('film_name', 'dd-the-vault'),
        clip_start=data.get('clip_start', 0),
        clip_duration=data.get('clip_duration', 20),
        audio_path=data.get('audio_path'),
        audio_start=data.get('audio_start', 0),
        overlay_text=data.get('overlay_text'),
    )
    return jsonify(result)


@instagram_bp.route('/instagram/generate/chorus-reel', methods=['POST'])
def generate_chorus_reel_route():
    """Generate a chorus reel from uploaded clip + audio. Body: {film_clip_path, audio_path, clip_duration}"""
    from services.instagram_content_service import generate_chorus_reel

    data = request.json or {}
    result = generate_chorus_reel(
        film_clip_path=data['film_clip_path'],
        audio_path=data['audio_path'],
        audio_start=data.get('audio_start', 0),
        clip_duration=data.get('clip_duration', 20),
        overlay_text=data.get('overlay_text', 'DIAMOND DRONES\u2122'),
    )
    return jsonify(result)


# --- DAILY CONTENT GENERATION ---

@instagram_bp.route('/instagram/generate/daily', methods=['POST'])
def generate_daily():
    """Generate a full day's content. Body: {date, phase}"""
    from services.instagram_scheduler import generate_daily_content

    data = request.json or {}
    result = generate_daily_content(
        date=data.get('date'),
        phase=data.get('phase', 'disruption'),
    )
    return jsonify({
        'items_generated': len(result),
        'content': result,
    })


@instagram_bp.route('/instagram/generate/week', methods=['POST'])
def generate_week():
    """Generate a full week's content. Body: {start_date, phase}"""
    from services.instagram_scheduler import generate_week_content

    data = request.json or {}
    result = generate_week_content(
        start_date=data.get('start_date'),
        phase=data.get('phase', 'disruption'),
    )
    return jsonify({
        'items_generated': len(result),
        'days': 7,
        'avg_per_day': len(result) / 7 if result else 0,
    })


# --- SCHEDULING & PUBLISHING ---

@instagram_bp.route('/instagram/schedule/status', methods=['GET'])
def schedule_status():
    """Get current schedule status."""
    from services.instagram_scheduler import get_schedule_status
    return jsonify(get_schedule_status())


@instagram_bp.route('/instagram/schedule/clear', methods=['POST'])
def clear_schedule():
    """Clear all pending scheduled items."""
    from services.instagram_scheduler import clear_schedule as do_clear
    return jsonify(do_clear())


@instagram_bp.route('/instagram/publish/pending', methods=['POST'])
def publish_pending():
    """Publish all content scheduled for now or earlier."""
    from services.instagram_scheduler import publish_pending_content

    data = request.json or {}
    dry_run = data.get('dry_run', False)
    count = publish_pending_content(dry_run=dry_run)
    return jsonify({
        'published': count,
        'dry_run': dry_run,
    })


@instagram_bp.route('/instagram/publish/now', methods=['POST'])
def publish_now():
    """Immediately publish a single piece of content. Body: {content_type, ...params}"""
    from services.instagram_api_service import InstagramAPIService
    from services.instagram_scheduler import _local_to_public_url, _log_post

    data = request.json or {}
    api = InstagramAPIService()
    content_type = data.get('content_type', 'feed')
    caption = data.get('caption', '')
    path = data.get('path', '')

    url = _local_to_public_url(path)

    if content_type in ('feed', 'feed_grid', 'quote_card'):
        result = api.publish_image(url, caption)
    elif content_type == 'carousel':
        paths = data.get('paths', [])
        urls = [_local_to_public_url(p) for p in paths]
        result = api.publish_carousel(urls, caption)
    elif content_type == 'reel':
        result = api.publish_reel(url, caption)
    elif content_type == 'story':
        result = api.publish_story_image(url) if not path.endswith('.mp4') else api.publish_story_video(url)
    else:
        return jsonify({'error': f'Unknown content type: {content_type}'}), 400

    _log_post({**data, **result})
    return jsonify(result)


@instagram_bp.route('/instagram/schedule/add-chorus', methods=['POST'])
def add_chorus():
    """Add a chorus reel to the schedule. Body: {film_clip_path, audio_path, scheduled_time, caption}"""
    from services.instagram_scheduler import add_chorus_reel_to_schedule

    data = request.json or {}
    result = add_chorus_reel_to_schedule(
        film_clip_path=data['film_clip_path'],
        audio_path=data['audio_path'],
        scheduled_time=data['scheduled_time'],
        caption=data.get('caption'),
        audio_start=data.get('audio_start', 0),
        clip_duration=data.get('clip_duration', 20),
    )
    return jsonify(result)


# --- CONTENT CALENDAR ---

@instagram_bp.route('/instagram/calendar', methods=['POST'])
def get_calendar():
    """Generate a content calendar. Body: {start_date, phase}"""
    from services.content_calendar_service import generate_weekly_calendar

    data = request.json or {}
    calendar = generate_weekly_calendar(
        start_date=data.get('start_date', datetime.now().strftime('%Y-%m-%d')),
        phase=data.get('phase', 'disruption'),
    )
    return jsonify({
        'phase': data.get('phase', 'disruption'),
        'days': len(calendar),
        'calendar': calendar,
    })


@instagram_bp.route('/instagram/calendar/phases', methods=['GET'])
def get_phases():
    """List available campaign phases."""
    from services.content_calendar_service import get_available_phases
    return jsonify(get_available_phases())


# --- ASSETS ---

@instagram_bp.route('/instagram/assets', methods=['GET'])
def list_assets():
    """List all available assets for content generation."""
    from services.instagram_content_service import list_available_assets
    return jsonify(list_available_assets())


@instagram_bp.route('/instagram/output/<path:filename>')
def serve_instagram_content(filename):
    """Serve generated Instagram content files."""
    return send_from_directory(OUTPUT_DIR, filename)


# --- INSTAGRAM API STATUS ---

@instagram_bp.route('/instagram/api/status', methods=['GET'])
def api_status():
    """Check Instagram API connection status."""
    from services.instagram_api_service import InstagramAPIService

    api = InstagramAPIService()
    token_status = api.verify_token()

    if token_status.get('valid'):
        try:
            account = api.get_account_info()
            return jsonify({
                'connected': True,
                'token_valid': True,
                'account': account,
            })
        except Exception as e:
            return jsonify({
                'connected': False,
                'token_valid': True,
                'error': str(e),
            })

    return jsonify({
        'connected': False,
        'token_valid': False,
        'token_status': token_status,
        'setup_instructions': {
            'step1': 'Go to developers.facebook.com and create an app',
            'step2': 'Add Instagram Graph API product',
            'step3': 'Generate User Token with pages_show_list, instagram_basic, instagram_content_publish',
            'step4': 'Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID to .env',
        },
    })


@instagram_bp.route('/instagram/api/insights', methods=['GET'])
def get_insights():
    """Get account insights."""
    from services.instagram_api_service import InstagramAPIService

    api = InstagramAPIService()
    period = request.args.get('period', 'day')
    insights = api.get_account_insights(period=period)
    return jsonify(insights)


@instagram_bp.route('/instagram/api/refresh-token', methods=['POST'])
def refresh_token():
    """Refresh the long-lived access token."""
    from services.instagram_api_service import InstagramAPIService

    api = InstagramAPIService()
    result = api.refresh_long_lived_token()
    return jsonify(result)


# --- UPLOAD CHORUS CLIPS ---

@instagram_bp.route('/instagram/upload/clip', methods=['POST'])
def upload_clip():
    """Upload a film clip or Kling video for use in chorus reels."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'No filename'}), 400

    clips_dir = os.path.join(OUTPUT_DIR, 'clips')
    os.makedirs(clips_dir, exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    safe_name = file.filename.replace(' ', '_')
    filename = f'{timestamp}_{safe_name}'
    filepath = os.path.join(clips_dir, filename)
    file.save(filepath)

    return jsonify({
        'path': filepath,
        'filename': filename,
        'message': 'Clip uploaded. Use this path when creating chorus reels.',
    })
