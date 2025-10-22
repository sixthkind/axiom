#!/bin/bash

# Pull pocketbase using version from config files
# https://github.com/pocketbase/pocketbase/releases

# Default to local config if no environment is specified
ENV=${1:-local}
CONFIG_FILE="config/${ENV}.json"
VERSIONS_FILE="config/version.json"

# Check if config files exist
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Config file $CONFIG_FILE not found"
    echo "Available configs: local, server"
    exit 1
fi

if [ ! -f "$VERSIONS_FILE" ]; then
    echo "Error: Versions file $VERSIONS_FILE not found"
    exit 1
fi

# Read config values using jq
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install it first."
    echo "On macOS: brew install jq"
    echo "On Linux: sudo apt-get install jq"
    exit 1
fi

PB_VERSION=$(jq -r '.pocketbase' "$VERSIONS_FILE")
PB_SYSTEM=$(jq -r '.pocketbase.system' "$CONFIG_FILE")
PB_ARCH=$(jq -r '.pocketbase.arch' "$CONFIG_FILE")

# Check for required config values
if [ -z "$PB_VERSION" ] || [ -z "$PB_SYSTEM" ] || [ -z "$PB_ARCH" ]; then
    echo "Error: Missing required configuration values"
    echo "Please ensure your config files contain:"
    echo "  version.json: pocketbase version (e.g., 0.27.1)"
    echo "  ${CONFIG_FILE}: pocketbase.system (e.g., darwin, linux)"
    echo "  ${CONFIG_FILE}: pocketbase.arch (e.g., amd64, arm64)"
    exit 1
fi

# Construct download URL using config values
DOWNLOAD_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PB_SYSTEM}_${PB_ARCH}.zip"

# Function to install unzip based on system
install_unzip() {
    if ! command -v unzip &> /dev/null; then
        echo "unzip is not installed. Installing..."
        if [ -f /etc/debian_version ]; then
            # Debian/Ubuntu
            sudo apt-get update && sudo apt-get install -y unzip
        elif [ -f /etc/redhat-release ]; then
            # RHEL/CentOS/Fedora
            sudo yum install -y unzip
        elif [ -f /etc/arch-release ]; then
            # Arch Linux
            sudo pacman -Sy --noconfirm unzip
        elif command -v brew &> /dev/null; then
            # macOS with Homebrew
            brew install unzip
        else
            echo "Could not install unzip automatically. Please install it manually."
            exit 1
        fi
    fi
}

# Check for unzip before proceeding
install_unzip

# Download the zip file
echo "Downloading PocketBase v${PB_VERSION}..."
curl -L $DOWNLOAD_URL -o pocketbase_${PB_VERSION}_${PB_SYSTEM}_${PB_ARCH}.zip

# Unzip the archive
echo "Extracting files..."
unzip -o pocketbase_${PB_VERSION}_${PB_SYSTEM}_${PB_ARCH}.zip && rm pocketbase_${PB_VERSION}_${PB_SYSTEM}_${PB_ARCH}.zip

echo "PocketBase installation complete!"