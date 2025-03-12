from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, TextAreaField, DecimalField, IntegerField, SelectField, BooleanField
from wtforms.validators import DataRequired, Length, NumberRange, Optional

class InventoryAddForm(FlaskForm):
    # Basic Information
    name = StringField('Product Name', validators=[
        DataRequired(),
        Length(min=2, max=100)
    ])
    
    sku = StringField('SKU', validators=[
        DataRequired(),
        Length(min=2, max=50)
    ])
    
    category = SelectField('Category', validators=[DataRequired()])
    
    brand = StringField('Brand', validators=[
        Length(max=50),
        Optional()
    ])
    
    description = TextAreaField('Description', validators=[
        Length(max=500),
        Optional()
    ])
    
    # Pricing & Inventory
    cost_price = DecimalField('Cost Price', validators=[
        DataRequired(),
        NumberRange(min=0)
    ])
    
    mrp = DecimalField('MRP', validators=[
        DataRequired(),
        NumberRange(min=0)
    ])
    
    price = DecimalField('Selling Price', validators=[
        DataRequired(),
        NumberRange(min=0)
    ])
    
    tax_rate = DecimalField('Tax Rate', validators=[
        NumberRange(min=0, max=100),
        Optional()
    ], default=18)
    
    discount = DecimalField('Discount', validators=[
        NumberRange(min=0, max=100),
        Optional()
    ], default=0)
    
    profit_margin = DecimalField('Profit Margin', validators=[
        Optional()
    ])
    
    quantity = IntegerField('Stock Quantity', validators=[
        DataRequired(),
        NumberRange(min=0)
    ])
    
    low_stock_threshold = IntegerField('Low Stock Threshold', validators=[
        NumberRange(min=0),
        Optional()
    ], default=10)
    
    # Barcode Information
    barcode = StringField('Barcode', validators=[
        DataRequired(),
        Length(min=8, max=13)
    ])
    
    barcode_type = SelectField('Barcode Type', choices=[
        ('EAN-13', 'EAN-13'),
        ('UPC-A', 'UPC-A'),
        ('CODE128', 'CODE128'),
        ('CODE39', 'CODE39')
    ], default='EAN-13')
    
    # Product Images
    image = FileField('Image', validators=[
        FileAllowed(['jpg', 'jpeg', 'png'], 'Images only!'),
        Optional()
    ])
    
    # Additional Information
    weight = DecimalField('Weight', validators=[
        NumberRange(min=0),
        Optional()
    ])
    
    length = DecimalField('Length', validators=[
        NumberRange(min=0),
        Optional()
    ])
    
    width = DecimalField('Width', validators=[
        NumberRange(min=0),
        Optional()
    ])
    
    height = DecimalField('Height', validators=[
        NumberRange(min=0),
        Optional()
    ])
    
    is_active = BooleanField('Active', default=True)
    
    notes = TextAreaField('Notes', validators=[
        Length(max=500),
        Optional()
    ]) 