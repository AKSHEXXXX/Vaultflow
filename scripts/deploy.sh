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

echo "==> Syncing ${COMPOSE_FILE}..."
scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no \
    "${COMPOSE_FILE}" \
    "${EC2_USER}@${EC2_HOST}:${APP_DIR}/${COMPOSE_FILE}"

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

echo "--- Starting postgres and redis (if not running) ---"
DOCKER_IMAGE="${DOCKER_IMAGE}" IMAGE_TAG="${IMAGE_TAG}" \
  sudo docker compose -f "${COMPOSE_FILE}" --env-file .env.prod up -d postgres redis

echo "--- Waiting for postgres/redis to be healthy (up to 60s) ---"
for i in $(seq 1 20); do
  PG_STATUS=$(sudo docker inspect --format='{{.State.Health.Status}}' saas-postgres-prod 2>/dev/null || echo "starting")
  RD_STATUS=$(sudo docker inspect --format='{{.State.Health.Status}}' saas-redis-prod 2>/dev/null || echo "starting")
  echo "  [${i}/20] postgres: ${PG_STATUS}  redis: ${RD_STATUS}"
  [ "${PG_STATUS}" = "healthy" ] && [ "${RD_STATUS}" = "healthy" ] && break
  sleep 3
done

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

echo "--- Done ---"
sudo docker compose -f "${COMPOSE_FILE}" ps
EOF

echo "==> Deploy finished successfully."
