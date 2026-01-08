# 🚀 Guide de Démarrage - Agent Configuration Interface

## Vue d'ensemble

Cette application permet de configurer des agents conversationnels IA via une interface web moderne construite avec Next.js 15, React 19 et TypeScript.

## ✅ État actuel (~40% complet)

**Phases complétées** :
- ✅ **Phase 1** : Architecture backend (TypeScript utilities, Zod schemas)
- ✅ **Phase 2** : API Backend complète (15 endpoints CRUD)
- ✅ **Phase 3** : Interface frontend de configuration des agents

**Phases restantes** :
- ⏳ Phase 4 : Gestion avancée des modules
- ⏳ Phase 5 : Canvas pour les sub-agents (drag-and-drop)
- ⏳ Phase 6 : Configuration des tools et hooks
- ⏳ Phase 7 : UI Export/Import (backend déjà fait)
- ⏳ Phase 8 : Polish et tests

## 📋 Prérequis

- **Node.js** : v22.11.0 ou supérieur (v20.19.6 fonctionne mais avec warnings)
- **pnpm** : Package manager (sera installé automatiquement si absent)
- **Docker** (optionnel) : Pour middleware (Redis, Postgres)

## 🚀 Installation et Lancement

### 1. Installation des dépendances

```bash
cd web
pnpm install
```

Cette commande installe :
- Next.js 15 et React 19
- TypeScript et Zod (validation)
- Tailwind CSS (styling)
- js-yaml (parsing YAML)
- Et toutes les autres dépendances

### 2. Lancer l'application en développement

```bash
pnpm dev
```

L'application sera accessible sur : **http://localhost:3000/agents**

### 3. Lancer en production

```bash
# Build l'application
pnpm build

# Lance le serveur de production
pnpm start
```

## 📁 Structure du projet

```
agentic-workflow-model/
├── agents/                          # Données YAML
│   ├── configurations/v6/           # Configurations des agents
│   │   └── {client}/
│   │       └── {agent_id}/
│   │           └── {version}/
│   │               ├── agent_config.yml
│   │               ├── modules_inputs/
│   │               ├── glossary/
│   │               └── sub_agents/
│   └── modules_configurations/      # Configurations des modules
│       └── {module_name}/
│           ├── forms.yml
│           ├── dependencies.yml
│           ├── memory.yml
│           └── tools/
│
├── web/                             # Application Next.js
│   ├── app/                         # Routes et pages
│   │   ├── agents/                  # Pages de configuration
│   │   │   ├── page.tsx            # Liste des agents
│   │   │   ├── new/page.tsx        # Créer un agent
│   │   │   └── [agentId]/page.tsx  # Détails d'un agent
│   │   └── api/                     # API Routes (backend)
│   │       ├── agents/              # CRUD agents
│   │       ├── modules/             # Discovery modules
│   │       └── config/              # Configuration
│   │
│   ├── lib/                         # Utilitaires
│   │   ├── utils/paths.ts          # Gestion des chemins
│   │   ├── yaml/                   # Lecteur/Écriture YAML
│   │   └── agents/parser.ts        # Parsing des agents
│   │
│   └── types/                       # Définitions TypeScript
│       ├── agent.ts                # Types d'agents
│       └── module.ts               # Types de modules
│
├── new_project/                     # Documentation de référence
│   ├── ROADMAP.md                  # Plan global
│   ├── AGENTS.md                   # Spec des agents
│   ├── MODULES.md                  # Spec des modules
│   └── roadmap/                    # Étapes détaillées
│
├── IMPLEMENTATION_STATUS.md         # État d'avancement
├── PHASE_3_COMPLETE.md             # Documentation Phase 3
└── API_README.md                    # Documentation API
```

## 🎯 Fonctionnalités disponibles

### 1. Liste des agents (`/agents`)
- Affichage de tous les agents en grille
- Recherche par nom ou ID
- Filtre par client
- Bouton de création rapide

### 2. Créer un agent (`/agents/new`)
- Formulaire complet avec validation
- Configuration LLM, STT, TTS
- Slider de température
- Sélecteurs de langue et timezone

### 3. Détails d'un agent (`/agents/[agentId]`)
- Interface à onglets :
  - **Configuration** : Paramètres généraux, messages, modèles IA
  - **Modules** : Liste des modules configurés
  - **Glossaire** : Définitions personnalisées
  - **Sub-Agents** : Sous-agents configurés
