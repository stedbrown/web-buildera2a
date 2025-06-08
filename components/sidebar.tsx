"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Plus, 
  FolderOpen, 
  Save, 
  Download, 
  Settings, 
  FileText,
  Home,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Globe
} from "lucide-react"
import { useProjectStore } from "@/hooks/use-project-store"
import { Project, Page } from "@/types"
import { cn } from "@/lib/utils"
import AIGenerationToolbar from "./ai-generation-dialog"

interface SidebarProps {
  currentProject?: Project | null
  isOpen?: boolean
  onToggle?: () => void
}

export function Sidebar({ currentProject, isOpen, onToggle }: SidebarProps) {
  const { 
    projects, 
    currentPageId,
    currentProject: storeCurrentProject,
    setCurrentProject, 
    setCurrentPage,
    addPage,
    updatePage,
    deletePage,
    duplicatePage,
    createProject,
    deleteProject,
    exportProject 
  } = useProjectStore()
  
  // Use the current project from props if provided, otherwise from store
  const activeProject = currentProject || storeCurrentProject
  
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [isNewPageOpen, setIsNewPageOpen] = useState(false)
  const [isEditPageOpen, setIsEditPageOpen] = useState(false)
  const [isDeletePageOpen, setIsDeletePageOpen] = useState(false)
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [selectedPageToDelete, setSelectedPageToDelete] = useState<Page | null>(null)
  const [selectedProjectToDelete, setSelectedProjectToDelete] = useState<Project | null>(null)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  
  // New/Edit page form state
  const [pageName, setPageName] = useState("")
  const [pageTitle, setPageTitle] = useState("")
  const [pageSlug, setPageSlug] = useState("")

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim(), newProjectDescription.trim() || undefined)
      setNewProjectName("")
      setNewProjectDescription("")
      setIsNewProjectOpen(false)
    }
  }

  const handleCreatePage = () => {
    if (!activeProject || !pageName.trim()) return

    const slug = pageSlug.trim() || pageName.toLowerCase().replace(/[^a-z0-9]/gi, '-')
    
    const newPage: Omit<Page, 'id'> = {
      name: pageName.trim(),
      title: pageTitle.trim() || pageName.trim(),
      slug,
      isHomePage: false,
      html: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle.trim() || pageName.trim()}</title>
    <link rel="stylesheet" href="global.css">
    <link rel="stylesheet" href="${slug}.css">
</head>
<body>
    <nav>
        <div class="nav-container">
            <h1 class="logo">Il Mio Sito</h1>
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="${slug}.html">${pageName.trim()}</a></li>
            </ul>
        </div>
    </nav>
    
    <main>
        <section>
            <h1>${pageTitle.trim() || pageName.trim()}</h1>
            <p>Contenuto della pagina ${pageName.trim()}.</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 - Realizzato con WebBuilder A2A</p>
    </footer>
    
    <script src="global.js"></script>
    <script src="${slug}.js"></script>
</body>
</html>`,
      css: `/* Stili specifici per ${pageName.trim()} */
.main-content {
    padding: 2rem 0;
}

section {
    text-align: center;
}`,
      javascript: `// JavaScript specifico per ${pageName.trim()}
console.log('Pagina ${pageName.trim()} caricata con successo!');

document.addEventListener('DOMContentLoaded', function() {
    // Aggiungi qui il codice specifico per questa pagina
});`
    }

    addPage(activeProject.id, newPage)
    resetPageForm()
    setIsNewPageOpen(false)
  }

  const handleEditPage = () => {
    if (!activeProject || !editingPage || !pageName.trim()) return

    const slug = pageSlug.trim() || pageName.toLowerCase().replace(/[^a-z0-9]/gi, '-')
    
    updatePage(activeProject.id, editingPage.id, {
      name: pageName.trim(),
      title: pageTitle.trim() || pageName.trim(),
      slug,
    })

    resetPageForm()
    setIsEditPageOpen(false)
    setEditingPage(null)
  }

  const resetPageForm = () => {
    setPageName("")
    setPageTitle("")
    setPageSlug("")
  }

  const openEditPage = (page: Page) => {
    setEditingPage(page)
    setPageName(page.name)
    setPageTitle(page.title)
    setPageSlug(page.slug)
    setIsEditPageOpen(true)
  }

  const openDeletePage = (page: Page) => {
    setSelectedPageToDelete(page)
    setIsDeletePageOpen(true)
  }

  const handleDeletePage = () => {
    if (!currentProject || !selectedPageToDelete) return
    
    deletePage(currentProject.id, selectedPageToDelete.id)
    setSelectedPageToDelete(null)
    setIsDeletePageOpen(false)
  }

  const openDeleteProject = (project: Project) => {
    setSelectedProjectToDelete(project)
    setIsDeleteProjectOpen(true)
  }

  const handleDeleteProject = () => {
    if (!selectedProjectToDelete) return
    
    deleteProject(selectedProjectToDelete.id)
    setSelectedProjectToDelete(null)
    setIsDeleteProjectOpen(false)
  }

  const handleDuplicatePage = (page: Page) => {
    if (!currentProject) return
    duplicatePage(currentProject.id, page.id)
  }

  return (
    <div className="w-80 bg-card border-r border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Progetti</h2>
          <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuovo Progetto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome Progetto</label>
                  <Input
                    value={newProjectName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectName(e.target.value)}
                      placeholder="Il mio sito web"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrizione (opzionale)</label>
                    <Input
                      value={newProjectDescription}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectDescription(e.target.value)}
                    placeholder="Descrizione del progetto"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>
                  Annulla
                </Button>
                <Button onClick={handleCreateProject}>
                  Crea Progetto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project List */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {projects.map((project) => (
            <div key={project.id} className="relative group">
              <button
                onClick={() => setCurrentProject(project)}
                className={cn(
                  "w-full text-left p-2 rounded text-sm transition-colors",
                  currentProject?.id === project.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium truncate">{project.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {project.pages.length} pagina{project.pages.length !== 1 ? 'e' : ''}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => exportProject(project)}>
                        <Download className="h-4 w-4 mr-2" />
                        Esporta
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openDeleteProject(project)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Current Project Pages */}
      {currentProject && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Pagine</h3>
              <Dialog open={isNewPageOpen} onOpenChange={setIsNewPageOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 px-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Nuova
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuova Pagina</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome Pagina</label>
                      <Input
                        value={pageName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageName(e.target.value)}
                        placeholder="Chi Siamo"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Titolo (opzionale)</label>
                      <Input
                        value={pageTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageTitle(e.target.value)}
                        placeholder="Scopri la nostra storia"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Slug URL (opzionale)</label>
                      <Input
                        value={pageSlug}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageSlug(e.target.value)}
                        placeholder="chi-siamo"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Verrà generato automaticamente dal nome se vuoto
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsNewPageOpen(false)
                      resetPageForm()
                    }}>
                      Annulla
                    </Button>
                    <Button onClick={handleCreatePage}>
                      Crea Pagina
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Pages List */}
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {currentProject.pages.map((page) => (
                <div key={page.id} className="relative group">
                  <button
                    onClick={() => setCurrentPage(page.id)}
                    className={cn(
                      "w-full text-left p-2 rounded text-sm transition-colors flex items-center justify-between",
                      currentPageId === page.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {page.isHomePage ? (
                        <Home className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <FileText className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="truncate">{page.name}</span>
                      {page.isHomePage && (
                        <Badge variant="secondary" className="text-xs">Home</Badge>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditPage(page)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicatePage(page)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplica
                        </DropdownMenuItem>
                        {!page.isHomePage && (
                          <DropdownMenuItem 
                            onClick={() => openDeletePage(page)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Elimina
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Tools */}
          <div className="p-4 space-y-3">
            <h3 className="font-medium text-sm">Strumenti AI</h3>
            <AIGenerationToolbar />
          </div>

          {/* Global Assets Info */}
          <div className="mt-auto p-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                <span>CSS e JS globali disponibili nell'editor</span>
              </div>
              <div className="text-xs">
                I file globali sono condivisi tra tutte le pagine
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No project selected */}
      {!currentProject && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Seleziona un progetto per iniziare</p>
          </div>
        </div>
      )}

      {/* Edit Page Dialog */}
      <Dialog open={isEditPageOpen} onOpenChange={setIsEditPageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Pagina</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome Pagina</label>
              <Input
                value={pageName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageName(e.target.value)}
                placeholder="Chi Siamo"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Titolo</label>
              <Input
                value={pageTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageTitle(e.target.value)}
                placeholder="Scopri la nostra storia"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug URL</label>
              <Input
                value={pageSlug}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageSlug(e.target.value)}
                placeholder="chi-siamo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditPageOpen(false)
              setEditingPage(null)
              resetPageForm()
            }}>
              Annulla
            </Button>
            <Button onClick={handleEditPage}>
              Salva Modifiche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Page Confirmation */}
      <AlertDialog open={isDeletePageOpen} onOpenChange={setIsDeletePageOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Pagina</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare la pagina "{selectedPageToDelete?.name}"? 
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Project Confirmation */}
      <AlertDialog open={isDeleteProjectOpen} onOpenChange={setIsDeleteProjectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Progetto</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il progetto "{selectedProjectToDelete?.name}"? 
              Tutte le pagine e i dati del progetto verranno persi. Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 