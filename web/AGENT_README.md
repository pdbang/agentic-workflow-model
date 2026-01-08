# Agent Configuration Management System

Quick reference for the V6 Agent Configuration Management interface built on top of Dify's web application.

## 🚀 Launch Instructions

```bash
# From the web directory

# 1. Install dependencies (if not already installed)
pnpm install

# 2. Start the development server
pnpm dev

# 3. Access the agent configuration interface
# Open: http://localhost:3000/agent/test_agent
```

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup and usage guide
- **[README.md](./README.md)** - Dify web application README

## 🎯 What This Adds to Dify

This implementation adds a complete agent configuration management system:

### Backend (TypeScript/Node.js):
- **11 REST API endpoints** for agent CRUD operations
- **YAML read/write** utilities
- **Version management** system
- **Module dependency** resolution
- **Type-safe** with Zod validation

### Frontend (React/Next.js):
- **Configuration editor** - Messages, models, settings
- **Glossary editor** - Definitions, pronunciations, transcriptions
- **Modules viewer** - Display configured modules
- **Canvas viewer** - Display sub-agents
- **Save & Export** - Persist and download configurations

## 📂 New Files Added

```
web/
├── SETUP.md                    # Comprehensive setup guide
├── AGENT_README.md             # This file
├── app/
│   ├── api/
│   │   ├── config/             # System configuration API
│   │   ├── agents/             # Agent CRUD API
│   │   └── modules/            # Module operations API
│   ├── agent/[agentId]/        # Agent UI pages
│   │   ├── config/             # Configuration tab
│   │   ├── glossary/           # Glossary tab
│   │   ├── modules/            # Modules tab
│   │   └── canvas/             # Canvas tab
│   └── components/agent/       # Agent UI components
├── lib/
│   ├── agents/                 # Agent operations
│   ├── modules/                # Module operations  
│   ├── yaml/                   # YAML utilities
│   └── hooks/                  # React hooks
└── types/                      # TypeScript types
    ├── agent.ts
    ├── module.ts
    ├── sub-agent.ts
    ├── tool.ts
    └── hook.ts
```

## 🔗 Quick Links

| Resource | Description |
|----------|-------------|
| `/agent/test_agent` | Test agent configuration interface |
| `/api/config` | System configuration endpoint |
| `/api/agents` | List all agents |
| `SETUP.md` | Complete documentation |
| `../new_project/AGENTS.md` | Agent architecture docs |

## 🎨 UI Features

### Configuration Tab (`/agent/{id}/config`)
- General settings (language, timezone)
- Messages editor
- AI models configuration (LLM, STT, TTS)
- Triggers display

### Glossary Tab (`/agent/{id}/glossary`)
- Definitions editor
- Pronunciations editor
- Transcriptions editor

### Modules Tab (`/agent/{id}/modules`)
- Configured modules list
- Module settings display

### Canvas Tab (`/agent/{id}/canvas`)
- Sub-agents overview
- Tools and prompts counts
- Configuration viewer

## 💡 Usage Tips

1. **Navigate** between tabs to edit different sections
2. **Click Save** in the header to persist changes
3. **Click Export YAML** to download configuration
4. **Check Console** (F12) for any errors during development

## 🧪 Testing

### Manual Testing
1. Navigate to `/agent/test_agent`
2. Edit any configuration values
3. Click Save
4. Refresh page to verify persistence

### API Testing
```bash
# Get agent configuration
curl http://localhost:3000/api/agents/test_agent?clientId=test_client

# Export as YAML
curl http://localhost:3000/api/agents/test_agent/export?clientId=test_client&format=yaml
```

## 🐛 Common Issues

**Agent not loading**: Ensure `agents/configurations/v6/test_client/test_agent/latest/` exists

**Save not working**: Check browser console for API errors

**Type errors**: Run `pnpm type-check:tsgo` to see issues

**Port in use**: Next.js will use the next available port automatically

## 📖 Learn More

For complete documentation including:
- Detailed API reference
- Architecture overview
- Development guidelines
- Troubleshooting guide

See **[SETUP.md](./SETUP.md)**

---

**Ready?** Run `pnpm dev` and open `/agent/test_agent` 🚀
