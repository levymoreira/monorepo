#!/bin/bash

# PostgreSQL Database Setup Script
# This script installs PostgreSQL, configures it for remote access,
# and creates a user with the specified credentials.

# Note: Removed 'set -e' to allow script to continue even if some commands fail
# We'll handle errors individually for better resilience

# Database configuration
DB_USER="monorepo-user"
DB_PASSWORD="@ffkp?@fgg*7f123fe32f#$"
DB_NAME="monorepo-db"

echo "Starting PostgreSQL installation and configuration..."
echo "=========================================="

# Update package list
echo "Updating package list..."
sudo apt update

# Install PostgreSQL
echo "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
echo "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and configure database
echo "Configuring PostgreSQL..."

# Create user and database (with error handling for existing resources)
echo "Creating/updating database user and database..."

# Create user if it doesn't exist
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    echo "User '$DB_USER' already exists, updating password..."
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
else
    echo "Creating user '$DB_USER'..."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
fi

# Create database if it doesn't exist
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    echo "Database '$DB_NAME' already exists"
else
    echo "Creating database '$DB_NAME'..."
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
fi

# Ensure user has all required privileges
echo "Granting privileges to user '$DB_USER'..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

echo "✓ User '$DB_USER' and database '$DB_NAME' are ready"

# Configure PostgreSQL for remote access
echo "Configuring PostgreSQL for remote access..."

# Get PostgreSQL major version to find config path
PG_VERSION=$(sudo -u postgres psql -t -c "SHOW server_version;" | grep -o '^[0-9]*' | head -1)
PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"

# Fallback: if the above doesn't work, try to find the config directory
if [ ! -d "$PG_CONFIG_DIR" ]; then
    PG_CONFIG_DIR=$(find /etc/postgresql -name "postgresql.conf" -type f | head -1 | xargs dirname)
    if [ -z "$PG_CONFIG_DIR" ]; then
        echo "Error: Could not locate PostgreSQL configuration directory"
        exit 1
    fi
fi

# Backup original configuration files (only if backups don't exist)
if [ ! -f "$PG_CONFIG_DIR/postgresql.conf.backup" ]; then
    echo "Backing up postgresql.conf..."
    sudo cp "$PG_CONFIG_DIR/postgresql.conf" "$PG_CONFIG_DIR/postgresql.conf.backup"
else
    echo "postgresql.conf backup already exists"
fi

if [ ! -f "$PG_CONFIG_DIR/pg_hba.conf.backup" ]; then
    echo "Backing up pg_hba.conf..."
    sudo cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.backup"
else
    echo "pg_hba.conf backup already exists"
fi

echo "✓ Configuration files backed up"

# Configure postgresql.conf to listen on all addresses
if grep -q "^listen_addresses = '\*'" "$PG_CONFIG_DIR/postgresql.conf"; then
    echo "listen_addresses already configured for remote access"
else
    echo "Configuring postgresql.conf for remote access..."
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONFIG_DIR/postgresql.conf"
    sudo sed -i "s/^listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONFIG_DIR/postgresql.conf"
fi

# Configure pg_hba.conf to allow connections from any IP with password authentication
if grep -q "host.*all.*all.*0.0.0.0/0.*md5" "$PG_CONFIG_DIR/pg_hba.conf"; then
    echo "pg_hba.conf already configured for remote access"
else
    echo "Configuring pg_hba.conf for remote access..."
    echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a "$PG_CONFIG_DIR/pg_hba.conf"
fi

echo "✓ PostgreSQL configured for remote access"

# Restart PostgreSQL to apply changes
echo "Restarting PostgreSQL service..."
sudo systemctl restart postgresql

# Configure firewall (if ufw is active)
if sudo ufw status | grep -q "Status: active"; then
    if sudo ufw status | grep -q "5432"; then
        echo "Firewall already allows PostgreSQL connections on port 5432"
    else
        echo "Configuring firewall for PostgreSQL..."
        sudo ufw allow 5432/tcp
        echo "✓ Firewall configured to allow PostgreSQL connections on port 5432"
    fi
else
    echo "UFW firewall is not active. Please ensure port 5432 is open for PostgreSQL connections."
fi

# Display connection information
echo ""
echo "=========================================="
echo "PostgreSQL Installation Complete!"
echo "=========================================="
echo "Database Server: $(hostname -I | awk '{print $1}'):5432"
echo "Database Name: $DB_NAME"
echo "Username: $DB_USER"
echo "Password: $DB_PASSWORD"
echo ""
echo "Connection string example:"
echo "postgresql://$DB_USER:$DB_PASSWORD@$(hostname -I | awk '{print $1}'):5432/$DB_NAME"
echo ""
echo "To connect from remote machine:"
echo "psql -h $(hostname -I | awk '{print $1}') -p 5432 -U $DB_USER -d $DB_NAME"
echo ""
echo "Note: Make sure Azure Network Security Group allows inbound traffic on port 5432"
echo "=========================================="

# Test local connection
echo "Testing local database connection..."
if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 'Database connection successful!' as status;"; then
    echo "✓ Database connection test successful!"
else
    echo "✗ Database connection test failed!"
    exit 1
fi

echo "Setup complete!"