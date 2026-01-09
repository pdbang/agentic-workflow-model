import type { TracingProvider } from '@/app/(commonLayout)/app/(appDetailLayout)/[appId]/overview/tracing/type'
import type { ApiKeysListResponse, AppDailyConversationsResponse, AppDailyEndUsersResponse, AppDailyMessagesResponse, AppDetailResponse, AppListResponse, AppStatisticsResponse, AppTemplatesResponse, AppTokenCostsResponse, AppVoicesListResponse, CreateApiKeyResponse, DSLImportMode, DSLImportResponse, GenerationIntroductionResponse, TracingConfig, TracingStatus, UpdateAppModelConfigResponse, UpdateAppSiteCodeResponse, UpdateOpenAIKeyResponse, ValidateOpenAIKeyResponse, WebhookTriggerResponse, WorkflowDailyConversationsResponse } from '@/models/app'
import type { CommonResponse } from '@/models/common'
import type { AppIconType, AppModeEnum, ModelConfig } from '@/types/app'
import { localStorageService } from './local-storage'

export const fetchAppList = ({ url, params }: { url: string, params?: Record<string, any> }): Promise<AppListResponse> => {
  const result = localStorageService.searchApps(params || {})
  return Promise.resolve({
    data: result.data as any[],
    total: result.total,
    page: result.page,
    limit: result.limit,
    has_more: result.has_more,
  })
}

export const fetchAppDetail = ({ url, id }: { url: string, id: string }): Promise<AppDetailResponse> => {
  const app = localStorageService.getAppById(id)
  if (!app)
    throw new Error('App not found')
  return Promise.resolve({ ...app } as AppDetailResponse)
}

export const fetchAppDetailDirect = async ({ url, id }: { url: string, id: string }): Promise<AppDetailResponse> => {
  const app = localStorageService.getAppById(id)
  if (!app)
    throw new Error('App not found')
  return Promise.resolve({ ...app } as AppDetailResponse)
}

export const fetchAppTemplates = ({ url }: { url: string }): Promise<AppTemplatesResponse> => {
  return get<AppTemplatesResponse>(url)
}

export const createApp = ({
  name,
  icon_type,
  icon,
  icon_background,
  mode,
  description,
  config,
}: {
  name: string
  icon_type?: AppIconType
  icon?: string
  icon_background?: string
  mode: AppModeEnum
  description?: string
  config?: ModelConfig
}): Promise<AppDetailResponse> => {
  const newApp = localStorageService.createApp({
    name,
    icon_type: icon_type || 'emoji',
    icon: icon || '🤖',
    icon_background: icon_background || '#FFEAD5',
    mode,
    description: description || '',
    model_config: config,
    enable_site: false,
    enable_api: false,
    api_rpm: 0,
    api_rph: 0,
    is_demo: false,
    model: undefined,
    status: 'normal',
    icon_info: {
      icon: icon || '🤖',
      icon_type: icon_type || 'emoji',
      icon_background: icon_background || '#FFEAD5',
    },
    tags: [],
  } as any)
  return Promise.resolve({ ...newApp } as AppDetailResponse)
}

export const updateAppInfo = ({
  appID,
  name,
  icon_type,
  icon,
  icon_background,
  description,
  use_icon_as_answer_icon,
  max_active_requests,
}: {
  appID: string
  name: string
  icon_type: AppIconType
  icon: string
  icon_background?: string
  description: string
  use_icon_as_answer_icon?: boolean
  max_active_requests?: number | null
}): Promise<AppDetailResponse> => {
  const updated = localStorageService.updateApp(appID, {
    name,
    icon_type,
    icon,
    icon_background,
    description,
    use_icon_as_answer_icon,
    max_active_requests,
  } as any)
  if (!updated)
    throw new Error('App not found')
  return Promise.resolve({ ...updated } as AppDetailResponse)
}

