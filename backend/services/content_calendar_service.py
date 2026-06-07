"""
Content Calendar Service for DIAMOND DRONES Instagram Campaign

Generates phase-specific posting schedules with content types,
captions, hashtags, and optimal posting times.
"""

import random
from datetime import datetime, timedelta

# Optimal posting times (UK timezone, targeting younger demographic)
# Weekday slots: morning discovery, lunch engagement, evening prime
POSTING_SLOTS = {
    'morning': '11:00',
    'lunch': '13:00',
    'evening': '19:00',
    'prime': '20:30',
}

# Best days ranked by Instagram engagement
BEST_DAYS = ['Tuesday', 'Wednesday', 'Thursday', 'Monday', 'Friday', 'Saturday', 'Sunday']

# Hashtag sets by context
HASHTAGS = {
    'brand': ['#DiamondDrones', '#DronesOfSuburbia', '#MissALSimpson'],
    'diamond_drones': ['#DiamondDrones1000', '#GenerativeArt', '#DigitalDiamonds'],
    'drone_blondes': ['#DroneBlondes', '#NFTPhotography', '#BlackAndWhitePhotography', '#FineArtPhotography'],
    'album': ['#DronesAlbum', '#MusicNFT', '#ElectronicMusic'],
    'discovery': ['#CryptoArt', '#NFTArt', '#DigitalArt', '#Web3Art', '#ContemporaryArt'],
    'disruption': ['#DigitalDiamonds', '#FutureOfDiamonds', '#NewLuxury', '#DigitalLuxury', '#GenZ'],
    'collectors': ['#ArtCollector', '#DigitalCollecting', '#TokenGated', '#OnChainArt'],
    'aesthetic': ['#ImmersiveArt', '#CinematicArt', '#DarkAesthetic', '#LuxuryArt'],
}


def _build_hashtag_set(contexts, max_tags=15):
    """Build a hashtag string from context keys, capped at max_tags for Instagram."""
    tags = []
    # Always include brand tags
    tags.extend(HASHTAGS['brand'])
    for ctx in contexts:
        if ctx in HASHTAGS:
            tags.extend(HASHTAGS[ctx])
    # Deduplicate, cap
    seen = set()
    unique = []
    for t in tags:
        if t.lower() not in seen:
            seen.add(t.lower())
            unique.append(t)
    return ' '.join(unique[:max_tags])


# --- CAPTION TEMPLATES ---

