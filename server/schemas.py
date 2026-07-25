from typing import List, Optional, Literal
from pydantic import BaseModel, Field

# --- Speech Parsing Schemas ---
class SpeechItem(BaseModel):
    item_name: str = Field(..., description="Normalized item name")
    quantity: float = Field(default=1.0, description="Quantity of item")
    unit: str = Field(default="piece", description="Unit (piece, kg, litre, packet, gm, box, bottle)")
    unit_price: Optional[float] = Field(default=None, description="Price per unit in ₹")
    total_amount: Optional[float] = Field(default=None, description="Total amount for line item in ₹")

class SpeechParseRequest(BaseModel):
    text: str = Field(..., description="Spoken or typed input in Hindi, English, or Hinglish", example="aaj 2 kg gehu 80 me becha")
    languagePref: Optional[str] = Field(default="hinglish", description="Language preference preference")

class SpeechParseResponse(BaseModel):
    transaction_type: Literal["sale", "purchase", "unclear"] = "sale"
    detected_language: Literal["hi", "en", "hinglish"] = "hinglish"
    items: List[SpeechItem] = []
    spoken_response: str = Field(..., description="Concise audio response confirmation")
    confidence: float = Field(default=0.9, description="Parsing confidence score")


# --- Shop Search & Google Maps Verification Schemas ---
class ShopSearchRequest(BaseModel):
    query: Optional[str] = Field(default="", description="Google Maps URL or general search query")
    shop_name: Optional[str] = Field(default="", description="Name of the shop")
    city: Optional[str] = Field(default="", description="City or Town")
    area: Optional[str] = Field(default="", description="Area, Colony, or Landmark")
    pincode: Optional[str] = Field(default="", description="6-digit Indian Postal Code")

class RecommendedInventoryItem(BaseModel):
    name: str = Field(..., description="Product or item name")
    category: str = Field(..., description="Category name")
    stock: int = Field(default=10, description="Recommended initial stock quantity")
    price: float = Field(..., description="Selling price in ₹")
    cost: float = Field(..., description="Wholesale cost price in ₹")
    unit: str = Field(default="Pcs", description="Unit of measurement")

class ShopProfileResponse(BaseModel):
    name: str = Field(..., description="Store Name")
    address: str = Field(..., description="Full Address")
    city: str = Field(default="", description="City / District")
    area: str = Field(default="", description="Area / Colony / Market")
    pincode: str = Field(..., description="6-digit Pincode")
    maps_url: str = Field(..., description="Direct Google Maps URL")
    category: str = Field(..., description="Store Category")
    business_complexity: Literal["simple_apparel", "fmcg_kirana", "standard_retail"] = "standard_retail"
    complexity_reasoning: str = Field(..., description="Reasoning behind suite recommendation")
    lat: float = Field(default=19.0760, description="Latitude coordinate")
    lng: float = Field(default=72.8777, description="Longitude coordinate")
    recommended_inventory: List[RecommendedInventoryItem] = Field(default_factory=list, description="Suggested initial inventory items tailored for this store")


# --- Daily Insights Schemas ---
class DailyInsightsRequest(BaseModel):
    revenue: float = Field(default=0.0, description="Total revenue today")
    cogs: float = Field(default=0.0, description="Cost of goods sold")
    netProfit: float = Field(default=0.0, description="Net profit today")
    transactionsCount: int = Field(default=0, description="Number of sales transactions")
    topItemNames: List[str] = Field(default_factory=list, description="Top selling item names")

class DailyInsightsResponse(BaseModel):
    tips: List[str] = Field(..., description="Actionable business tips for store owner")


# --- Bill OCR Scan Schemas ---
class BillItem(BaseModel):
    item_name: str = Field(..., description="Product name")
    quantity: float = Field(default=1.0, description="Purchased quantity")
    unit: str = Field(default="piece", description="Unit")
    cost_price: float = Field(..., description="Wholesale cost price per unit in ₹")
    selling_price: Optional[float] = Field(default=None, description="Suggested selling price per unit in ₹")
    total_amount: float = Field(..., description="Line total amount in ₹")
    category: Optional[str] = Field(default="General", description="Product category")

class BillScanRequest(BaseModel):
    imageBase64: str = Field(..., description="Base64 encoded bill image string")
    mimeType: Optional[str] = Field(default="image/jpeg", description="Image MIME type")

class BillScanResponse(BaseModel):
    vendor_name: str = Field(..., description="Distributor / Wholesale dealer name")
    bill_number: Optional[str] = Field(default="INV-GEN", description="Invoice number")
    bill_date: Optional[str] = Field(default="", description="Bill date")
    items: List[BillItem] = []
    grand_total: float = Field(..., description="Grand total bill amount in ₹")
    summary_notes: str = Field(..., description="Short summary of bill")


# --- Status Schema ---
class SystemStatusResponse(BaseModel):
    status: str = "active_and_healthy"
    python_version: str
    genai_sdk_available: bool
    engine: str
    has_api_key: bool
