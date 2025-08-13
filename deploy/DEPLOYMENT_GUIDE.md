# Azure Deployment Guide

This guide walks you through deploying the biomechanics MCP server to Azure Container Apps with proper authentication and integration.

## Prerequisites Completed ✅

- [x] Azure CLI installed (v2.76.0)
- [x] Container Apps extension added
- [x] Project structure created
- [x] Dockerfiles and source code ready

## Step 1: Azure Authentication

Open a new Command Prompt or PowerShell window and run:

```cmd
az login
```

This will open a browser for Azure authentication. Follow the prompts to sign in.

Verify your subscription:
```cmd
az account show
```

If you have multiple subscriptions, set the correct one:
```cmd
az account set --subscription "your-subscription-id"
```

## Step 2: Run Resource Provisioning

From the project root directory, run:

```cmd
cd deploy
chmod +x azure-resources.sh
./azure-resources.sh
```

This script will create:
- Resource Group: `rg-bio-mcp`
- Storage Account: `stbiomcp[random]`
- Container Apps Environment: `env-bio-mcp`
- Log Analytics Workspace: `log-bio-mcp`
- Key Vault: `kv-bio-mcp`
- Azure AI Search: `ase-bio-technique` (optional)

## Step 3: Deploy Services

After resource provisioning completes, deploy both services:

```cmd
./deploy-services.sh
```

This will:
1. Deploy the inference service (Python/FastAPI)
2. Deploy the MCP server (TypeScript)
3. Configure networking between services
4. Generate VS Code configuration

## Step 4: Verify Deployment

Test the inference service:
```cmd
curl https://your-inference-app.azurecontainerapps.io/health
```

Test the MCP server endpoint:
```cmd
curl https://your-mcp-app.azurecontainerapps.io/mcp
```

## Step 5: Configure VS Code

1. Copy the generated `vscode-config.json` to `.vscode/mcp.json`
2. Open VS Code with AI Toolkit
3. Go to Agent Builder → Tools
4. Your MCP server should be auto-detected

## Alternative: Manual Azure Portal Deployment

If CLI deployment encounters issues, you can use the Azure Portal:

### 1. Create Resource Group
- Navigate to Azure Portal
- Create Resource Group: `rg-bio-mcp`
- Location: `East US`

### 2. Create Container Apps Environment
- Search for "Container Apps"
- Create new environment: `env-bio-mcp`
- Enable Log Analytics

### 3. Deploy Inference Service
- Create Container App: `app-infer-bio`
- Use container image build from `services/infer/`
- Set external ingress on port 8000
- Environment variables: `PYTHONUNBUFFERED=1`

### 4. Deploy MCP Server
- Create Container App: `app-mcp-bio`
- Use container image build from `services/mcp/`
- Set external ingress on port 3000
- Environment variables: `INFER_URL=https://app-infer-bio.azurecontainerapps.io`

## Step 6: Test Integration

### Test Biomechanics Analysis
```bash
curl -X POST https://your-mcp-app.azurecontainerapps.io/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "analyze_biomechanics",
      "arguments": {
        "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        "focus": ["bar path"]
      }
    }
  }'
```

## Step 7: VS Code Agent Builder Setup

1. **Install AI Toolkit** (if not already installed)
   - Open VS Code Extensions
   - Search "AI Toolkit"
   - Install Microsoft AI Toolkit

2. **Configure MCP Server**
   - Open Agent Builder
   - Add MCP Server → HTTP transport
   - URL: `https://your-mcp-app.azurecontainerapps.io/mcp`

3. **Test System Prompt**
   ```
   You are an expert biomechanics coach specializing in Olympic weightlifting. 
   Use the analyze_biomechanics tool to provide detailed coaching feedback.
   Focus on defensive sports applications and athlete development.
   ```

4. **Test Analysis**
   - Upload a sample video
   - Ask: "Analyze this clean and jerk, focus on bar path"
   - Verify the MCP tools are called correctly

## Troubleshooting

### Authentication Issues
- Ensure you're logged into the correct Azure subscription
- Check resource permissions (Contributor role required)
- Verify Azure CLI version is current

### Container Apps Issues
- Check deployment logs in Azure Portal
- Verify Docker images build successfully
- Check environment variables and networking

### MCP Connection Issues
- Verify MCP endpoint is accessible
- Check CORS configuration if needed
- Validate JSON-RPC format in requests

### VS Code Integration Issues
- Restart VS Code after MCP configuration
- Check Developer Console for errors
- Verify AI Toolkit extension is enabled

## Security Best Practices

- Store secrets in Azure Key Vault
- Use managed identity for service authentication
- Enable monitoring and logging
- Review network security groups
- Regular security updates

## Cost Optimization

- Use consumption-based pricing for Container Apps
- Monitor resource usage in Azure Monitor
- Set up cost alerts
- Scale down non-production resources

## Next Steps

After successful deployment:

1. **Add Real ML Models**: Replace mock analysis with actual pose estimation
2. **Implement Authentication**: Add proper user authentication
3. **Setup Monitoring**: Configure Application Insights
4. **Add Auto-scaling**: Configure scaling rules based on demand
5. **Setup CI/CD**: Implement automated deployment pipeline

## Support Resources

- [Azure Container Apps Documentation](https://docs.microsoft.com/en-us/azure/container-apps/)
- [VS Code MCP Integration](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- [Project README](../README.md)
- [Troubleshooting Guide](../docs/TROUBLESHOOTING.md)