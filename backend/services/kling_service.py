"""
Kling AI Video Generation Service
Generates animated video loops from still images using Kling's image-to-video API.
"""
import os
import time
import uuid
import base64
import requests
import jwt
from flask import current_app


def _get_jwt_token():
    """Generate a short-lived JWT token from Kling AK/SK."""
    ak = current_app.config.get('KLING_ACCESS_KEY', '')
    sk = current_app.config.get('KLING_SECRET_KEY', '')
    if not ak or not sk:
        raise ValueError("KLING_ACCESS_KEY and KLING_SECRET_KEY must be set in .env")

    headers = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "iss": ak,
        "exp": int(time.time()) + 1800,  # 30 min expiry
        "nbf": int(time.time()) - 5,
    }
    return jwt.encode(payload, sk, algorithm="HS256", headers=headers)


def _headers():
    """Auth headers for Kling API requests."""
    return {
        "Authorization": f"Bearer {_get_jwt_token()}",
        "Content-Type": "application/json",
    }


BASE_URL = "https://api.klingai.com"


def submit_image_to_video(image_path_or_url, prompt, duration="5", mode="std",
                          model="kling-v3", negative_prompt=""):
    """Submit an image-to-video generation task to Kling.

    Args:
        image_path_or_url: Local file path or URL to source image
        prompt: Motion/animation prompt
        duration: "5" or "10" seconds
        mode: "std" (standard) or "pro" (higher quality)
        model: Kling model version
        negative_prompt: What to avoid

    Returns:
        dict with 'task_id' and 'task_status'
    """
    # If it's a local file, convert to base64
    if os.path.exists(image_path_or_url):
        with open(image_path_or_url, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
    elif image_path_or_url.startswith(('http://', 'https://')):
        image_data = image_path_or_url
    else:
        # Assume it's a relative path in uploads
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_path_or_url)
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"Image not found: {image_path_or_url}")
        with open(full_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')

    payload = {
        "model_name": model,
        "image": image_data,
        "prompt": prompt,
        "duration": str(duration),
        "mode": mode,
    }
    if negative_prompt:
        payload["negative_prompt"] = negative_prompt

    resp = requests.post(
        f"{BASE_URL}/v1/videos/image2video",
        headers=_headers(),
        json=payload,
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()

    # Kling wraps response in a 'data' key
    task_data = data.get('data', data)
    return {
        'task_id': task_data.get('task_id'),
        'task_status': task_data.get('task_status', 'submitted'),
    }


def poll_task(task_id, timeout=600, interval=5):
    """Poll a Kling task until it completes or fails.

    Args:
        task_id: The task ID from submit
        timeout: Max seconds to wait (default 10 min)
        interval: Seconds between polls

    Returns:
        dict with 'task_status', 'video_url' (if succeeded)
    """
    start = time.time()
    while time.time() - start < timeout:
        resp = requests.get(
            f"{BASE_URL}/v1/videos/image2video/{task_id}",
            headers=_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        task_data = data.get('data', data)
        status = task_data.get('task_status', '')

        if status == 'succeed':
            videos = task_data.get('task_result', {}).get('videos', [])
            video_url = videos[0]['url'] if videos else None
            return {
                'task_status': 'succeed',
                'video_url': video_url,
            }
        elif status == 'failed':
            error = task_data.get('task_status_msg', 'Unknown error')
            return {
                'task_status': 'failed',
                'error': error,
            }

        time.sleep(interval)

    return {
        'task_status': 'timeout',
        'error': f'Task did not complete within {timeout} seconds',
    }


def download_video(video_url, collection_id, token_id):
    """Download a video from Kling CDN and save locally.

    Returns:
        relative path for storage in DB (e.g., 'videos/2/42.mp4')
    """
    save_dir = os.path.join(
        current_app.config['UPLOAD_FOLDER'], 'videos', str(collection_id)
    )
    os.makedirs(save_dir, exist_ok=True)

    filename = f"{token_id}.mp4"
    filepath = os.path.join(save_dir, filename)

    resp = requests.get(video_url, timeout=120, stream=True)
    resp.raise_for_status()

    with open(filepath, 'wb') as f:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)

    return os.path.join('videos', str(collection_id), filename)


def generate_video_for_nft(nft, prompt, duration="5", mode="std", model="kling-v3"):
    """Full pipeline: submit image-to-video, poll, download, update NFT record.

    Args:
        nft: NFT model instance (must have image_path)
        prompt: Motion prompt for the animation
        duration: "5" or "10"
        mode: "std" or "pro"
        model: Kling model version

    Returns:
        dict with 'video_path', 'video_url', 'task_id'
    """
    if not nft.image_path:
        raise ValueError(f"NFT #{nft.token_id} has no image to animate")

    # Submit
    result = submit_image_to_video(
        nft.image_path, prompt, duration=duration, mode=mode, model=model
    )
    task_id = result['task_id']

    # Poll until done
    poll_result = poll_task(task_id, timeout=600)

    if poll_result['task_status'] != 'succeed':
        raise Exception(
            f"Kling generation failed for NFT #{nft.token_id}: "
            f"{poll_result.get('error', 'Unknown')}"
        )

    # Download
    video_path = download_video(
        poll_result['video_url'], nft.collection_id, nft.token_id
    )

    return {
        'video_path': video_path,
        'video_url': f"/uploads/{video_path}",
        'task_id': task_id,
    }
