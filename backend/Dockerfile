FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1
LABEL maintainer="hassanali.tech25@gmail.com"

WORKDIR /app

COPY ./ .
COPY ./requirements.txt /tmp/requirements.txt

EXPOSE 8000

ARG DEV=false

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin \
    libgdal-dev \
    libproj-dev \
    libgeos-dev \
    postgresql-client \
    gcc \
    g++ \
    python3-dev \
    libpq-dev \
    binutils \
    libpng-dev \
    libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*

# Debug GDAL installation
RUN gdalinfo --version || true

# Setup virtual environment and install Python dependencies
RUN python -m venv /env && \
    . /env/bin/activate && \
    pip install --upgrade pip && \
    pip install -r /tmp/requirements.txt && \
    playwright install --with-deps chromium && \
    python -c "from django.contrib.gis import gdal; print(gdal.HAS_GDAL)" || true

# Clean up
RUN rm -rf /root/.cache && \
    rm -rf /tmp/requirements.txt

# Create user and set permissions
RUN useradd -m -s /bin/bash django-user && \
    mkdir -p /vol/web/media /vol/web/static && \
    chown -R django-user:django-user /vol /env && \
    chmod -R 755 /vol /env

ENV PATH="/env/bin:$PATH"
ENV GDAL_LIBRARY_PATH="/usr/lib/libgdal.so"
ENV GEOS_LIBRARY_PATH="/usr/lib/libgeos_c.so"
ENV PROJ_LIB="/usr/share/proj"

USER django-user