from flask import Blueprint, jsonify, request
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


@bp.route('/trending', methods=['GET'])
def trending():
    try:
        return jsonify(MovieService().get_trending())
    except TMDBError as exc:
        return jsonify({'error': exc.message}), exc.status_code


@bp.route('/popular', methods=['GET'])
def popular():
    try:
        return jsonify(MovieService().get_popular())
    except TMDBError as exc:
        return jsonify({'error': exc.message}), exc.status_code


@bp.route('/top-rated', methods=['GET'])
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
