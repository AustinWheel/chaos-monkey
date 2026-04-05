import psutil
from flask import Blueprint, jsonify

metrics_bp = Blueprint("metrics", __name__)

_cached = {"cpu_percent": 0.0, "memory_percent": 0.0, "memory_used_mb": 0.0, "memory_total_mb": 0.0}

vm = psutil.virtual_memory()
_cached["cpu_percent"] = psutil.cpu_percent(interval=0)
_cached["memory_percent"] = vm.percent
_cached["memory_used_mb"] = round(vm.used / 1024 ** 2, 1)
_cached["memory_total_mb"] = round(vm.total / 1024 ** 2, 1)


@metrics_bp.route("/metrics")
def metrics():
    vm = psutil.virtual_memory()
    _cached["cpu_percent"] = psutil.cpu_percent(interval=0)
    _cached["memory_percent"] = vm.percent
    _cached["memory_used_mb"] = round(vm.used / 1024 ** 2, 1)
    _cached["memory_total_mb"] = round(vm.total / 1024 ** 2, 1)
    return jsonify(_cached)
