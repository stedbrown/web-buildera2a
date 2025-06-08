"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Save, Download, Play, Settings, FileDown, Globe, ChevronDown } from "lucide-react"
import { Project, Page } from "@/types"
import { FileUtils } from "@/lib/file-utils"
import { useProjectStore } from "@/hooks/use-project-store"
import toast from "react-hot-toast"

interface HeaderProps {
  onSidebarToggle: () => void
  project: Project | null
}

export function Header({ onSidebarToggle, project }: HeaderProps) {
  const { updateProject, getCurrentPage } = useProjectStore()
  const currentPage = getCurrentPage()

  const handleSave = () => {
    if (!project) {
      toast.error("Nessun progetto da salvare")
      return
    }
    
    // Update the project's updatedAt timestamp
    updateProject(project.id, { updatedAt: new Date() })
    toast.success("Progetto salvato!")
  }

  const handleExportProject = async () => {
    if (!project) {
      toast.error("Nessun progetto da esportare")
      return
    }

    try {
      await FileUtils.exportProject(project)
      toast.success("Progetto multi-pagina esportato con successo!")
    } catch (error) {
      toast.error("Errore durante l'esportazione")
    }
  }

  const handleExportCurrentPage = () => {
    if (!project || !currentPage) {
      toast.error("Nessuna pagina da esportare")
      return
    }

    try {
      FileUtils.exportPageAsStandalone(project, currentPage)
      toast.success(`Pagina "${currentPage.name}" esportata come file standalone!`)
    } catch (error) {
      toast.error("Errore durante l'esportazione della pagina")
    }
  }

  const handlePreviewProject = () => {
    if (!project) {
      toast.error("Nessun progetto da visualizzare")
      return
    }

    // Preview the home page or first page
    const homePage = project.pages.find(page => page.isHomePage) || project.pages[0]
    if (!homePage) {
      toast.error("Nessuna pagina disponibile per l'anteprima")
      return
    }

    const standaloneHtml = FileUtils.generateStandaloneHtml(project, homePage)
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(standaloneHtml)
      newWindow.document.close()
    }
  }

  const handlePreviewCurrentPage = () => {
    if (!project || !currentPage) {
      toast.error("Nessuna pagina da visualizzare")
      return
    }

    const standaloneHtml = FileUtils.generateStandaloneHtml(project, currentPage)
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
                - {project.name} ({project.pages.length} pagina{project.pages.length !== 1 ? 'e' : ''})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salva
          </Button>
          
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Esporta
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportProject}>
                <FileDown className="h-4 w-4 mr-2" />
                Intero Progetto (ZIP)
              </DropdownMenuItem>
              {currentPage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportCurrentPage}>
                    <Globe className="h-4 w-4 mr-2" />
                    Pagina "{currentPage.name}" (HTML)
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Preview Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                Anteprima
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePreviewProject}>
                <Play className="h-4 w-4 mr-2" />
                Sito Completo (Home)
              </DropdownMenuItem>
              {currentPage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handlePreviewCurrentPage}>
                    <Globe className="h-4 w-4 mr-2" />
                    Pagina "{currentPage.name}"
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
} 