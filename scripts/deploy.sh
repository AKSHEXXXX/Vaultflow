#!/usr/bin/env bash
# =============================================================================
# scripts/deploy.sh — EC2 Production Deployment Script
#
# Usage (called by GitHub Actions or manually):
#   SSH_KEY=/path/to/key.pem DOCKER_IMAGE=user/saas-backend IMAGE_TAG=abc123 \
#   EC2_HOST=1.2.3.4 EC2_USER=ubuntu ./scripts/deploy.sh
#
# Assumptions on the EC2 instance:
#   - Docker + Docker Compose v2 installed
#   - App lives at ~/app/
#   - .env.prod already placed at ~/app/.env.prod (one-time manual setup)
#   - docker-compose.prod.yml is synced via this script
# =============================================================================
set -euo pipefail

# ---- Config (override via env vars or GitHub Actions secrets) ----
DOCKER_IMAGE="${DOCKER_IMAGE:?DOCKER_IMAGE must be set}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
EC2_HOST="${EC2_HOST:?EC2_HOST must be set}"
EC2_USER="${EC2_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:?SSH_KEY must be set}"
APP_DIR="${APP_DIR:-~/app}"
COMPOSE_FILE="docker-compose.prod.yml"

echo "==> Deploying ${DOCKER_IMAGE}:${IMAGE_TAG} to ${EC2_USER}@${EC2_HOST}"

# ---- Step 1: Copy the latest compose file to the server ----
echo "==> Syncing ${COMPOSE_FILE}..."
scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no \
    "${COMPOSE_FILE}" \
    "${EC2_USER}@${EC2_HOST}:${APP_DIR}/${COMPOSE_FILE}"

# ---- Step 2: SSH in and perform a rolling update of the backend only ----
# Using --no-deps so postgres/redis are NOT restarted (zero-downtime for data services)
ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" bash -s << EOF
set -euo pipefail
cd ${APP_DIR}

echo "--- Logging in to Docker Hub ---"
echo "\${DOCKER_PASSWORD}" | docker login -u "\${DOCKER_USERNAME}" --password-stdin

echo "--- Pulling new image: ${DOCKER_IMAGE}:${IMAGE_TAG} ---"
DOCKER_IMAGE=${DOCKER_IMAGE} IMAGE_TAG=${IMAGE_TAG} \
  docker compose -f ${COMPOSE_FILE} --env-file .env.prod pull backend

echo "--- Restarting backend (no-deps rolling update) ---"
DOCKER_IMAGE=${DOCKER_IMAGE} IMAGE_TAG=${IMAGE_TAG} \
  docker compose -f ${COMPOSE_FILE} --env-file .env.prod up -d --no-deps --force-recreate backend

echo "--- Waiting for backend health check... ---"
timeout 120 bash -c \
  'until docker inspect --format="{{.State.Health.Status}}" \$(docker compose -f ${COMPOSE_FILE} ps -q backend) 2>/dev/null | grep -q "healthy"; do sleep 3; done'

echo "--- Removing unused images to free disk space ---"
docker image prune -f

echo "--- Deployment complete ---"
docker compose -f ${COMPOSE_FILE} ps
EOF

echo "==> Deploy finished successfully."
