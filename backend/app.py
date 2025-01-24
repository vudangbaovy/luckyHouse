from flask import Flask, request, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user
from flask_bcrypt import Bcrypt
import configparser

app = Flask(__name__)
Bcrypt = Bcrypt(app)

config = configparser.ConfigParser()
config.read(os.path.abspath(os.path.join('.ini')))

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
app.config["SECRET_KEY"] = config['CONNECTION']['SECRET_KEY']
db = SQLAlchemy()

class Users(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(250), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)
    user_type = db.Column(db.String(250), nullable=False)

db.init_app(app)

# Create database within app context:
with app.app_context():
    db.create_all()

# "user loader" callback that returns a User object given a user id (Flask-Login)
@LoginManager.user_loader
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
    user = Users.query.filter_by(username=request.form.get('username')).first()
    is_valid = Bcrypt.check_password_hash(user.password, request.form.get('password'))
    if user and is_valid:
        login_user(user)
        return 0
    return 1

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route("/")
def home():
    return url_for('home')

if __name__ == "__main__":
    app.run(debug=True)