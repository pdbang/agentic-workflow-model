# Guide d'Implémentation : Architecture Modulaire V6

**Audience** : Développeurs diago et Assistants IA  
**Objectif** : Comprendre et maîtriser l'architecture V6 pour créer/modifier modules et agents

---

## 🎯 Vision Globale

L'architecture V6 repose sur une **séparation stricte** entre :

1. **Modules** (`src/modules/`) : Code métier réutilisable
2. **Agents** (`agents/configurations/v6/`) : Configuration conversationnelle spécifique

**Principe fondamental** : Un agent assemble des modules et définit comment ils interagissent via des **hooks** configurés en YAML.

---

## 📐 Concepts Fondamentaux

### 1. Module = Unité Fonctionnelle Autonome

Un module encapsule une fonctionnalité métier complète (ex: `mecaplanning`, `calendly`, `base_auto`).

**Structure type** :
```
module_name/
├── infos.py              # Configuration statique (API keys, URLs)
├── memory.py             # Variables de session (state management)
├── session_test.py       # Fixtures pytest pour les tests
├── tools/                # Actions exposées au LLM
│   ├── tool_name.py
│   └── tool_name_tool_test.py
├── codes/                # Logique métier pure (optionnel)
├── prompts/              # Templates Jinja2 (optionnel)
│   ├── category/name.py
│   ├── category/name.txt.j2
│   └── category/name_test.py
└── forms.yml             # Config backoffice (généré auto)
```

### 2. Agent = Orchestration Conversationnelle

Un agent définit **comment** utiliser les modules via des **sub-agents** (états conversationnels).

**Structure type** :
```
agent_name/
├── agent_config.yml      # Config globale (messages, models LLM/STT/TTS)
├── memory.yml            # Agrégé automatiquement (lecture seule)
├── glossary/             # Aide prononciation/transcription
├── modules_inputs/       # Valeurs concrètes pour infos.py
│   └── module_name.yml
└── sub_agents/           # États conversationnels
    └── state_name.yml
```

### 3. Hooks = Interopérabilité entre Modules

Les **hooks** permettent à un tool d'un module de déclencher un tool d'un autre module **sans couplage direct dans le code**.

**Exemple** : `base_auto/tools/select_team.py` définit un hook `on_transfer_failed` dans sa classe Python. L'agent configure dans `sub_agents/*.yml` quel tool appeler quand ce hook se déclenche.

**Configuration (YAML)** :
```yaml
tools:
  - name: "Select Team"
    module: "base_auto"
    path: "tools/select_team.py"
    hooks:
      on_transfer_failed:
        action: "tool"
        target_tool:
          name: "Send Lead Email"
          module: "crm_integration"
          path: "tools/send_lead.py"
```

**Code Python (dans le module)** :
```python
class Hooks(BaseHooks):
    on_transfer_failed: BaseHook = Field(
        default=BaseHook(name="on_transfer_failed", action="tool"),
        description="Hook triggered when transfer fails"
    )

class Tool(BaseTool):
    hooks: Hooks
    
    async def run(self, input, memory, infos, session):
        # ... logique métier
        if transfer_failed:
            # Déclenche le hook configuré par l'agent
            await self.trigger_hook(
                self.hooks.on_transfer_failed,
                memory, infos, input_data, session
            )
```

**Actions disponibles** :
- `tool` : Exécute un autre tool
- `switch_sub_agent` : Change d'état conversationnel
- `case` : Évalue des conditions et exécute une action selon le résultat

---

## 🔄 Cycle de Vie d'une Session

### Chargement (Lazy Loading)

```python
# 1. Chargement config agent depuis S3 ou local
config_agent = await ConfigAgent.get_agent(client, agent, version, channel)

# 2. Chargement modules infos (depuis modules_inputs/*.yml)
await config_agent.modules_infos.load_from_dict(modules_data)
# → Instancie les Pydantic models définis dans infos.py

# 3. Initialisation mémoire (avec variables de tous les modules utilisés)
memory = MemoryManager(client_id, agent_id, session_id, user_id)
await memory.load(config_agent.memory_variables)
# → Charge depuis RDS (session), S3 (user) et redis (shared)

# 4. Activation sub-agent initial
active_sub_agent = config_agent.get_initial_sub_agent()
# → Charge tools avec leurs hooks depuis sub_agents/*.yml
```

