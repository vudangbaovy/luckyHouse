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

@bp.route("/register", methods=["POST"])
def register():
    try:
        collection = mongoClient.get_collection("users")
        data = request.get_json()

        if collection.find_one({"username": str(data["username"])}):
            logger.error(f'Username {data["username"]} already exists')
            return jsonify({"message": "Username already exists"}), 400
        
        data["password_hash"] = generate_password_hash(data["password"])
        data.pop("password")

        if "user_type" not in data:
            data["user_type"] = "viewer"

        collection.insert_one(data)
        logger.info(f'User {data["username"]} registered')

        return jsonify({"message": "User registered successfully"}), 200
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        return jsonify({"message": "An error occurred"}), 500

@bp.route("/login", methods=["POST"])
def login():
    try:
        collection = mongoClient.get_collection("users")
        data = request.get_json()
        user = collection.find_one({"username": str(data["username"])})

        if user:
            if not check_password_hash(user["password_hash"], data["password"]):
                logger.error(f'Incorrect password for {data["username"]}')
                return jsonify({"message": "Incorrect password"}), 401

            currUser = User(username=user["username"], pw=user["password_hash"], user_type=user["user_type"], first_name=user.get("first_name"), last_name=user.get("last_name"), email=user.get("email"), phone=user.get("phone"), listing_url=user.get("listing_url"))
            login_user(currUser, remember=True)
            return jsonify({"message": "Login successful"}), 200
        else:
            logger.error(f'Username {data["username"]} not found')
            return jsonify({"message": "Username not found"}), 401
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        return jsonify({"message": "An error occurred"}), 500

@bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    logger.info('User logged out')
    return jsonify({"message": "Logout successful"}), 200

@bp.route('/user', methods=["GET"])
def get_type():
    if not current_user.is_authenticated:
        logger.error('User not authenticated')
        return jsonify({"error": "Not authenticated"}), 401
        
    return jsonify({
        "user_type": current_user.user_type,
        "logged_in": True
    }), 200