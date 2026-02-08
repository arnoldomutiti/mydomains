#!/usr/bin/env bash
#
# Domain Dashboard - VM Deployment Script
#
# Usage:
#   1. Copy this script to your VM
#   2. Run: chmod +x deploy.sh && ./deploy.sh
#
# Prerequisites: Ubuntu/Debian VM with SSH access
#
set -euo pipefail

APP_DIR="/opt/domain-dashboard"
REPO_URL="${REPO_URL:-}"

echo "=== Domain Dashboard VM Deployment ==="
echo ""

# ──────────────────────────────────────────
# 1. Install Docker if not present
# ──────────────────────────────────────────
if ! command -v docker &> /dev/null; then
    echo "[1/5] Installing Docker..."
    sudo apt-get update -qq
    sudo apt-get install -y -qq ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -qq
    sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER"
    echo "  Docker installed successfully."
else
    echo "[1/5] Docker already installed. Skipping."
fi

# ──────────────────────────────────────────
# 2. Clone or update the repository
# ──────────────────────────────────────────
echo "[2/5] Setting up application directory..."
if [ -d "$APP_DIR" ]; then
    echo "  Updating existing installation..."
    cd "$APP_DIR"
    git pull
else
    if [ -z "$REPO_URL" ]; then
        echo "  ERROR: REPO_URL not set and $APP_DIR does not exist."
        echo "  Usage: REPO_URL=https://github.com/user/repo.git ./deploy.sh"
        exit 1
    fi
    sudo mkdir -p "$APP_DIR"
    sudo chown "$USER:$USER" "$APP_DIR"
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# ──────────────────────────────────────────
# 3. Configure environment
# ──────────────────────────────────────────
echo "[3/5] Checking environment configuration..."
if [ ! -f server/.env ]; then
    echo "  Creating server/.env from template..."
    cp .env.example server/.env
    echo ""
    echo "  ╔══════════════════════════════════════════════════╗"
    echo "  ║  IMPORTANT: Edit server/.env with your secrets   ║"
    echo "  ║  before continuing.                              ║"
    echo "  ║                                                  ║"
    echo "  ║  nano $APP_DIR/server/.env             ║"
    echo "  ║                                                  ║"
    echo "  ║  Then re-run this script.                        ║"
    echo "  ╚══════════════════════════════════════════════════╝"
    echo ""
    exit 0
else
    echo "  server/.env exists. Continuing."
fi

# ──────────────────────────────────────────
# 4. Build and start containers
# ──────────────────────────────────────────
echo "[4/5] Building and starting containers..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

# ──────────────────────────────────────────
# 5. Configure firewall
# ──────────────────────────────────────────
echo "[5/5] Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 22/tcp
    echo "  Firewall rules added for ports 80, 443, 22."
else
    echo "  ufw not found. Make sure ports 80 and 443 are open."
fi

echo ""
echo "=== Deployment complete! ==="
echo ""
echo "  Application: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "  Useful commands:"
echo "    docker compose logs -f        # View logs"
echo "    docker compose restart        # Restart services"
echo "    docker compose down           # Stop services"
echo "    docker compose up -d --build  # Rebuild and restart"
echo ""
