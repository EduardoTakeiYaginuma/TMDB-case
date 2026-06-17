import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_cors import CORS
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
cache = Cache()
jwt = JWTManager()


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__)

    from app.config.settings import Config
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)

    _ensure_db_dir(app.config['SQLALCHEMY_DATABASE_URI'])

    db.init_app(app)
    cache.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=app.config.get('CORS_ORIGINS', ['http://localhost:3000']))

    from app.routes import register_routes
    register_routes(app)

    with app.app_context():
        db.create_all()

    return app


def _ensure_db_dir(uri: str) -> None:
    if uri.startswith('sqlite:///'):
        path = uri.replace('sqlite:///', '')
        directory = os.path.dirname(path)
        if directory:
            os.makedirs(directory, exist_ok=True)
