# Agent Configuration Management - Setup & Launch Guide

This guide explains how to run the Agent Configuration Management interface built for the V6 architecture.

## 🎯 What's Implemented

### Complete Features (Steps 1-3):
✅ **Backend API Infrastructure**
- TypeScript/Node.js REST API with Next.js API Routes
- Full CRUD operations for agent configurations
- YAML import/export functionality
- Versioning system with timestamps
- Module dependency resolution
- Zod validation for type safety

✅ **Frontend Configuration Interface**
- Agent editor with tab navigation
- Configuration tab (messages, models LLM/STT/TTS, general settings)
- Glossary tab (definitions, pronunciations, transcriptions)
- Modules view (displays configured modules)
- Canvas view (displays sub-agents)
- Save and Export YAML functionality
- Real-time form updates

### Simplified Features (Steps 4-5):
- Basic modules display page
- Basic sub-agents canvas view
- Configuration viewing capabilities

## 📋 Prerequisites

- **Node.js**: v22.11.0 or higher (specified in package.json)
- **pnpm**: v10.27.0 (package manager)
- **npm**: For installing pnpm globally

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Navigate to web directory
cd web

# Install pnpm if not already installed
npm install -g pnpm@10.27.0

# Install project dependencies
pnpm install
```

### 2. Setup Test Agent Data

The application uses file-based agent configurations. A test agent is already set up at:
```
agents/configurations/v6/test_client/test_agent/latest/
```

This contains:
- `agent_config.yml` - Main configuration
- `modules_inputs/` - Module configurations
- `sub_agents/` - Sub-agent definitions
- `glossary/` - Glossary files
- `memory.yml` - Memory variables

### 3. Start Development Server

```bash
# From the web directory
pnpm dev
```

The application will start on `http://localhost:3000` (or port 3001 if 3000 is in use).

### 4. Access the Interface

Navigate to: **http://localhost:3000/agent/test_agent**

This will redirect you to the configuration tab where you can:
- Edit agent settings (language, timezone)
- Manage messages
- Configure models (LLM, STT, TTS)
- Edit glossary (definitions, pronunciations, transcriptions)
- View configured modules
- View sub-agents

## 📐 Application Structure

```
web/
├── app/
│   ├── api/                          # REST API endpoints
│   │   ├── config/                   # System configuration
│   │   ├── agents/                   # Agent CRUD operations
│   │   │   └── [agentId]/
│   │   │       ├── route.ts         # GET/PUT/DELETE agent
│   │   │       ├── export/          # Export agent as YAML
│   │   │       └── versions/        # Version management
│   │   └── modules/                  # Module operations
│   │       └── [moduleId]/
│   │           ├── route.ts         # Get module details
│   │           └── dependencies/    # Resolve dependencies
│   │
│   └── agent/[agentId]/             # Agent UI pages
│       ├── layout.tsx                # Main layout with tabs
│       ├── page.tsx                  # Redirect to config
│       ├── config/                   # Configuration tab
│       ├── modules/                  # Modules tab
│       ├── canvas/                   # Sub-agents canvas
│       ├── glossary/                 # Glossary tab
│       └── components/               # UI components
│
├── lib/
│   ├── agents/                       # Agent operations
│   │   ├── parser.ts                # Parse YAML configs
│   │   ├── writer.ts                # Write YAML configs
│   │   └── versioning.ts            # Version management
│   ├── modules/                      # Module operations
│   │   ├── parser.ts                # Parse module configs
│   │   └── forms-generator.ts       # Dynamic form generation
│   ├── yaml/                         # YAML utilities
│   │   ├── reader.ts                # Read YAML files
│   │   └── writer.ts                # Write YAML files
│   ├── utils/
│   │   └── paths.ts                 # Path management
│   └── hooks/
│       └── use-agent.ts             # React hook for agent state
│
└── types/                            # TypeScript types
    ├── agent.ts                      # Agent configuration types
    ├── module.ts                     # Module types
    ├── sub-agent.ts                  # Sub-agent types
    ├── tool.ts                       # Tool types
    └── hook.ts                       # Hook types
```

## 🔧 Available API Endpoints

