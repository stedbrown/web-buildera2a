"use client"

import { Button } from "@/components/ui/button"
import { Menu, Save, Download, Play, Settings, FileDown, Globe } from "lucide-react"
import { Project } from "@/types"
import { FileUtils } from "@/lib/file-utils"
import { useProjectStore } from "@/hooks/use-project-store"
import toast from "react-hot-toast"

interface HeaderProps {
  onSidebarToggle: () => void
  project: Project | null
}

export function Header({ onSidebarToggle, project }: HeaderProps) {
  const { updateProject } = useProjectStore()

  const handleSave = () => {
    if (!project) {
      toast.error("Nessun progetto da salvare")
      return
    }
    
    // Update the project's updatedAt timestamp
    updateProject(project.id, { updatedAt: new Date() })
    toast.success("Progetto salvato!")
  }

  const handleExport = async () => {
    if (!project) {
      toast.error("Nessun progetto da esportare")
      return
    }

    try {
      await FileUtils.exportProject(project)
      toast.success("Progetto esportato con successo!")
    } catch (error) {
      toast.error("Errore durante l'esportazione")
    }
  }

  const handlePreview = () => {
    if (!project) {
      toast.error("Nessun progetto da visualizzare")
      return
    }

    const standaloneHtml = FileUtils.generateStandaloneHtml(project)
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(standaloneHtml)
      newWindow.document.close()
    }
  }
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">WebBuilder A2A</h1>
            {project && (
              <span className="text-sm text-muted-foreground">
                - {project.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salva
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handlePreview}>
            <Globe className="h-4 w-4 mr-2" />
            Anteprima
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
} 