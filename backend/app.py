import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from config import Config
from models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow localhost in dev, ruthven.world in production
    allowed_origins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://ruthven.world',
        'https://www.ruthven.world',
    ]
    CORS(app, origins=allowed_origins)

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok', 'project': 'RUTHVEN'})

    db.init_app(app)

    # Ensure upload directories exist
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'traits'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'generated'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'sources'), exist_ok=True)

    # Register blueprints
    from routes.brands import brands_bp
    from routes.collections import collections_bp
    from routes.traits import traits_bp
    from routes.generate import generate_bp
    from routes.ipfs import ipfs_bp
    from routes.deploy import deploy_bp
    from routes.wishlist import wishlist_bp
    from routes.video_generate import video_gen_bp

    app.register_blueprint(brands_bp, url_prefix='/api')
    app.register_blueprint(collections_bp, url_prefix='/api')
    app.register_blueprint(traits_bp, url_prefix='/api')
    app.register_blueprint(generate_bp, url_prefix='/api')
    app.register_blueprint(ipfs_bp, url_prefix='/api')
    app.register_blueprint(deploy_bp, url_prefix='/api')
    app.register_blueprint(wishlist_bp, url_prefix='/api')
    app.register_blueprint(video_gen_bp, url_prefix='/api')

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Create tables
    with app.app_context():
        db.create_all()

    return app


# Module-level app instance for gunicorn (gunicorn app:app)
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5001)
