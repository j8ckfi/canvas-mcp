const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

const CANVAS_BASE_URL = 'https://jajags.instructure.com/api/v1';
const CANVAS_TOKEN = process.env.CANVAS_TOKEN || '17740~C7Xz3AHmmFUN8PDJuQ3XGtQNfPP73UAY2LuU7aKQecKyW2Bv2ex7TxxFay9vx9VD';

// MCP Tool definitions
const tools = [
  {
        name: 'get_courses',
        description: 'Get list of courses for current user',
        inputSchema: {
                type: 'object',
                properties: {},
                required: []
        }
  },
  {
        name: 'get_assignments',
        description: 'Get assignments for a specific course',
        inputSchema: {
                type: 'object',
                properties: {
                          courseId: { type: 'string', description: 'Canvas course ID' }
                },
                required: ['courseId']
        }
  },
  {
        name: 'get_submissions',
        description: 'Get submissions for an assignment',
        inputSchema: {
                type: 'object',
                properties: {
                          courseId: { type: 'string', description: 'Canvas course ID' },
                          assignmentId: { type: 'string', description: 'Canvas assignment ID' }
                },
                required: ['courseId', 'assignmentId']
        }
  }
  ];

// Helper function to fetch Canvas API
async function fetchCanvas(endpoint) {
    try {
          const response = await fetch(`${CANVAS_BASE_URL}${endpoint}`, {
                  headers: {
                            'Authorization': `Bearer ${CANVAS_TOKEN}`,
                            'Content-Type': 'application/json'
                  }
          });
          if (!response.ok) {
                  throw new Error(`Canvas API error: ${response.status}`);
          }
          return await response.json();
    } catch (error) {
          throw new Error(`Failed to fetch from Canvas: ${error.message}`);
    }
}

// SSE endpoint for MCP
app.get('/sse', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

          // Send initialization
          res.write(`data: ${JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                result: {
                        protocolVersion: '2024-11-05',
                        capabilities: {
                                  tools: {}
                        },
                        serverInfo: {
                                  name: 'canvas-mcp',
                                  version: '1.0.0'
                        }
                }
          })}\n\n`);

          // Keep connection open for messages
          req.on('close', () => {
                res.end();
          });
});

// Handle tool calls
app.post('/tool-call', express.json(), async (req, res) => {
    const { name, arguments: args } = req.body;

           try {
                 let result;

      if (name === 'get_courses') {
              result = await fetchCanvas('/courses?per_page=100');
      } else if (name === 'get_assignments') {
              result = await fetchCanvas(`/courses/${args.courseId}/assignments?per_page=100`);
      } else if (name === 'get_submissions') {
              result = await fetchCanvas(`/courses/${args.courseId}/assignments/${args.assignmentId}/submissions?per_page=100`);
      } else {
              throw new Error(`Unknown tool: ${name}`);
      }

      res.json({ success: true, data: result });
           } catch (error) {
                 res.status(400).json({ error: error.message });
           }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'canvas-mcp' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Canvas MCP server running on port ${PORT}`);
});
