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


# PMC2 F.2 product slice; M1 routes above retain their historical contract.
from fastapi import HTTPException
from pmc2.demo import run_demo


class EvidenceDemoQuery(BaseModel):
    scenario: str = "valid"
    stock_a: str = "AAPL"
    stock_b: str = "MSFT"


@app.get("/pmc2")
def evidence_lab():
    return FileResponse(Path(__file__).resolve().parents[2] / "pmc2" / "index.html")


@app.post("/api/pmc2/demo")
def evidence_demo(query: EvidenceDemoQuery):
    try:
        return run_demo(query.scenario, query.stock_a, query.stock_b)
    except (ValueError, KeyError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


from pmc2.acquisition import request_dated_records
from pmc2.validation import validate_evidence


class AcquisitionInput(BaseModel):
    request: dict
    configuration: dict


class ValidationInput(BaseModel):
    context: dict
    market_records: list[dict]
    news_records: list[dict]
    configuration: dict


@app.post('/internal/f2/acquire')
def acquire_evidence(query: AcquisitionInput):
    try:
        return request_dated_records(query.request, query.configuration)
    except (KeyError, TypeError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.post('/internal/f2/validate')
def check_evidence(query: ValidationInput):
    try:
        return validate_evidence(query.context, query.market_records, query.news_records, query.configuration)
    except (KeyError, TypeError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
