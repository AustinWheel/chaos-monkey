import logging
import threading
import time

import psutil
from flask import Blueprint, Response
from prometheus_client import (
    Counter,
    Gauge,
    Histogram,
    generate_latest,
    CONTENT_TYPE_LATEST,
)

logger = logging.getLogger(__name__)
prom_bp = Blueprint("prom_metrics", __name__)

# -- Metrics that Prometheus will scrape --

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "Request latency in seconds",
    ["method", "endpoint"],
)

APP_UP = Gauge(
    "app_up",
    "Whether the application is up and healthy",
)
APP_UP.set(1)

REQUESTS_IN_FLIGHT = Gauge(
    "http_requests_in_flight",
    "Number of HTTP requests currently being processed",
)

ERROR_COUNT = Counter(
    "http_errors_total",
    "Total HTTP 5xx errors",
    ["method", "endpoint"],
)

CPU_USAGE = Gauge(
    "system_cpu_percent",
    "Current CPU usage percentage",
)

MEMORY_USAGE = Gauge(
    "system_memory_percent",
    "Current memory usage percentage",
)

MEMORY_USED_BYTES = Gauge(
    "system_memory_used_bytes",
    "Memory currently in use in bytes",
)


def _update_system_metrics():
    """Refresh CPU and memory gauges in a background thread."""
    while True:
        CPU_USAGE.set(psutil.cpu_percent(interval=1))
        vm = psutil.virtual_memory()
        MEMORY_USAGE.set(vm.percent)
        MEMORY_USED_BYTES.set(vm.used)
        time.sleep(5)


_metrics_thread = threading.Thread(target=_update_system_metrics, daemon=True)
_metrics_thread.start()


@prom_bp.route("/prom-metrics")
def prometheus_metrics():
    """Expose metrics in Prometheus text format."""
    return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)
