# ÉTAPE 5: Frontend - Canvas Sub-Agents

**Durée estimée**: 5-6 jours  
**Prérequis**: ÉTAPE 4 complétée, ReactFlow déjà dans Dify

---

## 🎯 Objectifs

Créer l'éditeur visuel drag-and-drop pour les sub-agents :
1. Canvas ReactFlow pour visualiser les sub-agents
2. Nodes personnalisés pour sub-agents
3. Création/édition/suppression de sub-agents
4. Connexions entre sub-agents (transitions via hooks)
5. Panel de configuration contextuel
6. Auto-layout et mini-map

---

## 📁 Structure Cible

```
web/app/agent/[agentId]/canvas/
└── page.tsx                            # Canvas principal

web/app/agent/[agentId]/components/canvas/
├── flow-canvas.tsx                     # ReactFlow wrapper
├── nodes/
│   ├── sub-agent-node.tsx              # Node sub-agent
│   └── node-types.ts                   # Export types
├── panels/
│   ├── sub-agent-panel.tsx             # Config sub-agent sélectionné
│   ├── tools-panel.tsx                 # Liste tools du sub-agent
│   └── prompts-panel.tsx               # Liste prompts du sub-agent
└── toolbar/
    ├── canvas-toolbar.tsx              # Boutons actions
    └── minimap.tsx                     # Minimap navigation
```

---

## 🔨 Tâches Détaillées

### 5.1 Page Canvas

**Créer**: `web/app/agent/[agentId]/canvas/page.tsx`

```typescript
'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import { FlowCanvas } from '../components/canvas/flow-canvas'

export default function CanvasPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading, updateSubAgents } = useAgent('default', agentId)

  if (loading) {
    return <div className="h-full flex items-center justify-center">Loading...</div>
  }

  if (!data) {
    return <div className="h-full flex items-center justify-center">Agent not found</div>
  }

  return (
    <div className="h-full relative bg-gray-50">
      <FlowCanvas
        subAgents={data.subAgents}
        modules={data.config.modules}
        onChange={updateSubAgents}
      />
    </div>
  )
}
```

### 5.2 Canvas ReactFlow

**Créer**: `web/app/agent/[agentId]/components/canvas/flow-canvas.tsx`

```typescript
'use client'

import { useState, useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { SubAgentNode } from './nodes/sub-agent-node'
import { SubAgentPanel } from './panels/sub-agent-panel'
import { CanvasToolbar } from './toolbar/canvas-toolbar'
import type { SubAgentConfig } from '@/types/sub-agent'

const nodeTypes = {
  subAgent: SubAgentNode,
}

interface FlowCanvasProps {
  subAgents: Record<string, SubAgentConfig>
  modules: string[]
  onChange: (subAgents: Record<string, SubAgentConfig>) => void
}

export function FlowCanvas({ subAgents, modules, onChange }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // Convertir subAgents en nodes ReactFlow
  useEffect(() => {
    const flowNodes: Node[] = Object.entries(subAgents).map(([id, config], index) => ({
      id,
      type: 'subAgent',
      position: { x: 100 + (index % 3) * 300, y: 100 + Math.floor(index / 3) * 200 },
      data: {
        config,
        onSelect: () => setSelectedNode({ id, type: 'subAgent', position: { x: 0, y: 0 }, data: { config } }),
      },
    }))

    setNodes(flowNodes)

    // TODO: Extraire les edges depuis les hooks switch_sub_agent
    setEdges([])
  }, [subAgents, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleAddSubAgent = () => {
    const newId = `sub_agent_${Date.now()}`
    const newConfig: SubAgentConfig = {
      sub_agent: {
        name: newId,
        description: 'New sub-agent',
        prompts: [],
        tools: {},
      },
    }

    onChange({
      ...subAgents,
      [newId]: newConfig,
    })
  }

  const handleDeleteSubAgent = (id: string) => {
    const { [id]: _, ...rest } = subAgents
    onChange(rest)
    setSelectedNode(null)
  }

  const handleUpdateSubAgent = (id: string, config: SubAgentConfig) => {
    onChange({
      ...subAgents,
      [id]: config,
    })
  }

  return (
    <div className="h-full w-full relative">
      <CanvasToolbar onAddSubAgent={handleAddSubAgent} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {selectedNode && (
        <SubAgentPanel
          nodeId={selectedNode.id}
          config={subAgents[selectedNode.id]}
          modules={modules}
          onUpdate={(config) => handleUpdateSubAgent(selectedNode.id, config)}
          onDelete={() => handleDeleteSubAgent(selectedNode.id)}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  )
}
```

### 5.3 Node Sub-Agent

**Créer**: `web/app/agent/[agentId]/components/canvas/nodes/sub-agent-node.tsx`

