# VS Code Agent Builder Setup Guide

This guide walks you through connecting your biomechanics MCP server to VS Code's Agent Builder for interactive coaching sessions.

## Prerequisites

- VS Code with AI Toolkit extension installed
- Agent Builder feature enabled
- Local or deployed MCP server running

## Setup Steps

### 1. Install VS Code AI Toolkit

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "AI Toolkit" or "Agent Builder"
4. Install the official Microsoft AI Toolkit

### 2. Configure MCP Server Connection

#### Option A: Use Existing Configuration File

The project includes a `.vscode/mcp.json` file. VS Code should automatically detect it.

#### Option B: Manual Configuration via UI

1. Open AI Toolkit → Agent Builder
2. Click **Tools** tab
3. Click **+ MCP Server**
4. Select **Connect to an Existing MCP Server**
5. Choose **HTTP (streamable)** transport
6. Enter your MCP server URL:
   - **Local**: `http://localhost:3000/mcp`
   - **Azure**: `https://your-mcp-app.azurecontainerapps.io/mcp`

#### Option C: Manual Configuration via File

Create or edit `.vscode/mcp.json` in your project:

```json
{
  "mcp": {
    "servers": {
      "biomech-mcp": {
        "transport": "http",
        "url": "http://localhost:3000/mcp",
        "env": { "AUTH_MODE": "none" }
      }
    }
  }
}
```

### 3. Add Supporting MCP Servers

Add these additional MCP servers for enhanced functionality:

#### Filesystem Server
```bash
npx -y @modelcontextprotocol/server-filesystem .
```

#### Time Server
```bash
npm install -g @modelcontextprotocol/server-time
```

#### Fetch Server (for web content)
```bash
npm install -g @modelcontextprotocol/server-fetch
```

### 4. Configure System Prompt

Create a system prompt for biomechanics coaching:

```
You are an expert biomechanics coach specializing in Olympic weightlifting and athletic movement analysis. You help athletes improve their technique through detailed video analysis and evidence-based coaching recommendations.

Your expertise includes:
- Movement pattern analysis
- Joint angle assessment  
- Bar path optimization
- Phase-by-phase technique breakdown
- Progressive correction strategies
- Injury prevention through proper form

When analyzing videos:
1. Use the analyze_biomechanics tool for comprehensive analysis
2. Extract specific frames with grab_frame for detailed review
3. Save coaching feedback with save_feedback for athlete progress tracking
4. Reference technique articles with search_technique_refs when needed

Always provide:
- Clear, actionable feedback
- Progressive correction strategies
- Specific drill recommendations
- Safety considerations
- Evidence-based explanations

Focus on defensive sports applications and athlete development.
```

### 5. Test the Setup

#### Basic Test
1. In Agent Builder, start a new conversation
2. Upload a sample video or provide a video URL
3. Ask: "Analyze this movement for coaching feedback"

#### Advanced Test
```
System Prompt: [Use the biomechanics coaching prompt above]
User Message: "Coach: Please analyze this clean and jerk video. Focus on bar path and receiving position. Athlete: Sarah, Age: 22, Sport: Weightlifting"
Attachments: [Upload video file or provide URL]
```

### 6. Available Tools

Your agent will have access to these tools:

- **analyze_biomechanics**: Full movement analysis with coaching feedback
- **grab_frame**: Extract specific frames for detailed review
- **save_feedback**: Save coaching notes for athlete progress tracking  
- **search_technique_refs**: Find relevant coaching articles and references
- **filesystem**: Read/write analysis files and reports
- **time**: Handle timestamps and scheduling

### 7. Workflow Examples

#### Session Analysis Workflow
1. Upload athlete video
2. Run biomechanics analysis
3. Extract key frames for detailed review
4. Generate coaching feedback
5. Save session notes for athlete file
6. Search for relevant technique references

#### Progressive Coaching Workflow
1. Compare multiple sessions over time
2. Track improvement metrics
3. Adjust training recommendations
4. Document progress in athlete files

## Troubleshooting

### MCP Server Not Connecting
- Check server is running on correct port
- Verify URL in configuration
- Check firewall/network settings
- Review VS Code developer console for errors

### Tools Not Available
- Ensure MCP server is properly registered
- Check tool registration in server code
- Verify server health endpoint
- Restart VS Code and try again

### Analysis Errors
- Verify video URL is accessible
- Check video format compatibility
- Ensure inference service is running
- Review server logs for detailed errors

## Advanced Configuration

### Custom Tool Configuration
Modify `services/mcp/src/index.ts` to add custom tools for your specific coaching needs.

### Authentication
For production deployments, configure authentication in Azure Container Apps and update MCP configuration.

### Performance Optimization
- Use video preprocessing for large files
- Implement caching for frequent analyses
- Configure auto-scaling for peak usage

## Support

- Check the main README.md for project overview
- Review logs in Azure Monitor for deployed services
- Test local development setup with `test/test-local.sh`
- Ensure all prerequisites are met

## Security Notes

- Only analyze videos from trusted sources
- Keep athlete data confidential and secure
- Follow defensive sports analysis guidelines
- Never use for malicious analysis purposes