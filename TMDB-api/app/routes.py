from flask import Flask, jsonify


def register_routes(app: Flask) -> None:
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok', 'message': 'CineRate API is running'})

    from app.controllers.movie_controller import bp as movies_bp
    from app.controllers.rating_controller import bp as ratings_bp
    from app.controllers.auth_controller import bp as auth_bp

    app.register_blueprint(movies_bp)
    app.register_blueprint(ratings_bp)
    app.register_blueprint(auth_bp)

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({'error': 'Route not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(_):
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(500)
    def internal_error(_):
        return jsonify({'error': 'Internal server error'}), 500
