"""
Instagram Graph API Service for DIAMOND DRONES

Handles automated publishing to Instagram via Meta's Graph API.
Supports: single images, carousels, reels (video), and stories.

Requirements:
- Instagram Business or Creator account
- Facebook Page linked to the IG account
- Meta Developer App with instagram_content_publish permission
- Long-lived access token stored in .env as INSTAGRAM_ACCESS_TOKEN
- Instagram Business Account ID stored in .env as INSTAGRAM_ACCOUNT_ID

Setup guide:
1. Go to developers.facebook.com and create an app
2. Add Instagram Graph API product
3. Generate a User Token with pages_show_list, instagram_basic, instagram_content_publish
4. Exchange for a long-lived token (60 days)
5. Get your IG Business Account ID via: GET /me/accounts -> page_id -> GET /{page_id}?fields=instagram_business_account
"""

import os
import time
import json
import requests
from datetime import datetime

GRAPH_API_BASE = 'https://graph.facebook.com/v21.0'


class InstagramAPIService:
    def __init__(self, access_token=None, account_id=None):
        self.access_token = access_token or os.getenv('INSTAGRAM_ACCESS_TOKEN', '')
        self.account_id = account_id or os.getenv('INSTAGRAM_ACCOUNT_ID', '')
        self.base_url = f'{GRAPH_API_BASE}/{self.account_id}'

    def _check_credentials(self):
        if not self.access_token:
            raise ValueError('INSTAGRAM_ACCESS_TOKEN not set. Add it to your .env file.')
        if not self.account_id:
            raise ValueError('INSTAGRAM_ACCOUNT_ID not set. Add it to your .env file.')

    def _make_request(self, method, url, **kwargs):
        """Make an API request with error handling."""
        response = requests.request(method, url, **kwargs)
        data = response.json()
        if 'error' in data:
            raise RuntimeError(f'Instagram API error: {data["error"].get("message", str(data["error"]))}')
        return data

    # --- PUBLISHING ---

    def publish_image(self, image_url, caption=''):
        """
        Publish a single image post.
        image_url must be a publicly accessible URL (not a local file path).
        """
        self._check_credentials()

        # Step 1: Create media container
        container = self._make_request('POST', f'{self.base_url}/media', params={
            'image_url': image_url,
            'caption': caption,
            'access_token': self.access_token,
        })
        container_id = container['id']

        # Step 2: Publish
        result = self._make_request('POST', f'{self.base_url}/media_publish', params={
            'creation_id': container_id,
            'access_token': self.access_token,
        })

        return {
            'success': True,
            'media_id': result['id'],
            'container_id': container_id,
            'timestamp': datetime.now().isoformat(),
        }

    def publish_carousel(self, image_urls, caption=''):
        """
        Publish a carousel post (2-10 images).
        All image_urls must be publicly accessible.
        """
        self._check_credentials()

        if len(image_urls) < 2 or len(image_urls) > 10:
            raise ValueError('Carousel requires 2-10 images')

        # Step 1: Create individual media containers for each image
        children_ids = []
        for url in image_urls:
            child = self._make_request('POST', f'{self.base_url}/media', params={
                'image_url': url,
                'is_carousel_item': 'true',
                'access_token': self.access_token,
            })
            children_ids.append(child['id'])

        # Step 2: Create carousel container
        container = self._make_request('POST', f'{self.base_url}/media', params={
            'media_type': 'CAROUSEL',
            'children': ','.join(children_ids),
            'caption': caption,
            'access_token': self.access_token,
        })
        container_id = container['id']

        # Step 3: Publish
        result = self._make_request('POST', f'{self.base_url}/media_publish', params={
            'creation_id': container_id,
            'access_token': self.access_token,
        })

        return {
            'success': True,
            'media_id': result['id'],
            'container_id': container_id,
            'children': children_ids,
            'timestamp': datetime.now().isoformat(),
        }

    def publish_reel(self, video_url, caption='', cover_url=None, thumb_offset=None):
        """
        Publish a Reel (video post).
        video_url must be a publicly accessible URL.
        Video requirements: MP4, H.264, AAC audio, 9:16 aspect, 3-90 seconds.
        """
        self._check_credentials()

        params = {
            'media_type': 'REELS',
            'video_url': video_url,
            'caption': caption,
            'access_token': self.access_token,
        }
        if cover_url:
            params['cover_url'] = cover_url
        if thumb_offset is not None:
            params['thumb_offset'] = str(thumb_offset)

        # Step 1: Create media container
        container = self._make_request('POST', f'{self.base_url}/media', params=params)
        container_id = container['id']

        # Step 2: Wait for video processing
        self._wait_for_processing(container_id)

        # Step 3: Publish
        result = self._make_request('POST', f'{self.base_url}/media_publish', params={
            'creation_id': container_id,
            'access_token': self.access_token,
        })

        return {
            'success': True,
            'media_id': result['id'],
            'container_id': container_id,
            'timestamp': datetime.now().isoformat(),
        }

    def publish_story_image(self, image_url):
        """Publish a story (image). Stories don't support captions via API."""
        self._check_credentials()

        container = self._make_request('POST', f'{self.base_url}/media', params={
            'image_url': image_url,
            'media_type': 'STORIES',
            'access_token': self.access_token,
        })
        container_id = container['id']

        result = self._make_request('POST', f'{self.base_url}/media_publish', params={
            'creation_id': container_id,
            'access_token': self.access_token,
        })

        return {
            'success': True,
            'media_id': result['id'],
            'timestamp': datetime.now().isoformat(),
        }

    def publish_story_video(self, video_url):
        """Publish a video story."""
        self._check_credentials()

        container = self._make_request('POST', f'{self.base_url}/media', params={
            'video_url': video_url,
            'media_type': 'STORIES',
            'access_token': self.access_token,
        })
        container_id = container['id']

        self._wait_for_processing(container_id)

        result = self._make_request('POST', f'{self.base_url}/media_publish', params={
            'creation_id': container_id,
            'access_token': self.access_token,
        })

        return {
            'success': True,
            'media_id': result['id'],
            'timestamp': datetime.now().isoformat(),
        }

    # --- SCHEDULING ---

    def schedule_image(self, image_url, caption='', publish_time=None):
        """
        Schedule a single image post for future publication.
        publish_time: Unix timestamp (must be 10 min to 75 days in the future).
        """
        self._check_credentials()

        if not publish_time:
            raise ValueError('publish_time is required for scheduling')

        container = self._make_request('POST', f'{self.base_url}/media', params={
            'image_url': image_url,
            'caption': caption,
            'published': 'false',
            'access_token': self.access_token,
        })
        container_id = container['id']

        # Note: As of Graph API v21, direct scheduling via the API requires
        # publishing the container at the desired time. For true scheduling,
        # we store the container_id and publish_time, and the scheduler handles it.
        return {
            'scheduled': True,
            'container_id': container_id,
            'publish_time': publish_time,
            'caption': caption,
        }

    # --- INSIGHTS ---

    def get_account_insights(self, period='day', metrics=None):
        """Get account-level insights."""
        self._check_credentials()

        if metrics is None:
            metrics = ['impressions', 'reach', 'follower_count', 'profile_views']

        result = self._make_request('GET', f'{self.base_url}/insights', params={
            'metric': ','.join(metrics),
            'period': period,
            'access_token': self.access_token,
        })

        return result.get('data', [])

    def get_media_insights(self, media_id, metrics=None):
        """Get insights for a specific post."""
        self._check_credentials()

        if metrics is None:
            metrics = ['impressions', 'reach', 'engagement', 'saved', 'likes', 'comments', 'shares']

        result = self._make_request('GET', f'{GRAPH_API_BASE}/{media_id}/insights', params={
            'metric': ','.join(metrics),
            'access_token': self.access_token,
        })

        return result.get('data', [])

    def get_account_info(self):
        """Get basic account information."""
        self._check_credentials()

        result = self._make_request('GET', self.base_url, params={
            'fields': 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url',
            'access_token': self.access_token,
        })

        return result

    # --- HELPERS ---

    def _wait_for_processing(self, container_id, max_wait=60, interval=3):
        """Wait for video/reel to finish processing before publishing."""
        for _ in range(max_wait // interval):
            status = self._make_request('GET', f'{GRAPH_API_BASE}/{container_id}', params={
                'fields': 'status_code',
                'access_token': self.access_token,
            })
            code = status.get('status_code', '')
            if code == 'FINISHED':
                return True
            if code == 'ERROR':
                raise RuntimeError(f'Video processing failed for container {container_id}')
            time.sleep(interval)

        raise TimeoutError(f'Video processing timed out after {max_wait}s for container {container_id}')

    def verify_token(self):
        """Verify the access token is valid and check its expiry."""
        if not self.access_token:
            return {'valid': False, 'error': 'No token set'}

        try:
            result = self._make_request('GET', f'{GRAPH_API_BASE}/debug_token', params={
                'input_token': self.access_token,
                'access_token': self.access_token,
            })
            data = result.get('data', {})
            return {
                'valid': data.get('is_valid', False),
                'expires_at': data.get('expires_at'),
                'scopes': data.get('scopes', []),
                'app_id': data.get('app_id'),
            }
        except Exception as e:
            return {'valid': False, 'error': str(e)}

    def refresh_long_lived_token(self):
        """
        Exchange current token for a new long-lived token.
        Long-lived tokens last 60 days.
        """
        if not self.access_token:
            raise ValueError('No token to refresh')

        result = self._make_request('GET', f'{GRAPH_API_BASE}/oauth/access_token', params={
            'grant_type': 'fb_exchange_token',
            'client_id': os.getenv('META_APP_ID', ''),
            'client_secret': os.getenv('META_APP_SECRET', ''),
            'fb_exchange_token': self.access_token,
        })

        new_token = result.get('access_token')
        if new_token:
            self.access_token = new_token
            return {
                'success': True,
                'new_token': new_token,
                'expires_in': result.get('expires_in'),
            }

        raise RuntimeError('Failed to refresh token')
