from flask_login import UserMixin, AnonymousUserMixin

class User(UserMixin):
    def __init__(self, username, pw, user_type, first_name=None, last_name=None, email=None, phone=None, listing_url=None):
        self.username = username
        self.password_hash = pw
        self.user_type = user_type
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.phone = phone
        self.listing_url = listing_url
    
    def get_id(self):
        return self.username
    
    @property
    def is_viewer(self):
        return self.user_type == "viewer"

    @property
    def is_admin(self):
        return self.user_type == "admin"

    def can_view_listing(self, listing_url):
        """Check if user has permission to view a specific listing"""
        if self.is_admin:
            return True
        if self.is_viewer and self.listing_url == listing_url:
            return True
        return False

class Viewer(AnonymousUserMixin):
    def __init__(self):
        self.username = None
        self.user_type = None
        self.listing_url = None
    
    def get_id(self):
        return None
    
    @property
    def is_viewer(self):
        return False

    @property
    def is_admin(self):
        return False

    def can_view_listing(self, listing_url):
        return False