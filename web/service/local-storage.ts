import type { App } from '@/types/app'

const STORAGE_KEY = 'dify_local_apps'

export interface LocalApp extends Omit<App, 'id'> {
  id: string
  createdAt: string
  updatedAt: string
}

class LocalStorageService {
  private getApps(): LocalApp[] {
    if (typeof window === 'undefined')
      return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    }
    catch (error) {
      console.error('Error reading apps from localStorage:', error)
      return []
    }
  }

  private saveApps(apps: LocalApp[]): void {
    if (typeof window === 'undefined')
      return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
    }
    catch (error) {
      console.error('Error saving apps to localStorage:', error)
    }
  }

  getAllApps(): LocalApp[] {
    return this.getApps()
  }

  getAppById(id: string): LocalApp | null {
    const apps = this.getApps()
    return apps.find(app => app.id === id) || null
  }

  createApp(appData: Omit<LocalApp, 'id' | 'createdAt' | 'updatedAt'>): LocalApp {
    const apps = this.getApps()
    const newApp: LocalApp = {
      ...appData,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    apps.push(newApp)
    this.saveApps(apps)
    return newApp
  }

  updateApp(id: string, updates: Partial<Omit<LocalApp, 'id' | 'createdAt'>>): LocalApp | null {
    const apps = this.getApps()
    const index = apps.findIndex(app => app.id === id)
    
    if (index === -1)
      return null
    
    apps[index] = {
      ...apps[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.saveApps(apps)
    return apps[index]
  }

  deleteApp(id: string): boolean {
    const apps = this.getApps()
    const filtered = apps.filter(app => app.id !== id)
    
    if (filtered.length === apps.length)
      return false
    
    this.saveApps(filtered)
    return true
  }

  searchApps(query: {
    name?: string
    mode?: string
    tag_ids?: string[]
    page?: number
    limit?: number
  }): { data: LocalApp[], total: number, page: number, limit: number, has_more: boolean } {
    let apps = this.getApps()
    
    // Filter by name
    if (query.name) {
      const searchTerm = query.name.toLowerCase()
      apps = apps.filter(app => app.name.toLowerCase().includes(searchTerm))
    }
    
    // Filter by mode
    if (query.mode && query.mode !== 'all') {
      apps = apps.filter(app => app.mode === query.mode)
    }
    
    // Filter by tags (if implemented)
    if (query.tag_ids && query.tag_ids.length > 0) {
      apps = apps.filter(app => {
        if (!app.tags || app.tags.length === 0)
          return false
        return query.tag_ids!.some(tagId => app.tags!.some(tag => tag.id === tagId))
      })
    }
    
    const total = apps.length
    const page = query.page || 1
    const limit = query.limit || 30
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedApps = apps.slice(startIndex, endIndex)
    const has_more = endIndex < total
    
    return {
      data: paginatedApps,
      total,
      page,
      limit,
      has_more,
    }
  }
}

export const localStorageService = new LocalStorageService()
