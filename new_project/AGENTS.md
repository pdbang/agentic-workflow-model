# Configuration des Agents V6

> **Note** : Pour une introduction complète, voir [`README_IMPLEM.md`](../../README_IMPLEM.md)

Ce document détaille la configuration technique des agents V6.

## Structure du Dossier Agent

En local, la configuration d'un agent V6 est dans `agents/configurations/v6/{client}/{agent}` :

```
agent_name/
├── agent_config.yml      # Configuration principale
├── memory.yml            # Agrégé automatiquement (lecture seule)
├── glossary/             # Aide prononciation/transcription
│   ├── definitions.yml
│   ├── pronounciations.yml
│   └── transcriptions.yml
├── modules_inputs/       # Configuration modules utilisés
│   └── module_name.yml
└── sub_agents/           # États conversationnels
    └── state_name.yml
```

## 1. Configuration Générale (`agent_config.yml`)

Configuration globale de l'agent avec messages, modèles IA, et triggers.

```yaml
version: "v6"
language: "fr-FR"
alternative_languages:
  - "en-US"
timezone: "Europe/Paris"

messages:
  welcome:
    text: "Bonjour, comment puis-je vous aider ?"
    audio: "audios/welcome.mp3"
  goodbye:
    text: "Au revoir et bonne journée !"
  error:
    text: "Désolé, je n'ai pas compris."

models:
  llm:
    provider: "openai"
    model: "gpt-4"
    temperature: 0.7
    timeout: 30
  stt:
    provider: "deepgram"
    model: "nova-2"
  tts:
    provider: "eleven_labs"
    voice_id: "voice_123"

triggers:
  start_discussion:
    - action: "tool"
      target_tool:
        module: "base_auto"
        path: "initialize_session"
  end_discussion:
    - action: "tool"
      target_tool:
        module: "base_auto"
        path: "finalize_session"

```

**Champs** :
- `messages` : Messages système utilisés par l'agent
- `models` : Configuration LLM, STT, TTS
- `triggers` : Hooks exécutés automatiquement (start/end discussion). Attention : Contrairement à avant, ce ne sont plus des listes de tools mais des listes de hooks, permettant plus de flexibilité (conditions, enchaînement de tools, etc.)

## 2. Glossaire (`glossary/`)

Ce dossier améliore la qualité de la conversation :

- **`definitions.yml`** : Définitions de termes métier injectées dans le prompt pour donner du contexte au LLM.
- **`pronounciations.yml`** : Mappage phonétique pour corriger la prononciation du TTS (ex: "Mecaplanning" -> "Mékaplanning").
- **`transcriptions.yml`** : Indices pour le STT afin de corriger les erreurs fréquentes de transcription (ex: "j'ai" -> "G" pour une lettre).

## 3. Modules Inputs (`modules_inputs/`)

Contient un fichier YAML par module utilisé. Ces fichiers fournissent les **valeurs concrètes** pour les champs définis dans le `infos.py` du module.

**Exemple** : Pour `modules/template/infos.py` :
ub-Agents (`sub_agents/`)

Définit la logique conversationnelle. Chaque fichier YAML représente un **état conversationnel** avec ses prompts, tools et hooks.

**Structure** :

```yamMémoire (`memory.yml`)

Fichier **généré automatiquement** lors de l'export. Il agrège toutes les variables de mémoire définies dans les `memory.py` des modules utilisés.

**Ne pas modifier manuellement** - Modifier les `memory.py` des modules puis ré-exporter.

**Format** :

```yaml
last_search:
  title: "Last Search"
  description: "Dernière recherche effectuée"
  type: "string"
  default: ""
  scopes:
    session: true
    user: false
    shared: false
  module: "base_auto"

preferred_language:
  title: "Preferred Language"
  description: "Langue préférée de l'utilisateur"
  type: "string"
  default: "fr"
  scopes:
    session: false
    user: true
    shared: false
  module: "base_auto"
```
      path: "start_prompt/initialisation"
  
  tools:
    - name: "Search Web"
   6. Validation et Test des Agents

### Test des Agents

```bash
# Tester un agent spécifique
python agents/scripts/test_agents.py test_agents test_v6

# Tester tous les agents
python agents/scripts/test_agents.py all

# Lister les agents disponibles
python agents/scripts/test_agents.py
```

Le script vérifie :
- ✅ **Structure** : Présence des fichiers requis
- ✅ **agent_config.yml** : Validité (messages, langues, timezone, modèles)
- ✅ **modules_inputs** : Cohérence avec les `infos.py` des modules
- ✅ **sub_agents** : Validité (tools, prompts, hooks, modules référencés)
- ✅ **memory** : Agrégation correcte des variables

### Exemple de Rapport

```
🧪 Testing agent: test_agents/test_v6

  📁 Testing agent structure...
    ✅ Structure validated
  
  📝 Testing agent_config.yml...
    ✅ Agent config validated
  
  🔧 Testing modules_inputs...
    ✅ Module 'test_module' inputs validated
    ✅ Tested 1 module inputs
  
  🤖 Testing sub_agents...
    ✅ Sub-agent 'initializar défaut si aucun case ne match
    email: str

