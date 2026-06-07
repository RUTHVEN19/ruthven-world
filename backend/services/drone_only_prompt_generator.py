"""
Drone-only prompt generator for the GENESIS Diamond Drone collection.

Builds 1000 unique drone-only prompts (no people, no hands, no figures,
no landscapes) with varied drone forms, diamond cuts, carat weights,
and luxurious textile backgrounds.

Designed specifically for clean 2D-to-3D conversion via TRELLIS:
every prompt produces an isolated diamond drone subject suitable
for downstream image-to-3D mesh generation.

This generator is INDEPENDENT of drone_prompt_generator.py
(which mixes drones + jewelry on people). Use this one for the
genesis collection and the 3D pipeline.
"""

import random


# ─── Drone Forms (the primary aesthetic axis) ─────────────────────

DRONE_FORMS = [
    {'value': 'Crystalline', 'weight': 30,
     'desc': 'dazzling pure-diamond crystalline drone, entire body carved from one colossal flawless brilliant-cut diamond, '
             'transparent gemstone with prismatic light refraction and rainbow fire, '
             'every facet catching and reflecting light like a chandelier crystal, '
             'blinding sparkle, glass-clear transparency, no opaque surfaces, no stone texture, '
             'pure diamond gemstone material polished to mirror finish'},

    {'value': 'Skeletal Diamond', 'weight': 15,
     'desc': 'mechanical skeletal drone with openwork wireframe diamond armature, '
             'transparent geometric lattice structure, machined drone chassis built from diamond struts, '
             'no animal anatomy, no organic limbs, no feet, no claws, no biological features'},

    {'value': 'Diamond-Encrusted', 'weight': 35,
     'desc': 'fully diamond-encrusted mechanical drone, no metal visible, '
             'pavé diamonds covering every surface, dense iced-out construction'},

    {'value': 'Hybrid', 'weight': 15,
     'desc': 'hybrid drone with translucent crystal body and structural metallic accents, '
             'diamond clusters at key joints, semi-transparent fuselage'},

    {'value': 'Pure Diamond Solitaire', 'weight': 5,
     'desc': 'single colossal solitaire diamond carved into drone silhouette, '
             'monolithic gem sculpture, one continuous stone'},
]


# ─── Drone Chassis Types ──────────────────────────────────────────

DRONE_TYPES = [
    {'value': 'Quadcopter', 'weight': 30,
     'desc': 'four-rotor quadcopter'},

    {'value': 'Hexacopter', 'weight': 15,
     'desc': 'six-rotor hexacopter'},

    {'value': 'Octocopter', 'weight': 10,
     'desc': 'eight-rotor octocopter'},

    {'value': 'Avian', 'weight': 25,
     'desc': 'avian bird-form with crystalline wings'},

    {'value': 'Insectoid', 'weight': 12,
     'desc': 'insectoid dragonfly-wing form'},

    {'value': 'Singular', 'weight': 8,
     'desc': 'singular orb-form with no external rotors'},
]


# ─── Diamond Cuts (expanded library) ──────────────────────────────

DIAMOND_CUTS = [
    {'value': 'Round Brilliant', 'weight': 18,
     'desc': 'round brilliant-cut faceting refracting starburst light'},

    {'value': 'Princess', 'weight': 14,
     'desc': 'princess-cut square step facets and clean angular geometry'},

    {'value': 'Marquise', 'weight': 10,
     'desc': 'elongated marquise-cut tapering to sharp points'},

    {'value': 'Pear', 'weight': 8,
     'desc': 'pear-cut teardrop facets'},

    {'value': 'Emerald', 'weight': 8,
     'desc': 'emerald-cut step facets in rectangular formation'},

    {'value': 'Asscher', 'weight': 6,
     'desc': 'asscher-cut octagonal step facets with art deco geometry'},

    {'value': 'Cushion', 'weight': 8,
     'desc': 'cushion-cut soft-square facets with rounded corners'},

    {'value': 'Heart', 'weight': 4,
     'desc': 'heart-cut romantic faceting'},

    {'value': 'Oval', 'weight': 7,
     'desc': 'oval-cut elongated brilliant facets'},

    {'value': 'Radiant', 'weight': 6,
     'desc': 'radiant-cut hybrid step-brilliant facets'},

    {'value': 'Rose', 'weight': 6,
     'desc': 'flat-backed rose-cut dome facets'},

    {'value': 'Baguette', 'weight': 5,
     'desc': 'rectangular baguette-cut step facets in linear formation'},
]


