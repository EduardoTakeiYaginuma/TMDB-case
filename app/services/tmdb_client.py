import requests
from flask import current_app
from app.utils.errors import TMDBError


class TMDBClient:
    """Thin HTTP wrapper around the TMDB REST API.

    Responsible only for making requests and surfacing transport-level errors.
    No business logic or data transformation lives here.
    """

    def _get(self, endpoint: str, extra_params: dict | None = None) -> dict:
        base_url: str = current_app.config['TMDB_BASE_URL']
        api_key: str = current_app.config['TMDB_API_KEY']
        timeout: int = current_app.config['TMDB_REQUEST_TIMEOUT']

        params = {'api_key': api_key, 'language': 'pt-BR'}
        if extra_params:
            params.update(extra_params)

        url = f"{base_url}{endpoint}"

        try:
            response = requests.get(url, params=params, timeout=timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            raise TMDBError("TMDB API request timed out", 504)
        except requests.exceptions.ConnectionError:
            raise TMDBError("Could not connect to TMDB API", 502)
        except requests.exceptions.HTTPError as exc:
            code = exc.response.status_code
            if code == 404:
                raise TMDBError("Movie not found on TMDB", 404)
            if code == 401:
                raise TMDBError("Invalid or missing TMDB API key", 500)
            raise TMDBError(f"TMDB API returned status {code}", 502)

    def search_movies(self, query: str, page: int = 1) -> dict:
        return self._get('/search/movie', {'query': query, 'page': page})

    def get_movie_with_credits(self, movie_id: int) -> dict:
        # append_to_response avoids a second round-trip to TMDB
        return self._get(
            f'/movie/{movie_id}',
            {'append_to_response': 'credits'},
        )

    def get_trending(self) -> dict:
        return self._get('/trending/movie/week')

    def get_popular(self) -> dict:
        return self._get('/movie/popular')

    def get_top_rated(self) -> dict:
        return self._get('/movie/top_rated')
