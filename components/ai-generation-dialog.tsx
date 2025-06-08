"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Wand2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Palette,
  Code,
  Globe,
  PlusCircle,
  Layout
} from "lucide-react"
import { cn } from "@/lib/utils"
import { aiService } from "@/lib/ai-service"
import { useProjectStore } from "@/hooks/use-project-store"
import { AIGenerationRequest, GenerationProgress, Page } from "@/types"
import toast from "react-hot-toast"

interface AIGenerationDialogProps {
  isOpen: boolean
  onClose: () => void
  type: 'webpage' | 'component' | 'style' | 'script' | 'page-edit' | 'multi-page-site' | 'new-page'
}

const typeConfig = {
  'multi-page-site': {
    title: "Genera Sito Multi-Pagina",
    description: "Crea un intero sito web con più pagine interconnesse",
    icon: Layout,
    placeholder: "Descrivi il sito web che vuoi creare. Ad esempio: 'Un sito per un'azienda di consulenza con home, servizi, chi siamo, portfolio e contatti'"
  },
  'new-page': {
    title: "Aggiungi Nuova Pagina",
    description: "Crea una nuova pagina per il sito esistente",
    icon: PlusCircle,
    placeholder: "Descrivi la nuova pagina che vuoi aggiungere. Ad esempio: 'Una pagina blog con lista articoli', 'Una pagina prezzi con tabelle comparative'"
  },
  webpage: {
    title: "Genera Pagina Web",
    description: "Crea una pagina web completa con HTML, CSS e JavaScript",
    icon: Globe,
    placeholder: "Descrivi il tipo di pagina web che vuoi creare. Ad esempio: 'Un sito per un ristorante con menu, contatti e gallery di foto'"
  },
  'page-edit': {
    title: "Modifica Pagina",
    description: "Modifica l'intera pagina web con modifiche generali",
    icon: Wand2,
    placeholder: "Descrivi le modifiche che vuoi apportare alla pagina. Ad esempio: 'Aggiungi una sezione contatti', 'Cambia il colore theme a verde', 'Rendi il layout più responsive'"
  },
  component: {
    title: "Genera Componente",
    description: "Crea un componente web riutilizzabile",
    icon: FileText,
    placeholder: "Descrivi il componente che vuoi creare. Ad esempio: 'Una card prodotto con immagine, titolo, prezzo e pulsante'"
  },
  style: {
    title: "Modifica CSS",
    description: "Genera o modifica gli stili CSS",
    icon: Palette,
    placeholder: "Descrivi come vuoi modificare gli stili. Ad esempio: 'Rendi il design più moderno con gradienti e ombre'"
  },
  script: {
    title: "Modifica JavaScript",
    description: "Genera o modifica il codice JavaScript",
    icon: Code,
    placeholder: "Descrivi la funzionalità JavaScript che vuoi aggiungere. Ad esempio: 'Aggiungi un carousel per le immagini'"
  }
}