### Exécution d'un Tool

```python
# 1. LLM décide d'appeler un tool
tool_call = {"tool_name": "select_team", "arguments": {"team": "atelier"}}

# 2. Validation et exécution
tool = active_sub_agent.tools["select_team"]
result = await tool.execute(memory, infos, tool_call["arguments"], session)
# → Pydantic valide les arguments (ToolInput)
# → Appelle tool.run(validated_input, memory, infos, session)

# 3. Si hook configuré, exécution automatique
if result.exit_to:  # Hook a déclenché un switch_sub_agent
    active_sub_agent = config_agent.sub_agents[result.exit_to]
```

### Persistance

```python
# À la fin de la conversation
await memory.save()
# → session scope → RDS table discussions (tags)
# → user scope → RDS table users
# → shared scope → Variables partagées (cache/RDS)
```

---

## 🛠️ Créer un Module

### Étape 1 : Structure de Base

Utilisez le module **`template`** comme référence :

```python
# infos.py
from typing import Annotated
from pydantic import BaseModel, Field

class TemplateInfos(BaseModel):
    api_key: Annotated[str, Field(description="API key for external service")]
    api_url: Annotated[str, Field(description="Base URL for the API")]
    email: Annotated[str, Field(description="Email address for notifications")]

class Infos(BaseModel):
    template: TemplateInfos
```

```python
# memory.py
from typing import Annotated
from pydantic import BaseModel, Field

class Memory(BaseModel):
    last_result: Annotated[
        str, 
        Field(
            title="Last Result",
            description="Dernière requête effectuée",
            json_schema_extra={"session": True}
        )
    ] = ""
```

**Scopes disponibles** :
- `{"session": True}` : Sauvegardé avec la discussion (RDS tags)
- `{"user": True}` : Sauvegardé pour l'utilisateur (RDS users)
- `{"shared": True}` : Partagé entre tous les utilisateurs (cache)
- Combinable : `{"session": True, "user": True}`

### Étape 2 : Créer un Tool

```python
# tools/example.py
from typing import TYPE_CHECKING, Annotated
from pydantic import Field

if TYPE_CHECKING:
    from models.globals.Session import Session

from models.tools.Tool import BaseTool, BaseToolInput, BaseHooks, BaseHook, ToolResult
from modules.template.memory import Memory
from modules.template.infos import Infos

class ToolInput(BaseToolInput):
    query: Annotated[str, Field(description="Query to process")]

class Hooks(BaseHooks):
    on_success: BaseHook = Field(
        default=BaseHook(name="on_success", action="tool"),
        description="Hook triggered on success"
    )

class Tool(BaseTool):
    """Example Tool
    This tool demonstrates the standard pattern."""
    
    hooks: Hooks
    usage: list = ["start_discussion"]  # Optionnel
    prompts: list = ["prompts/example_usage"]  # Optionnel
    
    def __init__(self):
        super().__init__(name="example", hooks=Hooks())
    
    async def run(
        self, 
        input: ToolInput, 
        memory: Memory, 
        infos: Infos, 
        session: "Session" = None
    ) -> ToolResult:
        # Logique métier
        result = f"Processed: {input.query}"
        memory.last_result = result
        
        # Retour avec self.result()
        return self.result(
            tool_content=f"Successfully processed query",
            output={"result": result}
        )
```

**Patterns obligatoires** :
- ✅ `ToolInput(BaseToolInput)` avec Pydantic validation
- ✅ `Hooks(BaseHooks)` même si vide
- ✅ `Tool(BaseTool)` avec `__init__` qui appelle `super().__init__(name, hooks)`
- ✅ `TYPE_CHECKING` pour éviter imports circulaires avec Session
- ✅ `self.result()` et non `ToolResult()` directement

### Étape 3 : Tests

