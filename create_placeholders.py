"""
Create placeholder images for the application.
This script generates placeholder images for products and other UI elements.
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont
import random

def create_directory(path):
    """Create directory if it doesn't exist."""
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Created directory: {path}")

def create_product_placeholder(output_path, size=(300, 300), bg_color=(247, 250, 252), text="Product"):
    """Create a product placeholder image."""
    img = Image.new('RGB', size, color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Draw border
    border_color = (203, 213, 224)
    border_width = 2
    draw.rectangle(
        [(border_width, border_width), (size[0] - border_width, size[1] - border_width)],
        outline=border_color,
        width=border_width
    )
    
    # Draw text
    try:
        # Try to use a system font
        font_size = 24
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        # Fallback to default font
        font_size = 24
        font = ImageFont.load_default()
    
    text_width, text_height = draw.textsize(text, font=font) if hasattr(draw, 'textsize') else (100, 20)
    position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2)
    text_color = (160, 174, 192)
    draw.text(position, text, fill=text_color, font=font)
    
    # Save the image
    img.save(output_path)
    print(f"Created placeholder image: {output_path}")

def main():
    """Main function to create all placeholder images."""
    # Base directories
    base_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(base_dir, 'app', 'static')
    images_dir = os.path.join(static_dir, 'images')
    placeholders_dir = os.path.join(images_dir, 'placeholders')
    
    # Create directories if they don't exist
    create_directory(static_dir)
    create_directory(images_dir)
    create_directory(placeholders_dir)
    
    # Create product placeholder
    product_placeholder_path = os.path.join(placeholders_dir, 'product-placeholder.jpg')
    create_product_placeholder(product_placeholder_path)
    
    print("All placeholder images created successfully!")

if __name__ == "__main__":
    main() 