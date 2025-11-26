#!/bin/bash

# Commit script
# Creates a git commit with the current date and time as the message

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory and resolve project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT" || {
    echo -e "${RED}✗ Failed to change to project directory${NC}"
    exit 1
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}✗ Not a git repository${NC}"
    exit 1
fi

# Check if there are any changes to commit
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${YELLOW}⚠ No changes to commit${NC}"
    exit 0
fi

# Generate commit message with date and time
COMMIT_MESSAGE=$(date '+%Y-%m-%d %H:%M:%S')

echo -e "${YELLOW}📝 Creating commit with message: ${COMMIT_MESSAGE}${NC}"

# Stage all changes
git add -A

# Create commit
git commit -m "$COMMIT_MESSAGE" || {
    echo -e "${RED}✗ Failed to create commit${NC}"
    exit 1
}

echo -e "${GREEN}✓ Commit created successfully${NC}"
echo -e "${GREEN}  Message: ${COMMIT_MESSAGE}${NC}"

# Push changes to remote
echo -e "${YELLOW}📤 Pushing changes to remote...${NC}"

# Get the current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Check if remote exists
if ! git remote | grep -q .; then
    echo -e "${YELLOW}⚠ No remote repository configured, skipping push${NC}"
    exit 0
fi

# Push to remote (use current branch)
git push origin "$CURRENT_BRANCH" || {
    echo -e "${RED}✗ Failed to push changes${NC}"
    exit 1
}

echo -e "${GREEN}✓ Changes pushed successfully to origin/${CURRENT_BRANCH}${NC}"

