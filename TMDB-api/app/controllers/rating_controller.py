from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError as MarshmallowValidationError

from app.services.rating_service import RatingService
from app.schemas.rating_schema import MovieRatingSchema, CreateRatingSchema, UpdateRatingSchema
from app.utils.errors import ConflictError, NotFoundError, ValidationError

bp = Blueprint('ratings', __name__, url_prefix='/api/ratings')

_schema = MovieRatingSchema()
_schema_many = MovieRatingSchema(many=True)


@bp.route('', methods=['GET'])
@jwt_required()
def list_ratings():
    user_id = int(get_jwt_identity())
    ratings = RatingService().list_ratings(user_id)
    return jsonify(_schema_many.dump(ratings))


@bp.route('', methods=['POST'])
@jwt_required()
def create_rating():
    user_id = int(get_jwt_identity())
    try:
        data = CreateRatingSchema().load(request.get_json(silent=True) or {})
    except MarshmallowValidationError as exc:
        return jsonify({'error': exc.messages}), 400

    try:
        rating = RatingService().create_rating(user_id=user_id, **data)
        return jsonify(_schema.dump(rating)), 201
    except ValidationError as exc:
        return jsonify({'error': exc.message}), 400
    except ConflictError as exc:
        return jsonify({'error': exc.message}), 409


@bp.route('/<int:tmdb_movie_id>', methods=['PUT'])
@jwt_required()
def update_rating(tmdb_movie_id: int):
    user_id = int(get_jwt_identity())
    try:
        data = UpdateRatingSchema().load(request.get_json(silent=True) or {})
    except MarshmallowValidationError as exc:
        return jsonify({'error': exc.messages}), 400

    try:
        rating = RatingService().update_rating(user_id, tmdb_movie_id, data['rating'])
        return jsonify(_schema.dump(rating))
    except ValidationError as exc:
        return jsonify({'error': exc.message}), 400
    except NotFoundError as exc:
        return jsonify({'error': exc.message}), 404


@bp.route('/<int:tmdb_movie_id>', methods=['DELETE'])
@jwt_required()
def delete_rating(tmdb_movie_id: int):
    user_id = int(get_jwt_identity())
    try:
        RatingService().delete_rating(user_id, tmdb_movie_id)
        return '', 204
    except NotFoundError as exc:
        return jsonify({'error': exc.message}), 404
