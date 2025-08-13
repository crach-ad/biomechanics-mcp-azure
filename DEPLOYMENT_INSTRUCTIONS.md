# GitHub Actions Deployment Instructions

## 🔧 Setup Steps for GitHub Actions Deployment

### 1. Create GitHub Repository

```bash
cd C:\Users\crach\OneDrive\Desktop\azureMCP
git init
git add .
git commit -m "Initial commit: Biomechanics MCP Server

🎯 Features implemented:
- FastAPI inference service with biomechanics analysis
- TypeScript MCP server with 4 coaching tools
- Azure Container Apps deployment configuration
- GitHub Actions CI/CD pipeline

🔧 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Create repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/biomechanics-mcp-azure.git
git branch -M main
git push -u origin main
```

### 2. Create Azure Service Principal

```bash
# Create service principal for GitHub Actions
az ad sp create-for-rbac --name "github-actions-biomech-mcp" \
  --role contributor \
  --scopes /subscriptions/a22e1acd-4ea5-44e9-935a-5343eea06a1c/resourceGroups/rg-bio-mcp \
  --sdk-auth
```

This will output JSON credentials like:
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "a22e1acd-4ea5-44e9-935a-5343eea06a1c",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 3. Configure GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

**Secret Name**: `AZURE_CREDENTIALS`
**Secret Value**: The entire JSON output from step 2

### 4. Grant Container Registry Permissions

```bash
# Get the service principal object ID
SP_ID=$(az ad sp list --display-name "github-actions-biomech-mcp" --query "[0].id" -o tsv)

# Grant ACR push permissions
az role assignment create \
  --assignee $SP_ID \
  --role AcrPush \
  --scope /subscriptions/a22e1acd-4ea5-44e9-935a-5343eea06a1c/resourceGroups/rg-bio-mcp/providers/Microsoft.ContainerRegistry/registries/ca1987fd2629acr
```

### 5. Test Deployment

Push any change to the main branch to trigger the deployment:

```bash
echo "# Trigger deployment" >> README.md
git add README.md
git commit -m "Trigger GitHub Actions deployment"
git push
```

Monitor the deployment in the **Actions** tab of your GitHub repository.

## 🎯 What the Deployment Does

1. **Builds Docker Images**: Creates containers for both inference and MCP services
2. **Pushes to ACR**: Uploads images to your Azure Container Registry
3. **Updates Container Apps**: Deploys new images to your running services
4. **Tests Endpoints**: Verifies services are responding correctly

## 🔍 Troubleshooting

### Common Issues

**Permission Errors**:
- Ensure service principal has Contributor role on resource group
- Verify ACR push permissions are granted

**Build Failures**:
- Check Dockerfile syntax in services/infer and services/mcp
- Verify all dependencies are listed in requirements.txt and package.json

**Deployment Timeouts**:
- Container Apps may take 5-10 minutes to update
- Check Azure portal for Container Apps status

### Verification Commands

```bash
# Check if services are responding
curl https://app-infer-bio.livelyforest-5153f98b.eastus.azurecontainerapps.io/health
curl https://app-mcp-bio.livelyforest-5153f98b.eastus.azurecontainerapps.io/mcp

# Check container app status
az containerapp show --name app-infer-bio --resource-group rg-bio-mcp --query "properties.runningStatus"
az containerapp show --name app-mcp-bio --resource-group rg-bio-mcp --query "properties.runningStatus"
```

## 🎉 Next Steps After Deployment

1. **Test MCP Integration**: Connect VS Code Agent Builder to the MCP endpoint
2. **Upload Test Video**: Try the biomechanics analysis workflow
3. **Monitor Performance**: Check logs and metrics in Azure portal
4. **Add Enhancements**: Deploy additional MCP servers or ML models

## 📋 Manual Backup Deployment

If GitHub Actions doesn't work, you can still deploy manually:

```bash
# Build and push images locally (requires Docker)
docker build -t ca1987fd2629acr.azurecr.io/bio-infer:latest services/infer/
docker build -t ca1987fd2629acr.azurecr.io/bio-mcp:latest services/mcp/

az acr login --name ca1987fd2629acr
docker push ca1987fd2629acr.azurecr.io/bio-infer:latest
docker push ca1987fd2629acr.azurecr.io/bio-mcp:latest

# Update container apps
az containerapp update --name app-infer-bio --resource-group rg-bio-mcp --image ca1987fd2629acr.azurecr.io/bio-infer:latest
az containerapp update --name app-mcp-bio --resource-group rg-bio-mcp --image ca1987fd2629acr.azurecr.io/bio-mcp:latest
```