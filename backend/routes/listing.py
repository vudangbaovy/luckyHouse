from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
import os, sys
current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
sys.path.append(parent)
from db import MongoConnector
import logging

logger = logging.getLogger('lucky_house')
mongoClient = MongoConnector()
bp = Blueprint('listing', __name__)

listings_collection = mongoClient.get_collection('listings')

@bp.route("/<url_token>", methods=["GET"])
def get_public_listing(url_token):
    """Get basic listing information for public view."""
    try:
        listing = listings_collection.find_one(
            {"url": url_token},
            {"_id": 0, "name": 1, "photos": {"$slice": 1}}  # Only return first photo
        )
        
        if not listing:
            logger.error(f'Listing with token {url_token} not found')
            return jsonify({"message": "Listing not found"}), 404
            
        # Return limited listing information
        return jsonify({
            "name": listing.get("name"),
            "preview_photo": listing.get("photos", [])[0] if listing.get("photos") else None
        })
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500

@bp.route("/<url_token>/details", methods=["GET"])
@login_required
def get_listing_details(url_token):
    """Get full listing details for authenticated viewers."""
    try:
        # Check if the user has access to this listing
        if current_user.user_type not in ['admin', 'viewer']:
            logger.error(f'User {current_user.username} does not have permission to view listings')
            return jsonify({"message": "Unauthorized"}), 403
            
        listing = listings_collection.find_one({"url": url_token}, {"_id": 0})
        if not listing:
            logger.error(f'Listing with token {url_token} not found')
            return jsonify({"message": "Listing not found"}), 404
            
        # For viewers, check if they have access to this specific listing
        if current_user.user_type == 'viewer':
            if not hasattr(current_user, 'listing_url') or current_user.listing_url != listing['id']:
                logger.error(f'Viewer {current_user.username} does not have access to listing {listing["id"]}')
                return jsonify({"message": "Unauthorized"}), 403
                
        return jsonify(listing)
    except Exception as e:
        logger.error(f'An error occurred: {e}')
        return jsonify({"message": "An error occurred"}), 500 