# Stage 1: Build
FROM python:3.12-slim as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Stage 2: Final
FROM python:3.12-slim

WORKDIR /app

COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

RUN pip install --no-cache /wheels/*

# Create a non-root user to run the application
RUN addgroup --system app && adduser --system --ingroup app --no-create-home app

COPY --chown=app:app . .

# Environment variables for production
ENV DEBUG=0
ENV DJANGO_SETTINGS_MODULE=core.settings

EXPOSE 8000

USER app

COPY --chown=app:app start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"]
