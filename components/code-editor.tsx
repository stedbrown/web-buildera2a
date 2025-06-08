"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { FileText, Palette, Code, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Project, EditorLanguage, Page } from "@/types"
import { useProjectStore } from "@/hooks/use-project-store"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse">Caricamento editor...</div>
    </div>
  ),
})

interface CodeEditorProps {
  project: Project
}

type EditorTab = {
  id: string
  label: string
  icon: any
  language: string
  isGlobal?: boolean
}

export function CodeEditor({ project }: CodeEditorProps) {
  const { getCurrentPage, updatePage, updateProject } = useProjectStore()
  const [activeTab, setActiveTab] = useState<string>('page-html')
  const [editorValue, setEditorValue] = useState('')
  
  const currentPage = getCurrentPage()

  // Dynamic tabs based on current page and global assets
  const tabs: EditorTab[] = [
    // Page-specific tabs
    { id: 'page-html', label: `HTML (${currentPage?.name || 'Pagina'})`, icon: FileText, language: 'html' },
    { id: 'page-css', label: `CSS (${currentPage?.name || 'Pagina'})`, icon: Palette, language: 'css' },
    { id: 'page-js', label: `JS (${currentPage?.name || 'Pagina'})`, icon: Code, language: 'javascript' },
    // Global tabs
    { id: 'global-css', label: 'CSS Globale', icon: Globe, language: 'css', isGlobal: true },
    { id: 'global-js', label: 'JS Globale', icon: Globe, language: 'javascript', isGlobal: true },
  ]

  useEffect(() => {
    if (!currentPage) return

    let value = ''
    switch (activeTab) {
      case 'page-html':
        value = currentPage.html
        break
      case 'page-css':
        value = currentPage.css
        break
      case 'page-js':
        value = currentPage.javascript
        break
      case 'global-css':
        value = project.globalCss
        break
      case 'global-js':
        value = project.globalJs
        break
    }
    setEditorValue(value)
  }, [currentPage, activeTab, project.globalCss, project.globalJs])

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && currentPage) {
      setEditorValue(value)
      
      // Update with debouncing
      const timeoutId = setTimeout(() => {
        switch (activeTab) {
          case 'page-html':
            updatePage(project.id, currentPage.id, { html: value })
            break
          case 'page-css':
            updatePage(project.id, currentPage.id, { css: value })
            break
          case 'page-js':
            updatePage(project.id, currentPage.id, { javascript: value })
            break
          case 'global-css':
            updateProject(project.id, { globalCss: value })
            break
          case 'global-js':
            updateProject(project.id, { globalJs: value })
            break
        }
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nessuna pagina selezionata</p>
          <p className="text-sm">Seleziona una pagina dalla sidebar per iniziare</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b bg-card/30 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary border-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent",
                tab.isGlobal && "bg-accent/30"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.isGlobal && (
                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                  Globale
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={tabs.find(t => t.id === activeTab)?.language}
          value={editorValue}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
      
      {/* Footer info */}
      <div className="px-4 py-2 text-xs text-muted-foreground bg-card/50 border-t">
        {activeTab.startsWith('global') ? (
          <span>File condiviso tra tutte le pagine del progetto</span>
        ) : (
          <span>File specifico per la pagina "{currentPage.name}"</span>
        )}
      </div>
    </div>
  )
} 