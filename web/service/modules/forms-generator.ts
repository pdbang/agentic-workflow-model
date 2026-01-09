import type { FormField } from '@/types/module'

/**
 * Type de composant UI pour un champ
 */
export type FieldComponent =
  | 'input'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'object'
  | 'array'

/**
 * Champ de formulaire React Hook Form
 */
export interface FormFieldDefinition extends FormField {
  component: FieldComponent
  validation: {
    required: boolean
    pattern?: string
    min?: number
    max?: number
  }
}

/**
 * Génère une définition de formulaire depuis forms.yml
 */
export function generateFormDefinition(fields: FormField[]): FormFieldDefinition[] {
  return fields.map((field) => {
    const component = getFieldComponent(field.type)

    return {
      ...field,
      component,
      validation: {
        required: field.required ?? false,
      },
    }
  })
}

/**
 * Détermine le composant UI approprié pour un type
 */
function getFieldComponent(type: FormField['type']): FieldComponent {
  switch (type) {
    case 'string':
      return 'input'
    case 'number':
      return 'number'
    case 'boolean':
      return 'checkbox'
    case 'array':
      return 'array'
    case 'object':
      return 'object'
    default:
      return 'input'
  }
}

/**
 * Valide les données de formulaire contre le schéma
 */
export function validateFormData(
  data: Record<string, unknown>,
  fields: FormField[],
): { valid: boolean, errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  for (const field of fields) {
    const value = data[field.name]

    // Required validation
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = `${field.label} is required`
      continue
    }

    // Type validation
    if (value !== undefined && value !== null) {
      const typeValid = validateFieldType(value, field.type)
      if (!typeValid)
        errors[field.name] = `${field.label} must be of type ${field.type}`
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Valide le type d'une valeur
 */
function validateFieldType(value: unknown, type: FormField['type']): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string'
    case 'number':
      return typeof value === 'number'
    case 'boolean':
      return typeof value === 'boolean'
    case 'array':
      return Array.isArray(value)
    case 'object':
      return typeof value === 'object' && !Array.isArray(value)
    default:
      return true
  }
}
