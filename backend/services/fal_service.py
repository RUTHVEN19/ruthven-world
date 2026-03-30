import os
import time
import uuid
import requests
from flask import current_app


def generate_image(model_id, prompt, negative_prompt='', width=1024, height=1024,
                   loras=None, guidance_scale=3.5, num_inference_steps=28,
                   num_images=1, seed=None):
    """Generate images using FAL AI API.

    Args:
        model_id: FAL model identifier (e.g., 'fal-ai/flux-lora')
        prompt: Text prompt for generation
        negative_prompt: Negative prompt
        width: Image width
        height: Image height
        loras: List of LoRA configs, e.g. [{"path": "url", "scale": 1.0}]
        guidance_scale: Guidance scale for generation
        num_inference_steps: Number of inference steps
        num_images: Number of images to generate (1-4)

    Returns:
        dict with 'images' list of {image_path, image_url}
    """
    api_key = current_app.config['FAL_KEY']
    if not api_key:
        raise ValueError("FAL_KEY not configured. Add it to your .env file.")

    headers = {
        'Authorization': f'Key {api_key}',
        'Content-Type': 'application/json',
    }

    payload = {
        'prompt': prompt,
        'image_size': {
            'width': width,
            'height': height,
        },
        'guidance_scale': guidance_scale,
        'num_inference_steps': num_inference_steps,
        'num_images': min(num_images, 4),
    }
    if negative_prompt:
        payload['negative_prompt'] = negative_prompt
    if seed is not None and seed != -1:
        payload['seed'] = seed
    if loras:
        payload['loras'] = loras

    # Submit to queue
    submit_url = f'https://queue.fal.run/{model_id}'
    response = requests.post(submit_url, json=payload, headers=headers, timeout=30)
    response.raise_for_status()
    result = response.json()

    # Get all image URLs from result
    image_urls = []
    if 'images' in result:
        image_urls = [img['url'] for img in result['images']]
    elif 'request_id' in result:
        # Poll for result
        request_id = result['request_id']
        status_url = f'https://queue.fal.run/{model_id}/requests/{request_id}/status'
        result_url = f'https://queue.fal.run/{model_id}/requests/{request_id}'

        timeout = 180
        start = time.time()
        while time.time() - start < timeout:
            status_resp = requests.get(status_url, headers=headers, timeout=10)
            status_data = status_resp.json()

            if status_data.get('status') == 'COMPLETED':
                result_resp = requests.get(result_url, headers=headers, timeout=10)
                result_data = result_resp.json()
                image_urls = [img['url'] for img in result_data['images']]
                break
            elif status_data.get('status') == 'FAILED':
                raise Exception(f"FAL generation failed: {status_data.get('error', 'Unknown error')}")

            time.sleep(2)
        else:
            raise Exception("FAL generation timed out after 180 seconds")
    else:
        raise Exception(f"Unexpected FAL response: {result}")

    # Download all images
    save_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'sources')
    os.makedirs(save_dir, exist_ok=True)

    saved_images = []
    for image_url in image_urls:
        img_response = requests.get(image_url, timeout=30)
        img_response.raise_for_status()

        filename = f"fal_{uuid.uuid4().hex}.png"
        filepath = os.path.join(save_dir, filename)

        with open(filepath, 'wb') as f:
            f.write(img_response.content)

        rel_path = os.path.join('sources', filename)
        saved_images.append({
            'image_path': rel_path,
            'image_url': f"/uploads/{rel_path}",
        })

    return {
        'images': saved_images,
        # Backwards compatibility
        'image_path': saved_images[0]['image_path'] if saved_images else None,
    }