REEL_CAPTIONS = {
    'diamond_drones': [
        "DIAMOND DRONES\u2122\n\nDigital diamonds for a new generation. 1000 unique works.\n\ndronesofsuburbia.com\n\n{hashtags}",
        "DIAMOND DRONES\u2122\n\nNot mined. Minted. The diamond industry reimagined.\n\ndronesofsuburbia.com\n\n{hashtags}",
        "DIAMOND DRONES\u2122\n\nEach one unique. Each one forever. Welcome to the new luxury.\n\ndronesofsuburbia.com\n\n{hashtags}",
        "DIAMOND DRONES\u2122\n\nThe future of diamonds is digital. Are you ready?\n\ndronesofsuburbia.com\n\n{hashtags}",
        "DIAMOND DRONES\u2122\n\nForget the mines. Forget the markup. This is something new.\n\ndronesofsuburbia.com\n\n{hashtags}",
        "DIAMOND DRONES\u2122\n\n4096 x 4096 pixels. Archival scale. Built to last.\n\ndronesofsuburbia.com\n\n{hashtags}",
        "DIAMOND DRONES\u2122\n\nA body of work, not a drop. A world, not a page.\n\ndronesofsuburbia.com\n\n{hashtags}",
    ],
    'drone_blondes': [
        "DRONE BLONDES\n\n120 black and white photographs. 10 traits. Each one a standalone work.\n\ndronesofsuburbia.com\n\n{hashtags}",
        "DRONE BLONDES\n\nPhotography. Not generative. Not AI. Photographs.\n\ndronesofsuburbia.com\n\n{hashtags}",
        "DRONE BLONDES\n\nThe intimate counterpart. 120 editions. Quieter energy. Same world.\n\ndronesofsuburbia.com\n\n{hashtags}",
    ],
    'film': [
        "DIAMOND DRONES\u2122\n\nFrom the cinema. The world breathes.\n\ndronesofsuburbia.com/drones/cinema\n\n{hashtags}",
        "DIAMOND DRONES\u2122\n\nFour films. No gas fees to watch. Art first, always.\n\ndronesofsuburbia.com/drones/cinema\n\n{hashtags}",
    ],
    'disruption': [
        "DIAMOND DRONES\u2122\n\nDiamonds don't need to come from the ground.\nThey don't need a cartel to set the price.\nThey don't need a box.\n\nThey need to be beautiful. That's all.\n\ndronesofsuburbia.com\n\n{hashtags}",
        "DIAMOND DRONES\u2122\n\nThe diamond industry is worth $87 billion.\nBuilt on scarcity, secrecy, and control.\n\nWhat happens when the diamonds are digital?\n\ndronesofsuburbia.com\n\n{hashtags}",
        "DIAMOND DRONES\u2122\n\nYour grandmother's diamonds sat in a drawer.\nYours live on the blockchain.\n\nSame beauty. No middleman.\n\ndronesofsuburbia.com\n\n{hashtags}",
        "DIAMOND DRONES\u2122\n\nA generation that grew up digital\ndeserves luxury that's native to their world.\n\ndronesofsuburbia.com\n\n{hashtags}",
    ],
}

FEED_CAPTIONS = {
    'single_drone': [
        "Diamond Drone #{id}.\n\n1000 unique works. 4096 x 4096 pixels. Built to exist at archival scale.\n\ndronesofsuburbia.com\n\n{hashtags}",
        "Diamond Drone #{id}.\n\nNot mined. Minted.\n\ndronesofsuburbia.com\n\n{hashtags}",
        "Diamond Drone #{id}.\n\nEvery drone has a story. Every suburb has a secret.\n\ndronesofsuburbia.com\n\n{hashtags}",
    ],
    'grid': [
        "Same system, infinite variation.\n\nDIAMOND DRONES\u2122 \u2014 each one unique.\n\ndronesofsuburbia.com\n\n{hashtags}",
        "Four faces of the same world.\n\nDIAMOND DRONES\u2122\n\ndronesofsuburbia.com\n\n{hashtags}",
    ],
    'carousel': [
        "Swipe through. Each one unique. Each one built to exist at archival scale.\n\nDIAMOND DRONES\u2122\n\ndronesofsuburbia.com\n\n{hashtags}",
    ],
}


def _pick_caption(template_list, **kwargs):
    """Pick a random caption template and fill in variables."""
    template = random.choice(template_list)
    return template.format(**kwargs)


# --- CALENDAR GENERATION ---

def generate_weekly_calendar(start_date, phase='pre_launch', posts_per_day=None):
    """
    Generate a 7-day content calendar for the given phase.

    Returns a list of scheduled content items with:
    - date, time, platform, content_type, caption, hashtags, generation_params
    """
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, '%Y-%m-%d')

    calendar = []

    if phase == 'pre_launch':
        calendar = _generate_pre_launch_week(start_date)
    elif phase == 'phase1_site_launch':
        calendar = _generate_site_launch_week(start_date)
    elif phase == 'phase2_drone_blondes':
        calendar = _generate_drone_blondes_week(start_date)
    elif phase == 'phase3_album':
        calendar = _generate_album_week(start_date)
    elif phase == 'phase4_diamond_drones':
        calendar = _generate_diamond_drones_week(start_date)
    elif phase == 'disruption':
        calendar = _generate_disruption_week(start_date)
    elif phase == 'ongoing':
        calendar = _generate_ongoing_week(start_date)

    return calendar


