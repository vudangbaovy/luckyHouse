from flask import Flask, request, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_session import Session
from flask_wtf.csrf import CSRFProtect
import configparser
import os

user_types = ['admin', 'customer', 'tenant']

config = configparser.ConfigParser()
config.read(os.path.abspath(os.path.join(".ini")))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Enable CORS for all routes

# SQLite database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
app.config["SECRET_KEY"] = config.get('CONNECTION', 'SECRET_KEY')
# Session configuration
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
csrf = CSRFProtect(app)
Session(app)
bcrypt = Bcrypt(app)
db = SQLAlchemy()

login_manager = LoginManager()
login_manager.init_app(app)

class Users(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # first_name = db.Column(db.String(250))
    # last_name = db.Column(db.String(250))
    username = db.Column(db.String(250), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)
    user_type = db.Column(db.String(250), nullable=False)

db.init_app(app)

# Create database within app context:
with app.app_context():
    db.create_all()

# "user loader" callback that returns a User object given a user id (Flask-Login)
@login_manager.user_loader
def loader_user(user_id):
    return Users.query.get(user_id)

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Unauthorized"}), 401

# Privileged to only admins
@app.route("/user/create", methods=["POST"])
@login_required
def create():
    if session.get('user_type') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    if Users.query.filter_by(username=data.get('username')).first():
        return jsonify({"message": "User already exists"})
    if data.get('user_type') not in user_types:
        return jsonify({"message": "Invalid user type"})
    user = Users(username=data.get('username'), password=bcrypt.generate_password_hash(data.get('password')).decode('utf-8'), user_type=data.get('user_type'))
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created successfully"})

@app.route("/user/update", methods=["POST"])
@login_required
def update_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user_type = data.get('user_type')

    user = Users.query.filter_by(username=username).first()
    if user:
        user.password = bcrypt.generate_password_hash(password).decode('utf-8')
        user.user_type = user_type if user_type in user_types else user.user_type
        # user.first_name = data.get('first_name') if data.get('first_name') else 'N/A'
        # user.last_name = data.get('last_name') if data.get('last_name') else 'N/A'
        db.session.commit()
        return "User updated successfully"
    return "User does not exist"

@app.route("/user/delete", methods=["POST"])
@login_required
def delete_user():
    data = request.get_json()
    username = data.get('username')
    user = Users.query.filter_by(username=username).first()
    if user:
        db.session.delete(user)
        db.session.commit()
        return "User deleted successfully"
    return "User does not exist"

@app.route("/user/get", methods=["GET"])
@login_required
def get_users():
    users = Users.query.all()
    return jsonify([{"id": user.id, "username": user.username, "user_type": user.user_type} for user in users])

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    user = Users.query.filter_by(username=data.get('username')).first()
    if user and bcrypt.check_password_hash(user.password, data.get('password')):
        login_user(user)
        session['user_type'] = user.user_type
        return jsonify({"message": "Login successful"})
    return jsonify({"message": "Invalid credentials"}), 401

@app.route("/api/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    session.pop('user_type', None)
    return jsonify({"message": "Logout successful"})

@app.route("/")
def index():
    if not session.get('username'):
        return redirect(url_for('login'))
    return app.send_static_file('index.html')
    
@app.errorhandler(404)   
def not_found(e):   
  return app.send_static_file('index.html')

if __name__ == "__main__":
    app.run(debug=True, port=8000)