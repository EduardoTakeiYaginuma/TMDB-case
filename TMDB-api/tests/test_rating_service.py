import pytest
from app.services.rating_service import RatingService
from app.utils.errors import ConflictError, NotFoundError, ValidationError


def _create(user_id, tmdb_id=1, title='Test Movie', poster=None, rating=4):
    return RatingService().create_rating(
        user_id=user_id,
        tmdb_movie_id=tmdb_id,
        title=title,
        poster_path=poster,
        rating=rating,
    )


def test_list_ratings_empty(app, test_user):
    assert RatingService().list_ratings(test_user.id) == []


def test_create_rating_success(app, test_user):
    r = _create(test_user.id)
    assert r.tmdb_movie_id == 1
    assert r.title == 'Test Movie'
    assert r.rating == 4
    assert r.poster_path is None


def test_create_rating_persists(app, test_user):
    _create(test_user.id, tmdb_id=10, rating=3)
    all_ratings = RatingService().list_ratings(test_user.id)
    assert len(all_ratings) == 1
    assert all_ratings[0].rating == 3


def test_create_rating_duplicate_raises_conflict(app, test_user):
    _create(test_user.id, tmdb_id=5)
    with pytest.raises(ConflictError):
        _create(test_user.id, tmdb_id=5)


def test_create_rating_below_min_raises_validation(app, test_user):
    with pytest.raises(ValidationError):
        _create(test_user.id, rating=0)


def test_create_rating_above_max_raises_validation(app, test_user):
    with pytest.raises(ValidationError):
        _create(test_user.id, rating=6)


def test_create_rating_not_int_raises_validation(app, test_user):
    with pytest.raises(ValidationError):
        _create(test_user.id, rating=3.5)  # type: ignore[arg-type]


def test_update_rating_success(app, test_user):
    _create(test_user.id, tmdb_id=2, rating=2)
    updated = RatingService().update_rating(test_user.id, 2, 5)
    assert updated.rating == 5


def test_update_rating_not_found_raises_not_found(app, test_user):
    with pytest.raises(NotFoundError):
        RatingService().update_rating(test_user.id, 999, 3)


def test_update_rating_invalid_value_raises_validation(app, test_user):
    _create(test_user.id, tmdb_id=3, rating=3)
    with pytest.raises(ValidationError):
        RatingService().update_rating(test_user.id, 3, 7)


def test_delete_rating_success(app, test_user):
    _create(test_user.id, tmdb_id=4, rating=1)
    RatingService().delete_rating(test_user.id, 4)
    assert RatingService().list_ratings(test_user.id) == []


def test_delete_rating_not_found_raises_not_found(app, test_user):
    with pytest.raises(NotFoundError):
        RatingService().delete_rating(test_user.id, 999)


def test_list_ratings_ordered_by_updated_at_desc(app, test_user):
    _create(test_user.id, tmdb_id=10, rating=5)
    _create(test_user.id, tmdb_id=20, rating=2)
    RatingService().update_rating(test_user.id, 10, 1)  # bumps updated_at of tmdb=10
    ratings = RatingService().list_ratings(test_user.id)
    assert ratings[0].tmdb_movie_id == 10


def test_ratings_are_scoped_per_user(app, test_user):
    from app.models.user import User
    from app import db

    other = User(username='other', email='other@example.com')
    other.set_password('pass')
    db.session.add(other)
    db.session.commit()
    db.session.refresh(other)

    _create(test_user.id, tmdb_id=99, rating=3)
    assert RatingService().list_ratings(other.id) == []
