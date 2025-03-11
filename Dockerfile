FROM ubuntu:22.04

# # Prevent interactive prompts
# ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y curl git build-essential

# Install Node.js (LTS) and Yarn
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn

# Setup working directories
RUN mkdir -p /shared

WORKDIR /shared

COPY entrypoint.sh /entrypoint.sh

COPY ./.env /

RUN chmod +x /entrypoint.sh

# Expose ports (API, web, admin)
EXPOSE 3000 
EXPOSE 3001
EXPOSE 3002


ENTRYPOINT ["/entrypoint.sh"]
# On container start, install dependencies and run the API
# CMD ["bash", "-c", "cd yarn install && yarn start"]

