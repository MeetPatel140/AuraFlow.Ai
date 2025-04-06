import os
import requests
import shutil
from pathlib import Path

# Create vendor directories if they don't exist
vendor_dirs = {
    'css': 'app/static/vendor/css',
    'js': 'app/static/vendor/js',
    'fonts': 'app/static/vendor/fonts'
}

for dir_path in vendor_dirs.values():
    Path(dir_path).mkdir(parents=True, exist_ok=True)

# Files to download
files_to_download = {
    # CSS files
    'css': {
        'bootstrap.min.css': 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        'materialdesignicons.min.css': 'https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css',
        'all.min.css': 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
        'chart.min.css': 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.css'
    },
    # JavaScript files
    'js': {
        'bootstrap.bundle.min.js': 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
        'chart.min.js': 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js',
        'jsbarcode.all.min.js': 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js',
        'filepond.min.js': 'https://unpkg.com/filepond/dist/filepond.min.js',
        'filepond-plugin-file-encode.min.js': 'https://unpkg.com/filepond-plugin-file-encode/dist/filepond-plugin-file-encode.min.js',
        'filepond-plugin-file-validate-type.min.js': 'https://unpkg.com/filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.min.js',
        'filepond-plugin-image-exif-orientation.min.js': 'https://unpkg.com/filepond-plugin-image-exif-orientation/dist/filepond-plugin-image-exif-orientation.min.js',
        'filepond-plugin-image-preview.min.js': 'https://unpkg.com/filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.js',
        'filepond-plugin-image-edit.min.js': 'https://unpkg.com/filepond-plugin-image-edit/dist/filepond-plugin-image-edit.min.js',
        'filepond-plugin-image-transform.min.js': 'https://unpkg.com/filepond-plugin-image-transform/dist/filepond-plugin-image-transform.min.js',
        'filepond-plugin-file-poster.min.js': 'https://unpkg.com/filepond-plugin-file-poster/dist/filepond-plugin-file-poster.min.js'
    }
}

# Download files
for category, files in files_to_download.items():
    for filename, url in files.items():
        print(f"Downloading {filename}...")
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            filepath = os.path.join(vendor_dirs[category], filename)
            with open(filepath, 'wb') as f:
                response.raw.decode_content = True
                shutil.copyfileobj(response.raw, f)
            print(f"Successfully downloaded {filename}")
        except Exception as e:
            print(f"Error downloading {filename}: {str(e)}")

# Download fonts
font_urls = {
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
}

for font_name, url in font_urls.items():
    print(f"Downloading {font_name} font...")
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Extract the font URLs from the CSS
        css_content = response.text
        font_urls = [url for url in css_content.split('url(') if 'woff2' in url]
        
        for font_url in font_urls:
            font_url = font_url.split(')')[0].strip('"')
            font_filename = font_url.split('/')[-1]
            
            font_response = requests.get(font_url, stream=True)
            font_response.raise_for_status()
            
            filepath = os.path.join(vendor_dirs['fonts'], font_filename)
            with open(filepath, 'wb') as f:
                font_response.raw.decode_content = True
                shutil.copyfileobj(font_response.raw, f)
            print(f"Successfully downloaded {font_filename}")
    except Exception as e:
        print(f"Error downloading {font_name} font: {str(e)}")

print("Download process completed!") 