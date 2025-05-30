FROM ubuntu:22.04

ARG POSTGRES_DB=postgres
ARG POSTGRES_USER=postgres
ARG POSTGRES_PASSWORD=postgres

ENV POSTGRES_DB=${POSTGRES_DB}
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV PGDATA=/var/lib/postgresql/data
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
  curl \
  git \
  build-essential \
  vim \
  tini \
  sudo \
  && rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS) and Yarn
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn

WORKDIR /shared

COPY pg_config /pg_config
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY ./.env /

# Expose ports (API, Web, Supabase Studio)
EXPOSE 3000
EXPOSE 3001
EXPOSE 3002 
EXPOSE 3003 
EXPOSE 3004 
EXPOSE 8000

ENTRYPOINT ["tini", "--", "/entrypoint.sh"]

