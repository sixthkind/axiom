import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetch } from "undici";

// --------- Config (env) ----------
const POCKETBASE_URL = process.env.VITE_POCKETBASE_URL || "http://localhost:8090";
const ALLOWED_COLLECTIONS = (process.env.ALLOWED_COLLECTIONS ?? "users,items,clients,tags")
  .split(",")
  .map(s => s.trim());

// Helper to log env at boot
console.log("MCP Server starting with config:", {
  POCKETBASE_URL,
  ALLOWED_COLLECTIONS
});

// ---------- PocketBase client helpers ----------
async function pbFetch(path: string, opts: { method?: string; body?: any; token?: string } = {}) {
  const headers: Record<string,string> = { "Content-Type": "application/json" };
  if (opts.token) headers["Authorization"] = opts.token;
  const res = await fetch(`${POCKETBASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  return res.json();
}

function tryParseJSON(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}

// ---------- Server bootstrap ----------
async function main() {
  console.log("Starting MCP server...");
  
  // Create an MCP server
  const server = new McpServer({
    name: "axiom-admin-mcp",
    version: "1.0.0"
  });
  
  console.log("MCP server created, registering tools...");

  // Register a simple test tool first
  server.registerTool("test_tool",
    {
      title: "Test Tool",
      description: "A simple test tool to verify MCP functionality",
      inputSchema: { message: z.string().default("Hello from Axiom MCP!") }
    },
    async (input) => {
      console.log("test_tool called with:", input);
      return { content: [{ type: "text", text: `Test successful! ${input.message}` }] };
    }
  );
  
  console.log("test_tool registered");

  // Register PocketBase login tool
  server.registerTool("pb_login",
    {
      title: "PocketBase Login",
      description: "Authenticate a user and get a PocketBase JWT.",
      inputSchema: { 
        identity: z.string().email(),
        password: z.string().min(1),
        collection: z.string().default("users")
      }
    },
    async (input) => {
      console.log("pb_login called with:", input);
      const { identity, password, collection } = input;
      const r = await pbFetch(`/api/collections/${collection}/auth-with-password`, {
        method: "POST",
        body: { identity, password },
      });
      return { content: [{ type: "text", text: JSON.stringify({ token: (r as any).token, userId: (r as any).record?.id, collection }) }] };
    }
  );
  
  console.log("pb_login tool registered");

  // Register PocketBase get tool
  server.registerTool("pb_get",
    {
      title: "PocketBase Get",
      description: "Query records or get by id from whitelisted collections.",
      inputSchema: {
        collection: z.enum(ALLOWED_COLLECTIONS as [string, ...string[]]),
        filter: z.string().optional(),
        id: z.string().optional(),
        page: z.number().int().min(1).default(1),
        perPage: z.number().int().min(1).max(50).default(10),
        token: z.string().min(10)
      }
    },
    async (input) => {
      console.log("pb_get called with:", input);
      const { collection, id, filter, page, perPage, token } = input;
      let result;
      if (id) {
        result = await pbFetch(`/api/collections/${collection}/records/${id}`, { token });
      } else {
        const qs = new URLSearchParams();
        qs.set("page", String(page));
        qs.set("perPage", String(perPage));
        if (filter) qs.set("filter", filter);
        result = await pbFetch(`/api/collections/${collection}/records?${qs.toString()}`, { token });
      }
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
  
  console.log("pb_get tool registered");

  // Register PocketBase create tool
  server.registerTool("pb_create",
    {
      title: "PocketBase Create",
      description: "Create a record in a whitelisted collection.",
      inputSchema: {
        collection: z.enum(ALLOWED_COLLECTIONS as [string, ...string[]]),
        id: z.string().optional(),
        data: z.record(z.any()).optional(),
        token: z.string().min(10)
      }
    },
    async (input) => {
      console.log("pb_create called with:", input);
      const { collection, data, token } = input;
      if (!data) throw new Error("data required");
      const result = await pbFetch(`/api/collections/${collection}/records`, {
        method: "POST",
        body: data,
        token,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
  
  console.log("pb_create tool registered");

  // Register PocketBase update tool
  server.registerTool("pb_update",
    {
      title: "PocketBase Update",
      description: "Update a record by id in a whitelisted collection.",
      inputSchema: {
        collection: z.enum(ALLOWED_COLLECTIONS as [string, ...string[]]),
        id: z.string().optional(),
        data: z.record(z.any()).optional(),
        token: z.string().min(10)
      }
    },
    async (input) => {
      console.log("pb_update called with:", input);
      const { collection, id, data, token } = input;
      if (!id) throw new Error("id required");
      if (!data) throw new Error("data required");
      const result = await pbFetch(`/api/collections/${collection}/records/${id}`, {
        method: "PATCH",
        body: data,
        token,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
  
  console.log("pb_update tool registered");

  // Register PocketBase delete tool
  server.registerTool("pb_delete",
    {
      title: "PocketBase Delete",
      description: "Delete a record by id in a whitelisted collection.",
      inputSchema: {
        collection: z.enum(ALLOWED_COLLECTIONS as [string, ...string[]]),
        id: z.string().optional(),
        data: z.record(z.any()).optional(),
        token: z.string().min(10)
      }
    },
    async (input) => {
      console.log("pb_delete called with:", input);
      const { collection, id, token } = input;
      if (!id) throw new Error("id required");
      await pbFetch(`/api/collections/${collection}/records/${id}`, {
        method: "DELETE",
        token,
      });
      return { content: [{ type: "text", text: JSON.stringify({ success: true }) }] };
    }
  );
  
  console.log("pb_delete tool registered");
  console.log("All tools registered, connecting transport...");

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log("MCP server connected and ready!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

