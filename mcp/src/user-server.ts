import express from 'express';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { fetch } from "undici";
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file from project root (axiom directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '..', '.env') });

// --------- Config (env) ----------
const POCKETBASE_URL = process.env.VITE_POCKETBASE_URL || "http://localhost:8090";
const PORT = process.env.PORT || 8091;

console.log("🚀 User API MCP Server starting...");
console.log(`   PocketBase URL: ${POCKETBASE_URL}`);
console.log(`   Port: ${PORT}`);

// ---------- OAuth token validation ----------
async function validateOAuthToken(token: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/oauth/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json() as any;
      return {
        valid: false,
        error: errorData.error_description || 'Invalid token'
      };
    }

    const data = await res.json() as any;
    return {
      valid: true
    };
  } catch (error: any) {
    console.error("OAuth token validation failed:", error.message);
    return {
      valid: false,
      error: error.message || 'Token validation failed'
    };
  }
}

// ---------- API fetch helper ----------
async function apiFetch(path: string, token: string, opts: { method?: string; body?: any } = {}) {
  const headers: Record<string, string> = { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
  
  const url = `${POCKETBASE_URL}${path}`;
  
  const fetchOpts: any = {
    method: opts.method ?? "GET",
    headers,
  };
  
  if (opts.body) {
    fetchOpts.body = JSON.stringify(opts.body);
  }
  
  const res = await fetch(url, fetchOpts);
  
  const text = await res.text();
  
  if (!res.ok) {
    let errorMessage = `${res.status} ${res.statusText}`;
    try {
      const errorData = JSON.parse(text);
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch {
    return text;
  }
}

// ---------- Server factory ----------
const getServer = (token: string) => {
  const server = new McpServer({
    name: "axiom-user-api",
    version: "1.0.0"
  });

  // Register tool: Get User Profile
  server.registerTool("get_user_profile",
    {
      title: "Get User Profile",
      description: "Get the authenticated user's profile information. Response contains: id, email, name, avatar, created, and updated timestamps.",
      inputSchema: { },
      annotations: { readOnlyHint: true }
    },
    async () => {
      try {
        const result = await apiFetch("/api/v1/user/profile", token);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to fetch user profile:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to fetch user profile" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Get User Items
  server.registerTool("get_user_items",
    {
      title: "Get User Items",
      description: "Get all items for the authenticated user with pagination. Returns an array of items with expanded tags. Each item contains: id, name, content, tags (array of tag objects), files (array of file IDs), user (owner ID), created, and updated timestamps.",
      inputSchema: { 
        limit: z.number().int().min(1).max(100).default(50).describe("Number of items per page (1-100, default: 50)"),
        page: z.number().int().min(1).default(1).describe("Page number (default: 1)")
      },
      annotations: { readOnlyHint: true }
    },
    async (input) => {
      try {
        const params = new URLSearchParams();
        params.set("limit", String(input.limit));
        params.set("page", String(input.page));
        
        const result = await apiFetch(`/api/v1/user/items?${params.toString()}`, token);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to fetch items:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to fetch user items" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Get Single Item
  server.registerTool("get_user_item",
    {
      title: "Get User Item",
      description: "Get a specific item by ID. Returns the item with expanded tags. Response contains: id, name, content, tags (array of tag objects with id, name, created, updated), files (array of file IDs), user (owner ID), created, and updated timestamps.",
      inputSchema: { 
        itemId: z.string().min(1).describe("The ID of the item to retrieve (required)")
      },
      annotations: { readOnlyHint: true }
    },
    async (input) => {
      try {
        const result = await apiFetch(`/api/v1/user/items/${input.itemId}`, token);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to fetch item:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to fetch item" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Create Item
  server.registerTool("create_user_item",
    {
      title: "Create User Item",
      description: "Create a new item for the authenticated user. Returns the created item with expanded tags.",
      inputSchema: { 
        name: z.string().optional().describe("The item name (optional)"),
        content: z.string().optional().describe("The item content in editor format (optional)"),
        tags: z.array(z.string()).optional().describe("Array of tag IDs to associate with the item (optional)"),
        files: z.array(z.string()).optional().describe("Array of file IDs to attach to the item (optional)")
      }
    },
    async (input) => {
      try {
        const result = await apiFetch("/api/v1/user/items", token, {
          method: "POST",
          body: {
            name: input.name,
            content: input.content,
            tags: input.tags,
            files: input.files
          }
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to create item:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to create item" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Get User Clients
  server.registerTool("get_user_clients",
    {
      title: "Get User Clients",
      description: "Get all clients for the authenticated user with pagination. Returns an array of clients with expanded accessTags. Each client contains: id, name, accessTags (array of tag objects), user (owner ID), created, and updated timestamps.",
      inputSchema: { 
        limit: z.number().int().min(1).max(100).default(50).describe("Number of clients per page (1-100, default: 50)"),
        page: z.number().int().min(1).default(1).describe("Page number (default: 1)")
      },
      annotations: { readOnlyHint: true }
    },
    async (input) => {
      try {
        const params = new URLSearchParams();
        params.set("limit", String(input.limit));
        params.set("page", String(input.page));
        
        const result = await apiFetch(`/api/v1/user/clients?${params.toString()}`, token);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to fetch clients:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to fetch user clients" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Get Single Client
  server.registerTool("get_user_client",
    {
      title: "Get User Client",
      description: "Get a specific client by ID. Returns the client with expanded accessTags. Response contains: id, name, accessTags (array of tag objects with id, name, created, updated), user (owner ID), created, and updated timestamps.",
      inputSchema: { 
        clientId: z.string().min(1).describe("The ID of the client to retrieve (required)")
      },
      annotations: { readOnlyHint: true }
    },
    async (input) => {
      try {
        const result = await apiFetch(`/api/v1/user/clients/${input.clientId}`, token);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to fetch client:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to fetch client" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Create Client
  server.registerTool("create_user_client",
    {
      title: "Create User Client",
      description: "Create a new client for the authenticated user. Returns the created client with expanded accessTags.",
      inputSchema: { 
        name: z.string().min(1).describe("The client name (required)"),
        accessTags: z.array(z.string()).optional().describe("Array of tag IDs for access control (optional)")
      }
    },
    async (input) => {
      try {
        const result = await apiFetch("/api/v1/user/clients", token, {
          method: "POST",
          body: {
            name: input.name,
            accessTags: input.accessTags
          }
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to create client:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to create client" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Get User Tags
  server.registerTool("get_user_tags",
    {
      title: "Get User Tags",
      description: "Get all tags for the authenticated user with pagination. Returns an array of tags. Each tag contains: id, name, user (owner ID), created, and updated timestamps.",
      inputSchema: { 
        limit: z.number().int().min(1).max(100).default(50).describe("Number of tags per page (1-100, default: 50)"),
        page: z.number().int().min(1).default(1).describe("Page number (default: 1)")
      },
      annotations: { readOnlyHint: true }
    },
    async (input) => {
      try {
        const params = new URLSearchParams();
        params.set("limit", String(input.limit));
        params.set("page", String(input.page));
        
        const result = await apiFetch(`/api/v1/user/tags?${params.toString()}`, token);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to fetch tags:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to fetch user tags" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Get Single Tag
  server.registerTool("get_user_tag",
    {
      title: "Get User Tag",
      description: "Get a specific tag by ID. Response contains: id, name, user (owner ID), created, and updated timestamps.",
      inputSchema: { 
        tagId: z.string().min(1).describe("The ID of the tag to retrieve (required)")
      },
      annotations: { readOnlyHint: true }
    },
    async (input) => {
      try {
        const result = await apiFetch(`/api/v1/user/tags/${input.tagId}`, token);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to fetch tag:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to fetch tag" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Create Tag
  server.registerTool("create_user_tag",
    {
      title: "Create User Tag",
      description: "Create a new tag for the authenticated user. Returns the created tag with id, name, user (owner ID), created, and updated timestamps.",
      inputSchema: { 
        name: z.string().min(1).describe("The tag name (required)")
      }
    },
    async (input) => {
      try {
        const result = await apiFetch("/api/v1/user/tags", token, {
          method: "POST",
          body: {
            name: input.name
          }
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to create tag:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to create tag" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Update Item
  server.registerTool("update_user_item",
    {
      title: "Update User Item",
      description: "Update an existing item by ID. Only provided fields will be updated. Returns the updated item with expanded tags.",
      inputSchema: { 
        itemId: z.string().min(1).describe("The ID of the item to update (required)"),
        name: z.string().optional().describe("The item name (optional)"),
        content: z.string().optional().describe("The item content in editor format (optional)"),
        tags: z.array(z.string()).optional().describe("Array of tag IDs to associate with the item (optional)"),
        files: z.array(z.string()).optional().describe("Array of file IDs to attach to the item (optional)")
      }
    },
    async (input) => {
      try {
        const body: any = {};
        if (input.name !== undefined) body.name = input.name;
        if (input.content !== undefined) body.content = input.content;
        if (input.tags !== undefined) body.tags = input.tags;
        if (input.files !== undefined) body.files = input.files;
        
        const result = await apiFetch(`/api/v1/user/items/${input.itemId}`, token, {
          method: "PATCH",
          body
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to update item:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to update item" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Update Client
  server.registerTool("update_user_client",
    {
      title: "Update User Client",
      description: "Update an existing client by ID. Only provided fields will be updated. Returns the updated client with expanded accessTags.",
      inputSchema: { 
        clientId: z.string().min(1).describe("The ID of the client to update (required)"),
        name: z.string().optional().describe("The client name (optional)"),
        accessTags: z.array(z.string()).optional().describe("Array of tag IDs for access control (optional)")
      }
    },
    async (input) => {
      try {
        const body: any = {};
        if (input.name !== undefined) body.name = input.name;
        if (input.accessTags !== undefined) body.accessTags = input.accessTags;
        
        const result = await apiFetch(`/api/v1/user/clients/${input.clientId}`, token, {
          method: "PATCH",
          body
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to update client:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to update client" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Update Tag
  server.registerTool("update_user_tag",
    {
      title: "Update User Tag",
      description: "Update an existing tag by ID. Only provided fields will be updated. Returns the updated tag.",
      inputSchema: { 
        tagId: z.string().min(1).describe("The ID of the tag to update (required)"),
        name: z.string().optional().describe("The tag name (optional)")
      }
    },
    async (input) => {
      try {
        const body: any = {};
        if (input.name !== undefined) body.name = input.name;
        
        const result = await apiFetch(`/api/v1/user/tags/${input.tagId}`, token, {
          method: "PATCH",
          body
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to update tag:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to update tag" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Delete Item
  server.registerTool("delete_user_item",
    {
      title: "Delete User Item",
      description: "Delete an existing item by ID. This action cannot be undone.",
      inputSchema: { 
        itemId: z.string().min(1).describe("The ID of the item to delete (required)")
      }
    },
    async (input) => {
      try {
        await apiFetch(`/api/v1/user/items/${input.itemId}`, token, {
          method: "DELETE"
        });
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: "Item deleted successfully" }, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to delete item:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to delete item" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Delete Client
  server.registerTool("delete_user_client",
    {
      title: "Delete User Client",
      description: "Delete an existing client by ID. This action cannot be undone.",
      inputSchema: { 
        clientId: z.string().min(1).describe("The ID of the client to delete (required)")
      }
    },
    async (input) => {
      try {
        await apiFetch(`/api/v1/user/clients/${input.clientId}`, token, {
          method: "DELETE"
        });
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: "Client deleted successfully" }, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to delete client:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to delete client" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  // Register tool: Delete Tag
  server.registerTool("delete_user_tag",
    {
      title: "Delete User Tag",
      description: "Delete an existing tag by ID. This action cannot be undone.",
      inputSchema: { 
        tagId: z.string().min(1).describe("The ID of the tag to delete (required)")
      }
    },
    async (input) => {
      try {
        await apiFetch(`/api/v1/user/tags/${input.tagId}`, token, {
          method: "DELETE"
        });
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: "Tag deleted successfully" }, null, 2) }] };
      } catch (error: any) {
        console.error("Failed to delete tag:", error.message);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error.message || "Failed to delete tag" }, null, 2) 
          }],
          isError: true
        };
      }
    }
  );

  return server;
};

// ---------- Express App ----------
const app = express();
app.use(express.json());

// CORS and ngrok headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning, mcp-protocol-version, mcp-session-id');
  res.header('ngrok-skip-browser-warning', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Store transports by session ID with their OAuth tokens
interface TransportData {
  transport: SSEServerTransport;
  token: string;
}
const transports: Record<string, TransportData> = {};

// MCP endpoint handler
async function handleMcpConnection(req: express.Request, res: express.Response) {
  // Get OAuth token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('MCP connection attempt without valid Bearer token');
    res.status(401).send('Authorization header with Bearer token required');
    return;
  }
  
  const oauthToken = authHeader.slice(7);
  
  try {
    // Validate OAuth token
    const validation = await validateOAuthToken(oauthToken);
    
    if (!validation.valid) {
      console.warn('MCP connection rejected - invalid OAuth token');
      res.status(401).send(validation.error || 'Invalid OAuth token');
      return;
    }
    
    console.log('New MCP connection established');
    
    // Create a new SSE transport for the client
    const transport = new SSEServerTransport('/messages', res);
    
    // Store the transport by session ID with OAuth token
    const sessionId = transport.sessionId;
    transports[sessionId] = {
      transport,
      token: oauthToken
    };
    
    // Set up onclose handler to clean up transport when closed
    transport.onclose = () => {
      delete transports[sessionId];
    };
    
    // Connect the transport to the MCP server with OAuth token
    const server = getServer(oauthToken);
    await server.connect(transport);
  } catch (error) {
    console.error('Error establishing SSE stream:', error);
    if (!res.headersSent) {
      res.status(500).send('Error establishing SSE stream');
    }
  }
}

// MCP endpoints (both /mcp and /sse for compatibility)
app.get('/mcp', handleMcpConnection);
app.get('/sse', handleMcpConnection);

// Messages endpoint for receiving client JSON-RPC requests
app.post('/messages', async (req, res) => {
  // Extract session ID from URL query parameter
  const sessionId = req.query.sessionId as string;
  
  if (!sessionId) {
    res.status(400).send('Missing sessionId parameter');
    return;
  }
  
  const transportData = transports[sessionId];
  
  if (!transportData) {
    res.status(404).send('Session not found');
    return;
  }
  
  try {
    // Handle the POST message with the transport
    await transportData.transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).send('Error handling request');
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeConnections: Object.keys(transports).length
  });
});

// OAuth discovery endpoint
app.get('/.well-known/oauth-authorization-server', (req, res) => {
  res.json({
    issuer: POCKETBASE_URL,
    authorization_endpoint: `${POCKETBASE_URL}/oauth/authorize`,
    token_endpoint: `${POCKETBASE_URL}/oauth/token`,
    registration_endpoint: `${POCKETBASE_URL}/oauth/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none']
  });
});

// MCP metadata endpoint (helps ChatGPT verify safety)
app.get('/', (req, res) => {
  res.json({
    name: 'Axiom User API MCP Server (OAuth)',
    version: '1.0.0',
    protocol: 'mcp',
    transport: 'sse',
    authentication: {
      type: 'oauth2',
      authorization_url: `${POCKETBASE_URL}/oauth/authorize`,
      token_url: `${POCKETBASE_URL}/oauth/token`,
      client_id: 'chatgpt',
      scopes: ['read']
    },
    endpoint: '/mcp',
    status: 'ready'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n🚀 User API MCP HTTP Server (OAuth) listening on port ${PORT}`);
  console.log(`\n📋 Endpoints:`);
  console.log(`   GET /mcp - MCP endpoint (requires OAuth Bearer token)`);
  console.log(`   GET /sse - MCP endpoint (alias for /mcp)`);
  console.log(`   GET /health - Health check\n`);
  console.log(`💡 Usage: Connect ChatGPT to https://your-server.com/mcp\n`);
});

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down MCP server...');
  
  const activeConnections = Object.keys(transports).length;
  if (activeConnections > 0) {
    console.log(`   Closing ${activeConnections} active connection(s)...`);
  }
  
  // Close all active transports
  for (const sessionId in transports) {
    try {
      await transports[sessionId].transport.close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`   Error closing session ${sessionId}:`, error);
    }
  }
  
  console.log('✅ Server shutdown complete');
  process.exit(0);
});