# ─── Carat Weight Tiers (rarity proxy) ────────────────────────────

CARAT_WEIGHTS = [
    {'value': 'Standard', 'weight': 45,
     'desc': 'modest 1-10 carat stones in delicate arrangement',
     'tier': 'Common'},

    {'value': 'Heavy', 'weight': 30,
     'desc': 'substantial 10-50 carat stones in bold arrangement',
     'tier': 'Uncommon'},

    {'value': 'Massive', 'weight': 18,
     'desc': 'statement 50-200 carat stones with exceptional presence',
     'tier': 'Rare'},

    {'value': 'Legendary', 'weight': 6,
     'desc': 'museum-grade 200-500 carat stones, world-class jewels',
     'tier': 'Legendary'},

    {'value': 'Hope Tier', 'weight': 1,
     'desc': 'impossible 500-plus carat solitaires, one-of-one auction-house grade',
     'tier': 'Hope'},
]


# ─── Backgrounds (textile only, no landscapes) ────────────────────

BACKGROUNDS = [
    {'value': 'Black Silk', 'weight': 16,
     'desc': 'draped black silk fabric with soft shadow folds'},

    {'value': 'White Silk', 'weight': 12,
     'desc': 'draped white silk fabric with soft luminous folds'},

    {'value': 'Black Velvet', 'weight': 18,
     'desc': 'deep black velvet, light-absorbing matte texture'},

    {'value': 'White Velvet', 'weight': 10,
     'desc': 'luxurious white velvet with plush nap'},

    {'value': 'Black Tulle', 'weight': 12,
     'desc': 'layered black tulle netting, ethereal mesh'},

    {'value': 'White Tulle', 'weight': 10,
     'desc': 'layered white tulle netting, gauzy ethereal veil'},

    {'value': 'Pure Black Void', 'weight': 14,
     'desc': 'pure black infinity void with no visible surface'},

    {'value': 'Pure White Seamless', 'weight': 8,
     'desc': 'pure white seamless infinity with no shadow'},
]


# ─── Lighting Setups ──────────────────────────────────────────────

LIGHTING = [
    {'value': 'Spotlight', 'weight': 20,
     'desc': 'single dramatic spotlight from above'},

    {'value': 'Studio Softbox', 'weight': 18,
     'desc': 'even studio softbox lighting from multiple angles'},

    {'value': 'Chiaroscuro', 'weight': 16,
     'desc': 'deep chiaroscuro with strong shadow contrast'},

    {'value': 'Soft Diffused', 'weight': 14,
     'desc': 'soft diffused window light'},

    {'value': 'Noir', 'weight': 14,
     'desc': 'high-contrast noir lighting with deep shadows'},

    {'value': 'Rim Light', 'weight': 10,
     'desc': 'rim lighting tracing the silhouette'},

    {'value': 'Halo Backlight', 'weight': 8,
     'desc': 'halo backlight creating a glowing edge'},
]


# ─── Compositions ─────────────────────────────────────────────────

COMPOSITIONS = [
    {'value': 'Hovering', 'weight': 40,
     'desc': 'hovering in mid-air with no surface contact'},

    {'value': '3/4 Hero', 'weight': 25,
     'desc': 'three-quarter angle hero shot'},

    {'value': 'Top-Down Aerial', 'weight': 15,
     'desc': 'directly top-down aerial view'},

    {'value': 'Profile', 'weight': 15,
     'desc': 'side profile silhouette view'},

    {'value': 'Close-Up Macro', 'weight': 5,
     'desc': 'close-up macro detail of diamond facets'},
]


