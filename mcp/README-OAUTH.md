# Axiom MCP OAuth Authentication

This guide explains how to set up OAuth 2.0 authentication for the Axiom MCP server, enabling ChatGPT and other OAuth clients to securely access user data.

## Overview

The OAuth implementation consists of three services:

1. **PocketBase** (Port 8090) - Handles OAuth endpoints, token management, and data access
2. **Nuxt App** (Port 3000) - Provides OAuth authorization UI with login support
3. **MCP HTTP Server** (Port 8091) - MCP protocol adapter that connects ChatGPT to PocketBase

## Architecture

```
┌─────────────┐
│   ChatGPT   │
└──────┬──────┘
       │ 1. User clicks "Connect"
       ▼
┌─────────────────────┐
│   PocketBase        │  ◄────┐
│  (Port 8090)        │       │ 2. Redirects to Nuxt
│                     │       │
│  /oauth/authorize   │───────┘
│  /oauth/token       │
│  /oauth/validate    │
│  /api/v1/user/*     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Nuxt App          │
│  (Port 3000)        │
│                     │
│  /oauth/authorize   │ ◄─── 3. User sees consent page
│  /auth              │      4. Or redirected to login if not authenticated
│                     │      5. Supports email/password login
└──────┬──────────────┘
       │ 6. User approves, sends auth request to PocketBase
       ▼
┌─────────────────────┐
│   PocketBase        │
│                     │
│  Validates session  │ ◄─── 7. Generates authorization code
│  Issues OAuth token │      8. Returns code to ChatGPT
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  MCP HTTP Server    │
│  (Port 8091)        │
│                     │
│  Validates OAuth    │ ◄─── 9. ChatGPT uses OAuth token
│  Proxies to PB API  │
└─────────────────────┘
```

## Key Features

- **OAuth 2.0**: Secure OAuth authentication flow with dynamic client registration (RFC 7591)
- **Persistent Storage**: OAuth tokens stored in PocketBase database
- **Direct Access**: OAuth tokens authenticate directly to user data
- **Automatic Cleanup**: Expired tokens removed automatically
- **User-Scoped Data**: Each user only accesses their own items, clients, and tags

## Setup

### 1. Database Migration

The OAuth collections will be automatically created when PocketBase starts with the migration files:

```bash
cd pocketbase
./pocketbase serve
```

This creates three collections:
- `_oauth_authorization_codes` - Temporary codes (10 minute expiry)
- `_oauth_access_tokens` - Long-lived tokens (90 days expiry)
- `_oauth_clients` - Registered OAuth clients

### 2. Environment Variables

#### PocketBase (`pocketbase/pb_hooks/env.json`):
```json
{
  "app_baseurl": "https://axiom.app",
  "app_baseurl_test": "http://localhost:3000"
}
```

#### Nuxt App (`.env`):
```bash
VITE_POCKETBASE_URL=http://localhost:8090
VITE_APP_URL=http://localhost:3000
```

#### MCP Server (`.env`):
```bash
VITE_POCKETBASE_URL=http://localhost:8090
PORT=8091
```

### 3. Start the Servers

You need to run all three services:

```bash
# Terminal 1: Start PocketBase (includes OAuth endpoints)
cd pocketbase
./pocketbase serve

# Terminal 2: Start Nuxt App (includes OAuth authorization UI)
cd app
npm run dev

# Terminal 3: Start MCP HTTP Server
cd mcp
npm install
npm run start
```

### 4. Configure ChatGPT

The Axiom OAuth server supports **RFC 7591 Dynamic Client Registration**, which means ChatGPT can automatically register itself:

1. Go to ChatGPT → Settings → Personalization → MCP Servers
2. Add new MCP connector:
   - **Server URL**: `https://your-mcp-server.com` (or ngrok URL for testing)
   - ChatGPT will automatically:
     - Discover OAuth endpoints from `/.well-known/oauth-authorization-server`
     - Register itself via `/oauth/register`
     - Get a unique `client_id`
     - Start the OAuth authorization flow

3. Follow the authorization flow:
   - Click "Connect" when prompted
   - You'll be redirected to your Nuxt app
   - Login if needed (email/password)
   - Click "Allow" on the consent page
   - You're connected!

## OAuth Flow

### Dynamic Client Registration Flow (RFC 7591)

When ChatGPT first connects:

1. **Discovery** - ChatGPT fetches `/.well-known/oauth-authorization-server`
2. **Registration** - ChatGPT sends POST to `/oauth/register`
3. **Response** - PocketBase generates and returns a unique `client_id`
4. **Storage** - Client registration stored in `_oauth_clients` collection
5. **OAuth Flow Begins** - ChatGPT proceeds with standard OAuth

### Authorization Flow

After client registration:

