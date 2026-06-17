from marshmallow import Schema, fields, validate


class MovieRatingSchema(Schema):
    """Serializes a MovieRating model instance to JSON."""
    id = fields.Int(dump_only=True)
    tmdb_movie_id = fields.Int(dump_only=True)
    title = fields.Str(dump_only=True)
    poster_path = fields.Str(allow_none=True, dump_only=True)
    rating = fields.Int()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class CreateRatingSchema(Schema):
    tmdb_movie_id = fields.Int(required=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    poster_path = fields.Str(allow_none=True, load_default=None)
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))


class UpdateRatingSchema(Schema):
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
