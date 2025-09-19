web: gunicorn api.wsgi:application --workers 3 --timeout 60 --bind 0.0.0.0:$PORT
release: python api/manage.py migrate && python api/manage.py collectstatic --noinput
