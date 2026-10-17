import pytest
from uuid import uuid4
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.models.models import Case
from backend.app.core.database import get_db

client = TestClient(app)


class MockScalarResult:
    def __init__(self, items):
        self._items = items

    def all(self):
        return self._items

    def first(self):
        return self._items[0] if self._items else None


class MockExecuteResult:
    def __init__(self, items):
        self._items = items

    def scalars(self):
        return MockScalarResult(self._items)


class MockAsyncSession:
    def __init__(self, cases=None):
        self.cases = list(cases) if cases is not None else []

    def add(self, obj):
        if hasattr(obj, "created_at") and getattr(obj, "created_at", None) is None:
            obj.created_at = datetime.now(timezone.utc)
        if obj not in self.cases:
            self.cases.append(obj)

    async def commit(self):
        pass

    async def refresh(self, obj):
        pass

    async def execute(self, query):
        return MockExecuteResult(self.cases)

    async def get(self, model, ident):
        for c in self.cases:
            if c.id == ident:
                return c
        return None


def test_get_case_stats_empty():
    """Verify empty database returns all zeros and no errors."""
    mock_db = MockAsyncSession(cases=[])
    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        response = client.get("/api/v1/cases/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_cases"] == 0
        assert data["critical_cases"] == 0
        assert data["high_cases"] == 0
        assert data["average_risk_score"] == 0.0
        assert data["active_iocs"] == 0
        assert data["risk_trend"] == []
    finally:
        app.dependency_overrides.pop(get_db, None)


def test_get_cases_empty():
    """Verify empty database returns empty list."""
    mock_db = MockAsyncSession(cases=[])
    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        response = client.get("/api/v1/cases")
        assert response.status_code == 200
        assert response.json() == []
    finally:
        app.dependency_overrides.pop(get_db, None)


def test_get_cases_with_stored_analysis():
    """Verify stored analysis populates risk_score and verdict without recomputing or inventing values."""
    case_with_analysis = Case(
        id=uuid4(),
        case_number="BC-1001",
        sha256="abc123sha256",
        filename="bank_trojan.apk",
        status="COMPLETED",
        created_at=datetime.now(timezone.utc),
        evidence_json={
            "full_payload": {
                "riskScore": 92,
                "threatFamily": "Anubis Trojan",
                "malwareType": "Banking Trojan"
            }
        }
    )
    case_pending = Case(
        id=uuid4(),
        case_number="BC-1002",
        sha256="def456sha256",
        filename="clean_utility.apk",
        status="queued",
        created_at=datetime.now(timezone.utc),
        evidence_json=None
    )

    mock_db = MockAsyncSession(cases=[case_with_analysis, case_pending])
    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        response = client.get("/api/v1/cases")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

        # First case with analysis
        assert data[0]["filename"] == "bank_trojan.apk"
        assert data[0]["risk_score"] == 92
        assert data[0]["verdict"] == "Anubis Trojan"

        # Second pending case without analysis returns null
        assert data[1]["filename"] == "clean_utility.apk"
        assert data[1]["risk_score"] is None
        assert data[1]["verdict"] is None
    finally:
        app.dependency_overrides.pop(get_db, None)


def test_get_case_stats_with_data():
    """Verify stats computation across populated cases."""
    case_crit = Case(
        id=uuid4(),
        case_number="BC-2001",
        sha256="hash1",
        filename="sample1.apk",
        status="COMPLETED",
        created_at=datetime.now(timezone.utc),
        evidence_json={
            "iocs": [{"type": "IP", "value": "185.220.101.5"}],
            "full_payload": {"riskScore": 90, "threatFamily": "Anubis"}
        }
    )
    case_high = Case(
        id=uuid4(),
        case_number="BC-2002",
        sha256="hash2",
        filename="sample2.apk",
        status="COMPLETED",
        created_at=datetime.now(timezone.utc),
        evidence_json={
            "iocs": [{"type": "IP", "value": "185.220.101.5"}, {"type": "Domain", "value": "c2.net"}],
            "full_payload": {"riskScore": 70, "threatFamily": "SpyNote"}
        }
    )
    case_low = Case(
        id=uuid4(),
        case_number="BC-2003",
        sha256="hash3",
        filename="sample3.apk",
        status="COMPLETED",
        created_at=datetime.now(timezone.utc),
        evidence_json={
            "iocs": [],
            "full_payload": {"riskScore": 20, "threatFamily": "Clean"}
        }
    )

    mock_db = MockAsyncSession(cases=[case_crit, case_high, case_low])
    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        response = client.get("/api/v1/cases/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_cases"] == 3
        assert data["critical_cases"] == 1
        assert data["high_cases"] == 1
        # (90 + 70 + 20) / 3 = 60.0
        assert data["average_risk_score"] == 60.0
        # distinct IOCs: 185.220.101.5, c2.net
        assert data["active_iocs"] == 2
        assert len(data["risk_trend"]) > 0
    finally:
        app.dependency_overrides.pop(get_db, None)


def test_upload_apk_persists_case():
    """Test that POST /api/v1/uploads creates and persists a case that appears in GET /api/v1/cases."""
    import io
    import zipfile

    mock_db = MockAsyncSession(cases=[])
    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        # Create a small valid zip file representing an APK
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("AndroidManifest.xml", b"<manifest package='com.test.sample'></manifest>")
        zip_buffer.seek(0)

        response = client.post(
            "/api/v1/uploads",
            files={"file": ("sample_test.apk", zip_buffer.getvalue(), "application/vnd.android.package-archive")}
        )
        assert response.status_code == 200
        upload_data = response.json()
        assert "case_id" in upload_data
        case_id = upload_data["case_id"]

        # Verify the case appears in GET /api/v1/cases
        get_response = client.get("/api/v1/cases")
        assert get_response.status_code == 200
        cases_list = get_response.json()
        assert len(cases_list) == 1
        persisted_case = cases_list[0]
        assert str(persisted_case["id"]) == case_id
        assert persisted_case["filename"] == "sample_test.apk"
        assert persisted_case["risk_score"] is not None
    finally:
        app.dependency_overrides.pop(get_db, None)

