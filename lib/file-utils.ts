import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Project, Page } from '@/types'

export class FileUtils {
  // Export project as ZIP file (supports multi-page)
  static async exportProject(project: Project): Promise<void> {
    try {
      const zip = new JSZip()
      
      // Add global CSS file
      if (project.globalCss?.trim()) {
        zip.file('global.css', project.globalCss)
      }
      
      // Add global JavaScript file
      if (project.globalJs?.trim()) {
        zip.file('global.js', project.globalJs)
      }
      
      // Add each page
      for (const page of project.pages) {
        // Add HTML file for each page
        const htmlFileName = page.isHomePage ? 'index.html' : `${page.slug}.html`
        zip.file(htmlFileName, page.html)
        
        // Add page-specific CSS if it exists
        if (page.css?.trim()) {
          zip.file(`${page.slug}.css`, page.css)
        }
        
        // Add page-specific JavaScript if it exists
        if (page.javascript?.trim()) {
          zip.file(`${page.slug}.js`, page.javascript)
        }
      }
      
      // Add README
      const readme = `# ${project.name}

${project.description || 'Progetto multi-pagina creato con WebBuilder A2A'}

## Struttura del progetto

### File globali
- \`global.css\` - Stili CSS condivisi tra tutte le pagine
- \`global.js\` - JavaScript condiviso tra tutte le pagine

### Pagine
${project.pages.map(page => 
  `- \`${page.isHomePage ? 'index.html' : page.slug + '.html'}\` - ${page.title}${page.css?.trim() ? `\n  - \`${page.slug}.css\` - Stili specifici` : ''}${page.javascript?.trim() ? `\n  - \`${page.slug}.js\` - JavaScript specifico` : ''}`
).join('\n')}

## Come usare

1. Apri \`index.html\` nel tuo browser per visualizzare la home page
2. Naviga tra le pagine usando i link di navigazione
3. Tutti i file CSS e JavaScript sono già collegati correttamente

## Pagine disponibili

${project.pages.map(page => 
  `- **${page.name}** (${page.isHomePage ? 'index.html' : page.slug + '.html'}) - ${page.title}`
).join('\n')}

---

Creato con WebBuilder A2A - ${new Date(project.createdAt).toLocaleDateString('it-IT')}
Ultimo aggiornamento: ${new Date(project.updatedAt).toLocaleDateString('it-IT')}
Pagine totali: ${project.pages.length}
`
      
      zip.file('README.md', readme)
      
      // Add project metadata
      const metadata = {
        name: project.name,
        description: project.description,
        pages: project.pages.map(page => ({
          name: page.name,
          title: page.title,
          slug: page.slug,
          isHomePage: page.isHomePage
        })),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        version: '2.0.0', // Multi-page version
        generator: 'WebBuilder A2A'
      }
      
      zip.file('project.json', JSON.stringify(metadata, null, 2))
      
      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' })
      
      // Save file
      const fileName = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_multipage.zip`
      saveAs(content, fileName)
      
    } catch (error) {
      console.error('Export Error:', error)
      throw new Error('Errore durante l\'esportazione del progetto')
    }
  }

  // Export single page as standalone HTML
  static exportPageAsStandalone(project: Project, page: Page): void {
    try {
      const standaloneHtml = this.generateStandaloneHtml(project, page)
      const fileName = `${page.slug}_standalone.html`
      this.exportSingleFile(standaloneHtml, fileName, 'text/html')
    } catch (error) {
      console.error('Export Page Error:', error)
      throw new Error('Errore durante l\'esportazione della pagina')
    }
  }

  // Export single file
  static exportSingleFile(content: string, fileName: string, mimeType: string = 'text/plain'): void {
    try {
      const blob = new Blob([content], { type: mimeType })
      saveAs(blob, fileName)
    } catch (error) {
      console.error('Export Single File Error:', error)
      throw new Error('Errore durante l\'esportazione del file')
    }
  }

  // Import project from JSON (supports both legacy and multi-page)
  static async importProject(file: File): Promise<Partial<Project>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const projectData = JSON.parse(content)
          
          // Check if it's a multi-page project
          if (projectData.version === '2.0.0' || projectData.pages) {
            // Multi-page project
            if (!projectData.name || !projectData.pages || !Array.isArray(projectData.pages)) {
              throw new Error('File di progetto multi-pagina non valido')
            }
            
            resolve({
              name: projectData.name,
              description: projectData.description || '',
              pages: projectData.pages.map((page: any) => ({
                id: crypto.randomUUID(),
                name: page.name || 'Pagina',
                title: page.title || 'Pagina',
                slug: page.slug || 'pagina',
                html: page.html || '',
                css: page.css || '',
                javascript: page.javascript || '',
                isHomePage: page.isHomePage || false
              })),
              globalCss: projectData.globalCss || '',
              globalJs: projectData.globalJs || '',
              isPublished: false
            })
          } else {
            // Legacy single-page project
            if (!projectData.name || !projectData.html) {
              throw new Error('File di progetto non valido')
            }
            
            // Convert to multi-page format
            const homePage: Omit<Page, 'id'> = {
              name: 'Home',
              title: projectData.name || 'Home Page',
              slug: 'index',
              html: projectData.html || '',
              css: projectData.css || '',
              javascript: projectData.javascript || '',
              isHomePage: true
            }
            
            resolve({
              name: projectData.name,
              description: projectData.description || '',
              pages: [{ ...homePage, id: crypto.randomUUID() }],
              globalCss: '',
              globalJs: '',
              isPublished: false
            })
          }
          
        } catch (error) {
          reject(new Error('Errore nella lettura del file di progetto'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Errore nella lettura del file'))
      }
      
      reader.readAsText(file)
    })
  }

  // Import HTML file
  static async importHtmlFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const content = e.target?.result as string
        resolve(content)
      }
      
      reader.onerror = () => {
        reject(new Error('Errore nella lettura del file HTML'))
      }
      
      reader.readAsText(file)
    })
  }

  // Generate project as JSON for saving (multi-page format)
  static exportProjectAsJson(project: Project): string {
    const exportData = {
      name: project.name,
      description: project.description,
      pages: project.pages,
      globalCss: project.globalCss,
      globalJs: project.globalJs,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      version: '2.0.0',
      generator: 'WebBuilder A2A'
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  // Generate standalone HTML file for a specific page
  static generateStandaloneHtml(project: Project, page: Page): string {
    let processedHtml = page.html
    
    // Inject global CSS
    if (project.globalCss?.trim()) {
      const globalCssTag = `<style>\n/* Global CSS */\n${project.globalCss}\n</style>`
      
      if (processedHtml.includes('</head>')) {
        processedHtml = processedHtml.replace('</head>', `  ${globalCssTag}\n</head>`)
      } else {
        processedHtml = globalCssTag + '\n' + processedHtml
      }
    }
    
    // Inject page-specific CSS
    if (page.css?.trim()) {
      const pageCssTag = `<style>\n/* ${page.name} CSS */\n${page.css}\n</style>`
      
      if (processedHtml.includes('</head>')) {
        processedHtml = processedHtml.replace('</head>', `  ${pageCssTag}\n</head>`)
      } else {
        processedHtml = pageCssTag + '\n' + processedHtml
      }
    }
    
    // Replace CSS links with inline styles
    processedHtml = processedHtml.replace(
      /<link[^>]*href=['"]global\.css['"][^>]*>/gi,
      ''
    )
    processedHtml = processedHtml.replace(
      new RegExp(`<link[^>]*href=['"]${page.slug}\\.css['"][^>]*>`, 'gi'),
      ''
    )
    
    // Inject global JavaScript
    if (project.globalJs?.trim()) {
      const globalJsTag = `<script>\n/* Global JavaScript */\n${project.globalJs}\n</script>`
      
      if (processedHtml.includes('</body>')) {
        processedHtml = processedHtml.replace('</body>', `  ${globalJsTag}\n</body>`)
      } else {
        processedHtml = processedHtml + '\n' + globalJsTag
      }
    }
    
    // Inject page-specific JavaScript
    if (page.javascript?.trim()) {
      const pageJsTag = `<script>\n/* ${page.name} JavaScript */\n${page.javascript}\n</script>`
      
      if (processedHtml.includes('</body>')) {
        processedHtml = processedHtml.replace('</body>', `  ${pageJsTag}\n</body>`)
      } else {
        processedHtml = processedHtml + '\n' + pageJsTag
      }
    }
    
    // Replace script links with inline scripts
    processedHtml = processedHtml.replace(
      /<script[^>]*src=['"]global\.js['"][^>]*><\/script>/gi,
      ''
    )
    processedHtml = processedHtml.replace(
      new RegExp(`<script[^>]*src=['"]${page.slug}\\.js['"][^>]*><\\/script>`, 'gi'),
      ''
    )
    
    return processedHtml
  }

  // Legacy method for backward compatibility
  static generateStandaloneHtmlLegacy(project: any): string {
    // For legacy single-page projects
    const { html, css, javascript } = project
    
    let processedHtml = html
    
    // Replace external CSS link with inline styles
    if (css?.trim()) {
      const cssTag = `<style>\n${css}\n</style>`
      
      if (processedHtml.includes('<link') && processedHtml.includes('stylesheet')) {
        processedHtml = processedHtml.replace(
          /<link[^>]*rel=['"]stylesheet['"][^>]*>/gi,
          cssTag
        )
      } else {
        if (processedHtml.includes('</head>')) {
          processedHtml = processedHtml.replace('</head>', `  ${cssTag}\n</head>`)
        } else {
          processedHtml = cssTag + '\n' + processedHtml
        }
      }
    }
    
    // Replace external JS script with inline script
    if (javascript?.trim()) {
      const jsTag = `<script>\n${javascript}\n</script>`
      
      if (processedHtml.includes('<script') && processedHtml.includes('src=')) {
        processedHtml = processedHtml.replace(
          /<script[^>]*src=['"][^'"]*\.js['"][^>]*><\/script>/gi,
          jsTag
        )
      } else {
        if (processedHtml.includes('</body>')) {
          processedHtml = processedHtml.replace('</body>', `  ${jsTag}\n</body>`)
        } else {
          processedHtml = processedHtml + '\n' + jsTag
        }
      }
    }
    
    return processedHtml
  }

  // Validate file type
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => 
      file.type === type || file.name.toLowerCase().endsWith(type.split('/')[1])
    )
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
} 