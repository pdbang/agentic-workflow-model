'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
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
  ReactFlowProvider,
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
        onSelect: () => {
          const node = nodes.find(n => n.id === id) || {
            id,
            type: 'subAgent',
            position: { x: 0, y: 0 },
            data: { config },
          }
          setSelectedNode(node)
        },
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
    <ReactFlowProvider>
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
    </ReactFlowProvider>
  )
}
