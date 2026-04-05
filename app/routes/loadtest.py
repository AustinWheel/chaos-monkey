import logging
from datetime import datetime

from flask import Blueprint, jsonify, request

from app.models.loadtest import LoadTestResult

logger = logging.getLogger(__name__)
loadtest_bp = Blueprint("loadtest", __name__)


def _result_to_dict(r):
    return {
        "id": r.id,
        "tier": r.tier,
        "target": r.target,
        "req_per_sec": r.req_per_sec,
        "p95_ms": r.p95_ms,
        "error_rate": r.error_rate,
        "status": r.status,
        "vus": r.vus,
        "duration": r.duration,
        "run_at": r.run_at.isoformat() if hasattr(r.run_at, "isoformat") else str(r.run_at),
        "summary": r.summary,
    }


@loadtest_bp.route("/loadtest/results")
def list_results():
    results = LoadTestResult.select().order_by(LoadTestResult.run_at.desc()).limit(20)
    return jsonify([_result_to_dict(r) for r in results])


@loadtest_bp.route("/loadtest/results", methods=["POST"])
def create_result():
    data = request.get_json()
    if not data or "tier" not in data:
        return jsonify({"error": "tier is required"}), 400

    result = LoadTestResult.create(
        tier=data["tier"],
        target=data.get("target", "unknown"),
        req_per_sec=data.get("req_per_sec", 0),
        p95_ms=data.get("p95_ms", 0),
        error_rate=data.get("error_rate", 0),
        status=data.get("status", "passed"),
        vus=data.get("vus", 0),
        duration=data.get("duration", ""),
        run_at=datetime.utcnow(),
        summary=data.get("summary", ""),
    )

    logger.info("Load test result recorded", extra={
        "component": "loadtest",
        "tier": result.tier,
        "target": result.target,
    })
    return jsonify(_result_to_dict(result)), 201