# ─── Templates (every template is drone-only by design) ───────────
#
# All templates explicitly state:
#   - black and white aesthetic
#   - isolated subject
#   - no people / no figures / no hands
#   - no landscape / no scenery / no environment
#   - square format
#
# The negative phrasing helps Flux respect the constraints.

TEMPLATES = [
    "{form_desc}, configured as {type_desc}, encrusted with {carat_desc} of {cut_desc} diamonds, "
    "{comp_desc}, photographed against {bg_desc}, {light_desc}, "
    "black and white ink illustration, isolated subject, no people, no hands, no figures, "
    "no landscape, no environment, drone only, square format",

    "Luxury diamond drone object, {form_desc}, "
    "{type_desc} silhouette, {cut_desc} stones throughout, {carat_desc}, "
    "{comp_desc}, {bg_desc} backdrop, {light_desc}, "
    "fine-art black and white photography, drone only, no humans, no figures, "
    "no scenery, no environment, single subject study, square format",

    "{form_desc} drone, {type_desc}, "
    "{carat_desc} of {cut_desc} diamonds catching light, "
    "{comp_desc} against {bg_desc}, {light_desc}, "
    "monochrome ink illustration, pure object study, "
    "no people present, no hands, no figures, no environment, square format",

    "Diamond drone sculpture, {form_desc}, {type_desc} configuration, "
    "{cut_desc} faceting, {carat_desc}, "
    "{comp_desc} composition, {bg_desc} backdrop, {light_desc}, "
    "black and white editorial jewellery photography, isolated, "
    "no figures, no hands, no landscape, no environment, square format",

    "{form_desc}, drone built as {type_desc}, "
    "{cut_desc} {carat_desc} catching {light_desc}, "
    "{comp_desc} against {bg_desc}, "
    "black and white art photography, museum-quality object, sole subject, "
    "no people, no hands, no scenery, no environment, square format",

    "Aerial diamond drone, {form_desc} with {type_desc} silhouette, "
    "{carat_desc} {cut_desc} surface, {comp_desc} pose, "
    "{bg_desc} background, {light_desc}, "
    "black and white luxury product photography, isolated diamond object, "
    "no humans visible, no hands, no figures, no environment, square format",

    "{form_desc} drone in flight, {type_desc} form, "
    "covered in {cut_desc} {carat_desc}, "
    "{comp_desc}, {bg_desc} behind, {light_desc}, "
    "high-jewellery editorial in black and white, single subject, "
    "no people, no hands, no figures, no landscape, square format",

    "Floating diamond drone, {form_desc}, {type_desc} chassis, "
    "{carat_desc} of {cut_desc} stones, {comp_desc}, "
    "{bg_desc}, {light_desc}, "
    "monochrome luxury still life, drone only, no humans, no hands, "
    "no figures, no scenery, square format",
]


# ─── Rarity Logic ─────────────────────────────────────────────────

def _compute_rarity(carat_value, form_value, cut_value):
    """Compute overall rarity from carat tier and modifiers."""
    carat_tier = next(c['tier'] for c in CARAT_WEIGHTS if c['value'] == carat_value)

    # Hope Tier carats are always Hope rarity
    if carat_tier == 'Hope':
        return 'Hope'

    # Pure Diamond Solitaire form is always at least Legendary
    if form_value == 'Pure Diamond Solitaire':
        return 'Legendary' if carat_tier in ('Common', 'Uncommon', 'Rare') else carat_tier

    # Heart cut is rare so bumps Common -> Uncommon, Uncommon -> Rare
    if cut_value == 'Heart':
        bump = {'Common': 'Uncommon', 'Uncommon': 'Rare', 'Rare': 'Legendary'}
        return bump.get(carat_tier, carat_tier)

    return carat_tier


# ─── Weighted Random Selection ────────────────────────────────────

def _weighted_choice(items, rng):
    weights = [item['weight'] for item in items]
    return rng.choices(items, weights=weights, k=1)[0]


# ─── Main Generator ───────────────────────────────────────────────

