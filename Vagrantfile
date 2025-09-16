# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Use Ubuntu 20.04 LTS (Focal)
  config.vm.box = "ubuntu/focal64"
  config.vm.hostname = "kenya-health-system"
  
  # Increase boot timeout to handle slow connections
  config.vm.boot_timeout = 600

  # Network configuration
  config.vm.network "private_network", ip: "192.168.56.10"
  config.vm.network "forwarded_port", guest: 8000, host: 9000, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 3000, host: 9001, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 5432, host: 9002, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 6379, host: 9003, host_ip: "127.0.0.1"

  # VM configuration
  config.vm.provider "virtualbox" do |vb|
    vb.name = "kenya-health-system"
    vb.memory = "4096"
    vb.cpus = 2
    vb.gui = false
  end

  # Sync folders
  config.vm.synced_folder ".", "/vagrant", type: "virtualbox"
  config.vm.synced_folder ".", "/home/vagrant/kenya_health_system", type: "virtualbox"

  # Provisioning script
  config.vm.provision "shell", inline: <<-SHELL
    # Update system
    apt-get update
    apt-get upgrade -y

    # Install essential system dependencies
    apt-get install -y \
      curl \
      git \
      build-essential \
      apt-transport-https \
      ca-certificates \
      gnupg \
      lsb-release

    # Install Docker and Docker Compose
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Add vagrant user to docker group
    usermod -aG docker vagrant

    # Start and enable Docker
    systemctl enable docker
    systemctl start docker

    # Create necessary directories
    mkdir -p /home/vagrant/kenya_health_system/data/logs
    mkdir -p /home/vagrant/kenya_health_system/data/postgres/backups
    chown -R vagrant:vagrant /home/vagrant/kenya_health_system

    echo "Docker setup completed!"
    echo "Access the VM with: vagrant ssh"
    echo "To start the application with Docker:"
    echo "1. vagrant ssh"
    echo "2. cd kenya_health_system"
    echo "3. docker compose up --build"
    echo "Django will be available at: http://localhost:9000"
    echo "React will be available at: http://localhost:9001"
  SHELL

  # User-level provisioning to start Docker services
  config.vm.provision "shell", inline: <<-SHELL
    cd /home/vagrant/kenya_health_system

    # Wait for Docker to be ready
    sleep 15

    # Set up environment variables if not exists
    if [ ! -f .env ]; then
      cp .env.example .env 2>/dev/null || echo "No .env.example found, skipping..."
    fi

    # Use sudo to run Docker commands (temporary workaround for permissions)
    echo "Starting Docker services..."
    sudo docker compose up --build -d

    # Wait for services to be ready
    echo "Waiting for services to start..."
    sleep 30

    # Check if services are running
    sudo docker compose ps

    # Set proper ownership for Docker socket access
    sudo chown vagrant:docker /var/run/docker.sock
    sudo chmod 666 /var/run/docker.sock

    echo "Application setup completed with Docker!"
    echo "Services are running in the background."
    echo "Access the application at:"
    echo "- Django Backend: http://localhost:9000"
    echo "- React Frontend: http://localhost:9001"
    echo "- PostgreSQL: localhost:9002"
    echo "- Redis: localhost:9003"
    echo ""
    echo "To manage services (after SSH):"
    echo "- View logs: docker compose logs -f"
    echo "- Stop services: docker compose down"
    echo "- Restart services: docker compose restart"
    echo ""
    echo "Note: Docker socket permissions have been set for user access."
  SHELL
end
