from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, username, pw, user_type, first_name=None, last_name=None, email=None, phone=None, property_id=None):
        self.username = username
        self.password_hash = pw
        self.user_type = user_type
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.phone = phone
        self.property_id = property_id
    
    def get_id(self):
        return self.username