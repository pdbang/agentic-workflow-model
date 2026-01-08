# Documentation Technique des Modules

> **Note** : Pour une introduction complète à l'architecture, voir [`README_IMPLEM.md`](../../README_IMPLEM.md)

Ce document détaille les aspects techniques de l'implémentation des modules.

## Structure d'un Module

Un module est une unité fonctionnelle autonome avec la structure suivante :

```
module_name/
├── infos.py              # Configuration statique (Pydantic models)
├── memory.py             # Variables de session (Pydantic models + Annotated)
├── session_test.py       # Fixtures pytest centralisées
├── tools/                # Actions exposées au LLM
│   ├── tool_name.py
│   └── tool_name_tool_test.py
├── codes/                # Logique métier pure (optionnel)
├── prompts/              # Templates Jinja2 + classes Python (optionnel)
│   ├── category/name.py
│   ├── category/name.txt.j2
│   └── category/name_test.py
└── forms.yml             # Config backoffice (auto-généré)
```

## 1. Infos (`infos.py`)

Définit la configuration statique du module avec Pydantic pour validation stricte.

**Règles** :
- Classe `Infos` obligatoire avec **un seul attribut** nommé comme le module
- Utiliser Pydantic `BaseModel` (pas `@dataclass`)
- Utiliser `Annotated` avec `Field(description=...)` pour documenter

```python
from typing import Annotated
from pydantic import BaseModel, Field

class MyModuleInfos(BaseModel):
    api_key: Annotated[str, Field(description="Clé API pour le service externe")]
    endpoint_url: Annotated[str, Field(description="URL du service")]

class Infos(BaseModel):
    my_module: MyModuleInfos
```

## 2. Memory (`memory.py`)

Définit les variables de session avec Pydantic et scopes de persistance.

**Règles** :
- Classe `Memory(BaseModel)` obligatoire
- Champs avec `Annotated[Type, Field(...)]`
- Métadonnées : `title`, `description`, `json_schema_extra` avec scopes
- Les noms de variables doivent être **uniques** entre tous les modules

**Scopes de persistance** :
- `{"session": True}` : Sauvegardé avec la discussion (RDS table tags)
- `{"user": True}` : Sauvegardé pour l'utilisateur (RDS table users)
- `{"shared": True}` : Partagé entre tous les utilisateurs (cache Redis)
- Combinables : `{"session": True, "user": True}`

```python
from typing import Annotated
from pydantic import BaseModel, Field

class Memory(BaseModel):
    # Variable de session
    last_search: Annotated[
        str,
        Field(
            title="Last Search",
            description="Dernière recherche effectuée",
            json_schema_extra={"session": True}
        )
    ] = ""

    # Variable utilisateur (préférence)
    preferred_language: Annotated[
        str,
        Field(
            title="Preferred Language",
            description="Langue préférée",
            json_schema_extra={"user": True}
        )
    ] = "fr"
```

**Héritage** : Un module peut hériter de la Memory d'un autre module :

```python
from modules.parent_module.memory import Memory as ParentMemory

class Memory(ParentMemory):
    new_variable: Annotated[str, Field(title="New Var", description="...")] = ""
```

## 3. Tools (`tools/`)

Les tools sont les actions exposées au LLM. Structure stricte obligatoire.

**Pattern obligatoire** :

