#!/usr/bin/env bash
# =============================================================================
# scripts/deploy.sh - EC2 Production Deployment Script
# =============================================================================
set -euo pipefail

DOCKER_IMAGE="${DOCKER_IMAGE:?DOCKER_IMAGE must be set}"
DOCKER_FRONTEND_IMAGE="${DOCKER_FRONTEND_IMAGE:?DOCKER_FRONTEND_IMAGE must be set}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
EC2_HOST="${EC2_HOST:?EC2_HOST must be set}"
EC2_USER="${EC2_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:?SSH_KEY must be set}"
DOCKER_USERNAME="${DOCKER_USERNAME:?DOCKER_USERNAME must be set}"
DOCKER_PASSWORD="${DOCKER_PASSWORD:?DOCKER_PASSWORD must be set}"
APP_DIR="${APP_DIR:-/home/${EC2_USER}/app}"
COMPOSE_FILE="docker-compose.prod.yml"

echo "==> Deploying ${DOCKER_IMAGE}:${IMAGE_TAG} to ${EC2_USER}@${EC2_HOST}"

ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" "mkdir -p ${APP_DIR}"

echo "==> Syncing ${COMPOSE_FILE} and nginx config..."
scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no \
    "${COMPOSE_FILE}" \
    "${EC2_USER}@${EC2_HOST}:${APP_DIR}/${COMPOSE_FILE}"

ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" "mkdir -p ${APP_DIR}/nginx/certs"
scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no \
    nginx/nginx.conf \
    "${EC2_USER}@${EC2_HOST}:${APP_DIR}/nginx/nginx.conf"

echo "==> Running deployment on EC2..."
ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" \
    DOCKER_IMAGE="${DOCKER_IMAGE}" \
    DOCKER_FRONTEND_IMAGE="${DOCKER_FRONTEND_IMAGE}" \
    IMAGE_TAG="${IMAGE_TAG}" \
    DOCKER_USERNAME="${DOCKER_USERNAME}" \
    DOCKER_PASSWORD="${DOCKER_PASSWORD}" \
    APP_DIR="${APP_DIR}" \
    COMPOSE_FILE="${COMPOSE_FILE}" \
    bash << 'EOF'
set -euo pipefail

if ! command -v docker &>/dev/null; then
  echo "--- Installing Docker ---"
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "${USER}"
  sudo systemctl enable --now docker
  echo "--- Docker installed ---"
fi

cd "${APP_DIR}"

echo "--- Logging in to Docker Hub ---"
echo "${DOCKER_PASSWORD}" | sudo docker login -u "${DOCKER_USERNAME}" --password-stdin

echo "--- Pulling ${DOCKER_IMAGE}:${IMAGE_TAG} ---"
DOCKER_IMAGE="${DOCKER_IMAGE}" IMAGE_TAG="${IMAGE_TAG}" \
  sudo docker compose -f "${COMPOSE_FILE}" --env-file .env.prod pull backend

echo "--- Starting postgres, redis, and minio (if not running) ---"
DOCKER_IMAGE="${DOCKER_IMAGE}" IMAGE_TAG="${IMAGE_TAG}" \
  sudo docker compose -f "${COMPOSE_FILE}" --env-file .env.prod up -d postgres redis minio

echo "--- Waiting for postgres, redis, and minio to be healthy (up to 90s) ---"
for i in $(seq 1 30); do
  PG_STATUS=$(sudo docker inspect --format='{{.State.Health.Status}}' saas-postgres-prod 2>/dev/null || echo "starting")
  RD_STATUS=$(sudo docker inspect --format='{{.State.Health.Status}}' saas-redis-prod 2>/dev/null || echo "starting")
  MN_STATUS=$(sudo docker inspect --format='{{.State.Health.Status}}' saas-minio-prod 2>/dev/null || echo "starting")
  echo "  [${i}/30] postgres: ${PG_STATUS}  redis: ${RD_STATUS}  minio: ${MN_STATUS}"
  [ "${PG_STATUS}" = "healthy" ] && [ "${RD_STATUS}" = "healthy" ] && [ "${MN_STATUS}" = "healthy" ] && break
  sleep 3
