# Agent Configuration Backend API

This is the backend API for the Agent Configuration Interface, built with Next.js API Routes and TypeScript.

## Overview

The API provides endpoints for managing AI agent configurations stored as YAML files. It supports:

- **CRUD operations** for agents
- **Module discovery** and configuration
- **Import/Export** of agent configurations
- **Versioning** of agents

## Base URL

In development: `http://localhost:3000/api`

## API Endpoints

### Configuration

#### GET /api/config

Get system configuration including available clients and modules.

**Response:**
```json
{
  "paths": {
    "ROOT": "/path/to/project",
    "AGENTS_BASE": "/path/to/agents",
    "MODULES_BASE": "/path/to/modules"
  },
  "clients": ["test_client"],
  "modules": ["base_auto"],
  "timestamp": "2026-01-08T17:00:00.000Z"
}
```

### Agents

#### GET /api/agents

List all agents across all clients.

**Response:**
```json
{
  "agents": [
    {
      "id": "agent_001",
      "clientId": "test_client",
      "version": "latest",
      "name": "agent_001",
      "createdAt": "2026-01-08T17:00:00.000Z",
      "updatedAt": "2026-01-08T17:00:00.000Z"
    }
  ]
}
```

#### POST /api/agents

Create a new agent.

**Request Body:**
```json
{
  "clientId": "test_client",
  "agentId": "new_agent",
  "config": {
    "version": "v6",
    "language": "fr-FR",
    "timezone": "Europe/Paris",
    "modules": ["base_auto"],
    "messages": {},
    "models": {
      "llm": { "provider": "openai", "model": "gpt-4" },
      "stt": { "provider": "deepgram", "model": "nova-3" },
      "tts": { "provider": "eleven_labs", "voice_id": "xxx" }
    }
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Agent created successfully",
  "agentId": "new_agent",
  "clientId": "test_client",
  "version": "latest"
}
```

#### GET /api/agents/:agentId

Get complete agent configuration.

**Query Parameters:**
- `clientId` (optional, default: "test_client")
- `version` (optional, default: "latest")

**Response:**
```json
{
  "id": "agent_001",
  "clientId": "test_client",
  "version": "latest",
  "config": { /* agent_config.yml */ },
  "modulesInputs": { /* modules_inputs/*.yml */ },
  "glossary": { /* glossary/*.yml */ },
  "subAgents": { /* sub_agents/*.yml */ }
}
```

#### PUT /api/agents/:agentId

Update agent configuration.

**Request Body:**
```json
{
  "clientId": "test_client",
  "version": "latest",
  "config": { /* updated config */ },
  "modulesInputs": { /* updated inputs */ },
  "glossary": { /* updated glossary */ },
  "subAgents": { /* updated sub-agents */ }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Agent updated successfully"
}
```

#### DELETE /api/agents/:agentId

Delete an agent.

**Query Parameters:**
- `clientId` (optional, default: "test_client")
- `version` (optional, default: "latest")

**Response:**
```json
{
  "success": true,
  "message": "Agent deleted successfully"
}
```

### Agent Export/Import

#### GET /api/agents/:agentId/export

Export agent configuration.

**Query Parameters:**
- `clientId` (optional, default: "test_client")
- `version` (optional, default: "latest")
- `format` (optional, default: "json") - "json" or "zip"

**Response (format=json):**
```json
{
  "agentId": "agent_001",
  "clientId": "test_client",
  "version": "latest",
  "exported_at": "2026-01-08T17:00:00.000Z",
  "config": { /* ... */ },
  "modulesInputs": { /* ... */ },
  "glossary": { /* ... */ },
  "subAgents": { /* ... */ }
}
```

#### POST /api/agents/import

Import agent from JSON configuration.

**Request Body:**
```json
{
  "agentId": "imported_agent",
  "clientId": "test_client",
  "version": "latest",
  "config": { /* agent config */ },
  "modulesInputs": { /* optional */ },
  "glossary": { /* optional */ },
  "subAgents": { /* optional */ },
  "overwrite": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Agent imported successfully",
  "agentId": "imported_agent",
  "clientId": "test_client",
  "version": "latest"
}
```

