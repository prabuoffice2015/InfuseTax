#!/bin/bash
set -e

echo "===================================================================="
echo " 🏗️ InfuseTax Jenkins CI/CD Automation Server Setup (Port: 8080) "
echo "===================================================================="

# 1. Check Root Privileges
if [ "$EUID" -ne 0 ]; then
  echo "⚠️ Please run as root (or with sudo): sudo ./deploy-jenkins.sh"
  exit 1
fi

# 2. Configure Firewall (UFW)
echo "🔒 Configuring Firewall for Jenkins (Ports 8080 & 50000)..."
ufw allow 8080/tcp || true
ufw allow 50000/tcp || true
echo "y" | ufw enable || true

# 3. Launch Jenkins Container
echo "🐳 Launching Jenkins LTS Container..."
docker compose -f docker-compose.jenkins.yml up -d

# 4. Wait for Jenkins initialization
echo "⏳ Waiting for Jenkins to start and generate initial admin token..."
sleep 15

# 5. Extract Initial Admin Password
echo ""
echo "===================================================================="
echo " 🔑 Jenkins Initial Admin Password:"
echo "===================================================================="
docker exec infusetax_jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || echo "Jenkins is still initializing. Run: docker exec infusetax_jenkins cat /var/jenkins_home/secrets/initialAdminPassword in 10 seconds."
echo "===================================================================="
echo ""
echo "🔗 Access Jenkins in your browser:"
echo "   http://SERVER_IP:8080"
echo "===================================================================="
