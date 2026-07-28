import time
from typing import List, Dict, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/reports", tags=["Enterprise Reports & Export Engine"])

class GenerateReportRequest(BaseModel):
    report_type: str = Field("sales_summary", description="sales_summary | profit_loss | inventory_valuation | udhaar_ledger | expense_breakdown")
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    transactions: List[dict] = []
    inventory: List[dict] = []
    customers: List[dict] = []

@router.post("/generate")
def generate_business_report(body: GenerateReportRequest):
    txs = body.transactions
    inv = body.inventory
    custs = body.customers

    sales_txs = [t for t in txs if t.get("type") == "sale"]
    purchase_txs = [t for t in txs if t.get("type") == "purchase"]

    total_revenue = sum(t.get("totalAmount", 0) for t in sales_txs)
    total_cogs = sum(t.get("totalCost", 0) for t in sales_txs)
    net_profit = total_revenue - total_cogs
    profit_margin_pct = round((net_profit / total_revenue) * 100, 1) if total_revenue > 0 else 0.0

    total_stock_value = sum(i.get("stockQuantity", 0) * i.get("costPrice", 0) for i in inv)
    total_retail_value = sum(i.get("stockQuantity", 0) * i.get("sellingPrice", 0) for i in inv)

    total_udhaar_receivable = sum(c.get("totalOwed", 0) for c in custs if c.get("totalOwed", 0) > 0)

    summary_bullets = [
        f"Generated {body.report_type.replace('_', ' ').title()} Report on {time.strftime('%Y-%m-%d %H:%M')}",
        f"Total Revenue Recorded: ₹{total_revenue:,.2f} across {len(sales_txs)} sales transactions",
        f"Cost of Goods Sold (COGS): ₹{total_cogs:,.2f}",
        f"Net Operating Profit: ₹{net_profit:,.2f} (Profit Margin: {profit_margin_pct}%)",
        f"Total Inventory Valuation (Cost): ₹{total_stock_value:,.2f} (Retail Value: ₹{total_retail_value:,.2f})",
        f"Outstanding Udhaar Receivable: ₹{total_udhaar_receivable:,.2f} across {len([c for c in custs if c.get('totalOwed', 0) > 0])} credit customers"
    ]

    return {
        "success": True,
        "report_id": f"rep_{int(time.time())}",
        "report_type": body.report_type,
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "metrics": {
            "total_revenue": total_revenue,
            "total_cogs": total_cogs,
            "net_profit": net_profit,
            "profit_margin_pct": profit_margin_pct,
            "total_stock_value": total_stock_value,
            "total_retail_value": total_retail_value,
            "total_udhaar_receivable": total_udhaar_receivable,
            "sales_count": len(sales_txs),
            "purchases_count": len(purchase_txs),
            "inventory_items_count": len(inv)
        },
        "summary_bullets": summary_bullets,
        "export_ready": True
    }
