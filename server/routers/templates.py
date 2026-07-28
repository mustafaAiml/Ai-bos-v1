from typing import List, Dict
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/templates", tags=["Industry Category Template Engine"])

class CategoryTemplate(BaseModel):
    category_id: str
    display_name: str
    description: str
    business_complexity: str
    custom_units: List[str]
    size_variants_enabled: bool
    expiry_tracking_enabled: bool
    batch_tracking_enabled: bool
    dimension_calc_enabled: bool
    sample_products: List[Dict]

TEMPLATES_DB: Dict[str, CategoryTemplate] = {
    "fmcg_kirana": CategoryTemplate(
        category_id="fmcg_kirana",
        display_name="Grocery & Kirana Store",
        description="Fast FMCG voice billing, loose weight units (kg, g, L), wholesale bill OCR import.",
        business_complexity="fmcg_kirana",
        custom_units=["kg", "gm", "litre", "packet", "box", "bottle", "piece"],
        size_variants_enabled=False,
        expiry_tracking_enabled=True,
        batch_tracking_enabled=False,
        dimension_calc_enabled=False,
        sample_products=[
            {"name": "Aashirvaad Shudh Chakki Atta 5kg", "category": "Grocery & Staples", "cost": 210, "price": 245, "unit": "packet", "stock": 25},
            {"name": "Fortune Sunlite Sunflower Oil 1L", "category": "Grocery & Staples", "cost": 120, "price": 142, "unit": "bottle", "stock": 20},
            {"name": "Tata Salt Vacuum Evaporated 1kg", "category": "Grocery & Staples", "cost": 20, "price": 25, "unit": "packet", "stock": 40},
            {"name": "Thumbs Up Soft Drink 600ml", "category": "Beverages", "cost": 30, "price": 40, "unit": "bottle", "stock": 30}
        ]
    ),
    "simple_apparel": CategoryTemplate(
        category_id="simple_apparel",
        display_name="Clothing & Apparel Boutique",
        description="Clean garment catalog with size variants (S, M, L, XL, Free Size), color options, and quick non-barcode sales.",
        business_complexity="simple_apparel",
        custom_units=["piece", "pair", "set", "meter"],
        size_variants_enabled=True,
        expiry_tracking_enabled=False,
        batch_tracking_enabled=False,
        dimension_calc_enabled=False,
        sample_products=[
            {"name": "Cotton Mens Casual Shirt", "category": "Menswear", "cost": 380, "price": 599, "unit": "piece", "stock": 18},
            {"name": "Designer Georgette Saree", "category": "Womenswear", "cost": 850, "price": 1299, "unit": "piece", "stock": 12},
            {"name": "Slim Fit Denim Jeans", "category": "Menswear", "cost": 550, "price": 899, "unit": "piece", "stock": 15},
            {"name": "Kids Cotton T-Shirt Set", "category": "Kidswear", "cost": 220, "price": 350, "unit": "set", "stock": 20}
        ]
    ),
    "hardware_timber": CategoryTemplate(
        category_id="hardware_timber",
        display_name="Hardware & Building Materials / Timber",
        description="Dimension calculations (length x width x thickness), square footage, and bulk weight delivery tracking.",
        business_complexity="standard_retail",
        custom_units=["sqft", "piece", "kg", "meter", "bundle", "box"],
        size_variants_enabled=False,
        expiry_tracking_enabled=False,
        batch_tracking_enabled=False,
        dimension_calc_enabled=True,
        sample_products=[
            {"name": "Commercial Plywood 18mm (8x4)", "category": "Building Materials", "cost": 1200, "price": 1550, "unit": "piece", "stock": 30},
            {"name": "Stainless Steel Door Handles", "category": "Hardware", "cost": 150, "price": 240, "unit": "pair", "stock": 40},
            {"name": "Asian Paints Tractor Emulsion 4L", "category": "Paints & Solvents", "cost": 450, "price": 580, "unit": "box", "stock": 15}
        ]
    ),
    "medical_pharmacy": CategoryTemplate(
        category_id="medical_pharmacy",
        display_name="Pharmacy & Medical Store",
        description="Batch numbers, expiry date alerts, strip/tablet counts, and prescription note support.",
        business_complexity="standard_retail",
        custom_units=["strip", "box", "bottle", "tube", "piece"],
        size_variants_enabled=False,
        expiry_tracking_enabled=True,
        batch_tracking_enabled=True,
        dimension_calc_enabled=False,
        sample_products=[
            {"name": "Paracetamol 650mg Tablets", "category": "General Medicine", "cost": 18, "price": 30, "unit": "strip", "stock": 100},
            {"name": "Vitamin C Chewing Tablets 50s", "category": "Supplements", "cost": 110, "price": 160, "unit": "bottle", "stock": 35},
            {"name": "Antiseptic Liquid 500ml", "category": "First Aid", "cost": 85, "price": 115, "unit": "bottle", "stock": 25}
        ]
    )
}

@router.get("/list", response_model=List[CategoryTemplate])
def list_industry_templates():
    return list(TEMPLATES_DB.values())

@router.get("/get/{template_id}", response_model=CategoryTemplate)
def get_industry_template(template_id: str):
    if template_id not in TEMPLATES_DB:
        return TEMPLATES_DB["fmcg_kirana"]
    return TEMPLATES_DB[template_id]
