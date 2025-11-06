# Axiom MCP Servers

This directory contains Model Context Protocol (MCP) servers that enable AI agents to interact with the Axiom platform.

## Available Servers

### 1. User API Server with OAuth (`user-server.ts`) ⭐ RECOMMENDED

**Purpose**: Provides authenticated access to user-specific API endpoints using OAuth 2.0 authentication.

**Authentication**: OAuth 2.0 (no API keys exposed in URLs)

**Architecture**: OAuth endpoints run inside PocketBase, MCP server connects ChatGPT to PocketBase

**Use Cases**:
- ChatGPT integration with secure user authentication
- Production deployments with multiple users
- OAuth-compliant AI agent integrations
- Secure user data access without exposed credentials

**Authentication Flow**:
1. User authorizes via OAuth login page (served by PocketBase)
2. ChatGPT receives OAuth token (stored in PocketBase database)
3. MCP server validates token with PocketBase
4. OAuth token authenticates directly to PocketBase APIs

**Key Features**:
- **OAuth 2.0**: Secure OAuth authentication flow
- **Persistent Tokens**: OAuth tokens stored in PocketBase database
- **Auto-Cleanup**: Expired tokens removed automatically
- **No Separate Server**: OAuth runs inside PocketBase hooks

**Available Tools**:
- `get_user_profile` - Get user profile information
- `get_user_items` - List user items with pagination
- `get_user_item` - Get a specific item by ID
- `create_user_item` - Create a new item
- `get_user_clients` - List user clients with pagination
- `get_user_client` - Get a specific client by ID
- `create_user_client` - Create a new client
- `get_user_tags` - List user tags with pagination
- `get_user_tag` - Get a specific tag by ID
- `create_user_tag` - Create a new tag

**Documentation**: [README-OAUTH.md](./README-OAUTH.md) 📖

**Run Command**:
```bash
# Start PocketBase (includes OAuth endpoints)
cd ../pocketbase
./pocketbase serve

# Start MCP HTTP Server with OAuth
cd ../mcp
npm run start
```

### 2. Admin MCP Server (`admin-server.ts`)

**Purpose**: Provides general PocketBase integration for AI agents with admin-level access.

**Authentication**: Requires PocketBase JWT tokens (obtained via login)

**Use Cases**:
- Direct PocketBase collection access (CRUD operations)
- Administrative tasks and automation
- Multi-collection operations

**Available Tools**:
- `test_tool` - Simple test tool for verification
- `pb_login` - Authenticate and get PocketBase JWT
- `pb_get` - Query records from whitelisted collections
- `pb_create` - Create records in whitelisted collections
- `pb_update` - Update records by ID
- `pb_delete` - Delete records by ID

**Run Command**:
```bash
npm run admin
```

## Quick Start

### Installation

```bash
cd mcp
npm install
```

### Environment Variables

Create a `.env` file or export the following variables:

```bash
# Required for all servers
export VITE_POCKETBASE_URL="http://localhost:8090"

# Required for OAuth server (for ChatGPT integration)
export PORT=8091
export OAUTH_BASE_URL="http://localhost:8091"
```

See `.env.example` for a complete template.

### Running Servers

```bash
# User API Server with OAuth (Recommended for ChatGPT)
npm run start

# Admin MCP Server
npm run admin
```

## Configuration for MCP Clients

### ChatGPT Configuration (OAuth)

For ChatGPT integration with OAuth authentication:

1. **Start the servers**:
   ```bash
   cd ../pocketbase
   ./pocketbase serve
   
   cd ../mcp
   npm run start
   ```

2. **Configure ChatGPT**:
   - Go to ChatGPT → Settings → Personalization → MCP Servers
   - Add new MCP connector with your server URL
   - ChatGPT will automatically discover OAuth endpoints
   - Follow the authorization flow

For detailed instructions, see [README-OAUTH.md](./README-OAUTH.md)

### Claude Desktop Configuration

Add to your Claude Desktop config file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "axiom-user-api": {
      "command": "node",
      "args": [
        "/path/to/axiom/mcp/node_modules/.bin/tsx",
        "/path/to/axiom/mcp/src/user-server.ts"
      ],
      "env": {
        "VITE_POCKETBASE_URL": "http://localhost:8090"
      }
    }
  }
}
```

See [mcp-config-example.json](./mcp-config-example.json) for a complete example.

## Choosing the Right Server

| Feature | User API Server | Admin MCP Server |
|---------|-----------------|------------------|
| **Authentication** | OAuth 2.0 | JWT Token |
| **Best For** | ChatGPT/Production | Admin tools |
| **Security** | ✅ High (no exposed keys) | ✅ High |
| **Access Level** | User-specific data | Any whitelisted collection |
| **Use Case** | ChatGPT integration | Admin/automation tasks |
| **Data Scope** | Single user | Multiple records/collections |
| **Multi-User** | ✅ Yes | ❌ Admin only |
| **CRUD Operations** | ✅ Full CRUD | ✅ Full CRUD |

### When to Use OAuth User Server (Recommended)

- ✅ **ChatGPT integration** - Secure OAuth flow
- ✅ **Production deployments** - No exposed API keys
- ✅ **Multi-user support** - Each user authenticates individually
- ✅ **OAuth-compliant AI agents** - Standard OAuth 2.0
- ✅ **User data access** - Items, clients, tags

### When to Use Admin MCP Server

- ✅ Administrative operations
- ✅ Creating/updating/deleting records
- ✅ Multi-collection queries
- ✅ Automation and batch operations

## Project Structure

```
mcp/
├── src/
│   ├── user-server.ts         # User API MCP server with OAuth
│   └── admin-server.ts         # Admin MCP server
├── package.json                # Dependencies and scripts
├── mcp-config-example.json     # MCP client config example
├── Dockerfile                  # Docker configuration
├── README.md                   # This file
└── README-OAUTH.md            # OAuth detailed docs
```

## Security Considerations

### User API Server
- OAuth tokens are securely stored in PocketBase database
- Tokens can be set to expire
- All requests are validated against the PocketBase backend
- Users only access their own data

### Admin MCP Server
- JWT tokens are required for all PocketBase operations
- Tokens expire based on PocketBase settings
- Only whitelisted collections are accessible

## Development

### Building

```bash
npm run build
```

### Adding New Tools

1. For user-specific endpoints: Add to `user-server.ts`
2. For general operations: Add to `admin-server.ts`
3. Update the respective README with tool documentation

## Troubleshooting

### Server won't start
- Check that PocketBase is running on the configured URL
- Verify environment variables are set correctly
- Check for port conflicts

### Authentication errors
- For OAuth: Verify token is valid and not expired
- For Admin Server: Ensure you've logged in and obtained a valid JWT
- Check PocketBase logs for detailed error messages

### Tool execution errors
- Verify the backend endpoints are accessible
- Check PocketBase logs for detailed error messages
- Ensure proper permissions are set in PocketBase

## Contributing

When adding new MCP tools:
1. Follow the existing patterns in the respective server files
2. Use Zod for input schema validation
3. Include proper error handling
4. Update documentation

## License

See project root LICENSE file.