1. **User initiates connection** in ChatGPT
2. **Redirect to PocketBase** - ChatGPT redirects to `/oauth/authorize`
3. **Redirect to Nuxt** - PocketBase redirects to Nuxt `/oauth/authorize` page
4. **Authentication check** - Nuxt checks if user is logged in
5. **Login if needed** - User redirected to `/auth` if not authenticated
6. **Consent page** - User sees authorization UI
7. **User approves** - User clicks "Allow"
8. **Authorization code** - PocketBase generates code
9. **Redirect back** - User redirected back to ChatGPT with code
10. **Token exchange** - ChatGPT exchanges code for access token
11. **API calls** - ChatGPT uses token to access MCP server
12. **Data access** - MCP server accesses user data from PocketBase

## Available MCP Tools

Once connected, ChatGPT can use these tools:

### User Profile
- `get_user_profile` - Get user profile information

### Items
- `get_user_items` - List user items with pagination
- `get_user_item` - Get specific item by ID
- `create_user_item` - Create a new item

### Clients
- `get_user_clients` - List user clients with pagination
- `get_user_client` - Get specific client by ID
- `create_user_client` - Create a new client

### Tags
- `get_user_tags` - List user tags with pagination
- `get_user_tag` - Get specific tag by ID
- `create_user_tag` - Create a new tag

## API Endpoints

### PocketBase (Port 8090)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/oauth/register` | POST | Dynamic Client Registration (RFC 7591) |
| `/oauth/authorize` | GET | Authorization endpoint (redirects to Nuxt) |
| `/oauth/authorize` | POST | Generate auth code for authenticated user |
| `/oauth/token` | POST | Exchange auth code for access token |
| `/oauth/validate` | POST | Validate access token (internal) |
| `/.well-known/oauth-authorization-server` | GET | OAuth discovery metadata |
| `/api/v1/user/profile` | GET | Get user profile |
| `/api/v1/user/items` | GET | List user items |
| `/api/v1/user/items/:id` | GET | Get specific item |
| `/api/v1/user/items` | POST | Create new item |
| `/api/v1/user/clients` | GET | List user clients |
| `/api/v1/user/clients/:id` | GET | Get specific client |
| `/api/v1/user/clients` | POST | Create new client |
| `/api/v1/user/tags` | GET | List user tags |
| `/api/v1/user/tags/:id` | GET | Get specific tag |
| `/api/v1/user/tags` | POST | Create new tag |

### Nuxt App (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/oauth/authorize` | GET | OAuth consent page |
| `/auth` | GET | Login page (supports return_to parameter) |

### MCP HTTP Server (Port 8091)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp` | GET | Establish MCP SSE connection (requires OAuth token) |
| `/sse` | GET | Alias for /mcp |
| `/messages` | POST | Handle MCP messages |
| `/health` | GET | Health check |
| `/.well-known/oauth-authorization-server` | GET | OAuth discovery |

## Security Features

- **Authorization codes** expire after 10 minutes
- **Access tokens** are valid for 90 days
- **Automatic cleanup** of expired tokens
- **User isolation** - each user only accesses their own data
- **Token validation** on every request
- **PKCE support** for additional security

## Production Deployment

### Requirements

1. **HTTPS Required** - All services must use HTTPS in production
2. **Domain names** - Use proper domain names (not localhost)
3. **Environment variables** - Set correctly for production
4. **Reverse proxy** - Use nginx or similar for HTTPS termination
5. **Database backups** - OAuth tokens stored in PocketBase database

### Example nginx Configuration

```nginx
# PocketBase (includes OAuth endpoints)
server {
    listen 443 ssl;
    server_name api.axiom.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# Nuxt App (includes OAuth UI)
server {
    listen 443 ssl;
    server_name app.axiom.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# MCP Server
server {
    listen 443 ssl;
    server_name mcp.axiom.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8091;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Troubleshooting

### "Server doesn't support RFC 7591 Dynamic Client Registration"

Make sure:
1. Latest version of `oauth.pb.js` with `/oauth/register` endpoint is installed
2. Migration `1760700000_created_oauth_clients.js` has been applied
3. `/.well-known/oauth-authorization-server` returns `registration_endpoint`
4. Restart PocketBase after applying migrations

### "Invalid OAuth token"

- Check that PocketBase is running
- Verify `VITE_POCKETBASE_URL` is set correctly
- Token may have expired (90 days default)
- Check `_oauth_access_tokens` collection in PocketBase

### ChatGPT connection fails

- Verify all three servers are running (PocketBase, Nuxt, MCP)
- Check HTTPS is configured in production
- Verify OAuth URLs match your deployment
- Check browser console for errors
- Ensure environment variables are set correctly

### CORS errors

- All servers include CORS headers
- Check reverse proxy configuration
- Ensure `Access-Control-Allow-Origin` is properly set

## Testing Locally with ngrok

For testing with ChatGPT before deployment:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from ngrok.com

# Start your MCP server
cd mcp
npm run start

# In another terminal, expose it via ngrok
ngrok http 8091

# Use the ngrok URL in ChatGPT
# Example: https://abc123.ngrok-free.app
```

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with health check endpoints
4. Review PocketBase logs for OAuth issues

## Related Documentation

- [Main MCP README](./README.md)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [OpenAI ChatGPT MCP Integration](https://platform.openai.com/docs/)
- [RFC 7591 Dynamic Client Registration](https://tools.ietf.org/html/rfc7591)

