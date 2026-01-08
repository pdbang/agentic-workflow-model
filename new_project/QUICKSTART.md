# 🚀 Quick Start - Pour Assistants IA

Ce document est un guide rapide pour qu'un assistant IA puisse démarrer le développement de l'interface de configuration d'agents.

---

## 📖 Lecture Préalable Obligatoire

Avant de commencer, lire dans l'ordre :

1. **[ROADMAP.md](./ROADMAP.md)** - Vision globale, stack technique, timeline
2. **[AGENTS.md](./AGENTS.md)** - Structure et configuration des agents
3. **[MODULES.md](./MODULES.md)** - Architecture des modules
4. **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Guide d'implémentation complet

---

## 🎯 Objectif du Projet

Créer une interface web Next.js/TypeScript pour configurer des agents IA conversationnels en :
- Sélectionnant et configurant des modules (formulaires dynamiques)
- Créant des sub-agents via drag-and-drop
- Ajoutant des tools et hooks
- Exportant en YAML

**Ce qu'on NE fait PAS** :
- ❌ Exécuter les workflows (juste configuration)
- ❌ Créer des tools/prompts (ils viennent des modules)
- ❌ Créer/éditer des modules (seulement les configurer)
- ❌ Système d'authentification

---

## 🗺️ Plan d'Exécution

### Phase 1: Backend (Semaines 1-2)
- [ÉTAPE 1: Architecture et Setup](./roadmap/STEP_1_ARCHITECTURE.md)
- [ÉTAPE 2: Backend API Core](./roadmap/STEP_2_BACKEND_API.md)

### Phase 2: Frontend Config (Semaines 2-4)
- [ÉTAPE 3: Frontend - Configuration Agent](./roadmap/STEP_3_FRONTEND_CONFIG.md)
- [ÉTAPE 4: Frontend - Gestion Modules](./roadmap/STEP_4_FRONTEND_MODULES.md)

### Phase 3: Canvas & Tools (Semaines 4-6)
- [ÉTAPE 5: Frontend - Canvas Sub-Agents](./roadmap/STEP_5_FRONTEND_CANVAS.md)
- [ÉTAPE 6: Frontend - Tools & Hooks](./roadmap/STEP_6_TOOLS_HOOKS.md)

### Phase 4: Finition (Semaine 7)
- [ÉTAPE 7: Export/Import & Versioning](./roadmap/STEP_7_EXPORT_VERSION.md)
- [ÉTAPE 8: Polish & Testing](./roadmap/STEP_8_POLISH.md)

---

## ⚡ Démarrage Rapide

### 1. Vérifier l'Environnement

```bash
# Node.js version
node --version  # Doit être >= v22.11.0

# pnpm installé
pnpm --version

# Docker Compose running (middleware)
cd /Users/admin/Documents/codes/agentic-workflow-model/docker
docker compose ps  # Redis, Postgres, etc. doivent tourner
```

### 2. Structure des Fichiers

Les configurations agents sont ici :
```
agents/configurations/v6/{client_id}/{agent_id}/
├── agent_config.yml
├── modules_inputs/
├── sub_agents/
└── glossary/
```

Les modules exportés sont ici :
```
agents/modules_configurations/{module_name}/
├── forms.yml
├── dependencies.yml
├── memory.yml
└── tools/
```

### 3. Commencer l'Implémentation

```bash
cd web

# Installer les dépendances
pnpm install

# Démarrer le serveur de dev
pnpm dev

# Dans un autre terminal - vérifier les types
pnpm type-check:tsgo
```

Puis suivre **[ÉTAPE 1](./roadmap/STEP_1_ARCHITECTURE.md)**.

---

## 📋 Checklist par Étape

Chaque fichier d'étape contient :
- 🎯 **Objectifs** : Ce qui doit être accompli
- 📁 **Structure Cible** : Organisation des fichiers
- 🔨 **Tâches Détaillées** : Code à écrire avec exemples
- ✅ **Checklist de Validation** : Vérifications avant de passer à l'étape suivante

**Règle d'Or** : Ne passer à l'étape suivante que si TOUTE la checklist est validée.

---

## 🧪 Tester votre Travail

### Tests Unitaires
```bash
cd web
pnpm test
```

### Vérification Types
```bash
pnpm type-check:tsgo
```

### Lint
```bash
pnpm lint:fix
```

