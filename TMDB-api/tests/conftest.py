import pytest
from app import create_app, db
from app.models.user import User


@pytest.fixture
def app():
    test_app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'TMDB_API_KEY': 'test-key',
        'CACHE_TYPE': 'NullCache',
        'JWT_SECRET_KEY': 'test-jwt-secret',
    })
    with test_app.app_context():
        db.create_all()
        yield test_app
        db.drop_all()


@pytest.fixture
def test_user(app):
    user = User(username='testuser', email='test@example.com')
    user.set_password('testpass')
    db.session.add(user)
    db.session.commit()
    db.session.refresh(user)
    return user