```python
from typing import TYPE_CHECKING, Annotated
from pydantic import Field

if TYPE_CHECKING:
    from models.globals.Session import Session

from models.tools.Tool import BaseTool, BaseToolInput, BaseHooks, BaseHook, ToolResult
from modules.my_module.memory import Memory
from modules.my_module.infos import Infos

class ToolInput(BaseToolInput):
    query: Annotated[str, Field(description="La requête à effectuer")]

class Hooks(BaseHooks):
    """Hooks pour l'interopérabilité - même si vide"""
    on_success: BaseHook = Field(
        default=BaseHook(name="on_success", action="tool"),
        description="Hook déclenché en cas de succès"
    )

class Tool(BaseTool):
    """Tool Name
    Description courte sur la première ligne.
    Description détaillée ensuite.
    """
    
    hooks: Hooks
    usage: list = []  # ["start_discussion"] ou ["end_discussion"]
    prompts: list = []  # Chemins vers prompts associés
    
    def __init__(self):
        super().__init__(name="my_tool", hooks=Hooks())
    
    async def run(
        self, 
        input: ToolInput, 
        memory: Memory, 
        infos: Infos,
        session: "Session" = None
    ) -> ToolResult:
        # Logique métier
        result = await fetch_data(input.query, infos.my_module.api_key)
        
        # Utiliser self.result() et non ToolResult()
        return self.result(
            tool_content="Successfully processed",
            output={"data": result}
        )
```

**Points critiques** :
- ✅ Nommage : `Tool`, `ToolInput`, `Hooks` (sans préfixes)
- ✅ `TYPE_CHECKING` pour éviter import circulaire de Session
- ✅ `Hooks` obligatoire même si vide
- ✅ `self.result()` et non `ToolResult()` directement
- ✅ Signature `run()` avec `session: "Session" = None`

## 4. Codes (`codes/`)

Ce dossier contient la logique métier pure, séparée de la couche "Tool". Cela facilite les tests et la réutilisation.

Utiliser `pytest` avec fixtures centralisées dans `session_test.py`.

**Convention de nommage** :
- `tools/my_tool.py` → `tools/my_tool_tool_test.py`
- `prompts/category/name.py` → `prompts/category/name_test.py`
- `codes/utils/api.py` → `codes/utils/api_test.py`

**Fixtures centralisées** (`session_test.py`) :

```python
import pytest
from modules.my_module.memory import Memory
from modules.my_module.infos import Infos, MyModuleInfos

@pytest.fixture
def mock_session():
    from unittest.mock import Mock
    return Mock()

@pytest.fixture
def mock_memory():
    return Memory(last_search="", counter=0)

@pytest.fixture
def mock_infos():
    return Infohériter d'un autre via `infos.py` et `memory.py`.

```python
# test_module_2/memory.py
from modules.test_module.memory import Memory as ParentMemory

class Memory(ParentMemory):
    new_var: Annotated[str, Field(title="New Var", description="...")] = ""
```

```python
# test_module_2/infos.py
from modules.test_module.infos import Infos as ParentInfos

class TestModule2Infos(BaseModel):
    extra_field: str

class Infos(ParentInfos):
    test_module_2: TestModule2Infos
```

**Gestion automatique** : Les dépendances sont détectées lors de l'export (`export_modules.py`) et validées lors des tests (`test_modules.py`)
from modules.my_module.session_test import mock_session, mock_memory, mock_infos

@pytest.mark.asyncio
async def test_my_tool(mock_session, mock_memory, mock_infos):
    tool = Tool()
    input_data = ToolInput(query="test")
    
    result = await tool.run(input_data, mock_memory, mock_infos, mock_session)
    
    assert result.output["data"] == "expected"
    assert mock_memory.last_search == "testnfos) -> str:
        self.prompt_input = PromptInput(
            user_name=memory.user_name
        )
        return self._render_prompt()
```

**Template Jinja2 :**
```jinja
Bonjour {{ prompt_input.user_name }}, comment puis-je vous aider ?
```

## 6. Tests

Nous utilisons `pytest`. Les tests doivent être placés à côté du code qu'ils testent.

- `tools/my_tool.py` -> `tools/my_tool_test.py`
- `codes/utils/api.py` -> `codes/utils/api_test.py`

**Exemple de test de Tool :**
```python
import pytest
from modules.my_module.tools.my_tool import MyTool, MyToolInput
from models.session.Memory import Memory
from models.session.ModulesInfos import ModulesInfos

@pytest.mark.asyncio
async def test_my_tool():
    tool = MyTool("my_tool")
    input_data = MyToolInput(query="test")
    memory = Memory("sess", "user")
    infos = ModulesInfos("client", "agent")

    result = await tool.run(input_data, memory, infos)
    assert result.output["data"] == "expected"
```

