"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Folder, 
  Plus, 
  Wand2, 
  FileText, 
  Palette, 
  Code,
  ChevronLeft,
  Brain
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/hooks/use-project-store"
import { AIGenerationDialog } from "./ai-generation-dialog"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'ai-tools'>('projects')
  const [aiDialog, setAiDialog] = useState<{
    isOpen: boolean
    type: 'webpage' | 'component' | 'style' | 'script' | 'page-edit'
  }>({ isOpen: false, type: 'webpage' })
  const { projects, currentProject, createProject, setCurrentProject } = useProjectStore()

  const handleCreateProject = () => {
    const name = `Progetto ${projects.length + 1}`
    createProject(name)
  }

  const openAiDialog = (type: 'webpage' | 'component' | 'style' | 'script' | 'page-edit') => {
    setAiDialog({ isOpen: true, type })
  }

  const closeAiDialog = () => {
    setAiDialog({ isOpen: false, type: 'webpage' })
  }

  return (
    <div className={cn(
      "border-r bg-card/50 backdrop-blur-sm transition-all duration-300 flex flex-col",
      isOpen ? "w-80" : "w-0 overflow-hidden"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Menu</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-6 w-6"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('projects')}
          className={cn(
            "flex-1 p-3 text-sm font-medium transition-colors",
            activeTab === 'projects' 
              ? "bg-primary/10 text-primary border-b-2 border-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Folder className="h-4 w-4 mr-2 inline" />
          Progetti
        </button>
        <button
          onClick={() => setActiveTab('ai-tools')}
          className={cn(
            "flex-1 p-3 text-sm font-medium transition-colors",
            activeTab === 'ai-tools' 
              ? "bg-primary/10 text-primary border-b-2 border-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Brain className="h-4 w-4 mr-2 inline" />
          AI Tools
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'projects' && (
          <div className="p-4">
            <Button 
              onClick={handleCreateProject}
              className="w-full mb-4"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Progetto
            </Button>

            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setCurrentProject(project)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors border",
                    currentProject?.id === project.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted border-transparent"
                  )}
                >
                  <div className="font-medium text-sm">{project.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(project.updatedAt).toLocaleDateString('it-IT')}
                  </div>
                </div>
              ))}
              
              {projects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nessun progetto ancora</p>
                  <p className="text-xs">Crea il tuo primo progetto!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai-tools' && (
          <div className="p-4">
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
                onClick={() => openAiDialog('webpage')}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Genera Pagina Web
              </Button>
              
              <Button 
                variant="default" 
                className="w-full justify-start" 
                size="sm"
                onClick={() => openAiDialog('page-edit')}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Modifica Pagina
              </Button>
              
              <div className="border-t pt-2 mt-3">
                <p className="text-xs text-muted-foreground mb-2 px-1">Modifica Specifica:</p>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => openAiDialog('component')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Modifica HTML
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => openAiDialog('style')}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Modifica CSS
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => openAiDialog('script')}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Modifica JavaScript
                </Button>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">DeepSeek AI</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Modello AI gratuito per la generazione e modifica del codice web
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI Generation Dialog */}
      <AIGenerationDialog
        isOpen={aiDialog.isOpen}
        onClose={closeAiDialog}
        type={aiDialog.type}
      />
    </div>
  )
} 