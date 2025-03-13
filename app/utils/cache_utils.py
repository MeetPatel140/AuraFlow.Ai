import os
import hashlib
from flask import url_for

# Dictionary to store file hashes
_file_hashes = {}

def get_file_hash(filepath):
    """
    Calculate a hash of the file contents for cache busting.
    Caches results to avoid recalculating hashes.
    """
    if filepath in _file_hashes:
        return _file_hashes[filepath]
    
    try:
        abs_path = os.path.join('app/static', filepath.lstrip('/'))
        if not os.path.exists(abs_path):
            return None
        
        with open(abs_path, 'rb') as f:
            file_hash = hashlib.md5(f.read()).hexdigest()[:8]
            _file_hashes[filepath] = file_hash
            return file_hash
    except Exception as e:
        print(f"Error calculating hash for {filepath}: {e}")
        return None

def versioned_url_for(endpoint, **values):
    """
    Generate a URL with a version parameter for cache busting.
    For static files, adds a 'v' parameter with the file's hash.
    """
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_hash = get_file_hash(filename)
            if file_hash:
                values['v'] = file_hash
    
    return url_for(endpoint, **values)

def versioned_static_url(filename):
    """
    Convenience function to generate versioned URLs for static files.
    """
    return versioned_url_for('static', filename=filename) 