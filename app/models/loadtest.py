from peewee import CharField, DateTimeField, FloatField, IntegerField, TextField

from app.database import BaseModel


class LoadTestResult(BaseModel):
    tier = CharField()  # bronze, silver, gold
    target = CharField()  # prod-nyc, prod-sfo, staging
    req_per_sec = FloatField(default=0)
    p95_ms = FloatField(default=0)
    error_rate = FloatField(default=0)
    status = CharField(default="passed")  # passed, failed
    vus = IntegerField(default=0)
    duration = CharField(default="")
    run_at = DateTimeField()
    summary = TextField(default="")
