'use client'

import { useState } from 'react'
import type { HookAction, HookToolAction, HookSwitchSubAgentAction, HookCaseAction, HookCase } from '@/types/hook'

interface HookActionEditorProps {
  action: HookAction
  onUpdate: (action: HookAction) => void
  availableSubAgents: string[]
}

export function HookActionEditor({ action, onUpdate, availableSubAgents }: HookActionEditorProps) {
  const [actionType, setActionType] = useState<'tool' | 'switch_sub_agent' | 'case'>(() => {
    if (action.action === 'tool') return 'tool'
    if (action.action === 'switch_sub_agent') return 'switch_sub_agent'
    if (action.action === 'case') return 'case'
    return 'tool'
  })

  const handleActionTypeChange = (newType: 'tool' | 'switch_sub_agent' | 'case') => {
    setActionType(newType)
    
    if (newType === 'tool') {
      const newAction: HookToolAction = {
        action: 'tool',
        target_tool: {
          module: '',
          path: '',
        },
      }
      onUpdate(newAction)
    } else if (newType === 'switch_sub_agent') {
      const newAction: HookSwitchSubAgentAction = {
        action: 'switch_sub_agent',
        target_sub_agent: availableSubAgents[0] || '',
      }
      onUpdate(newAction)
    } else if (newType === 'case') {
      const newAction: HookCaseAction = {
        action: 'case',
        cases: [],
      }
      onUpdate(newAction)
    }
  }

  const renderToolAction = () => {
    if (action.action !== 'tool') return null
    const toolAction = action as HookToolAction
    
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Module</label>
          <input
            type="text"
            value={toolAction.target_tool.module}
            onChange={(e) => onUpdate({
              ...toolAction,
              target_tool: { ...toolAction.target_tool, module: e.target.value }
            })}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
            placeholder="module_name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Path</label>
          <input
            type="text"
            value={toolAction.target_tool.path}
            onChange={(e) => onUpdate({
              ...toolAction,
              target_tool: { ...toolAction.target_tool, path: e.target.value }
            })}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
            placeholder="tools/tool_name"
          />
        </div>
        {toolAction.target_tool.name && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name (optional)</label>
            <input
              type="text"
              value={toolAction.target_tool.name}
              onChange={(e) => onUpdate({
                ...toolAction,
                target_tool: { ...toolAction.target_tool, name: e.target.value }
              })}
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
        )}
      </div>
    )
  }

  const renderSwitchSubAgentAction = () => {
    if (action.action !== 'switch_sub_agent') return null
    const switchAction = action as HookSwitchSubAgentAction
    
    return (
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Target Sub-Agent</label>
        <select
          value={switchAction.target_sub_agent}
          onChange={(e) => onUpdate({
            ...switchAction,
            target_sub_agent: e.target.value
          })}
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="">Select sub-agent...</option>
          {availableSubAgents.map(sa => (
            <option key={sa} value={sa}>{sa}</option>
          ))}
        </select>
      </div>
    )
  }

  const renderCaseAction = () => {
    if (action.action !== 'case') return null
    const caseAction = action as HookCaseAction
    
    const handleAddCase = () => {
      const newCase: HookCase = {
        memory_variable: '',
        operator: 'equals',
        value: '',
        action: {
          action: 'tool',
          target_tool: { module: '', path: '' },
        },
      }
      onUpdate({
        ...caseAction,
        cases: [...caseAction.cases, newCase],
      })
    }

    const handleUpdateCase = (index: number, updatedCase: HookCase) => {
      const newCases = [...caseAction.cases]
      newCases[index] = updatedCase
      onUpdate({
        ...caseAction,
        cases: newCases,
      })
    }

    const handleRemoveCase = (index: number) => {
      const newCases = caseAction.cases.filter((_, i) => i !== index)
      onUpdate({
        ...caseAction,
        cases: newCases,
      })
    }

    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {caseAction.cases.map((caseItem, index) => (
            <div key={index} className="rounded border border-gray-200 p-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium">Case {index + 1}</span>
                <button
                  onClick={() => handleRemoveCase(index)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={caseItem.memory_variable}
                  onChange={(e) => handleUpdateCase(index, {
                    ...caseItem,
                    memory_variable: e.target.value
                  })}
                  placeholder="memory_variable"
                  className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs"
                />
                <select
                  value={caseItem.operator}
                  onChange={(e) => handleUpdateCase(index, {
                    ...caseItem,
                    operator: e.target.value as any
                  })}
                  className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs"
                >
                  <option value="equals">equals</option>
                  <option value="not_equals">not equals</option>
                  <option value="contains">contains</option>
                  <option value="greater_than">greater than</option>
                  <option value="less_than">less than</option>
                </select>
                <input
                  type="text"
                  value={String(caseItem.value)}
                  onChange={(e) => handleUpdateCase(index, {
                    ...caseItem,
                    value: e.target.value
                  })}
                  placeholder="value"
                  className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs"
                />
                <div className="text-xs text-gray-500">Then:</div>
                <HookActionEditor
                  action={caseItem.action}
                  onUpdate={(updatedAction) => handleUpdateCase(index, {
                    ...caseItem,
                    action: updatedAction
                  })}
                  availableSubAgents={availableSubAgents}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddCase}
          className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50"
        >
          + Add Case
        </button>
        {caseAction.default && (
          <div className="mt-2 rounded border border-gray-200 p-2">
            <div className="mb-2 text-xs font-medium">Default:</div>
            <HookActionEditor
              action={caseAction.default}
              onUpdate={(updatedAction) => onUpdate({
                ...caseAction,
                default: updatedAction
              })}
              availableSubAgents={availableSubAgents}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded bg-gray-50 p-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Action Type</label>
        <select
          value={actionType}
          onChange={(e) => handleActionTypeChange(e.target.value as any)}
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="tool">Tool</option>
          <option value="switch_sub_agent">Switch Sub-Agent</option>
          <option value="case">Case (Conditional)</option>
        </select>
      </div>

      {actionType === 'tool' && renderToolAction()}
      {actionType === 'switch_sub_agent' && renderSwitchSubAgentAction()}
      {actionType === 'case' && renderCaseAction()}
    </div>
  )
}
