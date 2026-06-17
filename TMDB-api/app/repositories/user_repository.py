from app import db
from app.models.user import User


class UserRepository:
    def get_by_username(self, username: str) -> User | None:
        return db.session.query(User).filter_by(username=username).first()

    def get_by_email(self, email: str) -> User | None:
        return db.session.query(User).filter_by(email=email).first()

    def create(self, username: str, email: str, password: str) -> User:
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
        return user
