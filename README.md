# Biomechanics MCP Server for Azure

A comprehensive biomechanics analysis system built with Model Context Protocol (MCP) for defensive sports coaching. This project provides automated movement analysis for weightlifting and athletic movements using computer vision and AI.

## 🏗️ Architecture

- **Inference Service** (Python/FastAPI): Pose estimation and biomechanics analysis
- **MCP Server** (TypeScript): Model Context Protocol server exposing analysis tools
- **Azure Backend**: Container Apps, Blob Storage, Key Vault, AI Search
- **VS Code Integration**: Agent Builder with MCP for interactive coaching

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Azure CLI with Container Apps extension
- VS Code with AI Toolkit/Agent Builder

### 1. Install Azure CLI Extension

```bash
az extension add -n containerapp
```

### 2. Deploy to Azure

```bash
# Make scripts executable
chmod +x deploy/*.sh

# Provision Azure resources
./deploy/azure-resources.sh

# Deploy services
./deploy/deploy-services.sh
```

### 3. Test Local Development

```bash
# Start inference service
cd services/infer
pip install -r requirements.txt
python app.py

# Start MCP server (in another terminal)
cd services/mcp
npm install
npm run dev
```

### 4. Configure VS Code Agent Builder

1. Open VS Code with AI Toolkit
2. Go to Agent Builder → Tools
3. Add MCP Server → Connect to Existing
4. Use HTTP transport with your deployed MCP URL
5. Select tools: `analyze_biomechanics`, `grab_frame`, `save_feedback`, `search_technique_refs`

## 🛠️ Available Tools

### analyze_biomechanics
Analyzes movement videos for coaching feedback
- **Input**: Video URL, optional focus areas
- **Output**: Structured analysis with phases, recommendations

### grab_frame
Extracts specific frames from video for detailed analysis
- **Input**: Video URL, timestamp in milliseconds
- **Output**: Frame information and location

### save_feedback
Saves coaching feedback for athlete progress tracking
- **Input**: Athlete ID, feedback markdown, session date
- **Output**: Confirmation of saved feedback

### search_technique_refs
Searches coaching articles and technique references
- **Input**: Search query, result limit
- **Output**: Relevant coaching resources

## 📁 Project Structure

```
azureMCP/
├── plan.md                 # Original project plan
├── README.md              # This file
├── services/
│   ├── infer/             # Python inference service
│   │   ├── app.py         # FastAPI application
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── mcp/               # TypeScript MCP server
│       ├── src/index.ts   # MCP server implementation
│       ├── package.json
│       ├── tsconfig.json
│       └── Dockerfile
├── deploy/
│   ├── azure-resources.sh # Azure provisioning script
│   ├── deploy-services.sh # Service deployment script
│   └── azure-config.env   # Generated configuration
└── vscode-config.json     # Generated VS Code MCP config
```

## 🎯 Usage Examples

### Basic Analysis
```
Prompt: "Analyze this clean and jerk video, focus on bar path"
Video: [Upload or provide URL]
```

### Detailed Coaching Session
```
System Prompt: Advanced biomechanics coach specializing in Olympic lifting technique
User Prompt: "Review this athlete's clean technique and provide progressive corrections"
```

### Frame-by-Frame Analysis
```
Prompt: "Extract frame at peak extension (around 1200ms) and analyze hip angle"
```

## 🔧 Configuration

### Environment Variables

**Inference Service:**
- `PYTHONUNBUFFERED=1`

**MCP Server:**
- `INFER_URL`: URL to inference service
- `PORT`: Server port (default: 3000)

### Azure Resources

The deployment creates:
- Resource Group: `rg-bio-mcp`
- Container Apps Environment: `env-bio-mcp`
- Storage Account: `stbiomcp[random]`
- Key Vault: `kv-bio-mcp`
- Log Analytics: `log-bio-mcp`
- AI Search: `ase-bio-technique` (optional)

## 🧪 Testing

### Health Check
```bash
curl https://your-inference-url/health
```

### Video Analysis
```bash
curl -X POST https://your-inference-url/analyze \
  -H "Content-Type: application/json" \
  -d '{"video_url": "https://example.com/video.mp4"}'
```

### MCP Server Test
Use VS Code Agent Builder or MCP client to test tools.

## 🔐 Security & Best Practices

- All secrets stored in Azure Key Vault
- HTTPS endpoints for all services
- No sensitive data in logs or responses
- Defensive sports analysis only - no malicious applications
- Container Apps with managed identity
- Principle of least privilege for access

## 📈 Scaling & Production

- **Auto-scaling**: Container Apps scale based on demand
- **Monitoring**: Azure Monitor integration
- **Storage**: Blob Storage for video files
- **Search**: Azure AI Search for technique references
- **Caching**: Consider Redis for frequent analyses

## 🤝 Contributing

This is a defensive sports analysis tool. Contributions should focus on:
- Improved pose estimation accuracy
- Better coaching feedback algorithms
- Enhanced athlete progress tracking
- Additional safety and form analysis

## 📚 References

- [VS Code MCP Documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 📄 License

This project is designed for defensive sports coaching and analysis purposes.