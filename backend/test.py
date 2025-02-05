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
    tenant = Users(username='tenant', password='tenant', user_type='tenant')
    viewer = Users(username='viewer', password='viewer', user_type='viewer')
    db.session.add(admin)
    db.session.add(tenant)
    db.session.add(viewer)

    db.session.commit()
    print('Admin, tenant, viewer created successfully')
    rows = db.session.query(Users).all()
    print([row.id for row in rows])