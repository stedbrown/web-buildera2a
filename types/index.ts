export interface Page {
  id: string
  name: string
  title: string
  slug: string // URL-friendly name (e.g., "about-us", "contact")
  html: string
  css: string
  javascript: string
  isHomePage: boolean
}

export interface Project {
  id: string
  name: string
  description?: string
  pages: Page[]
  globalCss: string // CSS globale condiviso tra tutte le pagine
  globalJs: string // JavaScript globale condiviso tra tutte le pagine
  createdAt: Date
  updatedAt: Date
  isPublished: boolean
}

export interface AIGenerationRequest {
  prompt: string
  type: 'webpage' | 'component' | 'style' | 'script' | 'page-edit' | 'new-page' | 'multi-page-site'
  context?: {
    existingHtml?: string
    existingCss?: string
    existingJs?: string
    currentPageId?: string
    projectPages?: Page[]
  }
}

export interface AIGenerationResponse {
  html?: string
  css?: string
  javascript?: string
  pages?: Page[] // Per la generazione di siti multi-pagina
  globalCss?: string
  globalJs?: string
  explanation?: string
  suggestions?: string[]
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

export type EditorLanguage = 'html' | 'css' | 'javascript'

export interface EditorTab {
  id: EditorLanguage
  label: string
  language: string
  content: string
}

export interface PreviewSettings {
  device: 'desktop' | 'tablet' | 'mobile'
  showGrid: boolean
  darkMode: boolean
}

export type GenerationStep = 
  | 'idle'
  | 'analyzing'
  | 'generating'
  | 'applying'
  | 'complete'
  | 'error'

export interface GenerationProgress {
  step: GenerationStep
  message: string
  progress: number
} 