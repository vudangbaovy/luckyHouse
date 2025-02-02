# Script to delete all users and create a new admin user
from models import db, Users
from flask_bcrypt import Bcrypt
from app import app

with app.app_context():
    bcrypt = Bcrypt()
    db.drop_all()
    db.create_all()
    db.session.commit()

    admin = Users(username='admin', password='admin', user_type='admin')
    db.session.add(admin)

    db.session.commit()
    print('Admin user created successfully')