### Configuration
- `GET /api/config` - Get system paths and available clients

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/:id?clientId=X&version=Y` - Get agent details
- `PUT /api/agents/:id?clientId=X&version=Y` - Update agent
- `DELETE /api/agents/:id?clientId=X&version=Y` - Delete agent
- `GET /api/agents/:id/export?clientId=X&format=yaml` - Export agent
- `GET /api/agents/:id/versions?clientId=X` - List agent versions
- `POST /api/agents/:id/versions?clientId=X` - Create new version

### Modules
- `GET /api/modules` - List all modules
- `GET /api/modules/:id` - Get module details
- `GET /api/modules/:id/dependencies` - Resolve module dependencies

## 🎨 User Interface Features

### Configuration Tab
- **General Settings**: Edit language and timezone
- **Messages**: Add, edit, and remove messages with text and audio paths
- **Models**: Configure LLM, STT, and TTS providers and settings
- **Triggers**: View configured triggers (placeholder for future enhancement)

### Glossary Tab
- **Definitions**: Business terms and context for the LLM (JSON editor)
- **Pronunciations**: Phonetic mappings for TTS corrections (JSON editor)
- **Transcriptions**: Hints for STT accuracy (JSON editor)

### Modules Tab
- View list of configured modules
- See module configurations
- Instructions for adding/removing modules

### Canvas Tab
- View sub-agents and their configurations
- See tools and prompts counts
- Expandable configuration details

### Header Actions
- **Save**: Save all changes to the agent configuration
- **Export YAML**: Download the complete agent configuration as YAML

## 🔍 Testing the Application

### Manual Testing

1. **View Agent**: Navigate to `/agent/test_agent`
2. **Edit Configuration**: Modify language, timezone, messages
3. **Edit Models**: Change LLM temperature, STT/TTS providers
4. **Edit Glossary**: Add definitions, pronunciations, transcriptions
5. **Save Changes**: Click the Save button in the header
6. **Export**: Click Export YAML to download the configuration

### API Testing with curl

```bash
# Get system configuration
curl http://localhost:3000/api/config

# Get test agent
curl "http://localhost:3000/api/agents/test_agent?clientId=test_client"

# Export agent as YAML
curl "http://localhost:3000/api/agents/test_agent/export?clientId=test_client&format=yaml"

# List modules
curl http://localhost:3000/api/modules
```

## 🧹 Code Quality

### Run Linting
```bash
cd web
pnpm lint:fix
```

### Run Type Checking
```bash
cd web
pnpm type-check:tsgo
```

### Run Tests
```bash
cd web
pnpm test
```

## 📝 Creating New Agents

To create a new agent:

1. Create a directory structure:
```
agents/configurations/v6/your_client/your_agent/latest/
├── agent_config.yml
├── modules_inputs/
│   └── [module_name].yml
├── sub_agents/
│   └── [sub_agent_name].yml
└── glossary/
    ├── definitions.yml
    ├── pronunciations.yml
    └── transcriptions.yml
```

2. Copy and modify the test agent's `agent_config.yml` as a template

3. Access your agent at: `/agent/your_agent?clientId=your_client`

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is in use, Next.js will automatically use the next available port (e.g., 3001).

### Node Version Mismatch
If you see warnings about Node version, the app should still work with Node v20.x, but v22.11.0+ is recommended.

### Missing Dependencies
Run `pnpm install` again to ensure all dependencies are installed.

### TypeScript Errors
Run `pnpm type-check:tsgo` to see specific errors.

### Agent Not Found
Ensure the agent directory exists at:
`agents/configurations/v6/{clientId}/{agentId}/latest/`

## 🚀 Future Enhancements

Features planned but not yet implemented:
- **Step 4**: Full modules management UI with dynamic forms
- **Step 5**: Visual drag-and-drop canvas with ReactFlow
- **Step 6**: Tools and hooks configuration interface
- **Step 7**: Enhanced import/export and versioning UI
- **Step 8**: Polish, comprehensive testing, and documentation

## 📚 Additional Resources

- **Implementation Guide**: See `new_project/IMPLEMENTATION.md`
- **Agents Documentation**: See `new_project/AGENTS.md`
- **Roadmap**: See `new_project/roadmap/` directory

## 🤝 Contributing

When making changes:
1. Follow the existing code structure
2. Run linting: `pnpm lint:fix`
3. Run type checking: `pnpm type-check:tsgo`
4. Test your changes manually
5. Update this README if needed

## 📄 License

See LICENSE file in the root directory.
