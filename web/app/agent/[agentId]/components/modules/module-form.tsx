'use client'

import { useState, useEffect } from 'react'
import type { ModuleForm as ModuleFormType, FormField } from '@/types/module'

interface ModuleFormProps {
  form: ModuleFormType
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
}

export function ModuleForm({ form, values, onChange }: ModuleFormProps) {
  const [localValues, setLocalValues] = useState(values)

  useEffect(() => {
    setLocalValues(values)
  }, [values])

  const handleFieldChange = (fieldName: string, value: any) => {
    const updated = { ...localValues, [fieldName]: value }
    setLocalValues(updated)
  }

  const handleSave = () => {
    onChange(localValues)
    alert('Module configuration saved')
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
        <button
          onClick={handleSave}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Save Configuration
        </button>
      </div>

      <div className="space-y-4">
        {form.fields.map((field) => (
          <FormFieldRenderer
            key={field.name}
            field={field}
            value={localValues[field.name]}
            onChange={(value) => handleFieldChange(field.name, value)}
          />
        ))}
      </div>
    </section>
  )
}

interface FormFieldRendererProps {
  field: FormField
  value: any
  onChange: (value: any) => void
}

function FormFieldRenderer({ field, value, onChange }: FormFieldRendererProps) {
  const renderInput = () => {
    switch (field.type) {
      case 'string':
        if (field.options) {
          return (
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )
        }
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required={field.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required={field.required}
          />
        )

      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-gray-300"
          />
        )

      case 'array':
        // Simplification: édition JSON
        return (
          <textarea
            value={JSON.stringify(value || [], null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value))
              } catch {}
            }}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            required={field.required}
          />
        )

      case 'object':
        // Simplification: édition JSON
        return (
          <textarea
            value={JSON.stringify(value || {}, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value))
              } catch {}
            }}
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            required={field.required}
          />
        )

      default:
        return null
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {field.description && (
        <p className="mb-2 text-xs text-gray-500">{field.description}</p>
      )}
      {renderInput()}
    </div>
  )
}
