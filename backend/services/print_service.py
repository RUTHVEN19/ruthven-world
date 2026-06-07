"""
print_service.py — Utility functions for the open edition print shop.

Token ownership verification has been removed — prints are now open edition,
no wallet or NFT ownership required.
"""


def get_print_display_name(print_id):
    """Get a display-friendly name from a print ID like 'db-07'."""
    num = print_id.split('-')[1] if '-' in print_id else print_id
    return f'Drone Blonde #{int(num)}'
