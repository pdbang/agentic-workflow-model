# ÉTAPE 8: Polish & Testing

**Durée estimée**: 2-3 jours  
**Prérequis**: ÉTAPE 7 complétée

---

## 🎯 Objectifs

Finaliser et polir l'application :
1. Tests des flux principaux
2. Gestion d'erreurs et toasts
3. Amélioration UX (loading states, confirmations)
4. Documentation utilisateur
5. Guide de contribution
6. Correction des bugs

---

## 🔨 Tâches Détaillées

### 8.1 Système de Toast/Notifications

**Créer**: `web/lib/hooks/use-toast.ts`

```typescript
import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
}

let toastCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${toastCounter++}`
    setToasts(prev => [...prev, { id, type, message }])

    // Auto-dismiss après 5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
    warning: (message: string) => addToast('warning', message),
  }
}
```

**Créer**: `web/components/ui/toast-container.tsx`

```typescript
'use client'

import { useToast } from '@/lib/hooks/use-toast'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            rounded-lg shadow-lg p-4 min-w-[300px] flex items-start justify-between
            ${toast.type === 'success' ? 'bg-green-50 border border-green-200' : ''}
            ${toast.type === 'error' ? 'bg-red-50 border border-red-200' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 border border-blue-200' : ''}
            ${toast.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : ''}
          `}
        >
          <p className={`
            text-sm
            ${toast.type === 'success' ? 'text-green-800' : ''}
            ${toast.type === 'error' ? 'text-red-800' : ''}
            ${toast.type === 'info' ? 'text-blue-800' : ''}
            ${toast.type === 'warning' ? 'text-yellow-800' : ''}
          `}>
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
```

### 8.2 Confirmation Dialogs

**Créer**: `web/components/ui/confirm-dialog.tsx`

```typescript
'use client'

import { Button } from './button'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info',
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 8.3 Tests E2E Critiques

**Créer**: `web/__tests__/e2e/agent-workflow.test.ts`

```typescript
import { describe, it, expect } from 'vitest'

describe('Agent Workflow', () => {
  it('should create a new agent', async () => {
    // TODO: Implémenter avec Playwright ou Cypress
    expect(true).toBe(true)
  })

  it('should add modules to agent', async () => {
    // TODO: Implémenter
    expect(true).toBe(true)
  })

  it('should configure module inputs', async () => {
    // TODO: Implémenter
    expect(true).toBe(true)
  })

  it('should create sub-agents', async () => {
    // TODO: Implémenter
    expect(true).toBe(true)
  })

  it('should add tools to sub-agent', async () => {
    // TODO: Implémenter
    expect(true).toBe(true)
  })

  it('should save and export agent', async () => {
    // TODO: Implémenter
    expect(true).toBe(true)
  })
})
```

### 8.4 Documentation Utilisateur

**Créer**: `web/docs/USER_GUIDE.md`

```markdown
# Guide Utilisateur - Agent Configuration Interface

## Introduction

Cette interface permet de configurer des agents IA conversationnels en assemblant des modules, sub-agents, tools et hooks via une interface graphique intuitive.

## Concepts Clés

### Agent
Un agent représente un assistant IA complet avec :
- Configuration générale (messages, modèles LLM/STT/TTS)
- Modules fonctionnels
- Sub-agents (états conversationnels)
- Glossaire

### Module
Unité fonctionnelle réutilisable encapsulant une fonctionnalité métier (ex: calendrier, CRM, téléphonie).

### Sub-Agent
État conversationnel avec des prompts et tools spécifiques. Les sub-agents peuvent se connecter entre eux via des transitions.

### Tool
Action que le LLM peut décider d'exécuter (ex: créer un rendez-vous, envoyer un email).

### Hook
Point d'extension permettant à un tool de déclencher d'autres actions (ex: envoyer un email si le transfert échoue).

## Flux de Travail

### 1. Créer un Agent

1. Cliquer sur "New Agent"
2. Entrer un ID unique
3. Configurer les paramètres généraux (langue, timezone)
4. Définir les messages système (welcome, goodbye, etc.)
5. Configurer les modèles (LLM, STT, TTS)

### 2. Ajouter des Modules

1. Aller dans l'onglet "Modules"
2. Cliquer sur "Add Module"
3. Sélectionner un module
4. Remplir le formulaire de configuration
5. Les dépendances sont ajoutées automatiquement

### 3. Créer des Sub-Agents

1. Aller dans l'onglet "Canvas"
2. Cliquer sur "+ Add Sub-Agent"
3. Sélectionner le node créé
4. Configurer le nom et la description
5. Ajouter des prompts depuis les modules
6. Ajouter des tools depuis les modules
7. Configurer les hooks sur les tools

### 4. Configurer le Glossaire

1. Aller dans l'onglet "Glossary"
2. Ajouter des **définitions** pour donner du contexte au LLM
3. Ajouter des **prononciations** pour corriger le TTS
4. Ajouter des **transcriptions** pour aider le STT

### 5. Sauvegarder et Exporter

1. Cliquer sur "Save" en haut à droite
2. Pour exporter : cliquer sur "Export YAML"
3. Choisir le format (JSON ou YAML)
4. Télécharger ou copier dans le presse-papier

## Fonctionnalités Avancées

### Versioning

1. Aller dans "Versions"
2. Créer une nouvelle version avant une modification majeure
3. Les versions précédentes restent accessibles

### Duplication

1. Créer un nouvel agent basé sur un existant
2. Utiliser "Duplicate Agent" dans le menu
3. Modifier selon vos besoins

### Import

1. Cliquer sur "Import" dans le header
2. Upload un fichier YAML ou copier le contenu
3. Valider et importer

## Bonnes Pratiques

- **Modules** : Toujours configurer les modules en premier
- **Sub-Agents** : Nommer clairement les états conversationnels
- **Hooks** : Prévoir les cas d'échec (on_failure)
- **Versioning** : Créer une version avant modifications majeures
- **Glossaire** : Maintenir à jour pour améliorer la qualité

## Résolution de Problèmes

**Erreur de sauvegarde** : Vérifier que tous les champs requis des modules sont remplis

**Module non trouvé** : S'assurer que le module est exporté en YAML dans `agents/modules_configurations/`

**Hook ne se déclenche pas** : Vérifier la configuration du tool source

## Support

Pour toute question, consulter la documentation technique dans `new_project/*.md`.
```

### 8.5 Guide de Contribution

**Créer**: `new_project/CONTRIBUTING.md`

```markdown
# Guide de Contribution

## Pour les Assistants IA

Lors du développement de nouvelles fonctionnalités :

1. **Lire la documentation** dans `new_project/*.md`
2. **Suivre les étapes** de la roadmap
3. **Respecter les conventions** TypeScript et React
4. **Tester** chaque fonctionnalité avant de passer à la suivante
5. **Documenter** les décisions importantes

## Structure de Code

### TypeScript
- Strict mode activé
- Pas de `any`, utiliser `unknown` si nécessaire
- Types explicites pour les props et returns

### React
- Composants fonctionnels avec hooks
- `'use client'` pour composants interactifs
- Éviter les re-renders inutiles (useCallback, useMemo)

### API Routes
- Validation avec Zod
- Gestion d'erreurs avec try/catch
- Status HTTP appropriés

## Tests

Écrire des tests pour :
- Parsers et writers YAML
- Utilitaires de formulaires
- Hooks React personnalisés

## Documentation

Maintenir à jour :
- README principal
- Docs utilisateur
- Commentaires de code complexe

## Pull Requests

1. Branch depuis `main`
2. Commits atomiques et descriptifs
3. Tests passent
4. Pas d'erreur TypeScript
5. Documentation mise à jour
```

### 8.6 Checklist Finale

**Créer**: `new_project/FINAL_CHECKLIST.md`

```markdown
# Checklist Finale de Validation

## Backend

- [ ] Tous les types TypeScript sont corrects
- [ ] API Routes répondent correctement
- [ ] Lecture/écriture YAML fonctionne
- [ ] Validation Zod en place
- [ ] Gestion d'erreurs cohérente

## Frontend

- [ ] Toutes les pages se chargent
- [ ] Navigation entre onglets fluide
- [ ] Formulaires validés
- [ ] Loading states affichés
- [ ] Erreurs gérées avec toasts
- [ ] Confirmations pour actions destructives

## Fonctionnalités

### Configuration Agent
- [ ] Édition messages
- [ ] Configuration models (LLM/STT/TTS)
- [ ] Configuration triggers
- [ ] Sauvegarde fonctionne

### Modules
- [ ] Liste modules disponibles
- [ ] Ajout module avec dépendances
- [ ] Formulaire dynamique depuis forms.yml
- [ ] Suppression module

### Canvas
- [ ] Affichage sub-agents
- [ ] Drag & drop nodes
- [ ] Création sub-agent
- [ ] Édition sub-agent
- [ ] Suppression sub-agent

### Tools & Hooks
- [ ] Ajout tools depuis modules
- [ ] Configuration hooks
- [ ] Ajout prompts
- [ ] Suppression tools/prompts

### Export/Import
- [ ] Export YAML fonctionne
- [ ] Export JSON fonctionne
- [ ] Copie presse-papier
- [ ] Import YAML
- [ ] Validation import

### Versioning
- [ ] Création version
- [ ] Liste versions
- [ ] Navigation versions
- [ ] Duplication agent

## Qualité

- [ ] Aucune erreur TypeScript
- [ ] Aucune erreur console
- [ ] Aucun warning React
- [ ] Performance acceptable
- [ ] Responsive (desktop)

## Documentation

- [ ] README principal complet
- [ ] Guide utilisateur écrit
- [ ] Guide contribution écrit
- [ ] Commentaires code important
- [ ] Types documentés (JSDoc)

## Tests

- [ ] Tests unitaires backend passent
- [ ] Tests composants React passent
- [ ] Tests E2E flux principal

## Production Ready

- [ ] Build Next.js réussit
- [ ] Pas de dépendances inutiles
- [ ] Variables d'environnement documentées
- [ ] Logs appropriés (pas de console.log en prod)
```

---

## ✅ Checklist de Validation

- [ ] Système de toast implémenté
- [ ] Confirm dialogs pour actions destructives
- [ ] Tests E2E écrits (structure)
- [ ] Guide utilisateur complet
- [ ] Guide de contribution écrit
- [ ] Checklist finale créée
- [ ] Tous les bugs critiques corrigés
- [ ] Documentation à jour
- [ ] Build Next.js réussit
- [ ] Application testée de bout en bout

---

## 🎉 Félicitations !

Si toutes les checklists sont validées, l'interface de configuration d'agents est prête à être utilisée !

## 📚 Ressources Supplémentaires

- [Documentation Technique](../IMPLEMENTATION.md)
- [Structure des Agents](../AGENTS.md)
- [Structure des Modules](../MODULES.md)
- [Scripts de Gestion](../SCRIPTS_V6.md)