export const copyApp = ({
  appID,
  name,
  icon_type,
  icon,
  icon_background,
  mode,
  description,
}: {
  appID: string
  name: string
  icon_type: AppIconType
  icon: string
  icon_background?: string | null
  mode: AppModeEnum
  description?: string
}): Promise<AppDetailResponse> => {
  const originalApp = localStorageService.getAppById(appID)
  if (!originalApp)
    throw new Error('App not found')
  
  const newApp = localStorageService.createApp({
    ...originalApp,
    name,
    icon_type,
    icon,
    icon_background: icon_background || originalApp.icon_background,
    mode,
    description: description || originalApp.description,
  } as any)
  return Promise.resolve({ ...newApp } as AppDetailResponse)
}

export const exportAppConfig = ({ appID, include = false, workflowID }: { appID: string, include?: boolean, workflowID?: string }): Promise<{ data: string }> => {
  const params = new URLSearchParams({
    include_secret: include.toString(),
  })
  if (workflowID)
    params.append('workflow_id', workflowID)
  return get<{ data: string }>(`apps/${appID}/export?${params.toString()}`)
}

export const importDSL = ({ mode, yaml_content, yaml_url, app_id, name, description, icon_type, icon, icon_background }: { mode: DSLImportMode, yaml_content?: string, yaml_url?: string, app_id?: string, name?: string, description?: string, icon_type?: AppIconType, icon?: string, icon_background?: string }): Promise<DSLImportResponse> => {
  return post<DSLImportResponse>('apps/imports', { body: { mode, yaml_content, yaml_url, app_id, name, description, icon, icon_type, icon_background } })
}

export const importDSLConfirm = ({ import_id }: { import_id: string }): Promise<DSLImportResponse> => {
  return post<DSLImportResponse>(`apps/imports/${import_id}/confirm`, { body: {} })
}

export const switchApp = ({ appID, name, icon_type, icon, icon_background }: { appID: string, name: string, icon_type: AppIconType, icon: string, icon_background?: string | null }): Promise<{ new_app_id: string }> => {
  return post<{ new_app_id: string }>(`apps/${appID}/convert-to-workflow`, { body: { name, icon_type, icon, icon_background } })
}

export const deleteApp = (appID: string): Promise<CommonResponse> => {
  const deleted = localStorageService.deleteApp(appID)
  if (!deleted)
    throw new Error('App not found')
  return Promise.resolve({ result: 'success' } as CommonResponse)
}

export const updateAppSiteStatus = ({ url, body }: { url: string, body: Record<string, any> }): Promise<AppDetailResponse> => {
  return post<AppDetailResponse>(url, { body })
}

export const updateAppApiStatus = ({ url, body }: { url: string, body: Record<string, any> }): Promise<AppDetailResponse> => {
  return post<AppDetailResponse>(url, { body })
}

// path: /apps/{appId}/rate-limit
export const updateAppRateLimit = ({ url, body }: { url: string, body: Record<string, any> }): Promise<AppDetailResponse> => {
  return post<AppDetailResponse>(url, { body })
}

export const updateAppSiteAccessToken = ({ url }: { url: string }): Promise<UpdateAppSiteCodeResponse> => {
  return post<UpdateAppSiteCodeResponse>(url)
}

export const updateAppSiteConfig = ({ url, body }: { url: string, body: Record<string, any> }): Promise<AppDetailResponse> => {
  return post<AppDetailResponse>(url, { body })
}

export const getAppDailyMessages = ({ url, params }: { url: string, params: Record<string, any> }): Promise<AppDailyMessagesResponse> => {
  return get<AppDailyMessagesResponse>(url, { params })
}

export const getAppDailyConversations = ({ url, params }: { url: string, params: Record<string, any> }): Promise<AppDailyConversationsResponse> => {
  return get<AppDailyConversationsResponse>(url, { params })
}

export const getWorkflowDailyConversations = ({ url, params }: { url: string, params: Record<string, any> }): Promise<WorkflowDailyConversationsResponse> => {
  return get<WorkflowDailyConversationsResponse>(url, { params })
}

export const getAppStatistics = ({ url, params }: { url: string, params: Record<string, any> }): Promise<AppStatisticsResponse> => {
  return get<AppStatisticsResponse>(url, { params })
}

