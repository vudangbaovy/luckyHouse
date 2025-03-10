from flask import Blueprint, request, jsonify
from flask_login import login_required, login_user, logout_user, current_user
from werkzeug.security import (
    check_password_hash, 
    generate_password_hash
)
import os, sys
current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
sys.path.append(parent)
from db import MongoConnector
from user import User
import logging
logger = logging.getLogger('lucky_house')

mongoClient = MongoConnector()
bp = Blueprint('auth', __name__)
users_collection = mongoClient.get_collection('users')

@bp.route('/', methods=["GET"])
def get_type():
    """Check authentication status and return user type"""
    if not current_user.is_authenticated:
        logger.info('User not authenticated')
        return jsonify({
            "authenticated": False,
            "user_type": None,
            "message": "Not authenticated"
        }), 401
    
    try:
        return jsonify({
            "authenticated": True,
            "user_type": current_user.user_type,
            "listing_url": current_user.listing_url if hasattr(current_user, 'listing_url') else None
        }), 200
    except Exception as e:
        logger.error(f'Error in get_type: {e}')
        return jsonify({
            "authenticated": False,
            "user_type": None,
            "message": "Error checking authentication status"
        }), 500

@bp.route('/login', methods=["POST"])
def login():
    """Handle admin and tenant login"""
    try:
        data = request.get_json()
        logger.info(f'Login request data: {data}')
        
        if not data:
            logger.error('No JSON data received')
            return jsonify({
                "authenticated": False,
                "message": "No data provided"
            }), 400

        username = str(data.get("username", ""))
        password = str(data.get("password", ""))

        logger.info(f'Processing login for username: {username}')

        # Handle admin/tenant login
        user = users_collection.find_one({"username": username})
        if not user:
            logger.error(f'Username {username} not found in users collection')
            return jsonify({
                "authenticated": False,
                "message": "Invalid credentials"
            }), 401

        if not check_password_hash(user["password_hash"], password):
            logger.error(f'Incorrect password for {username}')
            return jsonify({
                "authenticated": False,
                "message": "Invalid credentials"
            }), 401

        logger.info(f'User {username} authenticated successfully as {user["user_type"]}')
        # Create user object and log in
        curr_user = User(
            username=user["username"],
            pw=user["password_hash"],
            user_type=user["user_type"],
            first_name=user.get("first_name"),
            last_name=user.get("last_name"),
            email=user.get("email"),
            phone=user.get("phone"),
            listing_url=user.get("listing_url")
        )
        login_user(curr_user, remember=True)

        return jsonify({
            "authenticated": True,
            "user_type": user["user_type"],
            "message": "Login successful",
            "listing_url": user.get("listing_url")
        }), 200

    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({
            "authenticated": False,
            "message": "An error occurred"
        }), 500

@bp.route("/logout", methods=["POST"])
@login_required
def logout():
    """Handle logout"""
    user_type = current_user.user_type
    logout_user()
    logger.info(f'{user_type} logged out')
    return jsonify({"message": "Logout successful"}), 200