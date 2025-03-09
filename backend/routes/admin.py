from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from werkzeug.security import (
    generate_password_hash
)
import os, sys
current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
sys.path.append(parent)
from db import MongoConnector
import logging
logger = logging.getLogger('lucky_house')

mongoClient = MongoConnector()
bp = Blueprint('admin', __name__)

user_types = ['admin', 'viewer', 'tenant']
users_collection = mongoClient.get_collection('users')
listings_collection = mongoClient.get_collection('listings')

@bp.before_request
def check_admin():
    # Skip authentication check for OPTIONS requests
    if request.method == 'OPTIONS':
        return jsonify({"message": "OK"}), 200
        
    logger.info(f'check_admin called. current_user: {current_user}, authenticated: {current_user.is_authenticated}')
    if not current_user.is_authenticated:
        logger.error('Unauthorized access: user not authenticated')
        return jsonify({"error": "Unauthorized"}), 401
    
    logger.info(f'User type: {current_user.user_type}')
    if current_user.user_type != 'admin':
        logger.error('Unauthorized access: user is not admin')
        return jsonify({"error": "Unauthorized"}), 403
    
    logger.info('Admin access granted')

# User Management Routes

# Create user (Admin only)
@bp.route("/user/create", methods=["POST"])
@login_required
def create_user():
    try:
        data = request.get_json()

        if users_collection.find_one({"username": data.get('username')}):
            logger.error(f'User {data.get("username")} already exists')
            return jsonify({"message": "User already exists"}), 400

        if data.get('user_type') not in user_types:
            logger.error(f'Invalid user type {data.get("user_type")}')
            return jsonify({"message": "Invalid user type"}), 400

        user = { "username": data.get('username'), "password_hash": generate_password_hash(data.get('password')), "user_type": data.get('user_type'), "first_name": data.get('first_name'), "last_name": data.get('last_name'), "email": data.get('email'), "phone": data.get('phone'), "property_id": data.get('property_id') }
        users_collection.insert_one(user)
        logger.info(f'User {data.get("username")} created by admin')
        return jsonify({"message": "User created successfully"}), 200
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500

# Update user (Admin only)
@bp.route("/user/update", methods=["POST"])
@login_required
def update_user():
    try:
        data = request.get_json()
        username = data.get('username')
        user = users_collection.find_one({"username": username})

        if not user:
                logger.error(f'User {data.get("username")} doesn not exist')
                return jsonify({"message": "User does not exist"}), 400

        if "password" in data:
            data["password_hash"] = generate_password_hash(data["password"])
            data.pop("password")
        users_collection.update_one({"username": username}, {"$set": user})
        return jsonify({"message": "User updated successfully"})
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500

# Delete user (Admin only)
@bp.route("/user/delete", methods=["POST"])
@login_required
def delete_user():
    try:
        data = request.get_json()
        username = data.get('username')
        query = {"username": username}
        user = users_collection.find_one(query)

        if user:
            users_collection.delete_one(query)
            return jsonify({"message": "User deleted successfully"})
        return jsonify({"message": "User does not exist"})
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500

@bp.route("/user/get", methods=["GET"])
@login_required
def get_users():
    try:
        aggregate = users_collection.aggregate([{"$project": {"_id": 0, "password_hash": 0}}])
        users = [user for user in aggregate]
        return jsonify(users)
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500

# Listing Management Routes

@bp.route("/listing/create", methods=["POST"])
@login_required
def create_listing():
    try:
        data = request.get_json()
        required_fields = ['id', 'name', 'address']
        
        # Validate required fields
        for field in required_fields:
            if not data.get(field):
                logger.error(f'Missing required field: {field}')
                return jsonify({"message": f"Missing required field: {field}"}), 400

        # Check if listing ID already exists
        if listings_collection.find_one({"id": data.get('id')}):
            logger.error(f'Listing with ID {data.get("id")} already exists')
            return jsonify({"message": "Listing ID already exists"}), 400

        # Create listing document
        listing_doc = {
            "id": data.get('id'),
            "name": data.get('name'),
            "address": data.get('address'),
            "description": data.get('description', ''),
            "bedrooms": data.get('bedrooms', []),
            "photos": data.get('photos', [])
        }

        listings_collection.insert_one(listing_doc)
        logger.info(f'Listing {data.get("id")} created successfully')
        return jsonify({"message": "Listing created successfully"}), 200
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500

@bp.route("/listing/update", methods=["POST"])
@login_required
def update_listing():
    try:
        data = request.get_json()
        listing_id = data.get('id')

        if not listing_id:
            logger.error('Missing listing ID')
            return jsonify({"message": "Missing listing ID"}), 400

        # Check if listing exists
        existing_listing = listings_collection.find_one({"id": listing_id})
        if not existing_listing:
            logger.error(f'Listing with ID {listing_id} not found')
            return jsonify({"message": "Listing not found"}), 404

        # Update listing document
        update_data = {
            "name": data.get('name'),
            "address": data.get('address'),
            "description": data.get('description', ''),
            "bedrooms": data.get('bedrooms', []),
            "photos": data.get('photos', [])
        }

        listings_collection.update_one(
            {"id": listing_id},
            {"$set": update_data}
        )
        logger.info(f'Listing {listing_id} updated successfully')
        return jsonify({"message": "Listing updated successfully"}), 200
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500

@bp.route("/listing/delete", methods=["POST"])
@login_required
def delete_listing():
    try:
        data = request.get_json()
        listing_id = data.get('id')

        if not listing_id:
            logger.error('Missing listing ID')
            return jsonify({"message": "Missing listing ID"}), 400

        result = listings_collection.delete_one({"id": listing_id})
        
        if result.deleted_count > 0:
            logger.info(f'Listing {listing_id} deleted successfully')
            return jsonify({"message": "Listing deleted successfully"}), 200
        else:
            logger.error(f'Listing with ID {listing_id} not found')
            return jsonify({"message": "Listing not found"}), 404
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500

@bp.route("/listing/get", methods=["GET"])
@login_required
def get_listings():
    try:
        # Exclude MongoDB's _id field from the results
        listings = list(listings_collection.find({}, {"_id": 0}))
        return jsonify(listings)
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500