export const getAppDailyEndUsers = ({ url, params }: { url: string, params: Record<string, any> }): Promise<AppDailyEndUsersResponse> => {
  return get<AppDailyEndUsersResponse>(url, { params })
}

export const getAppTokenCosts = ({ url, params }: { url: string, params: Record<string, any> }): Promise<AppTokenCostsResponse> => {
  return get<AppTokenCostsResponse>(url, { params })
}

export const updateAppModelConfig = ({ url, body }: { url: string, body: Record<string, any> }): Promise<UpdateAppModelConfigResponse> => {
  return post<UpdateAppModelConfigResponse>(url, { body })
}

// For temp testing
export const fetchAppListNoMock = ({ url, params }: { url: string, params: Record<string, any> }): Promise<AppListResponse> => {
  return get<AppListResponse>(url, params)
}

export const fetchApiKeysList = ({ url, params }: { url: string, params: Record<string, any> }): Promise<ApiKeysListResponse> => {
  return get<ApiKeysListResponse>(url, params)
}

export const delApikey = ({ url, params }: { url: string, params: Record<string, any> }): Promise<CommonResponse> => {
  return del<CommonResponse>(url, params)
}

export const createApikey = ({ url, body }: { url: string, body: Record<string, any> }): Promise<CreateApiKeyResponse> => {
  return post<CreateApiKeyResponse>(url, body)
}

export const validateOpenAIKey = ({ url, body }: { url: string, body: { token: string } }): Promise<ValidateOpenAIKeyResponse> => {
  return post<ValidateOpenAIKeyResponse>(url, { body })
}

export const updateOpenAIKey = ({ url, body }: { url: string, body: { token: string } }): Promise<UpdateOpenAIKeyResponse> => {
  return post<UpdateOpenAIKeyResponse>(url, { body })
}

export const generationIntroduction = ({ url, body }: { url: string, body: { prompt_template: string } }): Promise<GenerationIntroductionResponse> => {
  return post<GenerationIntroductionResponse>(url, { body })
}

export const fetchAppVoices = ({ appId, language }: { appId: string, language?: string }): Promise<AppVoicesListResponse> => {
  language = language || 'en-US'
  return get<AppVoicesListResponse>(`apps/${appId}/text-to-audio/voices?language=${language}`)
}

// Tracing
export const fetchTracingStatus = ({ appId }: { appId: string }): Promise<TracingStatus> => {
  return get<TracingStatus>(`/apps/${appId}/trace`)
}

export const updateTracingStatus = ({ appId, body }: { appId: string, body: Record<string, any> }): Promise<CommonResponse> => {
  return post<CommonResponse>(`/apps/${appId}/trace`, { body })
}

// Webhook Trigger
export const fetchWebhookUrl = ({ appId, nodeId }: { appId: string, nodeId: string }): Promise<WebhookTriggerResponse> => {
  return get<WebhookTriggerResponse>(
    `apps/${appId}/workflows/triggers/webhook`,
    { params: { node_id: nodeId } },
    { silent: true },
  )
}

export const fetchTracingConfig = ({ appId, provider }: { appId: string, provider: TracingProvider }): Promise<TracingConfig & { has_not_configured: true }> => {
  return get<TracingConfig & { has_not_configured: true }>(`/apps/${appId}/trace-config`, {
    params: {
      tracing_provider: provider,
    },
  })
}

export const addTracingConfig = ({ appId, body }: { appId: string, body: TracingConfig }): Promise<CommonResponse> => {
  return post<CommonResponse>(`/apps/${appId}/trace-config`, { body })
}

export const updateTracingConfig = ({ appId, body }: { appId: string, body: TracingConfig }): Promise<CommonResponse> => {
  return patch<CommonResponse>(`/apps/${appId}/trace-config`, { body })
}

export const removeTracingConfig = ({ appId, provider }: { appId: string, provider: TracingProvider }): Promise<CommonResponse> => {
  return del<CommonResponse>(`/apps/${appId}/trace-config?tracing_provider=${provider}`)
}
