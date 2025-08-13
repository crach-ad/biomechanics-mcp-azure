import { z } from "zod";
import fetch from "node-fetch";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

// Environment variables
const INFER_URL = process.env.INFER_URL || "http://localhost:8000";
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Initialize MCP server
const server = new McpServer({ 
  name: "biomech-mcp", 
  version: "0.1.0",
  description: "Biomechanics analysis MCP server for defensive sports coaching"
});

// Tool: Analyze biomechanics from video
server.registerTool(
  "analyze_biomechanics",
  {
    title: "Analyze movement biomechanics from video",
    description: "Run pose estimation and bar path analysis on weightlifting/movement videos to provide structured coaching feedback for defensive sports training.",
    inputSchema: {
      type: "object",
      properties: {
        video_url: {
          type: "string",
          description: "SAS URL or public URL to the video file for analysis"
        },
        focus: {
          type: "array",
          items: { type: "string" },
          description: "Optional focus areas for analysis (e.g., 'bar path', 'receive', 'timing')",
          optional: true
        }
      },
      required: ["video_url"]
    }
  },
  async ({ video_url, focus }) => {
    try {
      const response = await fetch(`${INFER_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          video_url, 
          phases: ["setup", "pull", "transition", "receive", "recovery"],
          focus: focus || []
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      // Format the response for coaching use
      const formattedText = formatAnalysisResponse(data);
      
      return { 
        content: [{ 
          type: "text", 
          text: formattedText 
        }] 
      };
    } catch (error) {
      return { 
        content: [{ 
          type: "text", 
          text: `Error analyzing video: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }] 
      };
    }
  }
);

// Tool: Extract frame from video at specific timestamp
server.registerTool(
  "grab_frame",
  {
    title: "Extract a still frame from video",
    description: "Extract and return information about a specific frame at a given timestamp for detailed analysis.",
    inputSchema: {
      type: "object",
      properties: {
        video_url: {
          type: "string",
          description: "URL to the video file"
        },
        ms: {
          type: "number",
          description: "Timestamp in milliseconds to extract frame"
        }
      },
      required: ["video_url", "ms"]
    }
  },
  async ({ video_url, ms }) => {
    try {
      const response = await fetch(`${INFER_URL}/frame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url, ms })
      });

      if (!response.ok) {
        throw new Error(`Frame extraction failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      return { 
        content: [{ 
          type: "text", 
          text: `Frame extracted at ${ms}ms:\n- Timestamp: ${data.timestamp_ms}ms\n- Status: ${data.message}\n- Frame saved for analysis` 
        }] 
      };
    } catch (error) {
      return { 
        content: [{ 
          type: "text", 
          text: `Error extracting frame: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }] 
      };
    }
  }
);

// Tool: Save feedback for athlete
server.registerTool(
  "save_feedback",
  {
    title: "Save coaching feedback for athlete",
    description: "Persist analysis summary and recommendations for a specific athlete for future reference and progress tracking.",
    inputSchema: {
      type: "object",
      properties: {
        athlete_id: {
          type: "string",
          description: "Unique identifier for the athlete"
        },
        feedback_md: {
          type: "string",
          description: "Markdown-formatted feedback and recommendations"
        },
        session_date: {
          type: "string",
          description: "Date of the training session (YYYY-MM-DD)",
          optional: true
        }
      },
      required: ["athlete_id", "feedback_md"]
    }
  },
  async ({ athlete_id, feedback_md, session_date }) => {
    try {
      // In production, this would save to Azure Blob Storage or Cosmos DB
      // For now, we'll simulate the save operation
      const timestamp = session_date || new Date().toISOString().split('T')[0];
      const filename = `feedback_${athlete_id}_${timestamp}.md`;
      
      // Mock save operation
      console.log(`Saving feedback for athlete ${athlete_id}:`, feedback_md);
      
      return { 
        content: [{ 
          type: "text", 
          text: `✓ Feedback saved for athlete ${athlete_id}\n- File: ${filename}\n- Date: ${timestamp}\n- Length: ${feedback_md.length} characters` 
        }] 
      };
    } catch (error) {
      return { 
        content: [{ 
          type: "text", 
          text: `Error saving feedback: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }] 
      };
    }
  }
);

// Tool: Search technique references (placeholder for Azure AI Search integration)
server.registerTool(
  "search_technique_refs",
  {
    title: "Search technique reference materials",
    description: "Search through coaching articles, technique guides, and reference materials for specific movement patterns or corrections.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (e.g., 'bar path correction', 'clean pull technique', 'front rack mobility')"
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return",
          optional: true
        }
      },
      required: ["query"]
    }
  },
  async ({ query, limit = 5 }) => {
    try {
      // Mock search results - in production this would query Azure AI Search
      const mockResults = [
        {
          title: "Bar Path Optimization in Olympic Lifts",
          excerpt: "Maintaining vertical bar path through proper lat engagement and timing...",
          source: "Coaching Manual Vol. 3"
        },
        {
          title: "Clean Pull Technique Progressions",
          excerpt: "Building proper pulling mechanics through systematic drill progression...",
          source: "Movement Fundamentals"
        },
        {
          title: "Front Rack Mobility and Positioning",
          excerpt: "Essential mobility requirements and correction exercises for front rack...",
          source: "Mobility Protocols"
        }
      ];

      const results = mockResults.slice(0, limit);
      const formattedResults = results.map((result, index) => 
        `**${index + 1}. ${result.title}**\n${result.excerpt}\n*Source: ${result.source}*`
      ).join('\n\n');

      return { 
        content: [{ 
          type: "text", 
          text: `Found ${results.length} reference(s) for "${query}":\n\n${formattedResults}` 
        }] 
      };
    } catch (error) {
      return { 
        content: [{ 
          type: "text", 
          text: `Error searching references: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }] 
      };
    }
  }
);

// Helper function to format analysis response
function formatAnalysisResponse(data: any): string {
  let formatted = `# Biomechanics Analysis\n\n`;
  
  formatted += `## Overview\n${data.overview}\n\n`;
  
  formatted += `## Phase Analysis\n`;
  for (const [phase, details] of Object.entries(data.phases) as [string, any][]) {
    formatted += `### ${phase.charAt(0).toUpperCase() + phase.slice(1)}\n`;
    formatted += `${details.notes}\n`;
    
    if (details.timing) {
      formatted += `- **Timing:** ${details.timing.start_ms}ms - ${details.timing.end_ms}ms\n`;
    }
    
    if (details.angles) {
      formatted += `- **Joint Angles:** Hip: ${details.angles.hip}°, Knee: ${details.angles.knee}°\n`;
    }
    
    if (details.key_points) {
      formatted += `- **Key Points:** ${details.key_points.join(', ')}\n`;
    }
    
    formatted += `\n`;
  }
  
  formatted += `## Recommendations\n`;
  data.recommendations.forEach((rec: string, index: number) => {
    formatted += `${index + 1}. ${rec}\n`;
  });
  
  if (data.debug?.focus_areas?.length > 0) {
    formatted += `\n*Analysis focused on: ${data.debug.focus_areas.join(', ')}*`;
  }
  
  return formatted;
}

// Start the server
async function main() {
  const transport = new StreamableHTTPServerTransport({ 
    port: PORT,
    path: "/mcp"
  });
  
  await server.connect(transport);
  console.log(`🏋️ Biomechanics MCP server running on port ${PORT}`);
  console.log(`📊 Streamable HTTP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🔗 Inference service: ${INFER_URL}`);
}

main().catch(console.error);