```python
# tools/example_tool_test.py
import pytest
from modules.template.tools.example import Tool, ToolInput, Hooks
from modules.template.session_test import mock_session, mock_memory, mock_infos

@pytest.mark.asyncio
async def test_example_tool(mock_session, mock_memory, mock_infos):
    tool = Tool()
    input_data = ToolInput(query="test query")
    
    result = await tool.run(input_data, mock_memory, mock_infos, mock_session)
    
    assert result.output["result"] == "Processed: test query"
    assert mock_memory.last_result == "Processed: test query"
```

```python
# session_test.py (fixtures centralisées)
import pytest
from modules.template.memory import Memory
from modules.template.infos import Infos, TemplateInfos

@pytest.fixture
def mock_session():
    from unittest.mock import Mock
    return Mock()

@pytest.fixture
def mock_memory():
    return Memory(last_result="", counter=0)

@pytest.fixture
def mock_infos():
    return Infos(
        template=TemplateInfos(
            api_key="test_key",
            api_url="https://api.test.com",
            email="test@example.com"
        )
    )
```

### Étape 4 : Validation

```bash
# Tester le module
python agents/scripts/test_modules.py template

# Exporter pour le backoffice
python agents/scripts/export_modules.py template
```

---

## 🤖 Créer un Agent

### Étape 1 : Configuration Générale

```yaml
# agent_config.yml
version: "v6"
language: "fr-FR"
timezone: "Europe/Paris"

messages:
  welcome:
    text: "Bonjour, comment puis-je vous aider ?"
    audio: "audios/welcome.mp3"
  goodbye:
    text: "Au revoir !"

models:
  llm:
    provider: "openai"
    model: "gpt-4"
    temperature: 0.7
  stt:
    provider: "deepgram"
  tts:
    provider: "eleven_labs"
```

### Étape 2 : Configuration des Modules

```yaml
# modules_inputs/template.yml
api_key: "sk-prod-xxxxx"
api_url: "https://api.production.com"
email: "support@client.com"
```

**Important** : Ces valeurs doivent correspondre exactement aux champs définis dans `modules/template/infos.py`.

### Étape 3 : Sub-Agents (États Conversationnels)

```yaml
# sub_agents/initialization.yml
sub_agent:
  name: "initialization"
  description: "État initial de la conversation"
  
  prompts:
    - module: "template"
      path: "welcome/initialisation"
  
  tools:
    - name: "Example Tool"
      module: "template"
      path: "tools/example.py"
      hooks:
        on_success:
          action: "switch_sub_agent"
          target_sub_agent: "conversation"
    
    - name: "Search Tool"
      module: "template"
      path: "tools/search.py"
      hooks:
        on_error:
          action: "case"
          cases:
            - memory_variable: "retry_count"
              operator: "lt"
              value: 3
              action: "tool"
              target_tool:
                name: "Retry Handler"
                module: "template"
                path: "tools/retry.py"
          default:
            action: "switch_sub_agent"
            target_sub_agent: "error_handler"
```

**Champs obligatoires** :
- `name` : Identifiant unique du sub-agent
- `description` : Description du rôle
- `prompts` : Liste des prompts à charger
- `tools` : Liste des tools disponibles dans cet état

**Hooks - Actions disponibles** :
- `tool` : Appelle un autre tool
- `switch_sub_agent` : Change d'état conversationnel
- `case` : Évalue des conditions avec operators :
  - `equals`, `not_equals`, `in`, `contains`, `exists`, `gt`, `lt`
  - Variables : `memory_variable`, `input_variable`, `info_variable`

### Étape 4 : Triggers (Start/End Discussion)

Les triggers V6 sont des tools marqués avec l'attribut `usage` :

```python
# Dans le module
class Tool(BaseTool):
    usage: list = ["start_discussion"]  # ou "end_discussion"
```

**Valeurs possibles** :
- `"default_start_discussion"` : Exécuté automatiquement au début (défaut du système)
- `"start_discussion"` : Peut être sélectionné par l'agent
- `"default_end_discussion"` : Exécuté automatiquement à la fin
- `"end_discussion"` : Peut être sélectionné par l'agent

Configuration dans `agent_config.yml` :
```yaml
triggers:
  start_discussion:
    - module: "base_auto"
      tool: "initialize_session"
  end_discussion:
    - module: "base_auto"
      tool: "save_analytics"
    - module: "crm"
      tool: "sync_lead"
```

