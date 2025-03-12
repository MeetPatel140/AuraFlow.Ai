"""
SQLAlchemy Patch for Python 3.13 on Windows
This patch fixes issues with platform.machine() causing hangs on Windows.
"""

import sys
import platform

# Save the original machine function
original_machine = platform.machine

# Define a patched version that doesn't hang
def patched_machine():
    try:
        # Try to use the original function with a timeout
        import threading
        import time
        
        result = [None]
        exception = [None]
        
        def get_machine():
            try:
                result[0] = original_machine()
            except Exception as e:
                exception[0] = e
        
        # Start thread to call original function
        thread = threading.Thread(target=get_machine)
        thread.daemon = True
        thread.start()
        
        # Wait for 1 second max
        thread.join(1.0)
        
        if thread.is_alive():
            # If it's still running after timeout, return a fallback value
            print("Warning: platform.machine() timed out, using fallback")
            if sys.platform.startswith('win'):
                return 'AMD64'  # Common on Windows
            else:
                return 'x86_64'  # Common on Unix
        
        if exception[0]:
            # If there was an exception, return fallback
            print(f"Warning: platform.machine() raised {exception[0]}, using fallback")
            if sys.platform.startswith('win'):
                return 'AMD64'
            else:
                return 'x86_64'
        
        return result[0]
    except Exception:
        # Fallback in case of any issue
        if sys.platform.startswith('win'):
            return 'AMD64'
        else:
            return 'x86_64'

# Patch the platform module
platform.machine = patched_machine

print("SQLAlchemy platform detection patched for Python 3.13") 