class Infos(BaseModel):
    template: TemplateInfos
```

**Configuration** : `modules_inputs/template.yml` :

```yaml
api_key: "sk-prod-xxxxx"
api_url: "https://api.production.com"
email: "support@client.com"
```
7. Système de Hooks - Interopérabilité

Les **hooks** sont le mécanisme central permettant à un tool d'un module de déclencher un tool d'un autre module **sans couplage dans le code**.

### Déclaration dans le Module (Python)

```python
# Dans modules/base_auto/tools/select_team.py
from pydantic import Field
from models.tools.Tool import BaseHook, BaseHooks

class Hooks(BaseHooks):
    on_transfer_failed: BaseHook = Field(
        default=BaseHook(name="on_transfer_failed", action="tool"),
        description="Hook triggered when transfer fails"
    )

class Tool(BaseTool):
    hooks: Hooks
    
    async def run(self, input, memory, infos, session):
        if transfer_failed:
            # Déclenche le hook configuré par l'agent
            await self.trigger_hook(
                self.hooks.on_transfer_failed,
                memory, infos, {}, session
            )
```

### Configuration dans l'Agent (YAML)

```yaml
# sub_agents/initialization.yml
tools:
  - name: "Select Team"
    module: "base_auto"
    path: "tools/select_team.py"
    hooks:
      on_transfer_failed:
        action: "case"
        cases:
          - memory_variable: "lead_source"
            operator: "equals"
            value: "web"
            action: "tool"
            target_tool:
              name: "Send Email"
              module: "crm"
              path: "tools/send_email.py"
          - memory_variable: "lead_source"
            operator: "equals"
            value: "phone"
            action: "tool"
            target_tool:
              name: "Create Ticket"
              module: "support"
              path: "tools/create_ticket.py"
        default:
          action: "switch_sub_agent"
          target_sub_agent: "fallback"
```

**Avantage** : Le module `base_auto` ne connaît pas les modules `crm` ou `support`. C'est l'agent qui orchestre l'interopérabilité.
- **Modules Inputs** : Cohérence entre `modules_inputs/*.yml` et les `infos.py` des modules
- **Sub-Agents** : Validité des fichiers dans `sub_agents/` (tools, prompts, modules référencés)
- **Mémoire** : Agrégation correcte des variables de tous les modules utilisés

### Exemple de Rapport de Test

```
🧪 Testing agent: test_agents/test_v6
📂 Agent path: /path/to/agents/configurations/v6/test_agents/test_v6

  📁 Testing agent structure...
    ✅ Structure validated
  
  📝 Testing agent_config.yml...
    ℹ️  V6 triggers format detected
    ✅ Agent config validated
  
  🔧 Testing modules_inputs...
    ✅ Module 'mecaplanning' inputs validated
    ✅ Tested 1 module inputs
  
  🤖 Testing sub_agents...
    ✅ Sub-agent 'initialisation' validated
    ✅ Tested 1 sub-agents
  
  💾 Testing memory aggregation...
    ✅ Memory aggregation validated (15 variables)

============================================================
✅ Agent 'test_agents/test_v6' passed all tests
```

## 8. Intégration avec le Code

### Architecture V6

L'architecture V6 introduit une séparation claire entre :

1. **Modules** (`src/modules/`) : Code réutilisable (tools, codes, prompts, memory)
2. **Agents** (`agents/configurations/v6/`) : Configuration spécifique par agent
3. **Session** : Orchestration runtime avec chargement dynamique des modules

### Chargement au Runtime

Lorsqu'une session est créée :

```python
# 1. Chargement de la configuration agent (V6)
config_agent = await ConfigAgent.get(client, agent, version, channel)

# 2. Initialisation des modules infos
session.agent_config.modules_infos = ModulesInfos(client_id, agent_id)
await session.agent_config.modules_infos.load(config_agent.infos)

# 3. Initialisation de la mémoire avec variables des modules
session.memory = Memory(client_id, agent_id, session_id, user_id)
await session.memory.load(memory_variables)

# 4. Activation du sub-agent initial
session.active_sub_agent = config_agent.get_initial_sub_agent()
```

### Exécution des Tools

Les tools sont exécutés différemment selon le contexte :

- **Sub-Agent Tools** : Tools définis dans les modules, chargés dynamiquement
- **Triggers** : Tools exécutés au début/fin de conversation (format V6)
- **Hooks** : Chaque tool peut contenir des hooks qui sont des portes d'entrées pour lancer un ou plusieurs tools provenant de différents modules. Ces hooks modifient les valeurs présentes dans la memory. Ces hooks sont la solution pour permettre l'interopérabilité et la flexibilité entre les différents modules (exemple : le même module base_auto peut être connecté avec différents modules de gestion de leads et avec différents modules de gestion de calendrier ainsi qu'avec des API custom)
