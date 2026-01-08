# Agent Configuration Interface

Interface TypeScript/Next.js pour configurer des agents conversationnels IA via YAML.

## 🚀 Démarrage Rapide

```bash
cd web
pnpm install
pnpm dev
```

Accédez à l'application : **http://localhost:3000/agents**

## 📖 Documentation

- **[DEMARRAGE.md](./DEMARRAGE.md)** - Guide complet de démarrage et documentation
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - État d'avancement détaillé
- **[web/API_README.md](./web/API_README.md)** - Documentation API complète

## ✅ État actuel (~40%)

- ✅ Phase 1 : Architecture backend
- ✅ Phase 2 : API REST complète (15 endpoints)
- ✅ Phase 3 : Interface de configuration des agents
- ⏳ Phases 4-8 : À venir (modules avancés, canvas, tools/hooks)

## 🎯 Fonctionnalités

### Interface Web
- Liste des agents avec recherche et filtres
- Créer/éditer des agents
- Configuration LLM, STT, TTS
- Gestion des messages multilingues
- Modules et sub-agents

### API Backend
- CRUD agents complet
- Export/Import JSON
- Versioning
- Découverte de modules
- Résolution de dépendances

## 📁 Structure

```
agents/configurations/v6/       # Configurations YAML
web/app/agents/                 # Interface utilisateur
web/app/api/                    # API Routes
web/lib/                        # Utilitaires
```

## 🔧 Commandes

```bash
pnpm dev              # Développement
pnpm build            # Build production
pnpm type-check:tsgo  # Vérification types
pnpm lint:fix         # Lint et fix
```

## 📸 Captures d'écran

- [Liste des agents](https://github.com/user-attachments/assets/062ddd74-5b74-4e65-b6d7-75230831a778)
- [Créer un agent](https://github.com/user-attachments/assets/b7438f4c-4a6b-49c9-8693-4a5ade7fbc10)
- [Configuration](https://github.com/user-attachments/assets/1bcd4539-da5b-4008-bbc9-5c1fc086fd64)

## 💻 Stack Technique

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Storage**: YAML local

---

Pour plus de détails, consultez [DEMARRAGE.md](./DEMARRAGE.md)
