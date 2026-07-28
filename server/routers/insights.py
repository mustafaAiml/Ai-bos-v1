import json
import sys
from fastapi import APIRouter
from server.schemas import DailyInsightsRequest, DailyInsightsResponse
from server.config import get_genai_client

router = APIRouter(prefix="/api/ai", tags=["Daily Business Strategy ML Insights"])

@router.post("/daily-insights", response_model=DailyInsightsResponse)
def get_daily_insights(body: DailyInsightsRequest):
    client = get_genai_client()
    if client:
        try:
            from google.genai import types
            prompt = f"""
You are a Python Business Strategy ML Agent for Indian Kirana & Retail Store owners.
Store Performance:
- Revenue: ₹{body.revenue}
- Net Profit: ₹{body.netProfit}
- Top Items: {', '.join(body.topItemNames) or 'N/A'}

Provide 3 actionable advice tips in clean Hinglish/English.
Return JSON: {{ "tips": ["tip1", "tip2", "tip3"] }}
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
                if "tips" in parsed and isinstance(parsed["tips"], list):
                    return DailyInsightsResponse(tips=parsed["tips"])
        except Exception as e:
            sys.stderr.write(f"Python Insights AI error: {e}\n")

    margin = round((body.netProfit / body.revenue) * 100) if body.revenue > 0 else 0
    return DailyInsightsResponse(
        tips=[
            "💡 High-margin inventory items are moving fast today.",
            "📦 Keep fast-moving stock displayed prominently near checkout for evening peak sales.",
            f"📊 Today's profit margin is healthy at {margin}%. Remind credit ledger customers for timely settlement."
        ]
    )
