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
    logout_user()
    session.pop('user_type', None)
    return jsonify({"message": "Logout successful"})