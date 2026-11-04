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


# F.2 evidence component; existing fixture routes retain their transport contract.
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


from pmc2.request import validate_pair, preserve_request


class PairValidationInput(BaseModel):
    stock_a: str
    stock_b: str


class RequestContextInput(BaseModel):
    pair_result: dict
    analysis_date: str
    request_id: str
    configuration: dict


@app.post('/internal/f1/validate-pair')
def validate_comparison_pair(query: PairValidationInput):
    return validate_pair(query.stock_a, query.stock_b)


@app.post('/internal/f1/preserve-context')
def preserve_comparison_context(query: RequestContextInput):
    try:
        return preserve_request(query.pair_result, query.analysis_date, query.request_id, query.configuration)
    except (KeyError, TypeError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
