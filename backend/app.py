from routes import app
import logging
from logging.handlers import RotatingFileHandler
import os

# Set up logging
log_dir = 'logs'
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

formatter = logging.Formatter(
    '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
)

file_handler = RotatingFileHandler(
    os.path.join(log_dir, 'lucky_house.log'), 
    maxBytes=10000000,  # 10MB
    backupCount=5
)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.DEBUG)

logger = logging.getLogger('lucky_house')
logger.addHandler(file_handler)
logger.addHandler(console_handler)
logger.setLevel(logging.DEBUG)

if __name__ == "__main__":
    app.run(debug=True, port=8000)