function AIGenerationDialog({ isOpen, onClose, type }: AIGenerationDialogProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<GenerationProgress>({
    step: 'idle',
    message: '',
    progress: 0
  })

  const { 
    currentProject, 
    currentPageId,
    getCurrentPage,
    updateCurrentProjectCode, 
    updateProject, 
    addPage,
    updatePage
  } = useProjectStore()
  
  const config = typeConfig[type]
  const Icon = config.icon
  const currentPage = getCurrentPage()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Inserisci una descrizione per la generazione")
      return
    }

    if (!currentProject) {
      toast.error("Seleziona o crea un progetto prima di generare")
      return
    }

    if ((type === 'page-edit' || type === 'component' || type === 'style' || type === 'script') && !currentPage) {
      toast.error("Seleziona una pagina per questa operazione")
      return
    }

    setIsGenerating(true)
    
    try {
      // Step 1: Analyzing
      setProgress({
        step: 'analyzing',
        message: 'Analizzando la richiesta...',
        progress: 20
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 2: Generating
      setProgress({
        step: 'generating',
        message: 'Generando il codice con DeepSeek AI...',
        progress: 50
      })

      const request: AIGenerationRequest = {
        prompt,
        type,
        context: {
          existingHtml: currentPage?.html || '',
          existingCss: currentPage?.css || '',
          existingJs: currentPage?.javascript || '',
          currentPageId: currentPageId || undefined,
          projectPages: currentProject.pages
        }
      }

      const result = await aiService.generateCode(request)

      // Step 3: Applying
      setProgress({
        step: 'applying',
        message: 'Applicando le modifiche...',
        progress: 80
      })

      await new Promise(resolve => setTimeout(resolve, 500))

      // Apply the generated code based on type
      if (type === 'multi-page-site') {
        // Replace entire project with multi-page site
        if (result.pages && result.pages.length > 0) {
          // Add unique IDs to generated pages
          const pagesWithIds: Page[] = result.pages.map(page => ({
            ...page,
            id: crypto.randomUUID()
          }))

          updateProject(currentProject.id, {
            pages: pagesWithIds,
            globalCss: result.globalCss || currentProject.globalCss,
            globalJs: result.globalJs || currentProject.globalJs
          })

          toast.success(`Sito multi-pagina creato con ${pagesWithIds.length} pagine!`)
        }
      } else if (type === 'new-page') {
        // Add new page to existing project
        if (result.html) {
          const newPage: Omit<Page, 'id'> = {
            name: extractPageName(prompt) || 'Nuova Pagina',
            title: extractPageTitle(prompt) || 'Nuova Pagina',
            slug: extractPageSlug(prompt) || `pagina-${Date.now()}`,
            html: result.html,
            css: result.css || '',
            javascript: result.javascript || '',
            isHomePage: false
          }

          addPage(currentProject.id, newPage)
          toast.success("Nuova pagina creata con successo!")
        }
      } else if (type === 'page-edit' && currentPage) {
        // Update current page
        const updates: Partial<Page> = {}
        if (result.html) updates.html = result.html
        if (result.css) updates.css = result.css
        if (result.javascript) updates.javascript = result.javascript

        updatePage(currentProject.id, currentPage.id, updates)
        toast.success("Pagina modificata con successo!")
      } else if (currentPage) {
        // Legacy single-page updates for components, styles, scripts
        updateCurrentProjectCode(
          result.html || undefined,
          result.css || undefined,
          result.javascript || undefined
        )
        toast.success("Modifiche applicate con successo!")
      }

      // Step 4: Complete
      setProgress({
        step: 'complete',
        message: 'Generazione completata!',
        progress: 100
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      if (result.explanation) {
        console.log("AI Explanation:", result.explanation)
      }

      onClose()

    } catch (error) {
      console.error('AI Generation Error:', error)
      setProgress({
        step: 'error',
        message: 'Errore durante la generazione',
        progress: 0
      })
      
      toast.error(error instanceof Error ? error.message : "Errore durante la generazione")
    } finally {
      setIsGenerating(false)
      setTimeout(() => {
        setProgress({ step: 'idle', message: '', progress: 0 })
      }, 2000)
    }
  }

  // Helper functions to extract page info from prompt
  const extractPageName = (prompt: string): string | null => {
    const matches = prompt.toLowerCase().match(/pagina\s+([a-zA-Z\s]+)|una\s+pagina\s+([a-zA-Z\s]+)/)
    if (matches) {
      return (matches[1] || matches[2]).trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    return null
  }

  const extractPageTitle = (prompt: string): string | null => {
    const name = extractPageName(prompt)
    return name ? `Pagina ${name}` : null
  }

  const extractPageSlug = (prompt: string): string | null => {
    const name = extractPageName(prompt)
    return name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : null
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'analyzing':
      case 'generating':
      case 'applying':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Special warnings for certain types */}
          {type === 'multi-page-site' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Attenzione</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Questa operazione sostituirà tutte le pagine esistenti nel progetto con un nuovo sito multi-pagina.
              </p>
            </div>
          )}

          {/* Current context info */}
          {currentProject && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">
                <strong>Progetto:</strong> {currentProject.name}
                {type !== 'multi-page-site' && currentPage && (
                  <>
                    <br />
                    <strong>Pagina corrente:</strong> {currentPage.name}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrizione</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={config.placeholder}
              className="min-h-[120px]"
              disabled={isGenerating}
            />
          </div>

          {/* Generation Progress */}
          {isGenerating && progress.step !== 'idle' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {getStepIcon(progress.step)}
                <span className="text-sm font-medium">{progress.message}</span>
              </div>
              <Progress value={progress.progress} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
            >
              Annulla
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="min-w-[120px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Genera
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Export the dialog component for use in other components
export { AIGenerationDialog }

// Default export for the AI Generation Dialog with type selection
export default function AIGenerationToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<keyof typeof typeConfig>('multi-page-site')

  const generationTypes = [
    { key: 'multi-page-site', label: 'Sito Multi-Pagina', icon: Layout },
    { key: 'new-page', label: 'Nuova Pagina', icon: PlusCircle },
    { key: 'page-edit', label: 'Modifica Pagina', icon: Wand2 },
    { key: 'component', label: 'Componente', icon: FileText },
    { key: 'style', label: 'Stili CSS', icon: Palette },
    { key: 'script', label: 'JavaScript', icon: Code },
  ] as const

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Generazione AI</label>
        <div className="grid grid-cols-2 gap-2">
          {generationTypes.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedType(key)
                setIsOpen(true)
              }}
              className="h-auto p-3 flex-col items-start text-left"
            >
              <div className="flex items-center gap-2 w-full">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <AIGenerationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        type={selectedType}
      />
    </>
  )
} 