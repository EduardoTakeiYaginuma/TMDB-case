from flask_jwt_extended import create_access_token
from app.repositories.user_repository import UserRepository
from app.utils.errors import ConflictError, ValidationError


class AuthService:
    def __init__(self) -> None:
        self._repo = UserRepository()

    def register(self, username: str, email: str, password: str) -> dict:
        if self._repo.get_by_username(username):
            raise ConflictError('Nome de usuário já está em uso.')
        if self._repo.get_by_email(email):
            raise ConflictError('E-mail já cadastrado.')

        user = self._repo.create(username, email, password)
        token = create_access_token(identity=str(user.id))
        return {
            'user': {'id': user.id, 'username': user.username, 'email': user.email},
            'token': token,
        }

    def login(self, username: str, password: str) -> dict:
        user = self._repo.get_by_username(username)
        if not user or not user.check_password(password):
            raise ValidationError('Usuário ou senha inválidos.')

        token = create_access_token(identity=str(user.id))
        return {
            'user': {'id': user.id, 'username': user.username, 'email': user.email},
            'token': token,
        }
