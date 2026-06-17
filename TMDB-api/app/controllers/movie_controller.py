from flask import Blueprint, jsonify, request
from app import cache
from app.services.movie_service import MovieService
from app.utils.errors import TMDBError, ValidationError

bp = Blueprint('movies', __name__, url_prefix='/api/movies')


@bp.route('/search', methods=['GET'])
def search():
    query = request.args.get('q', '')
    page = request.args.get('page', 1, type=int)

    if page < 1:
        return jsonify({'error': 'page must be >= 1'}), 400

    try:
        result = MovieService().search(query, page)
        return jsonify(result)
    except ValidationError as exc:
        return jsonify({'error': exc.message}), 400
    except TMDBError as exc:
        return jsonify({'error': exc.message}), exc.status_code


@bp.route('/genres', methods=['GET'])
@cache.cached(timeout=86400, key_prefix='movies_genres')
def genres():
    try:
        return jsonify(MovieService().get_genres())
    except TMDBError as exc:
        return jsonify({'error': exc.message}), exc.status_code


@bp.route('/discover', methods=['GET'])
@cache.cached(timeout=300, query_string=True, key_prefix='movies_discover')
def discover():
    genre_id = request.args.get('genre_id', type=int)
    year = request.args.get('year', type=int)
    page = request.args.get('page', 1, type=int)

    if page < 1:
        return jsonify({'error': 'page must be >= 1'}), 400

    try:
        result = MovieService().discover(genre_id, year, page)
        return jsonify(result)
    except TMDBError as exc:
        return jsonify({'error': exc.message}), exc.status_code


@bp.route('/trending', methods=['GET'])
@cache.cached(timeout=600, key_prefix='movies_trending')
def trending():
    try:
        return jsonify(MovieService().get_trending())
    except TMDBError as exc:
        return jsonify({'error': exc.message}), exc.status_code


@bp.route('/popular', methods=['GET'])
@cache.cached(timeout=600, key_prefix='movies_popular')
def popular():
    try:
        return jsonify(MovieService().get_popular())
    except TMDBError as exc:
        return jsonify({'error': exc.message}), exc.status_code


@bp.route('/top-rated', methods=['GET'])
@cache.cached(timeout=600, key_prefix='movies_top_rated')
def top_rated():
    try:
        return jsonify(MovieService().get_top_rated())
    except TMDBError as exc:
        return jsonify({'error': exc.message}), exc.status_code


@bp.route('/<int:tmdb_movie_id>', methods=['GET'])
def detail(tmdb_movie_id: int):
    try:
        result = MovieService().get_detail(tmdb_movie_id)
        return jsonify(result)
    except TMDBError as exc:
        return jsonify({'error': exc.message}), exc.status_code