## 7. Dépendances entre Modules

Un module peut dépendre d'un autre (ex: `test_module_2` étend `test_module`).
Cela se fait via l'héritage Python dans `infos.py` et `memory.py`.

```python
# test_module_2/memory.py
from modules.test_module.memory import Memory as ParentMemory

@dataclass
class Memory(ParentMemory):
    new_var: str
```

L'injection de dépendances est gérée automatiquement lors du chargement de l'agent.

## 8. Déploiement et Génération de Configuration

Lorsqu'un module est poussé en production, un script d'analyse automatique est exécuté pour valider et préparer le module pour l'interface d'administration.

Ce processus effectue les actions suivantes :

1.  **Validation** :
    *   Exécution de tous les tests unitaires (tools, codes, prompts) pour vérifier le bon fonctionnement.
    *   Vérification stricte du typage pour éviter les erreurs à l'exécution.
    *   Validation de la syntaxe et de la logique des prompts.
    *   Vérification de la cohérence entre le fichier `forms.yml` et la classe `infos.py`. Si pas de `forms.yml`, il est généré automatiquement.

2.  **Génération de YAML** :
    *   **Memory** : Un fichier YAML décrivant toutes les variables de session et leurs scopes.
    *   **Tools** : Un fichier YAML par tool, généré automatiquement à partir des définitions.
    *   **Prompts** : Un fichier YAML par prompt.

Ces fichiers YAML sont ensuite utilisés par le backoffice pour générer les interfaces de configuration de l'agent, assurant ainsi que l'interface est toujours synchronisée avec le code.

### Scripts de Déploiement

#### Export des Modules

Le script `agents/scripts/export_modules.py` permet d'exporter un module en fichiers YAML :

```bash
# Exporter un module spécifique
python agents/scripts/export_modules.py test_module

### Attributs Optionnels des Tools

**`usage`** : Définit le contexte d'utilisation automatique du tool

```python
class Tool(BaseTool):
    usage: list = ["start_discussion"]  # ou ["end_discussion"]
```

Valeurs possibles :
- `"default_start_discussion"` : Exécuté automatiquement au début
- `"start_discussion"` : Disponible pour triggers de début
- `"default_end_discussion"` : Exécuté automatiquement à la fin
- `"end_discussion"` : Disponible pour triggers de fin

**`prompts`** : Liste des chemins vers les prompts associés

```python
class Tool(BaseTool):
    prompts: list = ["prompts/usage/how_to_use"]
```

Ces prompts peuvent être automatiquement inclus dans le contexte du LLM

# Exporter vers un dossier personnalisé
python agents/scripts/export_modules.py test_module -o /path/to/output
```

Le script génère :
- `memory.yml` : Variables de mémoire avec leurs types et scopes
- `tools/` : Un fichier YAML par tool avec schéma d'entrée
- `prompts/` : Un fichier YAML par prompt avec inputs
- `dependencies.yml` : Liste des modules dont dépend ce module
- `forms.yml` : Configuration du formulaire pour le backoffice

#### Test des Modules

Le script `agents/scripts/test_modules.py` valide la structure d'un module :

```bash
# Tester un module spécifique
python agents/scripts/test_modules.py test_module

# Tester tous les modules
python agents/scripts/test_modules.py all

# Lister les modules disponibles
python agents/scripts/test_modules.py
```

Le script vérifie :
- Structure des fichiers requis
- Validité des classes Infos et Memory
- Existence et cohérence des tools
- Templates Jinja2 pour les prompts
- Dépendances entre modules


Un tool peut aussi contenir un attribut prompts qui permet de définir quels prompts doivent être automatiquement associés à ce tool.
Un tool peut aussi contenir un attribut usage qui permet de définir les usages pour lesquels doit être utilisé ce tool : default_start_discussion / default_end_discussion / start_discussion / end_discussion / ...