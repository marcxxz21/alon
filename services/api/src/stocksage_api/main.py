from fastapi import FastAPI, Header, HTTPException, status
from pydantic import BaseModel

app = FastAPI(
    title="Alon Worker API",
    version="0.1.0",
    description="Optional service for health checks and protected worker triggers.",
)


class TriggerResponse(BaseModel):
    accepted: bool
    job: str


def require_cron_secret(authorization: str | None) -> None:
    # Set CRON_SECRET in production and compare against a bearer token here.
    if authorization is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization header")


@app.get("/health")
def health():
    return {"ok": True, "service": "stocksage-api"}


@app.post("/jobs/ingest", response_model=TriggerResponse)
def trigger_ingestion(authorization: str | None = Header(default=None)):
    require_cron_secret(authorization)
    return TriggerResponse(accepted=True, job="daily_prices")


@app.post("/jobs/predict", response_model=TriggerResponse)
def trigger_predictions(authorization: str | None = Header(default=None)):
    require_cron_secret(authorization)
    return TriggerResponse(accepted=True, job="baseline_predictions")
