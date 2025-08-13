#!/bin/bash

# Service Deployment Script for Biomechanics MCP Project
# Deploys both inference and MCP services to Azure Container Apps

set -e

# Load configuration
if [ -f "./azure-config.env" ]; then
    source ./azure-config.env
    echo "📋 Loaded configuration from azure-config.env"
else
    echo "❌ azure-config.env not found. Run azure-resources.sh first."
    exit 1
fi

echo "🚀 Deploying services to Azure Container Apps..."

# Deploy inference service
echo "🧠 Deploying inference service..."
cd ../services/infer

az containerapp up \
  --name $APP_INF \
  --resource-group $RG \
  --environment $ENV \
  --location $LOC \
  --ingress external \
  --target-port 8000 \
  --source . \
  --set-env-vars "PYTHONUNBUFFERED=1"

# Get inference service URL
INFER_FQDN=$(az containerapp show \
  -g $RG \
  -n $APP_INF \
  --query properties.configuration.ingress.fqdn \
  -o tsv)

INFER_URL="https://$INFER_FQDN"
echo "✅ Inference service deployed: $INFER_URL"

# Deploy MCP server
echo "🔧 Deploying MCP server..."
cd ../mcp

# Install dependencies first
npm install

az containerapp up \
  --name $APP_MCP \
  --resource-group $RG \
  --environment $ENV \
  --location $LOC \
  --ingress external \
  --target-port 3000 \
  --source . \
  --set-env-vars "INFER_URL=$INFER_URL"

# Get MCP service URL
MCP_FQDN=$(az containerapp show \
  -g $RG \
  -n $APP_MCP \
  --query properties.configuration.ingress.fqdn \
  -o tsv)

MCP_URL="https://$MCP_FQDN/mcp"
echo "✅ MCP server deployed: $MCP_URL"

cd ../../deploy

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Service Endpoints:"
echo "- Inference API: $INFER_URL"
echo "- MCP Server: $MCP_URL"
echo ""
echo "🔄 Next steps:"
echo "1. Test services with: curl $INFER_URL/health"
echo "2. Configure VS Code Agent Builder with MCP URL: $MCP_URL"
echo "3. Add supporting MCP servers (filesystem, time, fetch, slack)"

# Save endpoints for VS Code configuration
cat > ../vscode-config.json << EOF
{
  "mcp": {
    "servers": {
      "biomech-mcp": {
        "transport": "http",
        "url": "$MCP_URL",
        "env": { "AUTH_MODE": "none" }
      }
    }
  }
}
EOF

echo "💾 VS Code MCP configuration saved to vscode-config.json"
echo "   Copy this to your project's .vscode/mcp.json file"