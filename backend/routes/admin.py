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
from utils import compress_image
import logging
logger = logging.getLogger('lucky_house')

mongoClient = MongoConnector()
bp = Blueprint('admin', __name__)

user_types = ['admin', 'viewer', 'tenant']

users_collection = mongoClient.get_collection('users')
viewers_collection = mongoClient.get_collection('viewers')
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

# Create viewer (Admin only)
@bp.route("/viewer/create", methods=["POST"])
@login_required
def create_viewer():
    try:
        new_viewer = request.get_json()
        username = new_viewer.get('username')
        viewer = viewers_collection.find_one({"username": username})

        if viewer:
            logger.error(f'Viewer {new_viewer.get("username")} already exists')
            return jsonify({"message": "Viewer already exists"}), 400
        
        viewer = {
            "username": new_viewer.get('username'),
            "password": new_viewer.get('password'),
            "listing_url": new_viewer.get('listing_url')
        }
        viewers_collection.insert_one(viewer)
        logger.info(f'Viewer {new_viewer.get("username")} created by admin')
        return jsonify({"message": "Viewer created successfully"}), 200
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500
    
# Update viewer (Admin only)
@bp.route("/viewer/update", methods=["POST"])
@login_required
def update_viewer():
    try:
        updated_viewer = request.get_json()
        username = updated_viewer.get('username')
        viewer = viewers_collection.find_one({"username": username})

        if not viewer:
            logger.error(f'Viewer {updated_viewer.get("username")} does not exist')
            return jsonify({"message": "Viewer does not exist"}), 400
        
        viewers_collection.update_one({"username": username}, {"$set": updated_viewer})
        return jsonify({"message": "Viewer updated successfully"}), 200
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500
    
# Delete viewer (Admin only)
@bp.route("/viewer/delete", methods=["POST"])
@login_required
def delete_viewer():
    try:
        data = request.get_json()
        username = data.get('username')
        query = {"username": username}
        viewer = viewers_collection.find_one(query)

        if viewer:
            viewers_collection.delete_one(query)
            return jsonify({"message": "Viewer deleted successfully"})
        return jsonify({"message": "Viewer does not exist"})
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500
    
@bp.route("/viewer/get", methods=["GET"])
@login_required
def get_viewers():
    try:
        aggregate = viewers_collection.aggregate([{"$project": {"_id": 0}}])
        users = [user for user in aggregate]
        return jsonify(users)
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500
    
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

        user = {
            "username": data.get('username'),
            "password_hash": generate_password_hash(data.get('password')),
            "user_type": data.get('user_type'),
            "first_name": data.get('first_name'),
            "last_name": data.get('last_name'),
            "email": data.get('email'),
            "phone": data.get('phone'),
            "listing_url": data.get('listing_url')
        }
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
        required_fields = ['url', 'name', 'address', 'open']
        
        # Validate required fields
        for field in required_fields:
            if not data.get(field):
                logger.error(f'Missing required field: {field}')
                return jsonify({"message": f"Missing required field: {field}"}), 400

        # Check if listing URL already exists
        if listings_collection.find_one({"url": data.get('url')}):
            logger.error(f'Listing with url {data.get("url")} already exists')
            return jsonify({"message": "Listing URL already exists"}), 400

        # Process and compress photos
        photos = data.get('photos', [])
        compressed_photos = [compress_image(photo) for photo in photos]

        # Create listing document
        listing_doc = {
            "url": data.get('url'),
            "name": data.get('name'),
            "address": data.get('address'),
            "description": data.get('description', ''),
            "photos": compressed_photos,
            "open": data.get('open', False)
        }

        listings_collection.insert_one(listing_doc)
        logger.info(f'Listing {data.get("url")} created successfully')
        return jsonify({"message": "Listing created successfully"}), 200
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500

@bp.route("/listing/update", methods=["POST"])
@login_required
def update_listing():
    try:
        data = request.get_json()
        listing_url = data.get('url')

        if not listing_url:
            logger.error('Missing listing URL')
            return jsonify({"message": "Missing listing URL"}), 400

        # Check if listing exists
        existing_listing = listings_collection.find_one({"url": listing_url})
        if not existing_listing:
            logger.error(f'Listing with URL {listing_url} not found')
            return jsonify({"message": "Listing not found"}), 404

        # Process and compress photos
        photos = data.get('photos', [])
        compressed_photos = [compress_image(photo) for photo in photos]

        # Update listing document
        update_data = {
            "name": data.get('name'),
            "address": data.get('address'),
            "description": data.get('description', ''),
            "photos": compressed_photos,
            "open": data.get('open', False)
        }

        listings_collection.update_one(
            {"url": listing_url},
            {"$set": update_data}
        )
        logger.info(f'Listing {listing_url} updated successfully')
        return jsonify({"message": "Listing updated successfully"}), 200
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500

@bp.route("/listing/delete", methods=["POST"])
@login_required
def delete_listing():
    try:
        data = request.get_json()
        listing_url = data.get('url')

        if not listing_url:
            logger.error('Missing listing URL')
            return jsonify({"message": "Missing listing URL"}), 400

        result = listings_collection.delete_one({"url": listing_url})
        
        if result.deleted_count > 0:
            logger.info(f'Listing {listing_url} deleted successfully')
            return jsonify({"message": "Listing deleted successfully"}), 200
        else:
            logger.error(f'Listing with URL {listing_url} not found')
            return jsonify({"message": "Listing not found"}), 404
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500

@bp.route("/listing/get", methods=["GET"])
@login_required
def get_listings():
    try:
        listings = list(listings_collection.find({}, {"_id": 0}))
        return jsonify(listings)
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500
    
@bp.route("/listing/get-credentials/<listing_url>", methods=["POST"])
def get_credentials(listing_url):
    existing_listing = listings_collection.find_one({"url": listing_url})
    if not existing_listing:
        logger.error(f'Listing with URL {listing_url} not found')
        return jsonify({"message": "Listing not found"}), 404
    
    results = users_collection.find({"listing_url": listing_url}, {"username": 1, "password": 1, "_id": 0})
    if not results:
        logger.error(f'Viewer for listing with URL {listing_url} not found')
        return jsonify({"message": "No viewer account found for that listing"}), 404
    
    existing_viewers = [viewer for viewer in results]
    return jsonify(existing_viewers), 200