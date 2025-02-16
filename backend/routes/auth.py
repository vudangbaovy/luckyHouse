from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_login import login_required, login_user, logout_user
from models import Users

bcrypt = Bcrypt()
bp = Blueprint('auth', __name__, url_prefix="/auth")
logged_in = False

@bp.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "GET":
        return jsonify({"message": "Please login"})
    
    data = request.get_json()
    user = Users.query.filter_by(username=data.get('username')).first()

    if user:
        if user.verify_password(data.get('password')):
            login_user(user, remember=True)
            session['user_type'] = user.user_type
            session.modified = True
            print(f'{user.user_type} logged in with session {session}')
            global logged_in
            logged_in = True
            return jsonify({"message": "Login successful", "user_type": user.user_type}), 200
        else:
            return jsonify({"message": "Incorrect password"}), 401
    return jsonify({"message": "Invalid credentials, user not found"}), 401

@bp.route("/logout", methods=["POST"])
@login_required
def logout():
    print(f'{session.get("user_type")} logged out with session {session}')
    logout_user()
    global logged_in
    logged_in = False
    return jsonify({"message": "Logout successful"}), 200

@bp.route('/user', methods=["GET"])
@login_required
def get_type():
    user_type = session.get('user_type')
    print(f'{user_type} checked session {session}')

    if not user_type:
        return jsonify({"error": "Credentials not found"}), 404
    
    return jsonify({"user_type": session.get('user_type')})

@bp.route('/check', methods=["GET"])
def check_login():
    return jsonify({"logged_in": logged_in})