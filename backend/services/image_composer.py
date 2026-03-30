import random
from PIL import Image

# Allow very large images (up to 300MP) without Pillow warning
Image.MAX_IMAGE_PIXELS = 300_000_000


def compose_layers(layer_paths, output_path, size=None):
    """Compose multiple PNG layers into a single image using alpha compositing.

    Args:
        layer_paths: List of file paths to layer images, in order from bottom to top.
        output_path: Where to save the composed image.
        size: Optional (width, height) tuple. If None, uses size of the first layer.
    """
    if not layer_paths:
        raise ValueError("At least one layer is required")

    # Load first layer to get dimensions
    base = Image.open(layer_paths[0]).convert('RGBA')
    if size:
        base = base.resize(size, Image.LANCZOS)

    target_size = base.size

    # Composite each subsequent layer
    for path in layer_paths[1:]:
        layer = Image.open(path).convert('RGBA')
        if layer.size != target_size:
            layer = layer.resize(target_size, Image.LANCZOS)
        base = Image.alpha_composite(base, layer)

    base.save(output_path, 'PNG')
    return output_path


def generate_unique_combinations(category_data, count):
    """Generate unique trait combinations using weighted random selection.

    Args:
        category_data: List of dicts with 'category' and 'values' keys.
            Each 'values' is a list of TraitValue objects with rarity_weight.
        count: Number of unique combinations to generate.

    Returns:
        List of lists, each containing one TraitValue per category.
    """
    # Calculate maximum possible unique combinations
    max_combos = 1
    for cd in category_data:
        max_combos *= len(cd['values'])

    if count > max_combos:
        raise ValueError(
            f"Requested {count} unique NFTs but only {max_combos} "
            f"unique combinations are possible with current traits"
        )

    seen = set()
    combinations = []

    max_attempts = count * 10  # Avoid infinite loop
    attempts = 0

    while len(combinations) < count and attempts < max_attempts:
        combo = []
        combo_key = []

        for cd in category_data:
            values = cd['values']
            weights = [v.rarity_weight for v in values]
            selected = random.choices(values, weights=weights, k=1)[0]
            combo.append(selected)
            combo_key.append(selected.id)

        key = tuple(combo_key)
        if key not in seen:
            seen.add(key)
            combinations.append(combo)

        attempts += 1

    if len(combinations) < count:
        raise ValueError(
            f"Could only generate {len(combinations)} unique combinations "
            f"out of {count} requested after {max_attempts} attempts"
        )

    return combinations
