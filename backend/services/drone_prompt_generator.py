"""
Diamond Drones prompt generator.

Builds unique prompts from a trait matrix of piece types, diamond cuts,
jewelry styles, and backgrounds. Each prompt comes with OpenSea-compatible
trait metadata attached.
"""

import random


# ─── Diamond Cuts (with rarity weights) ──────────────────────────

DIAMOND_CUTS = [
    {'value': 'Brilliant Cut', 'weight': 5,
     'desc': 'brilliant-cut faceting refracting sharp geometric light'},
    {'value': 'Princess Cut', 'weight': 15,
     'desc': 'princess-cut square facets and clean angular geometry'},
    {'value': 'Marquise Cut', 'weight': 20,
     'desc': 'elongated marquise-cut diamond body tapering to sharp points'},
    {'value': 'Rose Cut', 'weight': 30,
     'desc': 'flat-backed rose-cut dome facets catching soft diffused light'},
    {'value': 'Baguette Cut', 'weight': 30,
     'desc': 'rectangular baguette-cut step facets in linear formation'},
]


# ─── Piece Type Templates ────────────────────────────────────────

PIECE_TYPES = [
    # --- Aerial Drones (diamond-encrusted luxury objects over NYC) ---
    {
        'type': 'Aerial Drone',
        'weight': 30,
        'category': 'drone',
        'templates': [
            "Diamond-encrusted quadcopter drone, entire body covered in {cut_desc} "
            "diamonds, {jewelry_a}, {jewelry_b}, pavé diamond rotor housings, "
            "hovering above {location}, black and white ink illustration, "
            "luxury surveillance machine, Tiffany & Co aesthetic, square format",

            "Fully iced autonomous drone, {cut_desc} diamond fuselage, "
            "gemstone-encrusted arms, {jewelry_a}, {jewelry_b}, "
            "no bare metal visible, diamonds catching light, "
            "flying over {location}, black and white ink, cinematic, square format",

            "Diamond surveillance drone, quadcopter body encrusted in {cut_desc} "
            "stones, {jewelry_a} and {jewelry_b}, chrome and diamond, "
            "precious stone surface reflecting {location} below, "
            "black and white ink illustration, luxury machine, square format",

            "Jewel-encrusted drone hovering in noir darkness, {cut_desc} diamond body, "
            "{jewelry_a}, {jewelry_b}, every surface pavé set with stones, "
            "against {location}, black and white ink, dramatic lighting, "
            "high jewellery meets surveillance technology, square format",
        ],
    },
    # --- Drone Pendants (using exact proven prompts) ---
    {
        'type': 'Drone Pendant',
        'weight': 12,
        'category': 'jewelry',
        'templates': [
            "Diamond drone-shaped pendant necklace, quadcopter form with four arms "
            "radiating outward, {cut_desc} diamonds at each rotor tip, pavé diamond arms, "
            "large central diamond cluster, silver chain, {bg_jewelry}, "
            "black and white ink, luxury product photography, square format",

            "Diamond drone pendant necklace worn by a woman, drone-shaped jewel with "
            "four arms set with round {cut_desc} diamonds, marquise center stone, "
            "held between fingers, black and white ink editorial, cinematic, square format",

            "Black diamond drone pendant necklace, quadcopter silhouette in oxidised silver, "
            "black {cut_desc} stones at rotor positions, dark pavé arms, "
            "single black marquise center, dark dramatic background, "
            "black and white ink, luxury gothic jewellery photography, square format",

            "Minimal diamond drone pendant, four clean arms in white gold, "
            "single {cut_desc} solitaire at each arm tip, small cluster center, "
            "delicate chain, against deep black, black and white ink, high jewellery editorial, square format",
        ],
    },
    # --- Statement Necklaces ---
    {
        'type': 'Statement Necklace',
        'weight': 8,
        'category': 'jewelry',
        'templates': [
            "Diamond statement collar necklace with drone propeller motif, "
            "repeating rotor geometry in pavé diamonds, "
            "worn on bare décolletage, black and white ink, "
            "cinematic dramatic lighting, square format",

            "Cascading diamond bib necklace, drone arm geometry repeated in "
            "tiered chandelier drops, rose cut and {cut_desc} mixed, worn on skin, "
            "deep shadow, black and white ink editorial, square format",
        ],
    },
    # --- Drone Rings ---
    {
        'type': 'Drone Ring',
        'weight': 8,
        'category': 'jewelry',
        'templates': [
            "Diamond cocktail ring, top view of drone as the ring face, "
            "four arms extending from central {cut_desc} diamond, pavé setting, "
            "white gold, photographed on dark reflective surface, "
            "black and white ink, luxury jewellery editorial, square format",

            "Black and white diamond drone ring, architectural four-arm setting, "
            "large central black diamond, {cut_desc} white pavé border, "
            "oxidised silver band, black and white ink, product photography, velvet background, square format",
        ],
    },
    # --- Drone Bracelets ---
    {
        'type': 'Drone Bracelet',
        'weight': 6,
        'category': 'jewelry',
        'templates': [
            "Diamond tennis bracelet with repeating drone pendant charms, "
            "each charm a miniature diamond drone shape, {cut_desc} throughout, "
            "photographed on wrist against dark skin, black and white ink, cinematic, square format",

            "Wide diamond cuff bracelet, drone propeller geometry etched and set in pavé, "
            "architectural, art deco sensibility, "
            "photographed on black reflective surface, black and white ink, square format",
        ],
    },
    # --- Drone Earrings ---
    {
        'type': 'Drone Earring',
        'weight': 5,
        'category': 'jewelry',
        'templates': [
            "Long drop earrings, diamond drone pendant drops, four-arm form "
            "hanging from ear, pavé throughout, worn, "
            "black and white ink editorial, square format",
        ],
    },
    # --- Drone Brooches (top-down — proven strong outputs) ---
    {
        'type': 'Drone Brooch',
        'weight': 8,
        'category': 'jewelry',
        'templates': [
            "Diamond drone brooch viewed from above, quadcopter form with "
            "{cut_desc} diamonds, four pavé arms radiating from central cluster, "
            "propeller blades visible, {bg_jewelry}, "
            "black and white ink, luxury product photography, square format",

            "Diamond drone brooch, aerial top-down view, four rotor circles "
            "at each arm tip with {cut_desc}, spinning propeller blur, "
            "against pure black, starburst light refraction, black and white ink, square format",
        ],
    },
    # --- Drone Watches (object / 17a — proven strong) ---
    {
        'type': 'Drone Watch',
        'weight': 6,
        'category': 'jewelry',
        'templates': [
            "Diamond drone watch, the watch case IS a miniature quadcopter body, "
            "four rotor arms extending from the case as lugs, {cut_desc} diamonds "
            "encrusting the entire drone form, propeller blades as hour markers, "
            "black dial, photographed on dark reflective surface, "
            "black and white ink, luxury product photography, square format",
        ],
    },
    # --- Drone Watches (worn / 17b — strongest prompt) ---
    {
        'type': 'Drone Watch Worn',
        'weight': 6,
        'category': 'jewelry',
        'templates': [
            "Diamond watch with dial designed as aerial top-down view of a drone, "
            "four pavé diamond arms radiating from center, {cut_desc}, "
            "rotor circles at each arm tip, diamond bezel, "
            "the watch face IS a drone seen from above, {bg_jewelry}, black and white ink, square format",

            "Oversized diamond drone watch, angular quadcopter silhouette as case shape, "
            "arms of the drone form the bracelet links, camera lens as crown, "
            "covered in {cut_desc} pavé diamonds, heavy masculine piece, "
            "black and white ink, product photography, square format",
        ],
    },
    # --- Cuban Link / Masculine pieces ---
    {
        'type': 'Drone Chain',
        'weight': 6,
        'category': 'jewelry',
        'templates': [
            "Heavy Cuban link chain necklace with oversized diamond drone pendant, "
            "{cut_desc} diamonds, worn on black t-shirt, masculine editorial, "
            "black and white ink, square format",

            "Diamond drone signet ring, drone silhouette engraved and set with "
            "flush-set {cut_desc} diamonds, heavy white gold band, worn on male hand, "
            "black and white ink, product photography, square format",

            "Diamond grill with drone propeller geometry in pavé setting, "
            "{cut_desc} diamonds, worn, close-up mouth shot, "
            "black and white ink, hip hop luxury editorial, square format",
        ],
    },
    # --- Legendary (pure diamond, no metal visible) ---
    {
        'type': 'Legendary Drone',
        'weight': 2,
        'category': 'jewelry',
        'templates': [
            "Extraordinary diamond drone brooch, entire quadcopter form encrusted "
            "in {cut_desc} diamonds, no metal visible, pure diamond surface, "
            "photographed against black, blinding light refraction, "
            "black and white ink, luxury auction house photography, square format",
        ],
    },
    # --- Common (minimal, understated) ---
    {
        'type': 'Common Drone',
        'weight': 3,
        'category': 'jewelry',
        'templates': [
            "Delicate silver chain necklace with small geometric drone-shaped pendant, "
            "single tiny diamond at center, minimal, understated, "
            "against black, black and white ink, fine jewellery, square format",
        ],
    },
]


