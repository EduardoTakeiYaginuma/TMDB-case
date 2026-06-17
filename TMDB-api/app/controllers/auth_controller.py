from flask import Blueprint, jsonify, request
from marshmallow import ValidationError as MarshmallowValidationError

from app.services.auth_service import AuthService
from app.schemas.auth_schema import RegisterSchema, LoginSchema
from app.utils.errors import ConflictError, ValidationError

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@bp.route('/register', methods=['POST'])
def register():
    try:
        data = RegisterSchema().load(request.get_json(silent=True) or {})
    except MarshmallowValidationError as exc:
        return jsonify({'error': exc.messages}), 400

    try:
        result = AuthService().register(**data)
        return jsonify(result), 201
    except ConflictError as exc:
        return jsonify({'error': exc.message}), 409


@bp.route('/login', methods=['POST'])
def login():
    try:
        data = LoginSchema().load(request.get_json(silent=True) or {})
    except MarshmallowValidationError as exc:
        return jsonify({'error': exc.messages}), 400

    try:
        result = AuthService().login(**data)
        return jsonify(result)
    except ValidationError as exc:
        return jsonify({'error': exc.message}), 401
