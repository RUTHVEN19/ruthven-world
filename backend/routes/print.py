"""
print.py — Print shop routes: open edition Drone Blonde prints via Stripe Checkout.
"""
import os
import stripe
from flask import Blueprint, request, jsonify
from models import db
from models.print_order import PrintOrder

print_bp = Blueprint('print', __name__)

# Stripe config
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://diamonddrones.world')

PRICE_GBP_PENCE = 60000  # £600.00

# Valid print IDs (matches frontend PRINT_EDITIONS)
VALID_PRINTS = {
    'db-07', 'db-17', 'db-23', 'db-34', 'db-45',
    'db-58', 'db-63', 'db-71', 'db-84', 'db-99',
}


@print_bp.route('/print/checkout', methods=['POST'])
def create_checkout():
    """Create a Stripe Checkout Session for an open edition print."""
    data = request.get_json()
    email = (data.get('email') or '').strip()
    print_id = (data.get('print_id') or '').strip()
    print_title = (data.get('print_title') or '').strip()

    if not email or '@' not in email:
        return jsonify({'error': 'Valid email required'}), 400

    if print_id not in VALID_PRINTS:
        return jsonify({'error': 'Invalid print selection'}), 400

    if not print_title:
        print_title = f'Drone Blonde Print ({print_id})'

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            customer_email=email,
            line_items=[{
                'price_data': {
                    'currency': 'gbp',
                    'unit_amount': PRICE_GBP_PENCE,
                    'product_data': {
                        'name': f'{print_title} — Signed A2 Photo Rag Metallic Print',
                        'description': (
                            'Hand-signed Hahnemuhle Photo Rag Metallic 340gsm A2 print '
                            'with AR Drone Blonde dance activation.'
                        ),
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f'{FRONTEND_URL}/drones/prints?success=true&session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{FRONTEND_URL}/drones/prints?cancelled=true',
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
            },
        )

        order = PrintOrder(
            print_id=print_id,
            print_title=print_title,
            email=email,
            stripe_session_id=session.id,
            status='pending',
            amount_gbp=PRICE_GBP_PENCE,
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


@print_bp.route('/print/webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook events (payment confirmation)."""
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature', '')

    if not STRIPE_WEBHOOK_SECRET:
        return jsonify({'error': 'Webhook not configured'}), 500

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        return jsonify({'error': 'Invalid signature'}), 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        session_id = session['id']

        order = PrintOrder.query.filter_by(stripe_session_id=session_id).first()
        if order:
            order.status = 'paid'
            order.stripe_payment_intent = session.get('payment_intent')
            order.email = session.get('customer_details', {}).get('email') or order.email

            shipping = session.get('shipping_details', {})
            if shipping:
                order.shipping_name = shipping.get('name')
                address = shipping.get('address', {})
                order.shipping_address = ', '.join(filter(None, [
                    address.get('line1'),
                    address.get('line2'),
                    address.get('city'),
                    address.get('state'),
                    address.get('postal_code'),
                    address.get('country'),
                ]))

            db.session.commit()

    return jsonify({'received': True}), 200


@print_bp.route('/print/orders', methods=['POST'])
def get_orders():
    """Get print orders by email."""
    data = request.get_json()
    email = (data.get('email') or '').strip()
    if not email:
        return jsonify({'error': 'email required'}), 400

    orders = PrintOrder.query.filter_by(email=email).order_by(PrintOrder.created_at.desc()).all()
    return jsonify({'orders': [o.to_dict() for o in orders]}), 200