### Agent Versioning

#### GET /api/agents/:agentId/versions

List all versions of an agent.

**Query Parameters:**
- `clientId` (optional, default: "test_client")

**Response:**
```json
{
  "agentId": "agent_001",
  "clientId": "test_client",
  "versions": [
    {
      "version": "latest",
      "id": "agent_001",
      "clientId": "test_client",
      "name": "agent_001",
      "createdAt": "2026-01-08T17:00:00.000Z",
      "updatedAt": "2026-01-08T17:00:00.000Z"
    }
  ]
}
```

#### POST /api/agents/:agentId/versions

Create a new version by copying an existing one.

**Request Body:**
```json
{
  "clientId": "test_client",
  "sourceVersion": "latest",
  "newVersion": "v1.0.0"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Version created successfully",
  "agentId": "agent_001",
  "clientId": "test_client",
  "sourceVersion": "latest",
  "newVersion": "v1.0.0"
}
```

### Modules

#### GET /api/modules

List all available modules.

**Response:**
```json
{
  "modules": [
    {
      "id": "base_auto",
      "name": "base_auto",
      "hasDependencies": false,
      "dependenciesCount": 0
    }
  ]
}
```

#### GET /api/modules/:moduleId

Get complete module configuration.

**Response:**
```json
{
  "id": "base_auto",
  "forms": { /* forms.yml */ },
  "dependencies": { /* dependencies.yml */ },
  "memory": { /* memory.yml */ },
  "tools": { /* tools/*.yml */ },
  "prompts": { /* prompts/*.yml */ }
}
```

#### GET /api/modules/:moduleId/dependencies

Get module dependencies with recursive resolution.

**Response:**
```json
{
  "moduleId": "base_auto",
  "required": [],
  "optional": [],
  "resolved": []
}
```

## Data Structure

### Agent Configuration (agent_config.yml)

```yaml
version: "v6"
language: "fr-FR"
timezone: "Europe/Paris"
modules:
  - "base_auto"

messages:
  welcome:
    texts:
      fr-FR: "Bonjour..."

models:
  llm:
    provider: "openai"
    model: "gpt-4"
    temperature: 0.7
  stt:
    provider: "deepgram"
    model: "nova-3"
  tts:
    provider: "eleven_labs"
    voice_id: "xxx"

triggers:
  start_discussion:
    - action: "tool"
      target_tool:
        module: "base_auto"
        path: "initialize_session"
```

### Directory Structure

```
agents/
├── configurations/
│   └── v6/
│       └── {client_id}/
│           └── {agent_id}/
│               └── {version}/
│                   ├── agent_config.yml
│                   ├── modules_inputs/
│                   │   └── {module}.yml
│                   ├── glossary/
│                   │   ├── definitions.yml
│                   │   ├── pronunciations.yml
│                   │   └── transcriptions.yml
│                   └── sub_agents/
│                       └── {sub_agent}.yml
└── modules_configurations/
    └── {module_name}/
        ├── forms.yml
        ├── dependencies.yml
        ├── memory.yml
        ├── tools/
        │   └── {tool}.yml
        └── prompts/
            └── {prompt}.yml
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

Common status codes:
- `400` - Bad Request (invalid input)
- `404` - Not Found (agent/module doesn't exist)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

## Development

### Starting the Server

```bash
cd web
pnpm dev
```

The API will be available at `http://localhost:3000/api`.

### Type Checking

```bash
pnpm type-check:tsgo
```

### Testing APIs

Use curl or any HTTP client:

```bash
# List all agents
curl http://localhost:3000/api/agents

# Get specific agent
curl "http://localhost:3000/api/agents/agent_001?clientId=test_client"

# Export agent
curl "http://localhost:3000/api/agents/agent_001/export?clientId=test_client&format=json"
```

## Next Steps

- [ ] Implement ZIP export format
- [ ] Add authentication/authorization
- [ ] Add request validation middleware
- [ ] Add rate limiting
- [ ] Create OpenAPI/Swagger documentation
- [ ] Add comprehensive error handling
- [ ] Implement caching for read operations
- [ ] Add WebSocket support for real-time updates
