# Agent Configuration Interface

Interface TypeScript/Next.js pour configurer des agents IA avec gestion YAML.

## 🚀 Lancement de l'Application

### Prérequis

- Node.js v20+ (v22+ recommandé)
- pnpm (gestionnaire de packages)

### Installation

```bash
# Installer pnpm si nécessaire
npm install -g pnpm

# Installer les dépendances
cd web
pnpm install
```

### Démarrage

```bash
# Mode développement avec hot-reload
cd web
pnpm dev

# L'application sera disponible sur http://localhost:3000
```

### Build Production

```bash
cd web
pnpm build
pnpm start
```

## 📁 Structure du Projet

```
agents/
├── configurations/v6/          # Configurations des agents
│   └── {client_id}/
│       └── {agent_id}/
│           └── latest/
│               ├── agent_config.yml
│               ├── modules_inputs/
│               ├── sub_agents/
│               └── glossary/
└── modules_configurations/     # Configurations des modules
    └── {module_id}/
        ├── forms.yml
        ├── dependencies.yml
        └── memory.yml

web/
├── app/
│   ├── api/                   # API Routes (Backend)
│   │   ├── agents/           # CRUD agents
│   │   ├── modules/          # Liste modules
│   │   └── config/           # Configuration système
│   └── agent/                 # Pages frontend (TODO: STEP 3-8)
├── lib/
│   ├── agents/               # Logique agents
│   │   ├── parser.ts        # Lecture YAML
│   │   ├── writer.ts        # Écriture YAML
│   │   └── versioning.ts    # Versions & duplication
│   ├── modules/              # Logique modules
│   │   ├── parser.ts
│   │   └── forms-generator.ts
│   ├── yaml/                 # Utilitaires YAML
│   └── utils/
│       └── paths.ts          # Gestion chemins
└── types/                     # Types TypeScript & Zod schemas
    ├── agent.ts
    ├── module.ts
    ├── sub-agent.ts
    ├── tool.ts
    └── hook.ts
```

## 🔌 API Endpoints Disponibles

### Configuration Système

```bash
GET /api/config
# Retourne: paths, clients list, modules list
```

### Agents

```bash
# Liste tous les agents
GET /api/agents

# Détails d'un agent
GET /api/agents/{agentId}?clientId={clientId}&version=latest

# Créer/Modifier un agent
PUT /api/agents/{agentId}?clientId={clientId}&version=latest
Body: { config, modulesInputs, subAgents, glossary }

# Supprimer un agent
DELETE /api/agents/{agentId}?clientId={clientId}&version={version}

# Exporter un agent
GET /api/agents/{agentId}/export?clientId={clientId}&format=json|yaml
```

### Modules

```bash
# Liste tous les modules
GET /api/modules

# Détails d'un module
GET /api/modules/{moduleId}
# Retourne: form schema, dependencies, memory variables, tools
```

## 🧪 Tests

### Tester les API avec curl

```bash
# Démarrer le serveur
cd web && pnpm dev

# Dans un autre terminal:

# Test configuration
curl http://localhost:3000/api/config | jq

# Test liste agents
curl http://localhost:3000/api/agents | jq

# Test détails agent
curl "http://localhost:3000/api/agents/test_agent?clientId=test_client" | jq

# Test export YAML
curl "http://localhost:3000/api/agents/test_agent/export?clientId=test_client&format=yaml"

# Test liste modules
curl http://localhost:3000/api/modules | jq
```

### Créer un nouvel agent via API

```bash
curl -X PUT "http://localhost:3000/api/agents/my_new_agent?clientId=test_client" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "version": "v6",
      "language": "fr-FR",
      "timezone": "Europe/Paris",
      "modules": ["base_auto"],
      "messages": {
        "welcome": {
          "text": "Bonjour!"
        }
      },
      "models": {
        "llm": {
          "provider": "openai",
          "model": "gpt-4"
        },
        "stt": {
          "provider": "deepgram",
          "model": "nova-2"
        },
        "tts": {
          "provider": "eleven_labs",
          "voice_id": "test"
        }
      }
    }
  }'
```

## 📝 Configuration d'un Agent

Un agent V6 se compose de:

### 1. `agent_config.yml` - Configuration principale

```yaml
version: "v6"
language: "fr-FR"
timezone: "Europe/Paris"
modules:
  - "base_auto"

messages:
  welcome:
    text: "Bonjour, comment puis-je vous aider ?"
  goodbye:
    text: "Au revoir !"

models:
  llm:
    provider: "openai"
    model: "gpt-4"
    temperature: 0.7
  stt:
    provider: "deepgram"
    model: "nova-2"
  tts:
    provider: "eleven_labs"
    voice_id: "voice_id_here"

triggers:
  start_discussion:
    - action: "tool"
      target_tool:
        module: "base_auto"
        path: "initialize_session"
```

### 2. `modules_inputs/` - Configuration des modules

Un fichier YAML par module utilisé:

```yaml
# modules_inputs/base_auto.yml
api_key: "your_api_key"
api_url: "https://api.example.com"
```

### 3. `sub_agents/` - États conversationnels

```yaml
# sub_agents/initialization.yml
sub_agent:
  name: "Initialization"
  description: "État initial de la conversation"
  prompts:
    - module: "base_auto"
      path: "prompts/greeting"
  tools:
    welcome_user:
      name: "Welcome User"
      module: "base_auto"
      path: "tools/welcome"
```

### 4. `glossary/` - Aide prononciation

- `definitions.yml`: Définitions de termes métier
- `pronunciations.yml`: Corrections de prononciation TTS
- `transcriptions.yml`: Aide à la transcription STT

## 🔧 Développement

### Structure Backend (Complété ✅)

- ✅ STEP 1: Architecture TypeScript/Node
- ✅ STEP 2: API Core (CRUD, versioning, export)

### Structure Frontend (TODO)

Les étapes suivantes nécessitent l'implémentation des pages React:

- ⏳ STEP 3: Interface configuration agent
- ⏳ STEP 4: Gestion modules
- ⏳ STEP 5: Canvas sub-agents
- ⏳ STEP 6: Configuration tools/hooks
- ⏳ STEP 7: Export/Import UI
- ⏳ STEP 8: Polish & documentation

### Créer une Page Frontend

Pour créer l'interface utilisateur, suivre la structure Next.js 15:

```typescript
// web/app/agent/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function AgentsPage() {
  const [agents, setAgents] = useState([])

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => setAgents(data.agents))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Agents</h1>
      <div className="grid gap-4">
        {agents.map((agent: any) => (
          <div key={agent.id} className="border p-4 rounded">
            <h2>{agent.name}</h2>
            <p>Client: {agent.clientId}</p>
            <p>Version: {agent.version}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 📚 Documentation Technique

Voir les fichiers dans `new_project/`:
- `AGENTS.md` - Structure configuration agents
- `MODULES.md` - Structure modules
- `ROADMAP.md` - Plan d'implémentation complet
- `roadmap/STEP_*.md` - Détails par étape

## 🛠️ Scripts Utiles

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Run tests
pnpm test

# Build
pnpm build
```

## 🌐 Environnement

L'application fonctionne en mode standalone sans base de données:
- Lecture/écriture directe dans les fichiers YAML
- Pas d'authentification (à ajouter selon besoin)
- Pas de backend Python nécessaire

## 📞 Support

Pour des questions sur l'implémentation, voir:
- Documentation dans `new_project/*.md`
- Code existant des API routes
- Composants UI de base dans `web/app/components/base/`