def _generate_pre_launch_week(start):
    """Pre-launch: mystery, teaser, build curiosity."""
    hashtags = _build_hashtag_set(['discovery', 'aesthetic'])
    week = []

    # Monday: Reel — moody Diamond Drone slideshow
    week.append({
        'date': (start + timedelta(days=0)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Slideshow reel: 8 Diamond Drones with ambient audio, slow transitions',
        'caption': 'Something is being built.\n\n{hashtags}'.format(hashtags=hashtags),
        'generation': {'function': 'generate_slideshow_reel', 'params': {'collection': 'diamond_drones', 'count': 8}},
    })

    # Tuesday: Feed — close-up detail, no full reveal
    week.append({
        'date': (start + timedelta(days=1)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['lunch'],
        'platform': 'instagram',
        'content_type': 'feed',
        'description': 'Single Diamond Drone — cropped detail, mysterious',
        'caption': 'Detail 1 of 7. The closer you look, the more the suburbs dissolve.\n\n{hashtags}'.format(hashtags=hashtags),
        'generation': {'function': 'generate_single_drone_post', 'params': {}},
    })

    # Wednesday: Story — cryptic text overlay
    week.append({
        'date': (start + timedelta(days=2)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['prime'],
        'platform': 'instagram',
        'content_type': 'story',
        'description': 'Story with text: "Every drone has a story."',
        'caption': None,
        'generation': {'function': 'generate_story', 'params': {'text_overlay': 'Every drone has a story. Every suburb has a secret.'}},
    })

    # Thursday: Reel — Drone Blondes teaser
    week.append({
        'date': (start + timedelta(days=3)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Slideshow reel: Drone Blondes B&W with ambient audio',
        'caption': 'Black and white. 120 photographs.\n\n{hashtags}'.format(hashtags=hashtags),
        'generation': {'function': 'generate_slideshow_reel', 'params': {'collection': 'drone_blondes', 'count': 6}},
    })

    # Friday: Quote card
    week.append({
        'date': (start + timedelta(days=4)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['lunch'],
        'platform': 'instagram',
        'content_type': 'feed',
        'description': 'Quote card — artist statement',
        'caption': None,
        'generation': {'function': 'generate_quote_card', 'params': {'quote': "I've spent two years building something that doesn't exist yet in this space. Not a collection. A world."}},
    })

    # Saturday: Reel — film clip
    week.append({
        'date': (start + timedelta(days=5)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['prime'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Film clip reel from The Vault',
        'caption': _pick_caption(REEL_CAPTIONS['film'], hashtags=hashtags),
        'generation': {'function': 'generate_film_clip_reel', 'params': {'film_name': 'dd-the-vault', 'clip_duration': 15}},
    })

    # Sunday: Carousel
    week.append({
        'date': (start + timedelta(days=6)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'carousel',
        'description': 'Carousel: 5 Diamond Drones',
        'caption': _pick_caption(FEED_CAPTIONS['carousel'], hashtags=hashtags),
        'generation': {'function': 'generate_carousel', 'params': {'collection': 'diamond_drones', 'count': 5}},
    })

    return week


def _generate_disruption_week(start):
    """Disruption-focused content: targeting younger demographic, challenging diamond industry."""
    hashtags = _build_hashtag_set(['disruption', 'discovery'])
    week = []

    # Monday: Disruption Reel — Diamond Drones slideshow with chorus
    week.append({
        'date': (start + timedelta(days=0)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Chorus reel: Diamond Drones visuals + chorus audio — diamond industry disruption messaging',
        'caption': _pick_caption(REEL_CAPTIONS['disruption'], hashtags=hashtags),
        'generation': {'function': 'generate_slideshow_reel', 'params': {'collection': 'diamond_drones', 'count': 10}},
    })

    # Tuesday: Feed — provocative quote card
    week.append({
        'date': (start + timedelta(days=1)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['lunch'],
        'platform': 'instagram',
        'content_type': 'feed',
        'description': 'Quote card: diamond industry disruption angle',
        'caption': None,
        'generation': {'function': 'generate_quote_card', 'params': {'quote': 'Diamonds don\'t need to come from the ground. They don\'t need a cartel to set the price. They need to be beautiful. That\'s all.'}},
    })

    # Wednesday: Reel — film clip with chorus
    week.append({
        'date': (start + timedelta(days=2)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['prime'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Film clip reel with chorus overlay — cinematic disruption',
        'caption': _pick_caption(REEL_CAPTIONS['disruption'], hashtags=hashtags),
        'generation': {'function': 'generate_film_clip_reel', 'params': {'film_name': 'dd-jewellery-box', 'clip_duration': 20}},
    })

    # Thursday: Carousel — Diamond Drones variety
    week.append({
        'date': (start + timedelta(days=3)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'carousel',
        'description': 'Carousel: 5 Diamond Drones showing range',
        'caption': 'DIAMOND DRONES\u2122\n\nA generation that grew up digital deserves luxury that\'s native to their world.\n\nSwipe through.\n\ndronesofsuburbia.com\n\n{hashtags}'.format(hashtags=hashtags),
        'generation': {'function': 'generate_carousel', 'params': {'collection': 'diamond_drones', 'count': 5}},
    })

    # Friday: Reel — Drone Blondes with music
    week.append({
        'date': (start + timedelta(days=4)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Drone Blondes slideshow reel — photography meets digital luxury',
        'caption': _pick_caption(REEL_CAPTIONS['drone_blondes'], hashtags=_build_hashtag_set(['drone_blondes', 'discovery'])),
        'generation': {'function': 'generate_slideshow_reel', 'params': {'collection': 'drone_blondes', 'count': 8}},
    })

    # Saturday: Story — bold statement
    week.append({
        'date': (start + timedelta(days=5)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['prime'],
        'platform': 'instagram',
        'content_type': 'story',
        'description': 'Story: "The diamond industry is worth $87 billion. What happens when the diamonds are digital?"',
        'caption': None,
        'generation': {'function': 'generate_story', 'params': {'collection': 'diamond_drones', 'text_overlay': 'The diamond industry is worth $87 billion.\nWhat happens when the diamonds are digital?'}},
    })

    # Sunday: Feed — 4-grid showing range
    week.append({
        'date': (start + timedelta(days=6)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'feed',
        'description': 'Grid post: 4 Diamond Drones',
        'caption': _pick_caption(FEED_CAPTIONS['grid'], hashtags=hashtags),
        'generation': {'function': 'generate_grid_post', 'params': {'count': 4, 'collection': 'diamond_drones'}},
    })

    return week


def _generate_site_launch_week(start):
    """Phase 1: Site launch — drive traffic, establish the world."""
    hashtags = _build_hashtag_set(['discovery', 'aesthetic', 'collectors'])
    week = []

    week.append({
        'date': (start + timedelta(days=0)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['morning'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Cinematic site tour reel — 45 seconds, screen recording with ambient audio',
        'caption': 'DIAMOND DRONES\u2122 \u2014 The world is open.\n\ndronesofsuburbia.com is not a mint page. It\'s a universe. Six zones. One vision. Walk through it.\n\nLink in bio.\n\n{hashtags}'.format(hashtags=hashtags),
        'generation': {'function': 'generate_slideshow_reel', 'params': {'collection': 'diamond_drones', 'count': 10}},
        'note': 'MANUAL: Record a screen walkthrough of the site for best results',
    })

    for i, zone in enumerate(['Vault', 'Boudoir', 'Studio', 'Cinema']):
        week.append({
            'date': (start + timedelta(days=1 + i)).strftime('%Y-%m-%d'),
            'time': POSTING_SLOTS['evening'],
            'platform': 'instagram',
            'content_type': 'feed',
            'description': f'Zone reveal: {zone}',
            'caption': f'The {zone} zone.\n\nOne of six zones inside dronesofsuburbia.com. Enter the world.\n\n{hashtags}',
            'generation': {'function': 'generate_single_drone_post', 'params': {}},
        })

    week.append({
        'date': (start + timedelta(days=5)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['lunch'],
        'platform': 'instagram',
        'content_type': 'feed',
        'description': 'Artist statement quote card',
        'caption': None,
        'generation': {'function': 'generate_quote_card', 'params': {'quote': "I didn't want to build a website. I wanted to build a feeling. The kind you get walking into a gallery alone at night."}},
    })

    week.append({
        'date': (start + timedelta(days=6)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['prime'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Film clip from Diamond Drone Lounge',
        'caption': _pick_caption(REEL_CAPTIONS['film'], hashtags=hashtags),
        'generation': {'function': 'generate_film_clip_reel', 'params': {'film_name': 'dd-diamond-drone-lounge', 'clip_duration': 20}},
    })

    return week


def _generate_drone_blondes_week(start):
    """Phase 2: Drone Blondes drop."""
    hashtags = _build_hashtag_set(['drone_blondes', 'discovery'])
    week = []

    for i in range(4):
        week.append({
            'date': (start + timedelta(days=i)).strftime('%Y-%m-%d'),
            'time': POSTING_SLOTS['evening'],
            'platform': 'instagram',
            'content_type': 'reel' if i % 2 == 0 else 'feed',
            'description': f'Drone Blondes trait reveal #{i+1}' if i < 3 else 'Full piece reveal',
            'caption': _pick_caption(REEL_CAPTIONS['drone_blondes'], hashtags=hashtags) if i % 2 == 0 else f'Drone Blondes.\n\nTrait {i+1} of 10.\n\n{hashtags}',
            'generation': {
                'function': 'generate_slideshow_reel' if i % 2 == 0 else 'generate_drone_blonde_post',
                'params': {'collection': 'drone_blondes', 'count': 6} if i % 2 == 0 else {},
            },
        })

    week.append({
        'date': (start + timedelta(days=4)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['lunch'],
        'platform': 'instagram',
        'content_type': 'feed',
        'description': 'Quote card: "120 photographs. That\'s all."',
        'caption': None,
        'generation': {'function': 'generate_quote_card', 'params': {'quote': '120 photographs. That\'s all.'}},
    })

    week.append({
        'date': (start + timedelta(days=5)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['prime'],
        'platform': 'instagram',
        'content_type': 'carousel',
        'description': 'Carousel: 5 Drone Blondes',
        'caption': 'DRONE BLONDES\n\nSwipe through. 10 traits. 120 photographs. Each one a standalone work.\n\ndronesofsuburbia.com\n\n{hashtags}'.format(hashtags=hashtags),
        'generation': {'function': 'generate_carousel', 'params': {'collection': 'drone_blondes', 'count': 5}},
    })

    week.append({
        'date': (start + timedelta(days=6)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'story',
        'description': 'Story countdown: "Tomorrow."',
        'caption': None,
        'generation': {'function': 'generate_story', 'params': {'collection': 'drone_blondes', 'text_overlay': 'Tomorrow.'}},
    })

    return week


def _generate_album_week(start):
    """Phase 3: Album drop."""
    hashtags = _build_hashtag_set(['album', 'discovery'])
    week = []

    week.append({
        'date': (start + timedelta(days=0)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Audio teaser: 15-second clip with waveform visual',
        'caption': 'THE DRONES OF SUBURBIA\u2122 \u2014 the album.\n\n11 tracks. Open edition on Manifold.\n\nThe Studio zone opens with the mint.\n\n{hashtags}'.format(hashtags=hashtags),
        'generation': {'function': 'generate_slideshow_reel', 'params': {'collection': 'diamond_drones', 'count': 6}},
        'note': 'MANUAL: Add album artwork / waveform visual for best results',
    })

    for i in range(3):
        week.append({
            'date': (start + timedelta(days=1 + i)).strftime('%Y-%m-%d'),
            'time': POSTING_SLOTS['evening'],
            'platform': 'instagram',
            'content_type': 'feed',
            'description': f'Track card #{i+1}' if i < 2 else 'Album artwork reveal',
            'caption': f'Track {i+1}. No title yet. Just this.\n\n{hashtags}',
            'generation': {'function': 'generate_quote_card', 'params': {'quote': f'Track {i+1}.'}},
        })

    week.append({
        'date': (start + timedelta(days=4)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['lunch'],
        'platform': 'instagram',
        'content_type': 'feed',
        'description': 'Quote card: music as NFT statement',
        'caption': None,
        'generation': {'function': 'generate_quote_card', 'params': {'quote': 'Why release music as an NFT? Because I want my collectors to own the art, not rent it. No algorithm deciding if you hear it. No platform taking it down.'}},
    })

    week.append({
        'date': (start + timedelta(days=5)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['prime'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Album artwork + 30-second preview reel',
        'caption': '11 tracks. Open edition. The accessible entry point into the DIAMOND DRONES\u2122 world.\n\nMinting soon on Manifold.\n\n{hashtags}'.format(hashtags=hashtags),
        'generation': {'function': 'generate_slideshow_reel', 'params': {'collection': 'diamond_drones', 'count': 8}},
    })

    week.append({
        'date': (start + timedelta(days=6)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'story',
        'description': 'Story: "The Studio opens tomorrow. Press play."',
        'caption': None,
        'generation': {'function': 'generate_story', 'params': {'text_overlay': 'The Studio opens tomorrow.\nPress play.'}},
    })

    return week


def _generate_diamond_drones_week(start):
    """Phase 4: Diamond Drones flagship drop."""
    hashtags = _build_hashtag_set(['diamond_drones', 'discovery', 'disruption', 'collectors'])
    week = []

    week.append({
        'date': (start + timedelta(days=0)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Flagship reveal reel: rapid-fire Diamond Drones slideshow with chorus',
        'caption': _pick_caption(REEL_CAPTIONS['diamond_drones'], hashtags=hashtags),
        'generation': {'function': 'generate_slideshow_reel', 'params': {'collection': 'diamond_drones', 'count': 12}},
    })

    week.append({
        'date': (start + timedelta(days=1)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['lunch'],
        'platform': 'instagram',
        'content_type': 'feed',
        'description': '4-grid showing variety',
        'caption': _pick_caption(FEED_CAPTIONS['grid'], hashtags=hashtags),
        'generation': {'function': 'generate_grid_post', 'params': {'count': 4, 'collection': 'diamond_drones'}},
    })

    week.append({
        'date': (start + timedelta(days=2)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'carousel',
        'description': 'Trait system explainer carousel',
        'caption': 'The trait system behind DIAMOND DRONES\u2122.\n\nSwipe through: Background / Drone Model / Colour Palette / Lighting / Environment / Atmosphere.\n\n1000 unique combinations. No two alike.\n\n{hashtags}'.format(hashtags=hashtags),
        'generation': {'function': 'generate_carousel', 'params': {'collection': 'diamond_drones', 'count': 6}},
    })

    week.append({
        'date': (start + timedelta(days=3)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['prime'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Film clip reel: The Vault with chorus',
        'caption': _pick_caption(REEL_CAPTIONS['disruption'], hashtags=hashtags),
        'generation': {'function': 'generate_film_clip_reel', 'params': {'film_name': 'dd-the-vault', 'clip_duration': 20}},
    })

    week.append({
        'date': (start + timedelta(days=4)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['lunch'],
        'platform': 'instagram',
        'content_type': 'feed',
        'description': 'Token-gating explainer post',
        'caption': 'Every Diamond Drone collector receives token-gated access to the 4K archival PNG at dronesofsuburbia.com.\n\nConnect wallet. Verify ownership. Download.\n\nThe highest resolution I can offer \u2014 yours to keep, print, display.\n\n{hashtags}'.format(hashtags=hashtags),
        'generation': {'function': 'generate_single_drone_post', 'params': {}},
    })

    week.append({
        'date': (start + timedelta(days=5)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'feed',
        'description': 'Quote card: archival scale',
        'caption': None,
        'generation': {'function': 'generate_quote_card', 'params': {'quote': 'Zoom in. Keep zooming. 4096 x 4096 pixels. Every Diamond Drone is built to exist at archival scale. Print it. Frame it. Live with it.'}},
    })

    week.append({
        'date': (start + timedelta(days=6)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['prime'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Disruption reel: "Your grandmother\'s diamonds sat in a drawer. Yours live on the blockchain."',
        'caption': _pick_caption(REEL_CAPTIONS['disruption'], hashtags=hashtags),
        'generation': {'function': 'generate_slideshow_reel', 'params': {'collection': 'diamond_drones', 'count': 10}},
    })

    return week


def _generate_ongoing_week(start):
    """Ongoing: sustained engagement between drops."""
    hashtags = _build_hashtag_set(['discovery', 'aesthetic', 'disruption'])
    week = []

    # 3 posts: Mon, Wed, Fri — mix of reels, feed, quote cards
    week.append({
        'date': (start + timedelta(days=0)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['evening'],
        'platform': 'instagram',
        'content_type': 'reel',
        'description': 'Weekly reel: Diamond Drones slideshow',
        'caption': _pick_caption(REEL_CAPTIONS['diamond_drones'], hashtags=hashtags),
        'generation': {'function': 'generate_slideshow_reel', 'params': {'collection': 'diamond_drones', 'count': 8}},
    })

    week.append({
        'date': (start + timedelta(days=2)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['lunch'],
        'platform': 'instagram',
        'content_type': 'feed',
        'description': 'Mid-week feed post',
        'caption': _pick_caption(FEED_CAPTIONS['single_drone'], id=random.randint(1, 1000), hashtags=hashtags),
        'generation': {'function': 'generate_single_drone_post', 'params': {}},
    })

    week.append({
        'date': (start + timedelta(days=4)).strftime('%Y-%m-%d'),
        'time': POSTING_SLOTS['prime'],
        'platform': 'instagram',
        'content_type': 'feed',
        'description': 'Friday quote card or Drone Blonde',
        'caption': None,
        'generation': {'function': 'generate_quote_card', 'params': {'quote': random.choice([
            "Digital diamonds for a new generation.",
            "Not mined. Minted.",
            "This is art first, always.",
        ])}},
    })

    # Daily stories
    for i in range(7):
        week.append({
            'date': (start + timedelta(days=i)).strftime('%Y-%m-%d'),
            'time': POSTING_SLOTS['morning'],
            'platform': 'instagram',
            'content_type': 'story',
            'description': f'Daily story — day {i+1}',
            'caption': None,
            'generation': {'function': 'generate_story', 'params': {
                'collection': random.choice(['diamond_drones', 'drone_blondes']),
            }},
        })

    return week


def get_available_phases():
    """Return all available campaign phases."""
    return [
        {'id': 'pre_launch', 'name': 'Pre-Launch Runway', 'description': 'Build mystery and curiosity (4-6 weeks before Phase 1)'},
        {'id': 'phase1_site_launch', 'name': 'Phase 1: Site Launch', 'description': 'dronesofsuburbia.com goes live (7-10 days)'},
        {'id': 'phase2_drone_blondes', 'name': 'Phase 2: Drone Blondes', 'description': '120 B&W photographs on OpenSea (10-14 days)'},
        {'id': 'phase3_album', 'name': 'Phase 3: Album Drop', 'description': 'Open edition on Manifold (10-14 days)'},
        {'id': 'phase4_diamond_drones', 'name': 'Phase 4: Diamond Drones', 'description': '1000 generative works on OpenSea (14-21 days)'},
        {'id': 'disruption', 'name': 'Disruption Campaign', 'description': 'Diamond industry disruption messaging — target younger demographic'},
        {'id': 'ongoing', 'name': 'Ongoing', 'description': 'Sustained engagement between drops (3 posts/week + daily stories)'},
    ]
