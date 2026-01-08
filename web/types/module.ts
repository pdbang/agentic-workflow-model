import { z } from 'zod'

/**
 * Champ de formulaire module
 */
export type FormField = {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  label: string
  description?: string
  required?: boolean
  default?: unknown
  options?: string[]
  fields?: FormField[]
}

export const FormFieldSchema: z.ZodType<FormField> = z.lazy(() => z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
  options: z.array(z.string()).optional(), // Pour select/enum
  fields: z.array(FormFieldSchema).optional(), // Pour object nested
}))

/**
 * Définition formulaire module (forms.yml)
 */
export const ModuleFormSchema = z.object({
  fields: z.array(FormFieldSchema),
})

export type ModuleForm = z.infer<typeof ModuleFormSchema>

/**
 * Dépendance module (dependencies.yml)
 */
export const ModuleDependenciesSchema = z.object({
  required: z.array(z.string()).optional(),
  optional: z.array(z.string()).optional(),
})

export type ModuleDependencies = z.infer<typeof ModuleDependenciesSchema>

/**
 * Variable mémoire module (memory.yml)
 */
export const MemoryVariableSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.string(),
  default: z.unknown(),
  scopes: z.object({
    session: z.boolean(),
    user: z.boolean(),
    shared: z.boolean(),
  }),
  module: z.string(),
})

export type MemoryVariable = z.infer<typeof MemoryVariableSchema>

/**
 * Métadonnées module (pour liste)
 */
export const ModuleMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().optional(),
  hasDependencies: z.boolean(),
  dependenciesCount: z.number(),
})

export type ModuleMetadata = z.infer<typeof ModuleMetadataSchema>