done

echo "--- Ensuring MinIO bucket exists ---"
DOCKER_IMAGE="${DOCKER_IMAGE}" IMAGE_TAG="${IMAGE_TAG}" \
  sudo docker compose -f "${COMPOSE_FILE}" --env-file .env.prod up minio-init --no-deps || true

echo "--- Restarting backend ---"
DOCKER_IMAGE="${DOCKER_IMAGE}" IMAGE_TAG="${IMAGE_TAG}" \
  sudo docker compose -f "${COMPOSE_FILE}" --env-file .env.prod up -d --no-deps --force-recreate backend

echo "--- Waiting for backend health (up to 120s) ---"
for i in $(seq 1 40); do
  CID=$(sudo docker compose -f "${COMPOSE_FILE}" ps -q backend 2>/dev/null || true)
  STATUS=$(sudo docker inspect --format='{{.State.Health.Status}}' "${CID}" 2>/dev/null || echo "starting")
  echo "  [${i}/40] Health: ${STATUS}"
  [ "${STATUS}" = "healthy" ] && break
  sleep 3
done

echo "--- Pulling frontend image ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG} ---"
DOCKER_IMAGE="${DOCKER_IMAGE}" DOCKER_FRONTEND_IMAGE="${DOCKER_FRONTEND_IMAGE}" IMAGE_TAG="${IMAGE_TAG}" \
  sudo docker compose -f "${COMPOSE_FILE}" --env-file .env.prod pull frontend

echo "--- Restarting frontend and nginx ---"
DOCKER_IMAGE="${DOCKER_IMAGE}" DOCKER_FRONTEND_IMAGE="${DOCKER_FRONTEND_IMAGE}" IMAGE_TAG="${IMAGE_TAG}" \
  sudo docker compose -f "${COMPOSE_FILE}" --env-file .env.prod up -d --no-deps --force-recreate frontend nginx

echo "--- Pruning old images ---"
sudo docker image prune -f

# ==========================================================================
# Let's Encrypt SSL certificate (runs once; renews when <30 days left)
# ==========================================================================
DOMAIN="vaultflow.duckdns.org"
CERT_DIR="${APP_DIR}/nginx/certs"
CERT_FILE="${CERT_DIR}/fullchain.pem"

# Install certbot if missing
if ! command -v certbot &>/dev/null; then
  echo "--- Installing certbot ---"
  sudo apt-get update -q && sudo apt-get install -y -q certbot
fi

# Check if cert is missing or expiring within 30 days
NEEDS_CERT=false
if [ ! -f "${CERT_FILE}" ]; then
  NEEDS_CERT=true
elif ! sudo openssl x509 -checkend 2592000 -noout -in "${CERT_FILE}" 2>/dev/null; then
  NEEDS_CERT=true
fi

if [ "${NEEDS_CERT}" = "true" ]; then
  echo "--- Obtaining Let's Encrypt certificate for ${DOMAIN} ---"
  # Stop nginx to free port 80 for standalone challenge
  sudo docker compose -f "${COMPOSE_FILE}" stop nginx 2>/dev/null || true

  sudo certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email admin@vaultflow.duckdns.org \
    -d "${DOMAIN}" \
    --keep-until-expiring

  # Copy certs to the nginx certs directory
  sudo cp "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" "${CERT_DIR}/fullchain.pem"
  sudo cp "/etc/letsencrypt/live/${DOMAIN}/privkey.pem"   "${CERT_DIR}/privkey.pem"
  sudo chown ubuntu:ubuntu "${CERT_DIR}/fullchain.pem" "${CERT_DIR}/privkey.pem"
  sudo chmod 644 "${CERT_DIR}/fullchain.pem"
  sudo chmod 640 "${CERT_DIR}/privkey.pem"

  echo "--- Restarting nginx with new cert ---"
  sudo docker compose -f "${COMPOSE_FILE}" up -d nginx
else
  echo "--- SSL cert is valid, no renewal needed ---"
fi

echo "--- Done ---"
sudo docker compose -f "${COMPOSE_FILE}" ps
EOF

echo "==> Deploy finished successfully."
