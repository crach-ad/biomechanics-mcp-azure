#!/bin/bash

# Azure Resource Deployment Script for Biomechanics MCP Project
# This script provisions all required Azure resources

set -e

# Configuration variables
RG=rg-bio-mcp
LOC=eastus
AZSEARCH=ase-bio-technique
ST=stbiomcp$RANDOM
ENV=env-bio-mcp
LOGW=log-bio-mcp
KV=kv-bio-mcp
APP_MCP=app-mcp-bio
APP_INF=app-infer-bio

echo "🚀 Starting Azure resource provisioning..."
echo "Resource Group: $RG"
echo "Location: $LOC"
echo "Storage Account: $ST"

# Create resource group
echo "📁 Creating resource group..."
az group create -n $RG -l $LOC

# Create storage account for video files
echo "💾 Creating storage account..."
az storage account create \
  -g $RG \
  -n $ST \
  -l $LOC \
  --sku Standard_LRS \
  --kind StorageV2

# Create Log Analytics workspace
echo "📊 Creating Log Analytics workspace..."
az monitor log-analytics workspace create \
  -g $RG \
  -n $LOGW \
  -l $LOC

# Get workspace ID for container apps environment
WORKSPACE_ID=$(az monitor log-analytics workspace show \
  -g $RG \
  -n $LOGW \
  --query customerId \
  -o tsv)

# Create Container Apps environment
echo "🐳 Creating Container Apps environment..."
az containerapp env create \
  -g $RG \
  -n $ENV \
  -l $LOC \
  --logs-workspace-id $WORKSPACE_ID

# Create Key Vault for secrets
echo "🔐 Creating Key Vault..."
az keyvault create \
  -g $RG \
  -n $KV \
  -l $LOC

# Optional: Create Azure AI Search for technique references
echo "🔍 Creating Azure AI Search (optional)..."
az search service create \
  -g $RG \
  -n $AZSEARCH \
  -l $LOC \
  --sku Basic || echo "⚠️  Search service creation failed or already exists"

# Create storage container for videos
echo "📹 Creating storage container..."
STORAGE_KEY=$(az storage account keys list \
  -g $RG \
  -n $ST \
  --query '[0].value' \
  -o tsv)

az storage container create \
  --name videos \
  --account-name $ST \
  --account-key $STORAGE_KEY

echo "✅ Resource provisioning complete!"
echo ""
echo "📋 Resource Summary:"
echo "- Resource Group: $RG"
echo "- Storage Account: $ST"
echo "- Container Apps Environment: $ENV"
echo "- Key Vault: $KV"
echo "- Log Analytics: $LOGW"
echo "- AI Search: $AZSEARCH"
echo ""
echo "🔄 Next steps:"
echo "1. Deploy services with: ./deploy-services.sh"
echo "2. Configure VS Code Agent Builder"
echo "3. Test with sample video"

# Save configuration for deployment script
cat > ./azure-config.env << EOF
RG=$RG
LOC=$LOC
ST=$ST
ENV=$ENV
KV=$KV
APP_MCP=$APP_MCP
APP_INF=$APP_INF
AZSEARCH=$AZSEARCH
EOF

echo "💾 Configuration saved to azure-config.env"