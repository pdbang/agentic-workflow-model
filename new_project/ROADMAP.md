# Roadmap: Agent Configuration Interface

## 🎯 Vision

Transformer le cœur de Dify en une interface de configuration d'agents IA basée sur YAML, avec un système modulaire permettant d'assembler des sub-agents, tools et hooks via drag-and-drop.

### Ce qu'on garde de Dify
- ✅ Interface drag-and-drop (ReactFlow)
- ✅ Architecture frontend Next.js 15 + TypeScript + React 19
- ✅ Composants UI de base (boutons, formulaires, modals)
- ✅ Gestion du routing Next.js

### Ce qu'on retire
- ❌ Backend Python Flask (remplacé par TypeScript/Node)
- ❌ Exécution de workflows
- ❌ Système d'authentification
- ❌ RAG, embeddings, vector databases
- ❌ Gestion de datasets
- ❌ Modèles d'exécution LLM intégrés
- ❌ Tools personnalisés créés depuis l'UI

### Ce qu'on construit
- ✅ Backend Next.js API Routes (TypeScript)
- ✅ Lecture/écriture de configurations YAML locales
- ✅ Interface de configuration d'agents (messages, models, triggers)
- ✅ Sélection et configuration de modules via formulaires dynamiques
- ✅ Éditeur visuel de sub-agents avec drag-and-drop
- ✅ Configuration des tools et hooks
- ✅ Gestion du glossaire (definitions, pronunciations, transcriptions)
- ✅ Export/Import YAML
- ✅ Versioning des agents
- ✅ Duplication d'agents

---

## 📋 Étapes de la Roadmap

### [ÉTAPE 1: Architecture et Setup](./roadmap/STEP_1_ARCHITECTURE.md)
Mise en place de l'architecture backend TypeScript/Node et structure de données.

**Durée estimée**: 3-4 jours  
**Livrables**: 
- Structure du projet backend
- Modèles TypeScript pour YAML
- API Routes de base
- Système de fichiers local

---

### [ÉTAPE 2: Backend API Core](./roadmap/STEP_2_BACKEND_API.md)
Développement des API Routes pour la gestion des agents et modules.

**Durée estimée**: 4-5 jours  
**Livrables**:
- CRUD agents
- Lecture modules et génération formulaires
- Import/Export YAML
- Versioning

---

### [ÉTAPE 3: Frontend - Configuration Agent](./roadmap/STEP_3_FRONTEND_CONFIG.md)
Interface de configuration générale de l'agent (messages, models, triggers).

**Durée estimée**: 3-4 jours  
**Livrables**:
- Page principale agent
- Onglet Configuration (messages, models)
- Onglet Triggers
- Onglet Glossaire

---

### [ÉTAPE 4: Frontend - Gestion Modules](./roadmap/STEP_4_FRONTEND_MODULES.md)
Sélection de modules et configuration via formulaires dynamiques.

**Durée estimée**: 3-4 jours  
**Livrables**:
- Liste des modules disponibles
- Formulaires dynamiques (forms.yml)
- Gestion dépendances (dependencies.yml)
- Onglets par module configuré

---

### [ÉTAPE 5: Frontend - Canvas Sub-Agents](./roadmap/STEP_5_FRONTEND_CANVAS.md)
Éditeur visuel drag-and-drop pour les sub-agents, tools et hooks.

**Durée estimée**: 5-6 jours  
**Livrables**:
- Canvas ReactFlow pour sub-agents
- Nodes: sub-agent, tool, hook
- Connexions entre sub-agents
- Panel de configuration contextuel

---

### [ÉTAPE 6: Frontend - Tools & Hooks Configuration](./roadmap/STEP_6_TOOLS_HOOKS.md)
Configuration détaillée des tools et hooks dans les sub-agents.

**Durée estimée**: 3-4 jours  
**Livrables**:
- Sélection de tools par module
- Configuration des hooks
- Actions: tool, switch_sub_agent, case
- Preview des conditions

---

### [ÉTAPE 7: Export/Import & Versioning](./roadmap/STEP_7_EXPORT_VERSION.md)
Gestion de l'export/import YAML et système de versioning.

**Durée estimée**: 2-3 jours  
**Livrables**:
- Export YAML complet
- Import et validation YAML
- Versioning d'agents
- Duplication d'agents

---

### [ÉTAPE 8: Polish & Testing](./roadmap/STEP_8_POLISH.md)
Finalisation, tests et documentation utilisateur.

**Durée estimée**: 2-3 jours  
**Livrables**:
- Tests des flux principaux
- Documentation utilisateur
- Guide de contribution
- Correction bugs

---

## 📊 Timeline Globale

**Durée totale estimée**: 25-33 jours (5-7 semaines)

