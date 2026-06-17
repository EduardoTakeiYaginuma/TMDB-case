from datetime import datetime, timezone
from app import db


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class MovieRating(db.Model):
    __tablename__ = 'movie_ratings'
    __table_args__ = (
        db.UniqueConstraint('user_id', 'tmdb_movie_id', name='uq_user_movie'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    tmdb_movie_id = db.Column(db.Integer, nullable=False, index=True)
    title = db.Column(db.String(500), nullable=False)
    poster_path = db.Column(db.String(500), nullable=True)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)

    def __repr__(self) -> str:
        return f'<MovieRating user={self.user_id} tmdb={self.tmdb_movie_id} rating={self.rating}/5>'
