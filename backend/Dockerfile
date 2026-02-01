FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

LABEL maintainer="hassanali.tech25@gmail.com"

WORKDIR /app

COPY ./ .
COPY ./requirements.txt /tmp/requirements.txt

EXPOSE 8000

ARG DEV=false

# Install system dependencies (GDAL + previous Playwright libs + new ones)

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
    libgtk-3-0 \
    libx11-xcb1 \
    libx11-6 \
    libxcb1 \
    libxext6 \
    libxrandr2 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxfixes3 \
    libxi6 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libglib2.0-0 \
    libxrender1 \
    libasound2 \
    libdbus-1-3 \
    libxcb-shm0 \
    libgstreamer1.0-0 \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-libav \
    libgtk-4-1 \
    libvulkan1 \
    libgraphene-1.0-0 \
    libwoff1 \
    libvpx9 \
    libopus0 \
    libflite1 \
    libjxl0.11 \
    libharfbuzz-icu0 \
    libenchant-2-2 \
    libsecret-1-0 \
    libhyphen0 \
    libwayland-server0 \
    libmanette-0.2-0 \
    libgbm1 \
    libdrm2 \
    libgles2 \
    libx264-164 \
    && rm -rf /var/lib/apt/lists/*

# Debug GDAL
RUN gdalinfo --version || true

# Virtualenv + Python deps + Playwright
RUN python -m venv /env && \
    . /env/bin/activate && \
    pip install --upgrade pip && \
    pip install -r /tmp/requirements.txt && \
    playwright install && \
    python -c "from django.contrib.gis import gdal; print(gdal.HAS_GDAL)" || true

# Cleanup
RUN rm -rf /root/.cache && \
    rm -rf /tmp/requirements.txt

# User & permissions
RUN useradd -m -s /bin/bash django-user && \
    mkdir -p /vol/web/media /vol/web/static && \
    chown -R django-user:django-user /vol /env && \
    chmod -R 755 /vol /env

ENV PATH="/env/bin:$PATH"
ENV GDAL_LIBRARY_PATH="/usr/lib/libgdal.so"
ENV GEOS_LIBRARY_PATH="/usr/lib/libgeos_c.so"
ENV PROJ_LIB="/usr/share/proj"

USER django-user
