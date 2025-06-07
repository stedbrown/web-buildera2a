"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Project } from "@/types"

interface PreviewProps {
  project: Project
  device: 'desktop' | 'tablet' | 'mobile'
}

const deviceSizes = {
  desktop: { width: '100%', height: '100%' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' },
}

export function Preview({ project, device }: PreviewProps) {
  const [key, setKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const createPreviewDocument = () => {
    const { html, css, javascript } = project
    
    // Inject CSS and JavaScript into the HTML
    const processedHtml = html
      .replace(
        /<link[^>]*rel=['"]stylesheet['"][^>]*>/gi,
        `<style>${css}</style>`
      )
      .replace(
        /<script[^>]*src=['"][^'"]*\.js['"][^>]*><\/script>/gi,
        `<script>${javascript}</script>`
      )

    return processedHtml
  }

  const refreshPreview = () => {
    setKey(prev => prev + 1)
  }

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        doc.open()
        doc.write(createPreviewDocument())
        doc.close()
      }
    }
  }, [project, key])

  const openInNewTab = () => {
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(createPreviewDocument())
      newWindow.document.close()
    }
  }

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-card/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Anteprima</span>
          <span className="text-xs text-muted-foreground capitalize">
            ({device})
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={refreshPreview}
            title="Aggiorna anteprima"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={openInNewTab}
            title="Apri in nuova scheda"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className={cn(
            "bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300",
            device === 'desktop' ? "w-full h-full" : "mx-auto"
          )}
          style={{
            width: device === 'desktop' ? '100%' : deviceSizes[device].width,
            height: device === 'desktop' ? '100%' : deviceSizes[device].height,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          <iframe
            key={key}
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Website Preview"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
          />
        </div>
      </div>
      
      {device !== 'desktop' && (
        <div className="text-center p-2">
          <span className="text-xs text-muted-foreground">
            {deviceSizes[device].width} × {deviceSizes[device].height}
          </span>
        </div>
      )}
    </div>
  )
} 