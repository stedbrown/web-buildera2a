"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Code, Eye, Smartphone, Tablet, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { CodeEditor } from "./code-editor"
import { Preview } from "./preview"
import { useProjectStore } from "@/hooks/use-project-store"

type ViewMode = 'editor' | 'preview' | 'split'
type Device = 'desktop' | 'tablet' | 'mobile'

export function MainContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [device, setDevice] = useState<Device>('desktop')
  const { currentProject } = useProjectStore()

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nessun Progetto Selezionato</h3>
          <p className="text-muted-foreground">
            Seleziona un progetto dalla sidebar o crea un nuovo progetto per iniziare.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'editor' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('editor')}
            >
              <Code className="h-4 w-4 mr-2" />
              Editor
            </Button>
            
            <Button
              variant={viewMode === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
            >
              <div className="flex h-4 w-4 mr-2">
                <div className="w-2 h-4 border border-r-0 rounded-l" />
                <div className="w-2 h-4 border rounded-r" />
              </div>
              Split
            </Button>
            
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Anteprima
            </Button>
          </div>

          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex items-center gap-1">
              <Button
                variant={device === 'desktop' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setDevice('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              
              <Button
                variant={device === 'tablet' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setDevice('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              
              <Button
                variant={device === 'mobile' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setDevice('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className={cn(
          "transition-all duration-300",
          viewMode === 'editor' ? 'flex-1' : 
          viewMode === 'split' ? 'w-1/2' : 'w-0 overflow-hidden'
        )}>
          <CodeEditor project={currentProject} />
        </div>

        {/* Divider */}
        {viewMode === 'split' && (
          <div className="w-px bg-border" />
        )}

        {/* Preview */}
        <div className={cn(
          "transition-all duration-300",
          viewMode === 'preview' ? 'flex-1' : 
          viewMode === 'split' ? 'w-1/2' : 'w-0 overflow-hidden'
        )}>
          <Preview project={currentProject} device={device} />
        </div>
      </div>
    </div>
  )
} 