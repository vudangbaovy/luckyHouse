from flask import Flask, request, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import insert
from flask_login import LoginManager, UserMixin, login_user, logout_user
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import configparser
import os
import jsonify

config = configparser.ConfigParser()
config.read(os.path.abspath(os.path.join(".ini")))

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
app.config["SECRET_KEY"] = config.get('CONNECTION', 'SECRET_KEY', fallback='default_secret_key')
Bcrypt = Bcrypt(app)
CORS(app, resources={r"/*": {"origins": "*"}})
db = SQLAlchemy()

login_manager = LoginManager()
login_manager.init_app(app)

class Users(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(250), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)
    user_type = db.Column(db.String(250), nullable=False)

db.init_app(app)

# Create database within app context:
with app.app_context():
    db.create_all()

# Inject different user types into the database
def create_user_types():
    landlord = Users(username='landlord', password='landlord', user_type='admin')
    tenant = Users(username='tenant', password='tenant', user_type='tenant')
    customer = Users(username='customer', password='customer', user_type='customer')

    commit = True
    if Users.query.filter_by(username='landlord').first() is None:
        db.session.add(landlord)
        print('landlord added')
    else:
        print('landlord already exists')
        commit = False
    if Users.query.filter_by(username='tenant').first() is None:
        db.session.add(tenant)
        print('tenant added')
    else:
        print('tenant already exists')
        commit = False
    if Users.query.filter_by(username='customer').first() is None:
        db.session.add(customer)
        print('customer added')
    else:
        print('customer already exists')
        commit = False
    if commit:
        db.session.commit()

# "user loader" callback that returns a User object given a user id (Flask-Login)
@login_manager.user_loader
def loader_user(user_id):
    return Users.query.get(user_id)

# Priviledged to only admins
@app.route("/create", methods=["POST", "GET"])
def create():
    username = request.form.get('username')
    password = request.form.get('password')
    hashed_password = Bcrypt.generate_password_hash(password).decode('utf-8')
    user_type = request.form.get('user_type')
    user = Users(username=username, password=hashed_password, user_type=user_type)
    db.session.add(user)
    db.session.commit()
    return 0

@app.route("/login", methods=["POST", "GET"])
def login():
    print('here')
    user = Users.query.filter_by(username=request.form.get('username')).first()
    is_valid = Bcrypt.check_password_hash(user.password, request.form.get('password'))
    if user and is_valid:
        login_user(user)
        return jsonify({"message": "Login successful"})
    return jsonify({"message": "Invalid credentials"}), 401

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route("/")
def home():
    return url_for('home')

if __name__ == "__main__":
    # with app.app_context():
    #     create_user_types()
    app.run(debug=True, port=5000)