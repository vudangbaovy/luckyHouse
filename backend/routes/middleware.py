from functools import wraps
from flask import jsonify
from flask_login import current_user
import logging

logger = logging.getLogger('lucky_house')

def check_listing_access(url_token):
    """
    Decorator to check if the current user has access to the specified listing.
    For admin users: always allow access
    For viewer users: only allow access to their assigned listing
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                logger.warning('Unauthenticated user attempted to access listing')
                return jsonify({
                    "authenticated": False,
                    "message": "Please log in to view this listing"
                }), 401

            if current_user.is_admin:
                return f(*args, **kwargs)

            if current_user.is_viewer:
                if current_user.listing_url == url_token:
                    return f(*args, **kwargs)
                else:
                    logger.warning(f'Viewer {current_user.username} attempted to access unauthorized listing {url_token}')
                    return jsonify({
                        "authenticated": True,
                        "message": "You do not have permission to view this listing"
                    }), 403

            logger.error(f'Unknown user type {current_user.user_type} attempted to access listing')
            return jsonify({
                "authenticated": True,
                "message": "Invalid user type"
            }), 403

        return decorated_function
    return decorator 