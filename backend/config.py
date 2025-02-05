import configparser
import os
import redis

config = configparser.ConfigParser()
config.read(os.path.abspath(os.path.join(".ini")))

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///db.sqlite"
    SECRET_KEY = config.get('CONNECTION', 'SECRET_KEY')
    SESSION_PERMANENT = True
    SESSION_TYPE = 'redis'
    SESSION_USE_SIGNER = True
    SESSION_REDIS = redis.from_url('redis://127.0.0.1:6379')
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_PATH = '/'
    SESSION_COOKIE_SECURE = True