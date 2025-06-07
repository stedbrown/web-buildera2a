"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { FileText, Palette, Code } from "lucide-react"
import { cn } from "@/lib/utils"
import { Project, EditorLanguage } from "@/types"
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

const tabs = [
  { id: 'html' as EditorLanguage, label: 'HTML', icon: FileText, language: 'html' },
  { id: 'css' as EditorLanguage, label: 'CSS', icon: Palette, language: 'css' },
  { id: 'javascript' as EditorLanguage, label: 'JavaScript', icon: Code, language: 'javascript' },
]

export function CodeEditor({ project }: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorLanguage>('html')
  const [editorValue, setEditorValue] = useState('')
  const { updateCurrentProjectCode } = useProjectStore()

  useEffect(() => {
    setEditorValue(project[activeTab])
  }, [project, activeTab])

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value)
      // Update the project with debouncing
      const timeoutId = setTimeout(() => {
        const updates = { [activeTab]: value }
        updateCurrentProjectCode(
          activeTab === 'html' ? value : undefined,
          activeTab === 'css' ? value : undefined,
          activeTab === 'javascript' ? value : undefined
        )
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b bg-card/30">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary border-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
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
    </div>
  )
} 