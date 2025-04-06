"""Utility functions for handling versioned static URLs"""

import os
import hashlib
from flask import url_for

def get_file_hash(filepath):
    """Calculate hash of file contents for versioning"""
    if not os.path.exists(filepath):
        return ''
    
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read(65536)  # Read in 64kb chunks
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(65536)
    return hasher.hexdigest()[:8]

def versioned_url_for(endpoint, **values):
    """Generate URL with version hash for static assets"""
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(os.path.dirname(__file__), '..', 'static', filename)
            file_hash = get_file_hash(file_path)
            if file_hash:
                values['v'] = file_hash
    return url_for(endpoint, **values)