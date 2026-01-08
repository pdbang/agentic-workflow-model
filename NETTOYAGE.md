# Fichiers et Répertoires - Guide de Nettoyage

## 📁 Structure Actuelle

### ✅ Fichiers ESSENTIELS (à conserver)

#### Application Web (Next.js/TypeScript)
```
web/                          # APPLICATION PRINCIPALE
├── app/                      # Routes et pages
├── lib/                      # Utilitaires TypeScript
├── types/                    # Définitions de types
├── package.json              # Dépendances
├── tsconfig.json             # Config TypeScript
└── [autres configs Next.js]
```

#### Données
```
agents/                       # DONNÉES YAML
├── configurations/v6/        # Configurations des agents
└── modules_configurations/   # Configurations des modules
```

#### Documentation
```
DEMARRAGE.md                  # Guide de démarrage complet ⭐
START.md                      # Référence rapide ⭐
IMPLEMENTATION_STATUS.md      # État d'avancement
PHASE_3_COMPLETE.md          # Documentation Phase 3
web/API_README.md            # Documentation API
```

### ⚠️ Fichiers de RÉFÉRENCE (peuvent être conservés)

```
new_project/                  # Documentation de référence
├── ROADMAP.md               # Plan complet du projet
├── AGENTS.md                # Spécifications des agents
├── MODULES.md               # Spécifications des modules
├── QUICKSTART.md            # Guide rapide original
├── example_agent/           # Exemple d'agent
├── example_module/          # Exemple de module
└── roadmap/                 # Étapes détaillées
    ├── STEP_1_ARCHITECTURE.md
    ├── STEP_2_BACKEND_API.md
    ├── STEP_3_FRONTEND_CONFIG.md
    ├── STEP_4_FRONTEND_MODULES.md
    ├── STEP_5_FRONTEND_CANVAS.md
    ├── STEP_6_TOOLS_HOOKS.md
    ├── STEP_7_EXPORT_VERSION.md
    └── STEP_8_POLISH.md
```

**Utilité** : Ces fichiers contiennent les spécifications originales et peuvent être utiles pour les phases 4-8 à venir.

### ❌ Fichiers NON UTILISÉS (peuvent être supprimés)

#### Ancien Backend Python (remplacé par TypeScript)
```
api/                          # ❌ ANCIEN backend Python/Flask
docker/                       # ❌ ANCIENNE config Docker
```

**Raison** : Le backend Python a été complètement remplacé par Next.js API Routes en TypeScript. Ces fichiers ne sont plus utilisés.

#### Fichiers Dify originaux (si non nécessaires)
```
README.md                     # ❌ README Dify original (peut être renommé)
images/                       # ❌ Images Dify originales
```

**Raison** : Ce sont des fichiers du projet Dify original. Si vous avez forké depuis Dify, vous pouvez les conserver ou les remplacer.

## 🧹 Commandes de Nettoyage

### Option 1 : Nettoyage Léger (Recommandé)
Supprime uniquement les fichiers clairement inutiles :

```bash
# Sauvegarder d'abord (optionnel)
git branch backup-before-cleanup

# Supprimer l'ancien backend Python
rm -rf api/

# Supprimer les configs Docker anciennes (si non utilisées)
rm -rf docker/

# Nettoyer les caches de build
cd web
rm -rf .next
rm -rf node_modules/.cache
```

### Option 2 : Nettoyage Complet
Supprime aussi la documentation de référence :

```bash
# Option 1 + supprimer la doc de référence
rm -rf new_project/

# Optionnel : remplacer le README Dify
mv README.md README.dify.md
cp START.md README.md
```

### Option 3 : Reset Complet (Attention!)
Garde uniquement l'essentiel :

```bash
# ⚠️ ATTENTION : Ceci supprime beaucoup de fichiers!
# Faire une sauvegarde d'abord!
git branch backup-full-before-reset

# Supprimer tout sauf l'app et les données
rm -rf api/ docker/ new_project/ images/
mv README.md README.dify.md
cp START.md README.md

# Nettoyer les builds
cd web
rm -rf .next node_modules/.cache
```

## 📊 Espace Disque

### Taille approximative des répertoires

```
web/node_modules/        ~800 MB  (développement uniquement, pas en Git)
web/.next/               ~50 MB   (cache build, pas en Git)
api/                     ~5 MB    ❌ Inutile
docker/                  ~1 MB    ❌ Inutile
new_project/             ~500 KB  ⚠️ Référence (utile pour phases 4-8)
agents/                  ~200 KB  ✅ Données nécessaires
web/app/                 ~100 KB  ✅ Application principale
```

## 🎯 Recommandation

**Pour le développement actuel (Phases 1-3 complètes)** :

```bash
# Nettoyage minimal recommandé
rm -rf api/           # Ancien backend inutile
rm -rf docker/        # Anciennes configs inutiles

# Garder new_project/ pour référence des phases 4-8
# Garder README.md Dify ou le remplacer par START.md
```

**Pour la production future** :
- Supprimer `new_project/` après avoir terminé toutes les phases
- Créer un nouveau README personnalisé
- Garder uniquement `web/`, `agents/`, et les docs essentielles

## 📝 Après le nettoyage

1. Vérifier que l'app fonctionne :
```bash
cd web
pnpm dev
```

2. Commit les changements :
```bash
git add .
git commit -m "Clean up unused files (old Python backend, Docker configs)"
git push
```

3. Vérifier la taille du repo :
```bash
du -sh .
```

## 🔍 Vérification

Pour vérifier quels fichiers sont trackés par Git :
```bash
git ls-files | grep -E "(api/|docker/|new_project/)" | wc -l
```

Pour voir la taille de chaque répertoire :
```bash
du -sh api/ docker/ new_project/ web/ agents/
```

---

**Résumé** :
- ✅ **Garder** : `web/`, `agents/`, docs essentielles
- ⚠️ **Optionnel** : `new_project/` (référence pour phases futures)
- ❌ **Supprimer** : `api/`, `docker/` (remplacés par Next.js)
