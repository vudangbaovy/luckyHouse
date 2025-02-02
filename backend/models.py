from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import (
    check_password_hash, 
    generate_password_hash
)

db = SQLAlchemy()

class Users(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(250), unique=True, nullable=False)
    password_hash = db.Column(db.String(250), nullable=False)
    user_type = db.Column(db.String(250), nullable=False)  # 'admin', 'customer', 'tenant'

    # Optional attributes
    first_name = db.Column(db.String(250))
    last_name = db.Column(db.String(250))
    email = db.Column(db.String(250))
    phone = db.Column(db.String(250))
    # Add field that links to property once becomes tenant

    @property
    def password(self):
        raise AttributeError('writeonly attr: password')
    
    @password.setter
    def password(self, value):
        self.password_hash = generate_password_hash(value)

    def verify_password(self, value):
        return check_password_hash(self.password_hash, value)