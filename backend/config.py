import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///db.sqlite"
    SECRET_KEY = os.getenv('SECRET_KEY')
    # Cookie settings
    REMEMBER_COOKIE_SECURE = True  # For HTTPS
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours in seconds