"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw, ExternalLink, Home, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Project, Page } from "@/types"
import { useProjectStore } from "@/hooks/use-project-store"

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
  const { currentPageId, setCurrentPage } = useProjectStore()
  const [key, setKey] = useState(0)
  const [previewPageId, setPreviewPageId] = useState<string>('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Get current page for preview
  const currentPage = project.pages.find(page => page.id === (previewPageId || currentPageId))
  const homePage = project.pages.find(page => page.isHomePage)
  const pageToPreview = currentPage || homePage || project.pages[0]

  useEffect(() => {
    // Initialize preview with current page
    if (currentPageId && !previewPageId) {
      setPreviewPageId(currentPageId)
    }
  }, [currentPageId, previewPageId])

  const createPreviewDocument = (page: Page) => {
    if (!page) return '<html><body><h1>Nessuna pagina disponibile</h1></body></html>'

    let processedHtml = page.html

    // Replace global CSS link with actual CSS
    processedHtml = processedHtml.replace(
      /<link[^>]*href=['"]global\.css['"][^>]*>/gi,
      `<style>/* Global CSS */\n${project.globalCss}</style>`
    )

    // Replace page-specific CSS link with actual CSS
    processedHtml = processedHtml.replace(
      new RegExp(`<link[^>]*href=['"]${page.slug}\\.css['"][^>]*>`, 'gi'),
      `<style>/* ${page.name} CSS */\n${page.css}</style>`
    )

    // Replace global JS script with actual JS
    processedHtml = processedHtml.replace(
      /<script[^>]*src=['"]global\.js['"][^>]*><\/script>/gi,
      `<script>/* Global JS */\n${project.globalJs}</script>`
    )

    // Replace page-specific JS script with actual JS
    processedHtml = processedHtml.replace(
      new RegExp(`<script[^>]*src=['"]${page.slug}\\.js['"][^>]*><\\/script>`, 'gi'),
      `<script>/* ${page.name} JS */\n${page.javascript}</script>`
    )

    // Update navigation links to work within the preview
    const updatedHtml = processedHtml.replace(
      /href=['"]([^'"]*\.html)['"]|href=['"]([^'"]*)\.(html)['"]|href=['"]([^'"]*)['"]/g,
      (match, htmlFile, baseFile, ext, otherFile) => {
        // Find matching page by slug
        const targetSlug = htmlFile?.replace('.html', '') || baseFile || otherFile
        const targetPage = project.pages.find(p => 
          p.slug === targetSlug || 
          p.slug === targetSlug.replace('.html', '') ||
          (targetSlug === 'index' && p.isHomePage)
        )
        
        if (targetPage) {
          return `href="#" onclick="window.parent.postMessage({type: 'navigate', pageId: '${targetPage.id}'}, '*'); return false;"`
        }
        
        // Keep external links as-is
        if (otherFile && (otherFile.startsWith('http') || otherFile.startsWith('#'))) {
          return match
        }
        
        return 'href="#"'
      }
    )

    return updatedHtml
  }

  const refreshPreview = () => {
    setKey(prev => prev + 1)
  }

  useEffect(() => {
    if (iframeRef.current && pageToPreview) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        doc.open()
        doc.write(createPreviewDocument(pageToPreview))
        doc.close()
      }
    }
  }, [project, pageToPreview, key])

  // Listen for navigation messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'navigate' && event.data?.pageId) {
        setPreviewPageId(event.data.pageId)
        setCurrentPage(event.data.pageId)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [setCurrentPage])

  const openInNewTab = () => {
    if (!pageToPreview) return
    
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(createPreviewDocument(pageToPreview))
      newWindow.document.close()
    }
  }

  const handlePageChange = (pageId: string) => {
    setPreviewPageId(pageId)
    setCurrentPage(pageId)
  }

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-card/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Anteprima</span>
          
          {/* Page Selector */}
          <Select value={previewPageId || currentPageId || ''} onValueChange={handlePageChange}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Seleziona pagina" />
            </SelectTrigger>
            <SelectContent>
              {project.pages.map((page) => (
                <SelectItem key={page.id} value={page.id}>
                  <div className="flex items-center gap-2">
                    {page.isHomePage ? (
                      <Home className="h-3 w-3" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                    <span>{page.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
          {pageToPreview ? (
            <iframe
              key={`${key}-${pageToPreview.id}`}
              ref={iframeRef}
              className="w-full h-full border-0"
              title={`Anteprima - ${pageToPreview.name}`}
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nessuna pagina disponibile</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {device !== 'desktop' && (
        <div className="text-center p-2">
          <span className="text-xs text-muted-foreground">
            {deviceSizes[device].width} × {deviceSizes[device].height}
          </span>
        </div>
      )}
      
      {/* Current page info */}
      {pageToPreview && (
        <div className="px-4 py-2 text-xs text-muted-foreground bg-card/50 border-t">
          <div className="flex items-center gap-2">
            {pageToPreview.isHomePage ? (
              <Home className="h-3 w-3" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            <span>
              {pageToPreview.name} ({pageToPreview.slug}.html)
            </span>
            {pageToPreview.isHomePage && (
              <span className="bg-primary/10 text-primary px-1 rounded">Home</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 