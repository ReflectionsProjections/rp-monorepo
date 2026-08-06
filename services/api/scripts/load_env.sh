#!/bin/bash
# CodeDeploy hook: fetch app secrets from AWS Secrets Manager and write the
# .env file and Firebase admin cert the API reads at startup.
#
# Secret names must match aws_secretsmanager_secret resources in rp-infra
# (environments/prod/main.tf). Both secrets are stored as plaintext:
#   rp-api/prod/env                 -> full contents of the .env file
#   rp-api/prod/firebase-admin-cert -> Firebase service account JSON
set -euo pipefail

DEPLOY_DIR="/home/ubuntu/rp-api"
ENV_SECRET_ID="rp-api/prod/env"
FIREBASE_SECRET_ID="rp-api/prod/firebase-admin-cert"
FIREBASE_CERT_PATH="$DEPLOY_DIR/firebase-admin-cert.json"

# Resolve the region from instance metadata (IMDSv2).
TOKEN="$(curl -sf -X PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 300")"
REGION="$(curl -sf -H "X-aws-ec2-metadata-token: $TOKEN" \
    "http://169.254.169.254/latest/meta-data/placement/region")"

fetch_secret() {
    aws secretsmanager get-secret-value \
        --region "$REGION" \
        --secret-id "$1" \
        --query SecretString \
        --output text
}

umask 077

fetch_secret "$ENV_SECRET_ID" > "$DEPLOY_DIR/.env.tmp"
if ! grep -q "^ENV=" "$DEPLOY_DIR/.env.tmp"; then
    echo "Secret $ENV_SECRET_ID does not look like a .env file (no ENV= line)" >&2
    rm -f "$DEPLOY_DIR/.env.tmp"
    exit 1
fi
mv "$DEPLOY_DIR/.env.tmp" "$DEPLOY_DIR/.env"

fetch_secret "$FIREBASE_SECRET_ID" > "$FIREBASE_CERT_PATH.tmp"
if ! grep -q '"private_key"' "$FIREBASE_CERT_PATH.tmp"; then
    echo "Secret $FIREBASE_SECRET_ID does not look like a service account JSON" >&2
    rm -f "$FIREBASE_CERT_PATH.tmp"
    exit 1
fi
mv "$FIREBASE_CERT_PATH.tmp" "$FIREBASE_CERT_PATH"

chown ubuntu:ubuntu "$DEPLOY_DIR/.env" "$FIREBASE_CERT_PATH"
chmod 600 "$DEPLOY_DIR/.env" "$FIREBASE_CERT_PATH"

echo "Wrote $DEPLOY_DIR/.env and $FIREBASE_CERT_PATH from Secrets Manager"
