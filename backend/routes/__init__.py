from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from routes.auth import bp as auth_bp
from routes.admin import bp as admin_bp
from routes.listing import bp as listing_bp
from flask_login import LoginManager

import os, sys
current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
sys.path.append(parent)
from db import MongoConnector
from user import User, Viewer

import logging
logger = logging.getLogger('lucky_house')

app = Flask(__name__)
app.config.from_object(Config)
mongoConnector = MongoConnector()
login_manager = LoginManager()
login_manager.anonymous_user = Viewer
login_manager.init_app(app)

CORS(app, 
     resources={r"/*": {
         "origins": "*",
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "expose_headers": ["Content-Type"],
         "supports_credentials": True,
         "send_wildcard": False,
         "max_age": 86400
     }})

# Add OPTIONS handler for preflight requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        return response

@login_manager.user_loader
def load_user(username):
    logger.info(f'load_user called with username: {username}')
    collection = mongoConnector.get_collection('users')
    try:
        user = collection.find_one({'username': username})
        if not user:
            logger.error(f'No user found with username {username}')
            return None
        logger.info(f'Loaded user with username {username} and type {user["user_type"]}')
        return User(
            username=user['username'],
            pw=user['password_hash'],
            user_type=user['user_type'],
            first_name=user.get('first_name'),
            last_name=user.get('last_name'),
            email=user.get('email'),
            phone=user.get('phone'),
            listing_url=user.get('listing_url')
        )
    except Exception as e:
        logger.error(f'An error occurred in load_user: {e}')
        return None

@login_manager.unauthorized_handler
def unauthorized():
    logger.error('Unauthorized access')
    return jsonify({"error": "Unauthorized"}), 401

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(admin_bp, url_prefix="/admin")
app.register_blueprint(listing_bp, url_prefix="/listing")