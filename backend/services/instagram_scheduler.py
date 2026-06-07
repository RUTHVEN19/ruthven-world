"""
Instagram Auto-Scheduler for DIAMOND DRONES

Aggressive posting schedule designed to grow followers rapidly
and disrupt traditional diamond brands (Tiffany, De Beers, Swarovski).

Target: 15-20+ pieces of content per day
- Reels: 2-3x/day (main growth driver)
- Feed posts: 1-2x/day
- Stories: 5-10x/day
- Carousels: every other day

Runs as a background process. Generates content, uploads to a
public-facing server, and publishes via Instagram Graph API.
"""

import os
import json
import random
import threading
import logging
from datetime import datetime, timedelta

from services.instagram_content_service import (
    generate_single_drone_post,
    generate_drone_blonde_post,
    generate_grid_post,
    generate_carousel,
    generate_story,
    generate_quote_card,
    generate_slideshow_reel,
    generate_film_clip_reel,
    generate_chorus_reel,
    BRAND_QUOTES,
    OUTPUT_DIR,
)
from services.instagram_api_service import InstagramAPIService
from services.content_calendar_service import (
    _build_hashtag_set,
    REEL_CAPTIONS,
    FEED_CAPTIONS,
)

logger = logging.getLogger('instagram_scheduler')
logging.basicConfig(level=logging.INFO)

# Schedule database (JSON file for persistence)
SCHEDULE_DB = os.path.join(OUTPUT_DIR, 'schedule_db.json')
POST_LOG = os.path.join(OUTPUT_DIR, 'post_log.json')

# Base URL where generated content is publicly accessible
# This must be set to your server's public URL for the Instagram API to fetch images
PUBLIC_BASE_URL = os.getenv('PUBLIC_CONTENT_URL', '')


def _load_db(path):
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return []


def _save_db(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2, default=str)


def _log_post(post_data):
    """Log a published post."""
    log = _load_db(POST_LOG)
    log.append({**post_data, 'logged_at': datetime.now().isoformat()})
    _save_db(POST_LOG, log)


