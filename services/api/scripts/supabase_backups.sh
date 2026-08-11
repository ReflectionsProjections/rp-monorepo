#!/bin/bash
# Export every public Supabase table to CSV and upload the files to S3.
#
# Connection settings come from AWS Secrets Manager at runtime — nothing is
# read from or written to files on the host. The secret
# rp-api/prod/supabase-backup-env (a shell created by rp-infra terraform)
# must hold plaintext env lines:
#   DB_HOST=...
#   DB_PORT=6543
#   DB_USER=...
#   DB_NAME=postgres
#   DB_PASSWORD=...
# Optional lines: S3_BUCKET (default rp-api-supabase-backups) and S3_PREFIX
# (default supabase). The instance role provides the Secrets Manager read and
# the s3:PutObject; no AWS keys belong in the secret.
#
# This script is delivered by every CodeDeploy bundle but is not part of any
# deploy hook. Run it by hand or from cron:
#   sudo /home/ubuntu/rp-api/scripts/supabase_backups.sh
set -euo pipefail

BACKUP_SECRET_ID="rp-api/prod/supabase-backup-env"

# Resolve the region from instance metadata (IMDSv2).
TOKEN="$(curl -sf -X PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 300")"
REGION="$(curl -sf -H "X-aws-ec2-metadata-token: $TOKEN" \
    "http://169.254.169.254/latest/meta-data/placement/region")"

backup_env="$(aws secretsmanager get-secret-value \
    --region "$REGION" \
    --secret-id "$BACKUP_SECRET_ID" \
    --query SecretString \
    --output text)"

# shellcheck disable=SC1090
source /dev/stdin <<< "$backup_env"

required_vars=(
    DB_HOST
    DB_PORT
    DB_USER
    DB_NAME
    DB_PASSWORD
)

for required_var in "${required_vars[@]}"; do
    if [ -z "${!required_var:-}" ]; then
        echo "Secret $BACKUP_SECRET_ID is missing required line: $required_var=" >&2
        exit 1
    fi
done

S3_BUCKET="${S3_BUCKET:-rp-api-supabase-backups}"
S3_PREFIX="${S3_PREFIX:-supabase}"

DATE="$(date +'%Y-%m-%d_%H-%M-%S')"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

export PGPASSWORD="$DB_PASSWORD"

psql_base_args=(
    -h "$DB_HOST"
    -p "$DB_PORT"
    -U "$DB_USER"
    -d "$DB_NAME"
    -v ON_ERROR_STOP=1
)

psql "${psql_base_args[@]}" -At -F $'\t' -c \
    "SELECT schemaname, tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;" |
while IFS=$'\t' read -r schema_name table_name; do
    [ -n "$table_name" ] || continue

    csv_file="$TMP_DIR/${schema_name}.${table_name}.csv"
    s3_key="$S3_PREFIX/$DATE/${schema_name}.${table_name}.csv"

    echo "Exporting ${schema_name}.${table_name}..."

    psql "${psql_base_args[@]}" -c \
        "\\copy (SELECT * FROM \"$schema_name\".\"$table_name\") TO '$csv_file' WITH CSV HEADER"

    aws s3 cp "$csv_file" "s3://$S3_BUCKET/$s3_key" --sse AES256
done

echo "Backup completed: exported public tables to s3://$S3_BUCKET/$S3_PREFIX/$DATE/"
