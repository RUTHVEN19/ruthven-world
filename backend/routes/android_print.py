"""
android_print.py — Porcelain Android print shop routes via Stripe Checkout.
Supports single prints (A3/A2) and Machine Twin bundles (Porcelain + Manga).
"""
import os
import stripe
from flask import Blueprint, request, jsonify
from models import db
from models.print_order import PrintOrder

android_print_bp = Blueprint('android_print', __name__)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://porcelainandroid.com')

# Prices in pence
PRICES = {
    'a3_single': 30000,    # £300
    'a2_single': 60000,    # £600
    'a3_twin':   50000,    # £500
    'a2_twin':  100000,    # £1,000
}

PRODUCT_DESCRIPTIONS = {
    'a3_single': 'Museum-quality giclée on Hahnemühle Photo Rag 308gsm. A3 format, open edition. Signed by Miss AL Simpson.',
    'a2_single': 'Museum-quality giclée on Hahnemühle Photo Rag 308gsm. A2 format, edition of 50. Signed by Miss AL Simpson. Archival Collectors Edition.',
    'a3_twin':   'Manga Machine Twin Set — Porcelain + Manga prints. A3 format, open edition. Giclée on Hahnemühle Photo Rag 308gsm. Signed by Miss AL Simpson.',
    'a2_twin':   'Manga Machine Twin Set — Porcelain + Manga prints. A2 format, edition of 50. Giclée on Hahnemühle Photo Rag 308gsm. Signed by Miss AL Simpson. Archival Collectors Edition.',
}

VALID_TIERS = set(PRICES.keys())


@android_print_bp.route('/android-print/checkout', methods=['POST'])
def create_android_checkout():
    """Create a Stripe Checkout Session for a Porcelain Android print."""
    data = request.get_json()
    email = (data.get('email') or '').strip()
    print_id = (data.get('print_id') or '').strip()
    print_title = (data.get('print_title') or '').strip()
    tier = (data.get('tier') or '').strip()

    if not email or '@' not in email:
        return jsonify({'error': 'Valid email required'}), 400

    if not print_id:
        return jsonify({'error': 'Print ID required'}), 400

    if tier not in VALID_TIERS:
        return jsonify({'error': 'Invalid tier'}), 400

    if not print_title:
        print_title = f'Porcelain Android ({print_id})'

    price = PRICES[tier]
    description = PRODUCT_DESCRIPTIONS[tier]
    is_twin = 'twin' in tier
    size = 'A2' if 'a2' in tier else 'A3'

    product_name = f'{print_title} — {size} {"Twin Set" if is_twin else "Print"}'

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            customer_email=email,
            line_items=[{
                'price_data': {
                    'currency': 'gbp',
                    'unit_amount': price,
                    'product_data': {
                        'name': product_name,
                        'description': description,
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f'{FRONTEND_URL}/prints?success=true&session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{FRONTEND_URL}/prints?cancelled=true',
            shipping_address_collection={
                'allowed_countries': [
                    'GB', 'US', 'CA', 'AU', 'NZ', 'DE', 'FR', 'IT', 'ES', 'NL',
                    'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'JP',
                    'SG', 'AE', 'HK',
                ],
            },
            metadata={
                'print_id': print_id,
                'print_title': print_title,
                'tier': tier,
                'collection': 'porcelain-androids',
            },
        )

        order = PrintOrder(
            print_id=print_id,
            print_title=product_name,
            email=email,
            stripe_session_id=session.id,
            status='pending',
            amount_gbp=price,
        )
        db.session.add(order)
        db.session.commit()

        return jsonify({
            'checkout_url': session.url,
            'session_id': session.id,
            'order_id': order.id,
        }), 200

    except stripe.error.StripeError as e:
        return jsonify({'error': f'Payment error: {str(e)}'}), 500