```
Semaine 1-2:   ÉTAPE 1 + ÉTAPE 2 (Backend)
Semaine 2-3:   ÉTAPE 3 (Config Agent)
Semaine 3-4:   ÉTAPE 4 (Modules)
Semaine 4-6:   ÉTAPE 5 (Canvas)
Semaine 6-7:   ÉTAPE 6 (Tools/Hooks)
Semaine 7:     ÉTAPE 7 (Export/Version)
Semaine 7:     ÉTAPE 8 (Polish)
```

---

## 🛠️ Stack Technique

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: React 19
- **Drag-and-Drop**: ReactFlow (déjà dans Dify)
- **Styling**: Tailwind CSS (déjà configuré)
- **Forms**: React Hook Form + Zod validation
- **State**: React Context + Zustand (si nécessaire)

### Backend
- **Runtime**: Node.js v22+
- **Framework**: Next.js API Routes
- **Language**: TypeScript
- **Validation**: Zod (équivalent Pydantic)
- **YAML**: js-yaml
- **File System**: Node fs/promises
- **Testing**: Vitest (déjà configuré)

### Stockage
- **Configuration**: Fichiers YAML locaux
- **Structure**: 
  ```
  agents/configurations/v6/{client_id}/{agent_id}/
  agents/modules_configurations/{module_name}/
  ```

---

## 🚀 Prérequis pour Démarrer

1. **Environnement existant**:
   - Dify cloné et Docker Compose démarré
   - Node.js v22+ installé
   - pnpm installé

2. **Connaissances requises pour l'assistant IA**:
   - TypeScript avancé (types, generics, Zod)
   - Next.js 15 (App Router, API Routes, Server Components)
   - ReactFlow pour drag-and-drop
   - Manipulation YAML en TypeScript
   - Gestion de fichiers Node.js

3. **Documentation de référence**:
   - [new_project/AGENTS.md](./AGENTS.md) - Structure config agents
   - [new_project/MODULES.md](./MODULES.md) - Structure modules
   - [new_project/IMPLEMENTATION.md](./IMPLEMENTATION.md) - Architecture V6
   - [new_project/SCRIPTS_V6.md](./SCRIPTS_V6.md) - Scripts de gestion

---

## 📝 Conventions de Code

### TypeScript
- Mode strict activé
- Pas de `any`, utiliser `unknown` si nécessaire
- Préférer les types explicites aux inférés
- Utiliser Zod pour validation runtime
- Nommer les types avec PascalCase: `AgentConfig`, `ModuleInfo`

### Fichiers
- Composants React: `PascalCase.tsx`
- Utilitaires: `kebab-case.ts`
- Types: `types.ts` ou `schema.ts`
- API Routes: `route.ts` (convention Next.js)

### Organisation
```
web/
├── app/
│   ├── agent/
│   │   ├── [agentId]/
│   │   │   ├── page.tsx              # Page principale agent
│   │   │   ├── layout.tsx
│   │   │   └── components/           # Composants spécifiques agent
│   │   └── new/
│   │       └── page.tsx              # Création agent
│   └── api/
│       └── agents/                   # API Routes
│           ├── route.ts
│           └── [agentId]/
│               └── route.ts
├── lib/
│   ├── agents/                       # Logique agents
│   │   ├── schema.ts                 # Schémas Zod
│   │   ├── parser.ts                 # Parse YAML
│   │   └── writer.ts                 # Écriture YAML
│   ├── modules/                      # Logique modules
│   └── utils/
└── types/
    ├── agent.ts
    └── module.ts
```

---

## 🎯 Commencer l'Implémentation

Pour démarrer, un assistant IA devrait :

1. **Lire** tous les fichiers de documentation dans `new_project/`
2. **Commencer par** [ÉTAPE 1: Architecture et Setup](./roadmap/STEP_1_ARCHITECTURE.md)
3. **Suivre** les instructions détaillées de chaque étape
4. **Tester** chaque fonctionnalité avant de passer à l'étape suivante
5. **Documenter** les décisions d'implémentation dans des commentaires

---

## ❓ Questions Fréquentes

**Q: Pourquoi retirer le backend Python ?**  
R: Pour simplifier et unifier la stack (full TypeScript), retirer les dépendances non nécessaires (RAG, LLM execution, etc.), et avoir une architecture plus légère centrée sur la configuration.

**Q: Comment gérer la validation sans Pydantic ?**  
R: Utilisation de Zod pour la validation TypeScript runtime, avec des schémas équivalents aux modèles Pydantic.

**Q: Peut-on tester les agents configurés ?**  
R: Non, l'interface génère uniquement les fichiers YAML. Les tests se font avec votre backend d'exécution existant en important les YAML.

**Q: Comment gérer les modules qui n'existent pas encore ?**  
R: Les modules doivent être développés en Python selon la structure définie dans MODULES.md, puis exportés en YAML avec le script d'export.

---

## 📞 Support

Pour des questions pendant l'implémentation, référez-vous à :
- Documentation technique dans `new_project/*.md`
- Structure des agents exemples dans `new_project/example_agent/`
- Code Dify existant pour les patterns UI React