def generate_drone_prompts(count=1000, seed=42):
    """Generate `count` unique genesis Diamond Drone prompts.

    Returns:
        list of dicts, each containing:
            - prompt: str (FAL prompt with LoRA trigger)
            - traits: list of {trait_type, value} dicts (OpenSea format)
            - rarity: str (Common/Uncommon/Rare/Legendary/Hope)
    """
    rng = random.Random(seed)
    results = []
    seen_combos = set()

    attempts = 0
    max_attempts = count * 20

    while len(results) < count and attempts < max_attempts:
        attempts += 1

        form = _weighted_choice(DRONE_FORMS, rng)
        chassis = _weighted_choice(DRONE_TYPES, rng)
        cut = _weighted_choice(DIAMOND_CUTS, rng)
        carat = _weighted_choice(CARAT_WEIGHTS, rng)
        bg = _weighted_choice(BACKGROUNDS, rng)
        light = _weighted_choice(LIGHTING, rng)
        comp = _weighted_choice(COMPOSITIONS, rng)
        template = rng.choice(TEMPLATES)

        # Uniqueness key — ignore template choice so same combo
        # never repeats even with different template wording
        combo_key = (
            form['value'], chassis['value'], cut['value'],
            carat['value'], bg['value'], light['value'], comp['value'],
        )
        if combo_key in seen_combos:
            continue
        seen_combos.add(combo_key)

        prompt_body = template.format(
            form_desc=form['desc'],
            type_desc=chassis['desc'],
            cut_desc=cut['desc'],
            carat_desc=carat['desc'],
            bg_desc=bg['desc'],
            light_desc=light['desc'],
            comp_desc=comp['desc'],
        )

        prompt = f"{LORA_TRIGGER} {ANTI_HUMAN_PREFIX}. {prompt_body}"

        rarity = _compute_rarity(carat['value'], form['value'], cut['value'])

        traits = [
            {'trait_type': 'Drone Form', 'value': form['value']},
            {'trait_type': 'Chassis Type', 'value': chassis['value']},
            {'trait_type': 'Diamond Cut', 'value': cut['value']},
            {'trait_type': 'Carat Weight', 'value': carat['value']},
            {'trait_type': 'Background', 'value': bg['value']},
            {'trait_type': 'Lighting', 'value': light['value']},
            {'trait_type': 'Composition', 'value': comp['value']},
            {'trait_type': 'Rarity', 'value': rarity},
        ]

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


# ─── FAL Configuration (mirrors drone_prompt_generator.py) ────────

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

# Trigger word for the Ink Interventions LoRA
LORA_TRIGGER = "TOK"


# Bling-forward opening clause — leads with maximum diamond/crystal glamour
# AND blocks humans. Designed to maintain the LoRA's diamond aesthetic
# while shifting it from "model wearing jewelry" to "jewel object alone".
ANTI_HUMAN_PREFIX = (
    "Dazzling diamond drone covered in sparkling brilliant-cut diamonds, "
    "every surface set with prismatic gemstones catching light like a "
    "Tiffany window display, blinding crystal sparkle and rainbow refraction, "
    "lavish jewel-encrusted unmanned drone alone in a deserted empty studio, "
    "no humans whatsoever, no models, no people, no figures, "
    "pure high-jewellery still life photography of a diamond drone object"
)


# Strong negative prompt — blocks people, body parts, animal anatomy,
# AND opaque/dull/stone textures that kill the diamond bling.
NEGATIVE_PROMPT = (
    "person, woman, man, model, human, body, skin, face, neck, chest, "
    "shoulder, arm, hand, fingers, hair, lips, eyes, "
    "feet, legs, paws, claws, beak, fur, scales, tail, animal anatomy, "
    "creature, organism, organic limbs, biological features, "
    "stone, rock, coral, mineral, matte, dull, opaque, "
    "concrete, plaster, ceramic, porous texture, sandblasted finish"
)


# ─── CLI preview helper ───────────────────────────────────────────

if __name__ == '__main__':
    import json
    import sys

    n = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    samples = generate_drone_prompts(count=n, seed=42)
    for i, s in enumerate(samples, 1):
        print(f"\n─── Sample {i} ({s['rarity']}) ───")
        print(s['prompt'])
        print("Traits:", json.dumps(s['traits'], indent=2))