### Build Production
```bash
pnpm build
```

---

## 🎨 Conventions de Code

### TypeScript
```typescript
// ✅ BON
const data: AgentConfig | null = await parseAgentConfig(clientId, agentId)
if (!data) return null

// ❌ MAUVAIS
const data = await parseAgentConfig(clientId, agentId) // Type implicite
const data: any = await parseAgentConfig(clientId, agentId) // any interdit
```

### React Components
```typescript
// ✅ BON
'use client'

interface MyComponentProps {
  value: string
  onChange: (value: string) => void
}

export function MyComponent({ value, onChange }: MyComponentProps) {
  // ...
}

// ❌ MAUVAIS
export function MyComponent(props: any) { // any interdit, props destructurées
  // ...
}
```

### API Routes
```typescript
// ✅ BON
export async function GET(request: NextRequest) {
  try {
    const data = await loadData()
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/...:', error)
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    )
  }
}
```

---

## 🚨 Pièges Courants à Éviter

### 1. Chemins de Fichiers
```typescript
// ✅ BON - Chemins absolus
const agentPath = getAgentPath(clientId, agentId, version)

// ❌ MAUVAIS - Chemins relatifs
const agentPath = './agents/configurations/...'
```

### 2. Async/Await
```typescript
// ✅ BON
const [config, modules] = await Promise.all([
  parseAgentConfig(...),
  parseModulesInputs(...)
])

// ❌ MAUVAIS - Sequential (plus lent)
const config = await parseAgentConfig(...)
const modules = await parseModulesInputs(...)
```

### 3. React State Updates
```typescript
// ✅ BON
const handleUpdate = useCallback((field: string, value: any) => {
  setData(prev => prev ? { ...prev, [field]: value } : null)
}, [])

// ❌ MAUVAIS - State mutation directe
data[field] = value
setData(data)
```

### 4. Validation YAML
```typescript
// ✅ BON
const result = AgentConfigSchema.safeParse(data)
if (!result.success) {
  console.error('Validation error:', result.error)
  return null
}
return result.data

// ❌ MAUVAIS - Pas de validation
return data as AgentConfig
```

---

## 📚 Ressources Utiles

### Documentation Next.js
- [App Router](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### Documentation Bibliothèques
- [Zod](https://zod.dev/) - Validation TypeScript
- [ReactFlow](https://reactflow.dev/) - Drag & drop
- [js-yaml](https://github.com/nodeca/js-yaml) - Parse/stringify YAML

### Références Projet
- [new_project/example_agent/](./example_agent/) - Agent exemple complet
- [AGENTS.md](./AGENTS.md) - Spec configuration agents
- [MODULES.md](./MODULES.md) - Spec modules

---

## 🆘 En Cas de Blocage

### 1. Problème de Types TypeScript
- Vérifier que les types sont importés correctement
- Utiliser `pnpm type-check:tsgo` pour voir l'erreur complète
- Consulter les schémas Zod dans `web/types/`

### 2. API Route ne Répond Pas
- Vérifier les logs console côté serveur
- Tester avec curl ou Postman
- Vérifier que les paths de fichiers existent

### 3. Composant React ne Rend Pas
- Vérifier la console browser pour erreurs
- Ajouter des `console.log` pour debugger
- Vérifier que les props sont passées correctement

### 4. Import YAML Échoue
- Vérifier le format YAML (indentation, etc.)
- Tester avec un fichier simple d'abord
- Vérifier les logs d'erreur de validation Zod

---

## ✅ Prêt à Démarrer

Si vous avez :
- ✅ Lu ROADMAP.md, AGENTS.md, MODULES.md
- ✅ Vérifié l'environnement (Node, pnpm, Docker)
- ✅ Compris les conventions de code
- ✅ Noté les pièges à éviter

Alors vous pouvez commencer par **[ÉTAPE 1: Architecture et Setup](./roadmap/STEP_1_ARCHITECTURE.md)** ! 🚀

---

## 💡 Conseils Finaux

1. **Travaillez incrémentalement** : Validez chaque petite étape
2. **Testez souvent** : Ne laissez pas les erreurs s'accumuler
3. **Documentez vos choix** : Commentaires dans le code
4. **Demandez de l'aide** : Référez-vous à la doc existante
5. **Restez focus** : Une étape à la fois

Bon développement ! 🎉
