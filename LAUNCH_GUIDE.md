# Agent Configuration Interface - Launch Guide

## 🚀 Quick Start

This is a simplified YAML-based agent configuration interface built on Next.js. The Python backend has been removed and replaced with TypeScript API Routes.

### Prerequisites

- Node.js v22+ (v20.19+ works with warnings)
- pnpm (installed automatically if missing)

### Installation & Launch

```bash
# Navigate to the web directory
cd web

# Install dependencies (if not already done)
pnpm install

# Start the development server
pnpm dev
```

The application will be available at **http://localhost:3000**

It will automatically redirect to `/agents` where you can:
- View all configured agents
- Click on an agent to see its configuration
- View modules, sub-agents, and glossary settings

### Available Scripts

```bash
# Development
pnpm dev          # Start dev server with hot reload

# Type checking
pnpm type-check:tsgo    # Check TypeScript types

# Linting
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix linting issues automatically

# Testing
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
```

## 📁 Project Structure

```
web/
├── app/
│   ├── agents/                    # Agent management UI
│   │   ├── page.tsx              # Agents list page
│   │   ├── [agentId]/            # Agent detail page
│   │   └── components/           # Agent UI components
│   └── api/                      # Backend API routes
│       ├── agents/               # Agent CRUD operations
│       ├── modules/              # Module operations  
│       └── config/               # System configuration
├── lib/                          # Business logic
│   ├── agents/                   # Agent operations
│   ├── modules/                  # Module operations
│   ├── yaml/                     # YAML utilities
│   └── utils/                    # Helper functions
└── types/                        # TypeScript types

agents/                           # Configuration data
├── configurations/v6/            # Agent configurations
│   └── {client_id}/{agent_id}/
└── modules_configurations/       # Module definitions
    └── {module_id}/
```

## 🔌 API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/:id?clientId=X&version=Y` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `GET /api/agents/:id/export?format=yaml` - Export agent
- `GET /api/agents/:id/versions` - List agent versions

### Modules
- `GET /api/modules` - List all modules
- `GET /api/modules/:id` - Get module details

### System
- `GET /api/config` - Get system configuration

## 📝 Configuration Files

Agent configurations are stored as YAML files in:
- `agents/configurations/v6/{client_id}/{agent_id}/{version}/`

Each agent has:
- `agent_config.yml` - Main configuration (models, messages, triggers)
- `modules_inputs/` - Module-specific values
- `sub_agents/` - Conversational state definitions
- `glossary/` - Pronunciation and transcription helpers
- `memory.yml` - Auto-generated from modules

## 🎨 Features Implemented

### Backend (Steps 1-2) ✅
- TypeScript/Node.js backend with Next.js API Routes
- YAML reader/writer utilities
- Zod validation for runtime type safety
- Agent CRUD operations
- Module parsing and management
- Version control for agents
- Export/Import functionality

### Frontend (Step 3) ✅
- Agent list page with cards
- Agent detail page with tabs:
  - Configuration (models, messages)
  - Modules (list and inputs)
  - Sub-Agents (conversational states)
  - Glossary (definitions, pronunciations, transcriptions)
- Clean, responsive UI with Tailwind CSS
- Loading and error states

## 🧹 Cleaned Up

The following unnecessary components have been removed or are not needed:
- Python Flask backend (`/api` directory - keep for reference but not used)
- Authentication system (not needed for configuration tool)
- RAG/embeddings/vector databases
- Dataset management
- LLM execution
- Workflow execution

## 🔄 What's Running

The application is a **static configuration interface** that:
- Reads YAML files from the filesystem
- Provides a web UI to view and manage configurations
- Exports configurations for use with your execution backend
- Does NOT execute agents or run LLM inference

## 📖 Next Steps

To continue development:

1. **Step 4**: Add module selection and dynamic form generation
2. **Step 5**: Implement ReactFlow canvas for sub-agent editing
3. **Step 6**: Add tools and hooks configuration UI
4. **Step 7**: Implement UI for export/import and version management
5. **Step 8**: Add tests and polish

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### TypeScript errors
```bash
cd web
pnpm type-check:tsgo
```

### Linting errors
```bash
cd web
pnpm lint:fix
```

### Missing dependencies
```bash
cd web
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📚 Documentation

- `IMPLEMENTATION_STATUS.md` - Detailed implementation overview
- `new_project/ROADMAP.md` - Full roadmap and vision
- `new_project/AGENTS.md` - Agent configuration structure
- `new_project/MODULES.md` - Module structure
- `new_project/IMPLEMENTATION.md` - Architecture details

## ✨ Example

After starting the server, visit http://localhost:3000 to see:
- The example agent "example_agent" from client "example_client"
- Its configuration including LLM (GPT-4), STT (Deepgram), TTS (Eleven Labs)
- Two sub-agents: "initialization" and "collect_information"
- Module "base_auto" with its inputs

Click on the agent to explore all its settings in the tabbed interface!
