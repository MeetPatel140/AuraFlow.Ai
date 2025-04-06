from app import create_app
from app.extensions import db
from sqlalchemy import inspect

app = create_app()

with app.app_context():
    inspector = inspect(db.engine)
    
    # Check if products table exists
    tables = inspector.get_table_names()
    print("Tables in database:", tables)
    
    if 'products' in tables:
        # Get columns in products table
        columns = inspector.get_columns('products')
        print(f"Number of columns in products table: {len(columns)}")
        
        # Print all columns
        for i, col in enumerate(columns, 1):
            print(f"{i}. {col['name']}")
    else:
        print("Products table does not exist") 