- Actions : Enregistrer, Supprimer
- Notifications toast

## 🔧 Commandes utiles

```bash
# Développement
cd web
pnpm dev                 # Lance le serveur de dev
pnpm build               # Build pour production
pnpm start               # Lance la version production

# Qualité du code
pnpm type-check:tsgo     # Vérification TypeScript
pnpm lint:fix            # Lint et auto-fix
pnpm test                # Lance les tests

# Nettoyage
rm -rf node_modules      # Supprimer les dépendances
rm -rf .next             # Supprimer le cache Next.js
pnpm install             # Réinstaller
```

## 📡 API Backend

L'API REST est accessible sur `/api/*` :

### Agents
- `GET /api/agents` - Liste tous les agents
- `POST /api/agents` - Créer un agent
- `GET /api/agents/:id` - Obtenir un agent
- `PUT /api/agents/:id` - Mettre à jour un agent
- `DELETE /api/agents/:id` - Supprimer un agent

### Export/Import
- `GET /api/agents/:id/export` - Exporter en JSON
- `POST /api/agents/import` - Importer depuis JSON

### Versioning
- `GET /api/agents/:id/versions` - Lister les versions
- `POST /api/agents/:id/versions` - Créer une version

### Modules
- `GET /api/modules` - Liste des modules
- `GET /api/modules/:id` - Détails d'un module
- `GET /api/modules/:id/dependencies` - Dépendances

Documentation complète : `web/API_README.md`

## 🐛 Résolution de problèmes

### Port 3000 déjà utilisé
```bash
# Tuer le processus sur le port 3000
lsof -ti:3000 | xargs kill -9
# Ou utiliser un autre port
PORT=3001 pnpm dev
```

### Erreurs de dépendances
```bash
cd web
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erreurs TypeScript
```bash
cd web
pnpm type-check:tsgo
# Répare automatiquement ce qui peut l'être
pnpm lint:fix
```

### Données de test manquantes
```bash
# Créer la structure de test
mkdir -p agents/configurations/v6/test_client/agent_001/latest
mkdir -p agents/modules_configurations/base_auto
```

## 📊 État des données

**Agents de test** :
- `test_client/agent_001/latest` - Agent exemple configuré

**Modules de test** :
- `base_auto` - Module exemple avec forms, tools, memory

## 🔜 Prochaines étapes

Pour continuer le développement :

1. **Phase 4** : Gestion avancée des modules
   - Formulaires dynamiques depuis `forms.yml`
   - Visualisation des dépendances
   - Configuration détaillée des modules

2. **Phase 5** : Canvas pour sub-agents
   - Intégration ReactFlow
   - Drag-and-drop de nœuds
   - Connexions entre sub-agents

3. **Phase 6** : Tools & Hooks
   - Configuration des actions
   - Éditeur de conditions
   - Prévisualisation

## 📝 Documentation

- `IMPLEMENTATION_STATUS.md` - État détaillé de l'implémentation
- `PHASE_3_COMPLETE.md` - Résumé de la phase 3
- `web/API_README.md` - Documentation API complète
- `new_project/ROADMAP.md` - Roadmap originale
- `new_project/AGENTS.md` - Spécification des agents
- `new_project/MODULES.md` - Spécification des modules

## 💡 Conseils de développement

1. **Mode watch TypeScript** : Les types sont vérifiés en temps réel
2. **Hot reload** : Les modifications sont visibles instantanément
3. **React DevTools** : Disponible dans le navigateur
4. **ESLint** : Auto-fix avant chaque commit (husky)

## 🎨 Stack technique

- **Frontend** : Next.js 15, React 19, TypeScript
- **Styling** : Tailwind CSS
- **Validation** : Zod (runtime type checking)
- **State** : React hooks (useState, useEffect)
- **Routing** : Next.js App Router
- **API** : Next.js API Routes

## 📞 Support

Pour toute question ou problème :
1. Vérifier `IMPLEMENTATION_STATUS.md` pour l'état actuel
2. Consulter `web/API_README.md` pour l'API
3. Voir `new_project/` pour les spécifications originales

---

**Version** : Phase 3 complète (~40% du projet)
**Dernière mise à jour** : Janvier 2026
