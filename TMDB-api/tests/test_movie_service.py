from unittest.mock import MagicMock, patch
import pytest
from app.services.movie_service import MovieService, _image_url
from app.utils.errors import ValidationError


FAKE_MOVIE = {
    'id': 42,
    'title': 'Inception',
    'poster_path': '/poster.jpg',
    'backdrop_path': '/backdrop.jpg',
    'release_date': '2010-07-16',
    'vote_average': 8.8,
    'overview': 'A thief who steals corporate secrets.',
    'genre_ids': [28, 878],
}

FAKE_DETAIL = {
    **FAKE_MOVIE,
    'genres': [{'id': 28, 'name': 'Ação'}, {'id': 878, 'name': 'Ficção Científica'}],
    'runtime': 148,
    'credits': {
        'cast': [
            {
                'id': 1, 'name': 'Leonardo DiCaprio', 'character': 'Cobb',
                'profile_path': '/leo.jpg', 'order': 0,
            },
        ]
    },
}


def test_image_url_none_returns_none(app):
    assert _image_url(None) is None


def test_image_url_builds_correct_url(app):
    url = _image_url('/poster.jpg', 'w342')
    assert url == 'https://image.tmdb.org/t/p/w342/poster.jpg'


def test_search_empty_query_raises_validation(app):
    with pytest.raises(ValidationError):
        MovieService().search('')


def test_search_whitespace_only_raises_validation(app):
    with pytest.raises(ValidationError):
        MovieService().search('   ')


def test_search_returns_normalized_results(app):
    with patch('app.services.movie_service.TMDBClient') as MockClient:
        instance = MockClient.return_value
        instance.search_movies.return_value = {
            'results': [FAKE_MOVIE],
            'page': 1,
            'total_pages': 5,
            'total_results': 100,
        }
        result = MovieService().search('inception')

    assert result['total_results'] == 100
    assert result['page'] == 1
    movie = result['results'][0]
    assert movie['id'] == 42
    assert movie['title'] == 'Inception'
    assert movie['poster_path'] == 'https://image.tmdb.org/t/p/w342/poster.jpg'
    assert movie['genre_ids'] == [28, 878]


def test_get_detail_normalizes_cast(app):
    with patch('app.services.movie_service.TMDBClient') as MockClient:
        instance = MockClient.return_value
        instance.get_movie_with_credits.return_value = FAKE_DETAIL
        detail = MovieService().get_detail(42)

    assert detail['title'] == 'Inception'
    assert detail['runtime'] == 148
    assert detail['genres'] == ['Ação', 'Ficção Científica']
    assert len(detail['cast']) == 1
    assert detail['cast'][0]['name'] == 'Leonardo DiCaprio'
    assert detail['cast'][0]['character'] == 'Cobb'


def test_get_genres_returns_list(app):
    with patch('app.services.movie_service.TMDBClient') as MockClient:
        instance = MockClient.return_value
        instance.get_genres.return_value = {
            'genres': [{'id': 28, 'name': 'Ação'}, {'id': 35, 'name': 'Comédia'}]
        }
        result = MovieService().get_genres()

    assert result == [{'id': 28, 'name': 'Ação'}, {'id': 35, 'name': 'Comédia'}]


def test_discover_returns_normalized_results(app):
    with patch('app.services.movie_service.TMDBClient') as MockClient:
        instance = MockClient.return_value
        instance.discover_movies.return_value = {
            'results': [FAKE_MOVIE],
            'page': 1,
            'total_pages': 10,
            'total_results': 200,
        }
        result = MovieService().discover(genre_id=28, year=2010)

    assert result['total_results'] == 200
    assert result['results'][0]['title'] == 'Inception'
    instance.discover_movies.assert_called_once_with(28, 2010, 1)
