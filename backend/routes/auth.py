from flask import Blueprint, redirect, request, jsonify, session, url_for
from flask_login import login_user, logout_user, login_required
from flask_bcrypt import Bcrypt
from models import Users

bcrypt = Bcrypt()
bp = Blueprint('auth', __name__, url_prefix="/api")

@bp.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "GET":
        return jsonify({"message": "Please login"})
    
    data = request.get_json()
    user = Users.query.filter_by(username=data.get('username')).first()
    if user and user.verify_password(data.get('password')):
        logged = login_user(user, remember=True)
        session['user_type'] = user.user_type
        if logged and user.user_type == 'admin':
            print('Admin logged in')
            print(session)
            return jsonify({"message": "Login successful", "user_type": user.user_type})
    return jsonify({"message": "Invalid credentials"}), 401

@bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logged_out = logout_user()
    if logged_out:
        return jsonify({"message": "Logout successful"}), 200
    return jsonify({"message": "Logout failed"}), 400

@bp.route('/check_user', methods=["GET"])
def check_user():
    if session.get('user_type'):
        return jsonify({"user_type": session.get('user_type')})
    return jsonify({"user_type": "guest"})