from datetime import datetime
from . import db


class PrintOrder(db.Model):
    __tablename__ = 'print_orders'

    id = db.Column(db.Integer, primary_key=True)
    print_id = db.Column(db.String(20), nullable=False)       # e.g. 'db-07'
    print_title = db.Column(db.String(100), nullable=False)    # e.g. 'Drone Blonde #7'
    email = db.Column(db.String(255), nullable=False)
    stripe_session_id = db.Column(db.String(255), unique=True, nullable=True)
    stripe_payment_intent = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(30), default='pending')       # pending, paid, printing, shipped, delivered
    amount_gbp = db.Column(db.Integer, default=29500)          # in pence (£295.00)
    shipping_name = db.Column(db.String(255), nullable=True)
    shipping_address = db.Column(db.Text, nullable=True)
    tracking_number = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'print_id': self.print_id,
            'print_title': self.print_title,
            'email': self.email,
            'status': self.status,
            'amount_gbp': self.amount_gbp,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
