from flask import Blueprint, request, jsonify, session
from flask_login import login_required
from models import db, Users
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()
bp = Blueprint('admin', __name__, url_prefix="/admin")

user_types = ['admin', 'viewer', 'tenant']

def check_admin():
    if session.get('user_type') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

# Create user (Admin only)
@bp.route("/user/create", methods=["POST"])
@login_required
def create_user():
    check_admin()

    data = request.get_json()
    if Users.query.filter_by(username=data.get('username')).first():
        return jsonify({"message": "User already exists"})

    if data.get('user_type') not in user_types:
        return jsonify({"message": "Invalid user type"})

    user = Users(
        username=data.get('username'),
        password=bcrypt.generate_password_hash(data.get('password')).decode('utf-8'),
        user_type=data.get('user_type')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created successfully"})

# Update user (Admin only)
@bp.route("/user/update", methods=["POST"])
@login_required
def update_user():
    check_admin()
    
    data = request.get_json()
    username = data.get('username')
    user = Users.query.filter_by(username=username).first()

    if not user:
        return jsonify({"message": "User does not exist"})

    user.password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    user.user_type = data.get('user_type') if data.get('user_type') in user_types else user.user_type
    db.session.commit()
    return jsonify({"message": "User updated successfully"})

# Delete user (Admin only)
@bp.route("/user/delete", methods=["POST"])
@login_required
def delete_user():
    check_admin()
    
    data = request.get_json()
    username = data.get('username')
    user = Users.query.filter_by(username=username).first()

    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"})
    return jsonify({"message": "User does not exist"})

@bp.route("/user/get", methods=["GET"])
@login_required
def get_users():
    check_admin()
    users = Users.query.all()
    return jsonify([{"id": user.id, "username": user.username, "user_type": user.user_type} for user in users])