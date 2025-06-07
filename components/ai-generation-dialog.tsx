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
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import { aiService } from "@/lib/ai-service"
import { useProjectStore } from "@/hooks/use-project-store"
import { AIGenerationRequest, GenerationProgress } from "@/types"
import toast from "react-hot-toast"

interface AIGenerationDialogProps {
  isOpen: boolean
  onClose: () => void
  type: 'webpage' | 'component' | 'style' | 'script'
}

const typeConfig = {
  webpage: {
    title: "Genera Pagina Web",
    description: "Crea una pagina web completa con HTML, CSS e JavaScript",
    icon: Globe,
    placeholder: "Descrivi il tipo di pagina web che vuoi creare. Ad esempio: 'Un sito per un ristorante con menu, contatti e gallery di foto'"
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

export function AIGenerationDialog({ isOpen, onClose, type }: AIGenerationDialogProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<GenerationProgress>({
    step: 'idle',
    message: '',
    progress: 0
  })

  const { currentProject, updateCurrentProjectCode } = useProjectStore()
  const config = typeConfig[type]
  const Icon = config.icon

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Inserisci una descrizione per la generazione")
      return
    }

    if (!currentProject) {
      toast.error("Seleziona o crea un progetto prima di generare")
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
          existingHtml: currentProject.html,
          existingCss: currentProject.css,
          existingJs: currentProject.javascript
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

      // Apply the generated code
      updateCurrentProjectCode(
        result.html || undefined,
        result.css || undefined,
        result.javascript || undefined
      )

      // Step 4: Complete
      setProgress({
        step: 'complete',
        message: 'Generazione completata!',
        progress: 100
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      if (result.explanation) {
        toast.success(result.explanation.slice(0, 100) + "...")
      } else {
        toast.success("Codice generato con successo!")
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI Model Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Wand2 className="h-3 w-3 mr-1" />
              DeepSeek R1 - Gratuito
            </Badge>
          </div>

          {/* Prompt Input */}
          <Textarea
            placeholder={config.placeholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            disabled={isGenerating}
            className="resize-none"
          />

          {/* Progress */}
          {progress.step !== 'idle' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {getStepIcon(progress.step)}
                <span className={cn(
                  progress.step === 'error' ? 'text-red-600' : 'text-muted-foreground'
                )}>
                  {progress.message}
                </span>
              </div>
              <Progress 
                value={progress.progress} 
                className={cn(
                  "h-2",
                  progress.step === 'error' && "bg-red-100"
                )}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
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