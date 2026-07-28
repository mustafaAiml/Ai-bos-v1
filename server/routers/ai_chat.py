import json
import sys
from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field
from server.config import get_genai_client

router = APIRouter(prefix="/api/ai", tags=["Generative AI Contextual Assistant"])

class ChatMessage(BaseModel):
    role: str = Field(..., description="user | assistant")
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = Field(default_factory=list)
    context: Optional[dict] = Field(default_factory=dict, description="Active shop, inventory, and sales context")

class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []

@router.post("/chat", response_model=AIChatResponse)
def ai_chat(body: AIChatRequest):
    message = body.message.strip()
    ctx = body.context or {}
    shop = ctx.get("shop", {})
    inventory = ctx.get("inventory", [])
    transactions = ctx.get("transactions", [])

    sales_txs = [t for t in transactions if t.get("type") == "sale"]
    today_revenue = sum(t.get("totalAmount", 0) for t in sales_txs)
    today_profit = sum(t.get("netProfit", 0) for t in sales_txs)

    client = get_genai_client()
    if client:
        try:
            from google.genai import types
            prompt = f"""
You are the AI BOS Senior Business Consultant & Store AI Assistant for:
- Store Name: {shop.get('name', 'Indian Retail Store')}
- Category: {shop.get('category', 'Kirana & Retail')}
- Current Performance Today: Revenue ₹{today_revenue}, Net Profit ₹{today_profit}, Inventory Items {len(inventory)}, Sales Transactions {len(sales_txs)}.

USER MESSAGE: "{message}"

Respond as an expert, friendly, direct Indian business consultant in clear Hinglish/English. Answer precisely using the store data. Provide 2 short actionable follow-up questions or suggestions.
Return JSON:
{{
  "reply": "Your clear response here...",
  "suggested_actions": ["Show Low Stock Items", "Generate Profit Report", "Check Udhaar Ledger"]
}}
"""
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            if response and response.text:
                parsed = json.loads(response.text)
                return AIChatResponse(
                    reply=parsed.get("reply", "I am analyzing your business data."),
                    suggested_actions=parsed.get("suggested_actions", ["Check Low Stock", "View Daily Summary"])
                )
        except Exception as e:
            sys.stderr.write(f"AI Chat error: {e}\n")

    # Smart fallback
    msg_lower = message.lower()
    if "profit" in msg_lower or "revenue" in msg_lower or "sale" in msg_lower:
        reply = f"Today's recorded sales revenue is ₹{today_revenue:,.2f} with a net profit of ₹{today_profit:,.2f} across {len(sales_txs)} transactions."
    elif "reorder" in msg_lower or "stock" in msg_lower or "inventory" in msg_lower:
        low_items = [i.get('name') for i in inventory if i.get('stockQuantity', 0) <= i.get('lowStockThreshold', 5)]
        if low_items:
            reply = f"You have {len(low_items)} items requiring urgent reorder: {', '.join(low_items[:5])}."
        else:
            reply = f"Your store inventory is healthy. Currently tracking {len(inventory)} total product items."
    else:
        reply = f"Hello! I am your AI BOS Business Operating System Assistant for {shop.get('name', 'your store')}. I am tracking your sales, stock levels, wholesale bills, and credit ledger in real time."

    return AIChatResponse(
        reply=reply,
        suggested_actions=["Check Low Stock", "Generate Daily Report", "Review Udhaar Ledger"]
    )
