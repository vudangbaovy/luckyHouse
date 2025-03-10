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
viewers_collection = mongoClient.get_collection('viewers')

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
    """Handle both admin/tenant and viewer login"""
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
        user_type = str(data.get("user_type", "viewer"))

        logger.info(f'Processing login for username: {username}, user_type: {user_type}')

        # Handle viewer login separately
        if user_type == "viewer":
            logger.info('Attempting viewer login')
            viewer = viewers_collection.find_one({"username": username})
            if not viewer:
                logger.error(f'Viewer username {username} not found')
                return jsonify({
                    "authenticated": False,
                    "message": "Invalid credentials"
                }), 401

            if viewer["password"] != password:  # Direct password comparison for viewers
                logger.error(f'Incorrect password for viewer {username}')
                return jsonify({
                    "authenticated": False,
                    "message": "Invalid credentials"
                }), 401

            logger.info(f'Viewer {username} authenticated successfully')
            # Create viewer user object
            curr_user = User(
                username=viewer["username"],
                pw="",  # No password hash for viewers
                user_type="viewer",
                listing_url=viewer.get("listing_url")
            )
            login_user(curr_user, remember=True)
            return jsonify({
                "authenticated": True,
                "user_type": "viewer",
                "message": "Login successful",
                "listing_url": viewer.get("listing_url")
            }), 200

        # Handle admin/tenant login
        logger.info('Attempting admin/tenant login')
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

        # Verify user type matches
        if user["user_type"] != user_type:
            logger.error(f'User type mismatch for {username}. Expected {user_type}, got {user["user_type"]}')
            return jsonify({
                "authenticated": False,
                "message": f"Invalid credentials for {user_type} login"
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
    """Handle logout for all user types"""
    user_type = current_user.user_type
    logout_user()
    logger.info(f'{user_type} logged out')
    return jsonify({"message": "Logout successful"}), 200

@bp.route("/signup", methods=["POST"])
def signup():
    """Handle tenant signup"""
    try:
        data = request.get_json()
        logger.info('Signup request received')
        
        if not data:
            logger.error('No JSON data received')
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Extract and validate required fields
        required_fields = ['username', 'firstName', 'lastName', 'email', 'phoneNumber']
        for field in required_fields:
            if not data.get(field):
                logger.error(f'Missing required field: {field}')
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400

        # Check if username already exists
        if users_collection.find_one({"username": data['username']}):
            logger.error(f'Username {data["username"]} already exists')
            return jsonify({
                "success": False,
                "message": "Username already exists"
            }), 409

        # Create new user document
        new_user = {
            "username": data['username'],
            "first_name": data['firstName'],
            "last_name": data['lastName'],
            "email": data['email'],
            "phone_number": data['phoneNumber'],
            "user_type": "tenant",
            "password": generate_password_hash(data.get('password', 'changeme')),  # Default password if not provided
        }

        # Insert the new user
        result = users_collection.insert_one(new_user)
        
        if result.inserted_id:
            logger.info(f'Successfully created new tenant user: {data["username"]}')
            return jsonify({
                "success": True,
                "message": "User created successfully"
            }), 201
        else:
            logger.error('Failed to insert new user')
            return jsonify({
                "success": False,
                "message": "Failed to create user"
            }), 500

    except Exception as e:
        logger.error(f'Error in signup: {e}')
        return jsonify({
            "success": False,
            "message": "An error occurred during signup"
        }), 500