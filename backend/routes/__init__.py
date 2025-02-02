from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_session import Session
from config import Config
from models import db
from routes.auth import bp as auth_bp
from routes.admin import bp as admin_bp
from models import Users

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Setup extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
Session(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

@login_manager.user_loader
def loader_user(id):
    return Users.query.get(int(id))

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Unauthorized"}), 401

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)

# Create database tables
with app.app_context():
    db.create_all()