# ─── Jewelry Decorations (for aerial drone prompts) ─────────────

JEWELRY_FEMININE = [
    'diamond tiara crown sensor array',
    'pendant rotor housings',
    'chandelier earring chassis',
    'choker-band fuselage',
    'brooch-encrusted shell',
    'anklet chain trailing beneath',
]

JEWELRY_MASCULINE = [
    'signet ring rotor mounts',
    'Cuban link chain armour',
    'diamond grill intake vents',
    'cufflink rotor caps',
    'watch-face navigation dial',
    'sovereign ring mount',
    'rope chain undercarriage',
    'iced-out bezel cockpit',
]

JEWELRY_UNISEX = [
    'tennis bracelet wingspan',
    'pavé-encrusted shell',
    'solitaire nose cone',
    'eternity band rotor ring',
    'cathedral setting frame',
    'halo mount sensors',
]

ALL_JEWELRY = JEWELRY_FEMININE + JEWELRY_MASCULINE + JEWELRY_UNISEX


# ─── Backgrounds / Locations ────────────────────────────────────

DRONE_LOCATIONS = {
    'Common': [
        'noir black void, dramatic studio lighting',
        'deep black background, single spotlight from above',
        'pure darkness, diamond reflections only',
        'black velvet darkness, luxury product lighting',
    ],
    'Uncommon': [
        'Manhattan skyline at night, city lights below',
        'rain-soaked Manhattan, noir atmosphere',
        'Midtown rooftops, moody overcast',
        'dark industrial Brooklyn, dramatic shadows',
    ],
    'Rare': [
        'Brooklyn Bridge at night, noir',
        'Times Square neon from above, cinematic',
        'Central Park canopy aerial view, dawn haze',
        'Empire State Building close, dramatic clouds',
    ],
    'Legendary': [
        'Statue of Liberty orbit, golden hour',
        'top of Empire State Building, sunset',
        'Manhattan skyline, snowstorm whiteout',
    ],
}

