import json
import logging

from flask import Blueprint, jsonify, request

from app.models.event import Event

logger = logging.getLogger(__name__)
events_bp = Blueprint("events", __name__)


def _event_to_dict(event):
    details = event.details
    if isinstance(details, str):
        try:
            details = json.loads(details)
        except (json.JSONDecodeError, TypeError):
            pass

    return {
        "id": event.id,
        "url_id": event.url_id,
        "user_id": event.user_id,
        "event_type": event.event_type,
        "timestamp": event.timestamp.isoformat() if hasattr(event.timestamp, "isoformat") else str(event.timestamp),
        "details": details,
    }


@events_bp.route("/events")
def list_events():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)

    query = Event.select().order_by(Event.id)
    events = query.paginate(page, per_page)

    result = [_event_to_dict(e) for e in events]
    logger.info("Events listed", extra={"component": "events", "count": len(result), "page": page})
    return jsonify(result)