```typescript
'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { SubAgentConfig } from '@/types/sub-agent'

interface SubAgentNodeProps {
  data: {
    config: SubAgentConfig
    onSelect: () => void
  }
}

export const SubAgentNode = memo(({ data }: SubAgentNodeProps) => {
  const { config, onSelect } = data
  const toolsCount = Object.keys(config.sub_agent.tools ?? {}).length
  const promptsCount = config.sub_agent.prompts?.length ?? 0

  return (
    <div
      onClick={onSelect}
      className="bg-white border-2 border-blue-500 rounded-lg shadow-lg min-w-[200px] cursor-pointer hover:shadow-xl transition-shadow"
    >
      <Handle type="target" position={Position.Top} />

      <div className="p-4">
        <div className="font-semibold text-gray-900 mb-1">
          {config.sub_agent.name}
        </div>
        <div className="text-xs text-gray-500 mb-3">
          {config.sub_agent.description}
        </div>

        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span>🔧</span>
            <span>{toolsCount} tools</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💬</span>
            <span>{promptsCount} prompts</span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})

SubAgentNode.displayName = 'SubAgentNode'
```

### 5.4 Panel de Configuration

**Créer**: `web/app/agent/[agentId]/components/canvas/panels/sub-agent-panel.tsx`

```typescript
'use client'

import { useState } from 'react'
import type { SubAgentConfig } from '@/types/sub-agent'
import { Button } from '@/components/ui/button'
import { ToolsPanel } from './tools-panel'
import { PromptsPanel } from './prompts-panel'

interface SubAgentPanelProps {
  nodeId: string
  config: SubAgentConfig
  modules: string[]
  onUpdate: (config: SubAgentConfig) => void
  onDelete: () => void
  onClose: () => void
}

export function SubAgentPanel({
  nodeId,
  config,
  modules,
  onUpdate,
  onDelete,
  onClose,
}: SubAgentPanelProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'prompts' | 'tools'>('general')

  const handleUpdate = (field: string, value: any) => {
    onUpdate({
      ...config,
      sub_agent: {
        ...config.sub_agent,
        [field]: value,
      },
    })
  }

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sub-Agent</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {['general', 'prompts', 'tools'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                px-3 py-1 rounded text-sm font-medium capitalize
                ${activeTab === tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={config.sub_agent.name}
                onChange={(e) => handleUpdate('name', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={config.sub_agent.description}
                onChange={(e) => handleUpdate('description', e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        )}

        {activeTab === 'prompts' && (
          <PromptsPanel
            prompts={config.sub_agent.prompts ?? []}
            modules={modules}
            onChange={(prompts) => handleUpdate('prompts', prompts)}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsPanel
            tools={config.sub_agent.tools ?? {}}
            modules={modules}
            onChange={(tools) => handleUpdate('tools', tools)}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="destructive"
          onClick={onDelete}
          className="w-full"
        >
          Delete Sub-Agent
        </Button>
      </div>
    </div>
  )
}
```

### 5.5 Panels Tools et Prompts (Placeholders)

**Créer**: `web/app/agent/[agentId]/components/canvas/panels/tools-panel.tsx`

```typescript
'use client'

import type { SubAgentTool } from '@/types/sub-agent'

interface ToolsPanelProps {
  tools: Record<string, SubAgentTool>
  modules: string[]
  onChange: (tools: Record<string, SubAgentTool>) => void
}

export function ToolsPanel({ tools, modules, onChange }: ToolsPanelProps) {
  // TODO: Implémenter dans ÉTAPE 6
  return (
    <div className="text-sm text-gray-500">
      <p>Tools configuration will be implemented in Step 6.</p>
      <p className="mt-2">Currently configured: {Object.keys(tools).length} tools</p>
    </div>
  )
}
```

**Créer**: `web/app/agent/[agentId]/components/canvas/panels/prompts-panel.tsx`

```typescript
'use client'

import type { SubAgentPrompt } from '@/types/sub-agent'

interface PromptsPanelProps {
  prompts: SubAgentPrompt[]
  modules: string[]
  onChange: (prompts: SubAgentPrompt[]) => void
}

export function PromptsPanel({ prompts, modules, onChange }: PromptsPanelProps) {
  // TODO: Implémenter dans ÉTAPE 6
  return (
    <div className="text-sm text-gray-500">
      <p>Prompts configuration will be implemented in Step 6.</p>
      <p className="mt-2">Currently configured: {prompts.length} prompts</p>
    </div>
  )
}
```

### 5.6 Toolbar

**Créer**: `web/app/agent/[agentId]/components/canvas/toolbar/canvas-toolbar.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'

interface CanvasToolbarProps {
  onAddSubAgent: () => void
}

export function CanvasToolbar({ onAddSubAgent }: CanvasToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2">
      <Button onClick={onAddSubAgent}>
        + Add Sub-Agent
      </Button>
    </div>
  )
}
```

---

## ✅ Checklist de Validation

- [ ] Page canvas affiche ReactFlow
- [ ] Nodes sub-agents s'affichent
- [ ] Drag & drop nodes fonctionne
- [ ] Création nouveau sub-agent
- [ ] Sélection d'un node ouvre le panel
- [ ] Panel de configuration affiche:
  - [ ] Onglet General (name, description)
  - [ ] Onglet Prompts (placeholder)
  - [ ] Onglet Tools (placeholder)
- [ ] Suppression sub-agent
- [ ] Background, Controls, MiniMap affichés
- [ ] Pas d'erreur TypeScript
- [ ] Pas d'erreur console

---

## ➡️ Prochaine Étape

[ÉTAPE 6: Frontend - Tools & Hooks Configuration](./STEP_6_TOOLS_HOOKS.md)
