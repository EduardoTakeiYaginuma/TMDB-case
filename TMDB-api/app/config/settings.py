import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY: str = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY: str = os.environ.get('JWT_SECRET_KEY', os.environ.get('SECRET_KEY', 'dev-jwt-secret'))
    JWT_ACCESS_TOKEN_EXPIRES: timedelta = timedelta(days=7)

    SQLALCHEMY_DATABASE_URI: str = os.environ.get(
        'DATABASE_URL',
        'sqlite:///cinerate.db',
    )
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False

    TMDB_API_KEY: str = os.environ.get('TMDB_API_KEY', '')
    TMDB_BASE_URL: str = 'https://api.themoviedb.org/3'
    TMDB_IMAGE_BASE_URL: str = 'https://image.tmdb.org/t/p'
    TMDB_REQUEST_TIMEOUT: int = 10

    CORS_ORIGINS: list[str] = [
        'http://localhost:3000',
        'http://frontend:3000',
    ]

    CACHE_TYPE: str = 'SimpleCache'
    CACHE_DEFAULT_TIMEOUT: int = 600
