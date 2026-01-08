# Agents and Modules Management

Ce répertoire contient les configurations des agents et les outils pour gérer les modules.

## Structure

```
agents/
├── configurations/v6/           # Configuration des agents par client
│   └── {client_id}/
│       └── {agent_id}/
│           ├── agent_config.yml
│           ├── memory.yml
│           ├── modules_inputs/
│           ├── sub_agents/
│           └── glossary/
├── modules_configurations/   # Configuration exportée des modules
│   └── {module_name}/
│       ├── memory.yml
│       ├── tools/
│       ├── prompts/
│       ├── dependencies.yml
│       └── forms.yml
└── scripts/                  # Scripts de gestion
    ├── export_modules.py     # Export modules → YAML
    ├── test_modules.py       # Test structure modules
    └── test_agents.py        # Test configuration agents
```

## Quick Start

### 1. Développer un Module

Créer la structure dans `src/modules/my_module/`:
- `infos.py` : Configuration statique (API keys, URLs, etc.)
- `memory.py` : Variables de session Pydantic
- `tools/` : Tools (classes héritant de Tool)
- `codes/` : Logique métier réutilisable
- `prompts/` : Templates Jinja2 + classes Prompt

Voir `src/modules/MODULES.md` pour les détails.

### 2. Exporter le Module

```bash
# Export un module spécifique
python agents/scripts/export_modules.py my_module

# Export tous les modules
python agents/scripts/export_modules.py all

# Lister les modules disponibles
python agents/scripts/export_modules.py
```

Les fichiers YAML sont générés dans `agents/modules_configurations/my_module/`.

### 3. Tester le Module

```bash
# Test un module spécifique
python agents/scripts/test_modules.py my_module

# Test tous les modules
python agents/scripts/test_modules.py all
```

Le script vérifie :
- ✅ Structure des fichiers requis
- ✅ Validité des classes Infos et Memory
- ✅ Cohérence des tools et templates
- ✅ Dépendances entre modules

### 4. Configurer un Agent

Créer la structure dans `agents/configurations/v6/client_id/agent_id/version/`:

```yaml
# agent_config.yml
messages:
  welcome:
    fr-FR: "Bienvenue!"
languages:
  - fr-FR
timezone: "Europe/Paris"
start_discussion:
  tools:
    - tool: InitTool
      module: my_module
```

```yaml
# modules_inputs/my_module.yml
api_key: "sk-xxxxx"
endpoint_url: "https://api.example.com"
```

```yaml
# sub_agents/initialisation.yml
sub_agent:
  name: "initialisation"
  description: "État initial"
  prompts:
    - module: "my_module"
      path: "welcome/main"
  tools:
    - module: "my_module"
      path: "tools/search.py"
      class_name: "SearchTool"
```

Voir `agents/configurations/v6/AGENTS.md` pour les détails.

### 5. Tester l'Agent

```bash
# Test un agent spécifique
python agents/scripts/test_agents.py client_id agent_id

# Avec version spécifique
python agents/scripts/test_agents.py client_id agent_id --version test_v6

# Test tous les agents
python agents/scripts/test_agents.py all

# Lister les agents disponibles
python agents/scripts/test_agents.py
```

Le script vérifie :
- ✅ Structure de l'agent (fichiers requis)
- ✅ Validité de agent_config.yml
- ✅ Cohérence modules_inputs vs module infos
- ✅ Validité des sub-agents
- ✅ Agrégation de la mémoire

### 6. Lancer un Appel

Pour tester un agent en conditions réelles (nécessite que le serveur tourne localement ou à distance) :

```bash
# Appel simple
python agents/scripts/call_agent.py client_id agent_id +33612345678

# Avec version et variables
python agents/scripts/call_agent.py client_id agent_id +33612345678 \
  --version test_v6 \
  --vars '{"first_name": "Jean"}'

# Sur un serveur distant
python agents/scripts/call_agent.py client_id agent_id +33612345678 \
  --url https://api.diago.ai
```

## Architecture V6

### Séparation des Responsabilités

- **Modules** (`src/modules/`) : Code réutilisable, logique métier
- **Agents** (`agents/configurations/v6/`) : Configuration spécifique
- **Runtime** (`Session`, `ConfigAgent`) : Orchestration dynamique

### Workflow Runtime

```python
# 1. Chargement config agent V6
config = await ConfigAgent.get(client, agent, version, channel)

# 2. Chargement modules infos
session.agent_config.modules_infos = ModulesInfos(client_id, agent_id)
await session.agent_config.modules_infos.load(config.infos)

# 3. Chargement mémoire
session.memory = Memory(client_id, agent_id, session_id, user_id)
await session.memory.load(memory_variables)

# 4. Activation sub-agent
session.active_sub_agent = config.get_initial_sub_agent()
```

### Exécution Tools et Triggers

**Tools via Sub-Agent:**
```python
# Récupère le tool depuis le sub-agent actif
tool = session.active_sub_agent.tools["search"]

# Execute avec Memory et ModulesInfos
result = await tool.run(input, session.memory, session.agent_config.modules_infos)
```

**Triggers V6:**
```yaml
start_discussion:
  tools:
    - tool: InitTool
      module: my_module
    - tool: LoadData
      module: my_module
```

Exécutés automatiquement au début/fin de conversation.

## Documentation Complète

- **Modules** : `src/modules/MODULES.md`
- **Agents** : `agents/configurations/v6/AGENTS.md`
- **Intégration** : `docs/MODULE_AND_AGENT_INTEGRATION.md`
- **Copilot Instructions** : `.github/copilot-instructions.md`

## Exemples

### Module Test

Le module `test_module` démontre toutes les fonctionnalités :
- Infos avec structures imbriquées
- Memory avec types complexes (List[Team])
- Tools avec validation Pydantic
- Prompts avec templates Jinja2
- Codes réutilisables

```bash
# Export et test
python agents/scripts/export_modules.py test_module
python agents/scripts/test_modules.py test_module
```

### Agent Test

L'agent `test_agents/test_v6` démontre la configuration V6 :
- Messages multi-langues
- Configuration modèles (STT/TTS/LLM)
- Modules inputs
- Sub-agents avec tools
- Triggers V6

```bash
# Test
python agents/scripts/test_agents.py test_agents test_v6
```

## Troubleshooting

### Module non trouvé
```bash
❌ Module 'my_module' not found
```
→ Vérifier l'existence dans `src/modules/my_module/`

### Erreur validation modules_inputs
```bash
❌ Invalid configuration for module 'my_module'
```
→ Vérifier que tous les champs requis sont présents

### Tool non trouvé dans sub-agent
```bash
❌ Tool 'search' not found
```
→ Vérifier la référence dans `sub_agents/*.yml`

### Variables mémoire en conflit
```bash
⚠️  Variable 'status' defined in multiple modules
```
→ Renommer ou fusionner les modules

## Contribution

1. **Développer** le module dans `src/modules/`
2. **Ajouter tests** unitaires (`*_test.py`)
3. **Exporter** avec `export_modules.py`
4. **Tester** avec `test_modules.py`
5. **Configurer** agent dans `agents/configurations/v6/`
6. **Valider** avec `test_agents.py`

## Support

Pour toute question ou problème :
- Consulter la documentation dans `docs/`
- Vérifier les exemples dans `test_module` et `test_agents`
- Utiliser les scripts de test pour valider

## License

Propriétaire - Diago AI
