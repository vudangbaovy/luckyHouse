import os
import pymongo
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///db.sqlite"
    SECRET_KEY = os.getenv('SECRET_KEY')
    SESSION_PERMANENT = True
    SESSION_TYPE = 'mongodb'
    SESSION_MONGODB = pymongo.MongoClient(os.getenv('MONGO_URI'))
    SESSION_USE_SIGNER = True
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_PATH = '/'
    SESSION_COOKIE_SECURE = True