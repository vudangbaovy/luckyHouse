import configparser
import os

config = configparser.ConfigParser()
config.read(os.path.abspath(os.path.join(".ini")))

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///db.sqlite"
    SECRET_KEY = config.get('CONNECTION', 'SECRET_KEY')
    SESSION_PERMANENT = False
    SESSION_TYPE = "filesystem"
    SESSION_COOKIE_SAMESITE = "None"