DRONE_LOCATION_WEIGHTS = {
    'Common': 50,
    'Uncommon': 25,
    'Rare': 17,
    'Legendary': 8,
}

JEWELRY_BACKGROUNDS = {
    'Common': [
        'black velvet background',
        'dark reflective surface',
        'plain black background',
    ],
    'Uncommon': [
        "jeweller's case with soft spotlight",
        'grey marble surface',
        'black silk draped background',
    ],
    'Rare': [
        'worn on skin, editorial lighting',
        'held in hand, cinematic close-up',
        'museum vitrine with gallery lighting',
    ],
    'Legendary': [
        'auction house pedestal with dramatic spotlight',
        'worn on décolletage, Helmut Newton style',
        'floating against pure black, no surface visible',
    ],
}

JEWELRY_BG_WEIGHTS = {
    'Common': 40,
    'Uncommon': 30,
    'Rare': 20,
    'Legendary': 10,
}


# ─── Rarity Tier Assignment ─────────────────────────────────────

def _get_rarity_tier(cut, piece_type):
    """Determine rarity tier based on cut + piece type combination."""
    cut_rarity = {
        'Brilliant Cut': 'Legendary',
        'Princess Cut': 'Rare',
        'Marquise Cut': 'Uncommon',
        'Rose Cut': 'Common',
        'Baguette Cut': 'Common',
    }
    type_rarity = {
        'Legendary Drone': 'Legendary',
        'Common Drone': 'Common',
    }

    if piece_type in type_rarity:
        return type_rarity[piece_type]

    base = cut_rarity.get(cut, 'Common')
    return base


# ─── Weighted Random Selection ───────────────────────────────────

def _weighted_choice(items, weight_key='weight', rng=None):
    """Pick one item using weighted random selection."""
    if rng is None:
        rng = random
    weights = [item[weight_key] for item in items]
    return rng.choices(items, weights=weights, k=1)[0]


