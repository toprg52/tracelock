import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.security import create_access_token

client = TestClient(app)

def test_officer_cannot_access_technical_report():
    # 1. Create a JWT token with role "officer"
    token = create_access_token(subject="user_123", role="officer")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Hit the analyst-only endpoint
    response = client.get("/api/v1/reports/report/123e4567-e89b-12d3-a456-426614174000/technical", headers=headers)

    # 3. Assert it returns 403 Forbidden
    assert response.status_code == 403
    assert response.json()["detail"] == "Not enough permissions to access this resource"

def test_analyst_can_access_technical_report(mocker):
    # Mock the compile_case_reports to avoid needing DB access
    mocker.patch("backend.app.api.v1.reports.compile_case_reports", return_value={"analyst": {"html": "<p>test</p>", "hash": "testhash"}})
    
    # 1. Create a JWT token with role "analyst"
    token = create_access_token(subject="user_123", role="analyst")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Hit the analyst-only endpoint
    response = client.get("/api/v1/reports/report/123e4567-e89b-12d3-a456-426614174000/technical", headers=headers)

    # 3. Assert it returns 200 OK
    assert response.status_code == 200
