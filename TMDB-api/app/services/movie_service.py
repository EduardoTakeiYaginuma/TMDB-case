from typing import Any
from app.services.tmdb_client import TMDBClient
from app.utils.errors import ValidationError

_IMAGE_BASE = 'https://image.tmdb.org/t/p'
_CAST_LIMIT = 10


def _image_url(path: str | None, size: str = 'w342') -> str | None:
    if not path:
        return None
    return f"{_IMAGE_BASE}/{size}{path}"


def _normalize_summary(raw: dict) -> dict[str, Any]:
    return {
        'id': raw['id'],
        'title': raw.get('title') or raw.get('original_title', ''),
        'poster_path': _image_url(raw.get('poster_path')),
        'backdrop_path': _image_url(raw.get('backdrop_path'), 'w780'),
        'release_date': raw.get('release_date') or None,
        'vote_average': raw.get('vote_average'),
        'overview': raw.get('overview') or '',
        'genre_ids': raw.get('genre_ids', []),
    }


class MovieService:
    """Orchestrates TMDB data fetching and normalizes responses for the API."""

    def __init__(self) -> None:
        self._client = TMDBClient()

    def search(self, query: str, page: int = 1) -> dict[str, Any]:
        query = query.strip()
        if not query:
            raise ValidationError("Query parameter 'q' is required and cannot be empty")

        raw = self._client.search_movies(query, page)

        return {
            'results': [_normalize_summary(m) for m in raw.get('results', [])],
            'page': raw.get('page', 1),
            'total_pages': raw.get('total_pages', 1),
            'total_results': raw.get('total_results', 0),
        }

    def get_trending(self) -> list[dict]:
        raw = self._client.get_trending()
        return [_normalize_summary(m) for m in raw.get('results', [])]

    def get_popular(self) -> list[dict]:
        raw = self._client.get_popular()
        return [_normalize_summary(m) for m in raw.get('results', [])]

    def get_top_rated(self) -> list[dict]:
        raw = self._client.get_top_rated()
        return [_normalize_summary(m) for m in raw.get('results', [])]

    def get_genres(self) -> list[dict]:
        raw = self._client.get_genres()
        return raw.get('genres', [])

    def discover(
        self,
        genre_id: int | None = None,
        year: int | None = None,
        page: int = 1,
    ) -> dict[str, Any]:
        raw = self._client.discover_movies(genre_id, year, page)
        return {
            'results': [_normalize_summary(m) for m in raw.get('results', [])],
            'page': raw.get('page', 1),
            'total_pages': raw.get('total_pages', 1),
            'total_results': raw.get('total_results', 0),
        }

    def get_detail(self, tmdb_movie_id: int) -> dict[str, Any]:
        raw = self._client.get_movie_with_credits(tmdb_movie_id)

        cast = [
            {
                'id': member['id'],
                'name': member['name'],
                'character': member.get('character') or '',
                'profile_path': _image_url(member.get('profile_path'), 'w185'),
                'order': member.get('order', 999),
            }
            for member in raw.get('credits', {}).get('cast', [])[:_CAST_LIMIT]
        ]

        return {
            **_normalize_summary(raw),
            'overview': raw.get('overview') or '',
            'genres': [g['name'] for g in raw.get('genres', [])],
            'runtime': raw.get('runtime'),
            'cast': cast,
        }