def _pick_location_tier(rng):
    """Pick a location rarity tier using weights."""
    tiers = list(DRONE_LOCATION_WEIGHTS.keys())
    weights = list(DRONE_LOCATION_WEIGHTS.values())
    tier = rng.choices(tiers, weights=weights, k=1)[0]
    return tier


def _pick_jewelry_bg_tier(rng):
    """Pick a jewelry background rarity tier using weights."""
    tiers = list(JEWELRY_BG_WEIGHTS.keys())
    weights = list(JEWELRY_BG_WEIGHTS.values())
    tier = rng.choices(tiers, weights=weights, k=1)[0]
    return tier


# ─── Main Generator ─────────────────────────────────────────────

def generate_drone_prompts(count=700, seed=42):
    """Generate `count` unique Diamond Drone prompts with trait metadata.

    Returns:
        list of dicts, each containing:
            - prompt: str (the FAL prompt)
            - traits: list of {trait_type, value} dicts (OpenSea format)
            - rarity: str (Common/Uncommon/Rare/Legendary)
    """
    rng = random.Random(seed)
    results = []
    seen_combos = set()

    attempts = 0
    max_attempts = count * 10

    while len(results) < count and attempts < max_attempts:
        attempts += 1

        # Pick diamond cut
        cut = _weighted_choice(DIAMOND_CUTS, rng=rng)

        # Pick piece type
        piece = _weighted_choice(PIECE_TYPES, rng=rng)

        # Pick template
        template = rng.choice(piece['templates'])

        # Build combo key for uniqueness
        if piece['category'] == 'drone':
            # For aerial drones, pick two jewelry pieces and a location
            jewelry_pair = rng.sample(ALL_JEWELRY, 2)
            loc_tier = _pick_location_tier(rng)
            location = rng.choice(DRONE_LOCATIONS[loc_tier])

            combo_key = (cut['value'], piece['type'], tuple(sorted(jewelry_pair)), location)
            if combo_key in seen_combos:
                continue
            seen_combos.add(combo_key)

            prompt = template.format(
                cut_desc=cut['desc'],
                jewelry_a=jewelry_pair[0],
                jewelry_b=jewelry_pair[1],
                location=location,
            )

            traits = [
                {'trait_type': 'Diamond Cut', 'value': cut['value']},
                {'trait_type': 'Piece Type', 'value': piece['type']},
                {'trait_type': 'Jewelry A', 'value': jewelry_pair[0]},
                {'trait_type': 'Jewelry B', 'value': jewelry_pair[1]},
                {'trait_type': 'Location', 'value': location},
                {'trait_type': 'Location Tier', 'value': loc_tier},
            ]

        else:
            # For jewelry pieces, pick a background
            bg_tier = _pick_jewelry_bg_tier(rng)
            bg = rng.choice(JEWELRY_BACKGROUNDS[bg_tier])

            combo_key = (cut['value'], piece['type'], template[:50], bg)
            if combo_key in seen_combos:
                continue
            seen_combos.add(combo_key)

            prompt = template.format(
                cut_desc=cut['desc'],
                bg_jewelry=bg,
            )

            traits = [
                {'trait_type': 'Diamond Cut', 'value': cut['value']},
                {'trait_type': 'Piece Type', 'value': piece['type']},
                {'trait_type': 'Background', 'value': bg},
                {'trait_type': 'Background Tier', 'value': bg_tier},
            ]

        rarity = _get_rarity_tier(cut['value'], piece['type'])
        traits.append({'trait_type': 'Rarity', 'value': rarity})

        # Prepend LoRA trigger word so Ink Interventions style activates
        prompt = f"{LORA_TRIGGER} {prompt}"

        results.append({
            'prompt': prompt,
            'traits': traits,
            'rarity': rarity,
        })

    if len(results) < count:
        raise ValueError(
            f"Could only generate {len(results)} unique prompts out of {count} requested. "
            f"Increase trait variety or reduce count."
        )

    return results


# ─── FAL Configuration ───────────────────────────────────────────

FAL_DRONE_CONFIG = {
    'model_id': 'fal-ai/flux-lora',
    'loras': [{
        'path': 'https://storage.googleapis.com/fal-flux-lora/'
                '1fc806a7d5a146ff81cdadb7d06b713a_pytorch_lora_weights.safetensors',
        'scale': 1,
    }],
    'width': 512,
    'height': 512,
    'num_inference_steps': 22,
    'guidance_scale': 5,
}

# Trigger word for the Ink Interventions LoRA (FAL default when none set)
LORA_TRIGGER = "TOK"
