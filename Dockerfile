FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# install deps first (cache-friendly)
COPY api/requirements.txt /app/api/requirements.txt
RUN pip install -r /app/api/requirements.txt

# copy project
COPY . /app

ENV PORT=8080
EXPOSE 8080

CMD gunicorn api.wsgi:application --bind 0.0.0.0:${PORT} --workers 3 --timeout 60