def _local_to_public_url(local_path):
    """Convert a local file path to a publicly accessible URL."""
    if not PUBLIC_BASE_URL:
        raise ValueError(
            'PUBLIC_CONTENT_URL not set in .env. '
            'The Instagram API needs publicly accessible URLs to fetch your content. '
            'Set this to your server URL, e.g. https://api.dronesofsuburbia.com'
        )
    # Extract relative path from uploads/instagram/
    rel = os.path.relpath(local_path, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads'))
    return f'{PUBLIC_BASE_URL}/uploads/{rel}'


# --- DAILY CONTENT GENERATION ---

# Disruption captions specifically targeting diamond industry
DISRUPTION_CAPTIONS = [
    "DIAMOND DRONES\u2122\n\nTiffany charges $12,000 for a 1-carat diamond.\nDe Beers controls the supply.\nSwarovski sells crystal as luxury.\n\nWe sell art. Digital, eternal, yours.\n\ndronesofsuburbia.com",
    "DIAMOND DRONES\u2122\n\nThe diamond industry spends billions convincing you\nthat a rock from the ground is worth your savings.\n\nWhat if the diamonds were digital?\nWhat if they were art?\nWhat if they were actually scarce?\n\ndronesofsuburbia.com",
    "DIAMOND DRONES\u2122\n\nDiamonds aren't rare. De Beers made you think they are.\n\nThese are rare. 1000. That's all. Forever.\n\ndronesofsuburbia.com",
    "DIAMOND DRONES\u2122\n\nA diamond loses 50% of its value the moment you leave the shop.\n\nA Diamond Drone is verifiably scarce, publicly owned, and can't be counterfeited.\n\nWhich one is the real luxury?\n\ndronesofsuburbia.com",
    "DIAMOND DRONES\u2122\n\nGen Z doesn't want a ring in a box.\nThey want art they can own.\nThey want proof it's theirs.\nThey want to be part of something.\n\ndronesofsuburbia.com",
    "DIAMOND DRONES\u2122\n\nBlood diamonds. Cartel pricing. Environmental destruction.\n\nDigital diamonds. Verifiable scarcity. Beautiful art.\n\nThe choice seems obvious.\n\ndronesofsuburbia.com",
    "DIAMOND DRONES\u2122\n\nSwarovski isn't even real diamond.\nDe Beers is a monopoly.\nTiffany is a blue box.\n\nDIAMOND DRONES is art.\n\ndronesofsuburbia.com",
    "DIAMOND DRONES\u2122\n\nYour parents bought diamonds because advertising told them to.\nYou collect because you chose to.\n\nThat's the difference.\n\ndronesofsuburbia.com",
    "DIAMOND DRONES\u2122\n\nA new generation doesn't need permission\nfrom the diamond industry to define luxury.\n\ndronesofsuburbia.com",
    "DIAMOND DRONES\u2122\n\nDigital diamonds.\nNo mines. No markup. No middleman.\nJust art.\n\ndronesofsuburbia.com",
]

STORY_TEXTS = [
    'Digital diamonds.',
    'Not mined. Minted.',
    'dronesofsuburbia.com',
    '1000 unique works.',
    'The future of diamonds is digital.',
    'Art first, always.',
    'The Vault is open.',
    'A new generation of luxury.',
    'DIAMOND DRONES\u2122',
    'Forget the mines.',
    '4096 x 4096 pixels.',
    'Built to last forever.',
    'Own the art, not a receipt.',
    'No cartel. No markup. Just beauty.',
    'Are you ready?',
]

FILM_NAMES = [
    'dd-the-vault',
    'dd-recording-studio',
    'dd-jewellery-box',
    'dd-diamond-drone-lounge',
]


def generate_daily_content(date=None, phase='disruption'):
    """
    Generate a full day's content for the aggressive posting schedule.

    Returns a list of content items ready for publishing, each with:
    - content_type (reel/feed/story/carousel)
    - scheduled_time
    - local_path(s)
    - caption
    - generation metadata
    """
    if date is None:
        date = datetime.now()
    elif isinstance(date, str):
        date = datetime.strptime(date, '%Y-%m-%d')

    hashtags_dd = _build_hashtag_set(['diamond_drones', 'disruption', 'discovery'])
    hashtags_db = _build_hashtag_set(['drone_blondes', 'discovery'])
    day_content = []

    # --- REELS (3x per day: morning, afternoon, evening) ---

    # Reel 1 (08:00): Diamond Drones slideshow with music
    try:
        reel1 = generate_slideshow_reel(
            collection='diamond_drones',
            count=random.randint(8, 12),
            duration_per_image=random.choice([2, 2.5, 3]),
            audio_path=_extract_chorus_clip(),
        )
        reel1['caption'] = random.choice(DISRUPTION_CAPTIONS) + f'\n\n{hashtags_dd}'
        reel1['scheduled_time'] = date.replace(hour=8, minute=0).isoformat()
        reel1['priority'] = 'high'
        day_content.append(reel1)
    except Exception as e:
        logger.error(f'Failed to generate morning reel: {e}')

    # Reel 2 (13:00): Film clip or Drone Blondes reel
    try:
        if random.random() > 0.5:
            reel2 = generate_film_clip_reel(
                film_name=random.choice(FILM_NAMES),
                clip_start=random.randint(0, 60),
                clip_duration=random.choice([15, 20]),
                audio_path=_extract_chorus_clip(),
                audio_start=0,
            )
            reel2['caption'] = random.choice(DISRUPTION_CAPTIONS) + f'\n\n{hashtags_dd}'
        else:
            reel2 = generate_slideshow_reel(
                collection='drone_blondes',
                count=random.randint(6, 10),
                duration_per_image=2.5,
                audio_path=_extract_chorus_clip(),
            )
            reel2['caption'] = random.choice(REEL_CAPTIONS.get('drone_blondes', REEL_CAPTIONS['diamond_drones'])).format(hashtags=hashtags_db)
        reel2['scheduled_time'] = date.replace(hour=13, minute=0).isoformat()
        reel2['priority'] = 'high'
        day_content.append(reel2)
    except Exception as e:
        logger.error(f'Failed to generate afternoon reel: {e}')

    # Reel 3 (20:00): Prime time — disruption messaging + Diamond Drones
    try:
        reel3 = generate_slideshow_reel(
            collection='diamond_drones',
            count=random.randint(10, 15),
            duration_per_image=2,
            audio_path=_extract_chorus_clip(),
        )
        reel3['caption'] = random.choice(DISRUPTION_CAPTIONS) + f'\n\n{hashtags_dd}'
        reel3['scheduled_time'] = date.replace(hour=20, minute=0).isoformat()
        reel3['priority'] = 'high'
        day_content.append(reel3)
    except Exception as e:
        logger.error(f'Failed to generate evening reel: {e}')

    # --- FEED POSTS (2x per day) ---

    # Feed 1 (11:00): Single drone or grid
    try:
        if random.random() > 0.4:
            feed1 = generate_single_drone_post()
            feed1['caption'] = random.choice(DISRUPTION_CAPTIONS) + f'\n\n{hashtags_dd}'
        else:
            feed1 = generate_grid_post(4, 'diamond_drones')
            feed1['caption'] = random.choice(DISRUPTION_CAPTIONS) + f'\n\n{hashtags_dd}'
        feed1['scheduled_time'] = date.replace(hour=11, minute=0).isoformat()
        feed1['priority'] = 'medium'
        day_content.append(feed1)
    except Exception as e:
        logger.error(f'Failed to generate morning feed: {e}')

    # Feed 2 (17:00): Quote card or Drone Blonde
    try:
        if random.random() > 0.5:
            feed2 = generate_quote_card(random.choice(BRAND_QUOTES + DISRUPTION_CAPTIONS[:3]))
            feed2['caption'] = feed2.get('caption', '') + f'\n\n{hashtags_dd}'
        else:
            feed2 = generate_drone_blonde_post()
            feed2['caption'] = random.choice(REEL_CAPTIONS.get('drone_blondes', [''])).format(hashtags=hashtags_db) if REEL_CAPTIONS.get('drone_blondes') else f'DRONE BLONDES\n\n{hashtags_db}'
        feed2['scheduled_time'] = date.replace(hour=17, minute=0).isoformat()
        feed2['priority'] = 'medium'
        day_content.append(feed2)
    except Exception as e:
        logger.error(f'Failed to generate afternoon feed: {e}')

    # --- CAROUSEL (every day, alternating collections) ---
    try:
        day_num = date.timetuple().tm_yday
        collection = 'diamond_drones' if day_num % 2 == 0 else 'drone_blondes'
        hashtags = hashtags_dd if collection == 'diamond_drones' else hashtags_db
        carousel = generate_carousel(collection, count=random.randint(4, 7))
        carousel['caption'] = f'Swipe through.\n\n' + random.choice(DISRUPTION_CAPTIONS[:5]) + f'\n\n{hashtags}'
        carousel['scheduled_time'] = date.replace(hour=15, minute=0).isoformat()
        carousel['priority'] = 'medium'
        day_content.append(carousel)
    except Exception as e:
        logger.error(f'Failed to generate carousel: {e}')

    # --- STORIES (8x per day, spread throughout) ---
    story_hours = [7, 9, 10, 12, 14, 16, 18, 21]
    for hour in story_hours:
        try:
            collection = random.choice(['diamond_drones', 'drone_blondes'])
            text = random.choice(STORY_TEXTS) if random.random() > 0.3 else None
            story = generate_story(collection=collection, text_overlay=text)
            story['scheduled_time'] = date.replace(hour=hour, minute=random.randint(0, 30)).isoformat()
            story['priority'] = 'low'
            day_content.append(story)
        except Exception as e:
            logger.error(f'Failed to generate story for {hour}:00: {e}')

    # Sort by scheduled time
    day_content.sort(key=lambda x: x.get('scheduled_time', ''))

    # Save to schedule DB
    schedule = _load_db(SCHEDULE_DB)
    for item in day_content:
        item['date'] = date.strftime('%Y-%m-%d')
        item['status'] = 'pending'
        item['generated_at'] = datetime.now().isoformat()
    schedule.extend(day_content)
    _save_db(SCHEDULE_DB, schedule)

    logger.info(f'Generated {len(day_content)} content items for {date.strftime("%Y-%m-%d")}')
    return day_content


def publish_pending_content(dry_run=False):
    """
    Publish all content scheduled for now or earlier.
    Call this periodically (e.g., every 15 minutes via cron or scheduler).
    """
    schedule = _load_db(SCHEDULE_DB)
    now = datetime.now()
    api = InstagramAPIService()
    published_count = 0

    for item in schedule:
        if item.get('status') != 'pending':
            continue

        scheduled_time = datetime.fromisoformat(item['scheduled_time'])
        if scheduled_time > now:
            continue

        if dry_run:
            logger.info(f'[DRY RUN] Would publish: {item["content_type"]} at {item["scheduled_time"]}')
            item['status'] = 'dry_run'
            continue

        try:
            result = _publish_item(api, item)
            item['status'] = 'published'
            item['publish_result'] = result
            item['published_at'] = datetime.now().isoformat()
            published_count += 1
            _log_post(item)
            logger.info(f'Published: {item["content_type"]} — {result.get("media_id", "ok")}')
        except Exception as e:
            item['status'] = 'failed'
            item['error'] = str(e)
            logger.error(f'Failed to publish {item["content_type"]}: {e}')

    _save_db(SCHEDULE_DB, schedule)
    return published_count


def _publish_item(api, item):
    """Publish a single content item via the Instagram API."""
    content_type = item.get('content_type', '')
    caption = item.get('caption', '')

    if content_type == 'feed' or content_type == 'feed_grid':
        path = item.get('path', '')
        url = _local_to_public_url(path)
        return api.publish_image(url, caption)

    elif content_type == 'carousel':
        paths = item.get('paths', [])
        urls = [_local_to_public_url(p) for p in paths]
        return api.publish_carousel(urls, caption)

    elif content_type == 'reel':
        path = item.get('path', '')
        url = _local_to_public_url(path)
        return api.publish_reel(url, caption)

    elif content_type == 'story':
        path = item.get('path', '')
        url = _local_to_public_url(path)
        if path.endswith('.mp4'):
            return api.publish_story_video(url)
        else:
            return api.publish_story_image(url)

    elif content_type == 'quote_card':
        path = item.get('path', '')
        url = _local_to_public_url(path)
        return api.publish_image(url, caption)

    else:
        raise ValueError(f'Unknown content type: {content_type}')



# Chorus timing for Track 11: "Diamond Drones Are a Girl's Best Friend"
# The main chorus runs from 37s to 58s (21 seconds) — the catchy hook
CHORUS_START = 37
CHORUS_END = 58
CHORUS_DURATION = CHORUS_END - CHORUS_START  # 21 seconds


def _get_audio_path():
    """
    Get the path to the signature audio track.
    Primary: "Diamond Drones Are a Girl's Best Friend" (Track 11)
    Fallback: diamond-drones.mp3 from marilyns folder
    """
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Primary: Track 11 — the signature track
    primary = os.path.join(base, 'uploads', 'album', 'mp3', '11-Diamond-Drones-Are-a-Girls-Best-Friend.mp3')
    if os.path.exists(primary):
        return primary

    # Fallback
    fallback = os.path.join(base, '..', 'frontend', 'public', 'marilyns', 'diamond-drones.mp3')
    return fallback if os.path.exists(fallback) else None


def _extract_chorus_clip():
    """
    Extract the chorus section (37s-58s) from Track 11 as a standalone clip.
    Caches the result so it's only extracted once.
    """
    chorus_path = os.path.join(OUTPUT_DIR, '_chorus_clip.mp3')
    if os.path.exists(chorus_path):
        return chorus_path

    source = _get_audio_path()
    if not source:
        return None

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    import subprocess
    result = subprocess.run([
        'ffmpeg', '-y',
        '-ss', str(CHORUS_START),
        '-i', source,
        '-t', str(CHORUS_DURATION),
        '-af', f'afade=t=in:st=0:d=0.3,afade=t=out:st={CHORUS_DURATION - 0.5}:d=0.5',
        '-c:a', 'libmp3lame', '-b:a', '320k',
        chorus_path,
    ], capture_output=True, text=True, timeout=30)

    if result.returncode != 0:
        logger.error(f'Failed to extract chorus clip: {result.stderr}')
        return None

    logger.info(f'Extracted chorus clip: {CHORUS_START}s-{CHORUS_END}s -> {chorus_path}')
    return chorus_path


def _get_random_album_track():
    """Get a random album track for variety in reels."""
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    mp3_dir = os.path.join(base, 'uploads', 'album', 'mp3')
    if os.path.exists(mp3_dir):
        tracks = [f for f in os.listdir(mp3_dir) if f.endswith('.mp3')]
        if tracks:
            return os.path.join(mp3_dir, random.choice(tracks))
    return _get_audio_path()


# --- BATCH OPERATIONS ---

def generate_week_content(start_date=None, phase='disruption'):
    """Generate 7 days of content in advance."""
    if start_date is None:
        start_date = datetime.now()
    elif isinstance(start_date, str):
        start_date = datetime.strptime(start_date, '%Y-%m-%d')

    all_content = []
    for day_offset in range(7):
        date = start_date + timedelta(days=day_offset)
        day_content = generate_daily_content(date, phase)
        all_content.extend(day_content)
        logger.info(f'Day {day_offset + 1}/7: {len(day_content)} items generated')

    logger.info(f'Week total: {len(all_content)} content items generated')
    return all_content


def get_schedule_status():
    """Get current schedule status."""
    schedule = _load_db(SCHEDULE_DB)
    post_log = _load_db(POST_LOG)

    pending = [i for i in schedule if i.get('status') == 'pending']
    published = [i for i in schedule if i.get('status') == 'published']
    failed = [i for i in schedule if i.get('status') == 'failed']

    return {
        'total_scheduled': len(schedule),
        'pending': len(pending),
        'published': len(published),
        'failed': len(failed),
        'total_published_all_time': len(post_log),
        'next_pending': pending[0] if pending else None,
        'last_published': published[-1] if published else None,
    }


def clear_schedule():
    """Clear all pending scheduled items."""
    schedule = _load_db(SCHEDULE_DB)
    # Keep published/failed for history, remove pending
    schedule = [i for i in schedule if i.get('status') != 'pending']
    _save_db(SCHEDULE_DB, schedule)
    return {'cleared': True}


def add_chorus_reel_to_schedule(film_clip_path, audio_path=None, scheduled_time=None,
                                 caption=None, audio_start=0, clip_duration=20):
    """
    Add a custom chorus reel (your Kling clips with chorus overlaid) to the schedule.
    If audio_path is None or 'auto', uses the extracted chorus clip automatically.
    """
    hashtags = _build_hashtag_set(['diamond_drones', 'disruption', 'discovery'])

    # Default to the chorus clip
    if not audio_path or audio_path == 'auto':
        audio_path = _extract_chorus_clip()

    result = generate_chorus_reel(
        film_clip_path=film_clip_path,
        audio_path=audio_path,
        audio_start=audio_start,
        clip_duration=clip_duration,
    )

    result['caption'] = caption or (random.choice(DISRUPTION_CAPTIONS) + f'\n\n{hashtags}')
    result['scheduled_time'] = scheduled_time
    result['status'] = 'pending'
    result['date'] = scheduled_time[:10] if isinstance(scheduled_time, str) else scheduled_time.strftime('%Y-%m-%d')
    result['generated_at'] = datetime.now().isoformat()
    result['priority'] = 'high'
    result['is_chorus_reel'] = True

    schedule = _load_db(SCHEDULE_DB)
    schedule.append(result)
    _save_db(SCHEDULE_DB, schedule)

    return result
