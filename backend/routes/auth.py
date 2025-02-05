from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_login import login_required, login_user, logout_user
from models import Users

bcrypt = Bcrypt()
bp = Blueprint('auth', __name__, url_prefix="/auth")

@bp.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "GET":
        return jsonify({"message": "Please login"})
    
    data = request.get_json()
    user = Users.query.filter_by(username=data.get('username')).first()

    if user and user.verify_password(data.get('password')):
        login_user(user, remember=True)
        session['user_type'] = user.user_type
        session.modified = True
        print(f'{user.user_type} logged in with session {session}')
        return jsonify({"message": "Login successful", "user_type": user.user_type})
        
    return jsonify({"message": "Invalid credentials"}), 401

@bp.route("/logout", methods=["POST"])
@login_required
def logout():
    print(f'{session.get("user_type")} logged out with session {session}')
    logout_user()
    return jsonify({"message": "Logout successful"}), 200