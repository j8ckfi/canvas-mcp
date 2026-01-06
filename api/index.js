const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const CANVAS_BASE_URL = 'https://jajags.instructure.com/api/v1';
const CANVAS_TOKEN = process.env.CANVAS_TOKEN || '17740~C7Xz3AHmmFUN8PDJuQ3XGtQNfPP73UAY2LuU7aKQecKyW2Bv2ex7TxxFay9vx9VD';

// Helper to fetch from Canvas API
async function fetchCanvas(endpoint) {
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
}

// MCP Server implementation
let requestId = 1;

// Generate SSE stream for MCP
function sendMCPResponse(res, response) {
    res.write(`data: ${JSON.stringify(response)}\n\n`);
}

app.get('/', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
          // Send initialization response
          sendMCPResponse(res, {
                  jsonrpc: '2.0',
                  id: 1,
                  result: {
                            protocolVersion: '2024-11-05',
                            capabilities: {
                                        tools: {}
                            },
                            serverInfo: {
                                        name: 'Canvas MCP',
                                        version: '1.0.0'
                            }
                  }
          });

          // Send tools list
          sendMCPResponse(res, {
                  jsonrpc: '2.0',
                  method: 'resources/list',
                  params: {
                            tools: [
                              {
                                            name: 'get_courses',
                                            description: 'Get all courses for the current user',
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
                                      ]
                  }
          });

          // Keep connection alive
          req.on('close', () => res.end());
    } catch (error) {
          sendMCPResponse(res, {
                  jsonrpc: '2.0',
                  id: 1,
                  error: { code: -32603, message: error.message }
          });
          res.end();
    }
});

// Handle tool calls
app.post('/', async (req, res) => {
    try {
          const { method, params, id } = req.body;

          if (method === 'tools/call') {
                  const { name, arguments: args } = params;
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

                  res.json({
                            jsonrpc: '2.0',
                            id,
                            result: { content: [{ type: 'text', text: JSON.stringify(result) }] }
                  });
          } else {
                  res.json({
                            jsonrpc: '2.0',
                            id,
                            error: { code: -32601, message: 'Method not found' }
                  });
          }
    } catch (error) {
          res.status(400).json({
                  jsonrpc: '2.0',
                  id: req.body?.id || -1,
                  error: { code: -32603, message: error.message }
          });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'canvas-mcp' });
});

app.listen(PORT, () => {
    console.log(`Canvas MCP server running on port ${PORT}`);
});