### Étape 5 : Validation

```bash
# Tester l'agent
python agents/scripts/test_agents.py mes_agents mon_agent_v6

# Le validator vérifie :
# - Structure des fichiers
# - Cohérence modules_inputs/*.yml <-> infos.py
# - Validité des sub_agents/*.yml
# - Agrégation memory.yml
```

---

## 🔍 Patterns Avancés

### 1. Dépendances entre Modules

```python
# test_module_2/memory.py hérite de test_module
from modules.test_module.memory import Memory as ParentMemory

class Memory(ParentMemory):
    new_variable: str = ""
```

**Gestion automatique** : Lors de l'export, les dépendances sont détectées et validées.

### 2. Prompts Dynamiques

```python
# prompts/welcome/initialisation.py
from pydantic import BaseModel
from models.configuration.Prompt import BasePrompt

class PromptInput(BaseModel):
    user_name: str
    company: str

class Prompt(BasePrompt):
    def render(self, memory, infos) -> str:
        self.prompt_input = PromptInput(
            user_name=memory.customer_name,
            company=infos.template.company_name
        )
        return self._render_prompt()
```

```jinja
{# prompts/welcome/initialisation.txt.j2 #}
Bonjour {{ prompt_input.user_name }}, 
bienvenue chez {{ prompt_input.company }}.
```

### 3. Codes Réutilisables

```python
# codes/utils/api.py
async def fetch_data(endpoint: str, api_key: str) -> dict:
    """Pure function - easily testable"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            endpoint,
            headers={"Authorization": f"Bearer {api_key}"}
        )
        return response.json()

# tools/fetch.py
from modules.template.codes.utils.api import fetch_data

class Tool(BaseTool):
    async def run(self, input, memory, infos, session):
        data = await fetch_data(
            infos.template.api_url,
            infos.template.api_key
        )
        return self.result("Data fetched", output={"data": data})
```

---

## ✅ Commandes Essentielles

| Action | Commande | Description |
|--------|----------|-------------|
| **Tester module** | `python agents/scripts/test_modules.py <module>` | Valide structure, tools, prompts |
| **Tester tous modules** | `python agents/scripts/test_modules.py all` | Vérifie tous les modules |
| **Exporter module** | `python agents/scripts/export_modules.py <module>` | Génère YAMLs pour backoffice |
| **Tester agent** | `python agents/scripts/test_agents.py <client> <agent>` | Valide config complète |
| **Lister agents** | `python agents/scripts/test_agents.py` | Affiche agents disponibles |

---

## 📚 Références Détaillées

- **Modules** : Voir [`MODULES.md`](src/modules/MODULES.md) pour détails techniques
- **Agents** : Voir [`AGENTS.md`](agents/configurations/AGENTS.md) pour configuration avancée
- **Migration V5→V6** : Voir [`README_V5TOV6.md`](README_V5TOV6.md) pour guide de migration

---

## 🎓 Checklist Développeur

### Créer un Module
- [ ] Structure créée depuis template
- [ ] `infos.py` avec Pydantic models
- [ ] `memory.py` avec Annotated + scopes
- [ ] Tools avec pattern Tool/ToolInput/Hooks
- [ ] `session_test.py` avec fixtures
- [ ] Tests `*_tool_test.py` pour chaque tool
- [ ] `test_modules.py <module>` passe ✅

### Créer un Agent
- [ ] `agent_config.yml` avec messages, models
- [ ] `modules_inputs/*.yml` pour chaque module utilisé
- [ ] `sub_agents/*.yml` avec name, description, prompts, tools
- [ ] Hooks configurés pour l'interopérabilité
- [ ] `test_agents.py <client> <agent>` passe ✅

### Bonnes Pratiques
- [ ] Nommage strict : Tool, ToolInput, Hooks (sans préfixes)
- [ ] TYPE_CHECKING pour Session
- [ ] self.result() et non ToolResult()
- [ ] Hooks même si vides (BaseHooks)
- [ ] Documentation inline (docstrings)
- [ ] Tests exhaustifs avec fixtures

---

**Dernière mise à jour** : 23 décembre 2025  
**Référence** : Module `template` & Agent `test_v6` pour exemples canoniques
