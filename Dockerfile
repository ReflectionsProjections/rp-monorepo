FROM ubuntu:22.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

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
RUN chmod +x /entrypoint.sh

# Expose ports used by the API (customize as needed)
EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
# On container start, install dependencies and run the API
# CMD ["bash", "-c", "cd yarn install && yarn start"]

