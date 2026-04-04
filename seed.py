import csv
import os

from peewee import chunked

from app.database import db, init_db
from app import create_app
from app.models.user import User
from app.models.url import Url
from app.models.event import Event
from app.models.product import Product

app = create_app()

with app.app_context():
    # Create all tables
    db.create_tables([User, Url, Event, Product])
    print("Tables created.")

    # Load users
    with open(os.path.expanduser("~/Downloads/users.csv"), newline="") as f:
        rows = list(csv.DictReader(f))
    with db.atomic():
        for batch in chunked(rows, 100):
            User.insert_many(batch).execute()
    print(f"Loaded {len(rows)} users.")

    # Load urls — need to convert 'True'/'False' strings to booleans
    with open(os.path.expanduser("~/Downloads/urls.csv"), newline="") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        row["is_active"] = row["is_active"] == "True"
    with db.atomic():
        for batch in chunked(rows, 100):
            Url.insert_many(batch).execute()
    print(f"Loaded {len(rows)} urls.")

    # Load events
    with open(os.path.expanduser("~/Downloads/events.csv"), newline="") as f:
        rows = list(csv.DictReader(f))
    with db.atomic():
        for batch in chunked(rows, 100):
            Event.insert_many(batch).execute()
    print(f"Loaded {len(rows)} events.")

    # Fix auto-increment sequences after bulk insert with explicit IDs
    db.execute_sql("SELECT setval('user_id_seq', (SELECT MAX(id) FROM \"user\"))")
    db.execute_sql("SELECT setval('url_id_seq', (SELECT MAX(id) FROM url))")
    db.execute_sql("SELECT setval('event_id_seq', (SELECT MAX(id) FROM event))")
    print("Sequences reset.")

    print("Done!")
