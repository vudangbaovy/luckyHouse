import secrets
import string
import base64
from io import BytesIO
from PIL import Image
import logging
logger = logging.getLogger('lucky_house')

def generate_secure_token(length=32):
    """Generate a secure random token for URLs."""
    return secrets.token_urlsafe(length)

def generate_viewer_credentials(listing_url):
    """Generate a username and password for a viewer."""
    # Generate a readable but random username based on listing ID
    random_suffix = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(4))
    username = f"viewer_{listing_url}_{random_suffix}"
    
    # Generate a secure random password
    password = ''.join(secrets.choice(string.ascii_letters + string.digits + string.punctuation) for _ in range(12))
    
    return username, password 

def compress_image(base64_string, max_size_kb=500):
    try:
        # Remove the data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Convert base64 to image
        image_data = base64.b64decode(base64_string)
        img = Image.open(BytesIO(image_data))
        
        # Convert to RGB if image is in RGBA mode
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # Initial quality
        quality = 95
        output = BytesIO()
        
        # Compress until size is under max_size_kb
        while True:
            output.seek(0)
            output.truncate()
            img.save(output, format='JPEG', quality=quality, optimize=True)
            size_kb = len(output.getvalue()) / 1024
            
            if size_kb <= max_size_kb or quality <= 5:
                break
                
            quality -= 5
        
        # Convert back to base64
        compressed_base64 = base64.b64encode(output.getvalue()).decode('utf-8')
        return f"data:image/jpeg;base64,{compressed_base64}"
    except Exception as e:
        logger.error(f'Error compressing image: {e}')
        return base64_string