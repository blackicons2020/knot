#!/bin/bash
set -e

echo "Starting EC2 instance setup for Knot..."

# 1. Update packages
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Create a 2GB swap file to prevent out-of-memory errors on t3.micro
if [ ! -f /swapfile ]; then
  echo "Creating 2GB swap file..."
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
else
  echo "Swap file already exists."
fi

# 3. Install Docker and Docker Compose
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  sudo apt-get install -y ca-certificates curl gnupg lsb-release
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  sudo usermod -aG docker ubuntu
  echo "Docker installed successfully."
else
  echo "Docker is already installed."
fi

echo "=========================================================="
echo "Setup is complete!"
echo "Next steps:"
echo "1. Log out and log back in so your user is in the docker group."
echo "2. Clone your repository if you haven't already."
echo "3. Create a .env file with NEXT_PUBLIC_API_URL=http://<YOUR_EC2_PUBLIC_IP>:8080"
echo "4. Run: docker compose -f docker-compose.prod.yml up -d --build"
echo "=========================================================="
