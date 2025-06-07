export interface Project {
  id: string
  name: string
  description?: string
  html: string
  css: string
  javascript: string
  createdAt: Date
  updatedAt: Date
  isPublished: boolean
}

export interface AIGenerationRequest {
  prompt: string
  type: 'webpage' | 'component' | 'style' | 'script'
  context?: {
    existingHtml?: string
    existingCss?: string
    existingJs?: string
  }
}

export interface AIGenerationResponse {
  html?: string
  css?: string
  javascript?: string
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