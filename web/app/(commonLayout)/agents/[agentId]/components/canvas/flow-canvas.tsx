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
  NodeTypes,
  EdgeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { SubAgentNode } from './nodes/sub-agent-node'
import { ToolNode } from './nodes/tool-node'
import { HookNode } from './nodes/hook-node'
import { SubAgentPanel } from './panels/sub-agent-panel'
import { CanvasToolbar } from './toolbar/canvas-toolbar'
import type { SubAgentConfig } from '@/types/agent'
import { START_INITIAL_POSITION } from '@/app/components/workflow/constants'

const nodeTypes: NodeTypes = {
  subAgent: SubAgentNode,
  tool: ToolNode,
  hook: HookNode,
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

  // Convert subAgents to ReactFlow nodes
  useEffect(() => {
    const flowNodes: Node[] = Object.entries(subAgents).map(([id, config], index) => ({
      id,
      type: 'subAgent',
      position: {
        x: START_INITIAL_POSITION.x + (index % 3) * 300,
        y: START_INITIAL_POSITION.y + Math.floor(index / 3) * 200,
      },
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

    // TODO: Extract edges from hooks switch_sub_agent
    // For now, no edges
    setEdges([])
  }, [subAgents, setNodes, setEdges, nodes])

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

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  return (
    <div className="h-full w-full relative">
      <CanvasToolbar onAddSubAgent={handleAddSubAgent} modules={modules} />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.25}
        maxZoom={2}
      >
        <Background
          gap={[14, 14]}
          size={2}
          className="bg-workflow-canvas-workflow-bg"
          color="var(--color-workflow-canvas-workflow-dot-color)"
        />
        <Controls />
        <MiniMap
          pannable
          zoomable
          style={{
            width: 102,
            height: 72,
          }}
          maskColor="var(--color-workflow-minimap-bg)"
          className="!absolute !bottom-14 !left-4 z-[9] !m-0 !h-[72px] !w-[102px] !rounded-lg !border-[0.5px] !border-divider-subtle !bg-background-default-subtle !shadow-md !shadow-shadow-shadow-5"
        />
      </ReactFlow>

      {selectedNode && selectedNode.type === 'subAgent' && (
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
