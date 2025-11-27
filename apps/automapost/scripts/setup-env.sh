#!/bin/bash

# AutomaPost Environment Setup Script
# This script helps you set up environment files for development and production

echo "🚀 AutomaPost Environment Setup"
echo "================================"

# Function to copy template to actual env file
setup_development() {
    echo "📝 Setting up development environment..."
    
    if [ ! -f ".env.local" ]; then
        cp env.development.template .env.local
        echo "✅ Created .env.local from template"
        echo "📍 Edit .env.local with your development-specific values"
    else
        echo "⚠️  .env.local already exists. Backup created as .env.local.backup"
        cp .env.local .env.local.backup
        cp env.development.template .env.local
    fi
}

setup_production() {
    echo "🏭 Setting up production environment..."
    
    if [ ! -f ".env.production" ]; then
        cp env.production.template .env.production
        echo "✅ Created .env.production from template"
        echo "📍 Edit .env.production with your production-specific values"
    else
        echo "⚠️  .env.production already exists. Backup created as .env.production.backup"
        cp .env.production .env.production.backup
        cp env.production.template .env.production
    fi
}

# Check command line argument
case "$1" in
    "dev"|"development")
        setup_development
        ;;
    "prod"|"production")
        setup_production
        ;;
    "both"|"all")
        setup_development
        setup_production
        ;;
    *)
        echo "Usage: $0 [dev|prod|both]"
        echo ""
        echo "Commands:"
        echo "  dev   - Set up development environment (.env.local)"
        echo "  prod  - Set up production environment (.env.production)"
        echo "  both  - Set up both environments"
        echo ""
        echo "Examples:"
        echo "  ./scripts/setup-env.sh dev"
        echo "  ./scripts/setup-env.sh prod"
        echo "  ./scripts/setup-env.sh both"
        exit 1
        ;;
esac

echo ""
echo "🎯 Next steps:"
echo "   1. Review and edit your environment files"
echo "   2. For development: yarn dev"
echo "   3. For production: yarn build && yarn start"
echo ""
echo "📚 Environment file priority (Next.js):"
echo "   1. .env.local (development)"
echo "   2. .env.production (production)"
echo "   3. .env"
