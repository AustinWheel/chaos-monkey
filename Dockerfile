FROM python:3.13-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

EXPOSE 8080

CMD ["uv", "run", "gunicorn", "run:app", "--bind", "0.0.0.0:8080", "--workers", "4"]
