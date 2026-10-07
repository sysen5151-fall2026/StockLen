"""Local transport for the Chapter 2 walking skeleton; no real services."""
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel

from walking_skeleton import dashboard_ui
app = FastAPI(title="StockLens Walking Skeleton")


class ComparisonQuery(BaseModel):
    stock_a: str
    stock_b: str
    analysis_date: str


@app.get("/")
def dashboard():
    return FileResponse(Path(__file__).resolve().parents[1] / "frontend" / "index.html")


@app.post("/compare")
def compare(query: ComparisonQuery):
    result = dashboard_ui.transmit_evaluation_request(
        query.stock_a, query.stock_b, query.analysis_date
    )
    return dashboard_ui.render_comparison_dashboard(result)
