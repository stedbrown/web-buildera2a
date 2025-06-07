import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Project } from '@/types'

export class FileUtils {
  // Export project as ZIP file
  static async exportProject(project: Project): Promise<void> {
    try {
      const zip = new JSZip()
      
      // Add HTML file
      zip.file('index.html', project.html)
      
      // Add CSS file
      zip.file('style.css', project.css)
      
      // Add JavaScript file  
      zip.file('script.js', project.javascript)
      
      // Add README
      const readme = `# ${project.name}

${project.description || 'Progetto creato con WebBuilder A2A'}

## Come usare

1. Apri \`index.html\` nel tuo browser
2. I file CSS e JavaScript sono già collegati

## File inclusi

- \`index.html\` - Struttura della pagina
- \`style.css\` - Stili CSS
- \`script.js\` - Codice JavaScript

---

Creato con WebBuilder A2A - ${new Date(project.createdAt).toLocaleDateString('it-IT')}
Ultimo aggiornamento: ${new Date(project.updatedAt).toLocaleDateString('it-IT')}
`
      
      zip.file('README.md', readme)
      
      // Add project metadata
      const metadata = {
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        version: '1.0.0',
        generator: 'WebBuilder A2A'
      }
      
      zip.file('project.json', JSON.stringify(metadata, null, 2))
      
      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' })
      
      // Save file
      const fileName = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`
      saveAs(content, fileName)
      
    } catch (error) {
      console.error('Export Error:', error)
      throw new Error('Errore durante l\'esportazione del progetto')
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

  // Import project from JSON
  static async importProject(file: File): Promise<Partial<Project>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const projectData = JSON.parse(content)
          
          // Validate required fields
          if (!projectData.name || !projectData.html) {
            throw new Error('File di progetto non valido')
          }
          
          // Return project data
          resolve({
            name: projectData.name,
            description: projectData.description || '',
            html: projectData.html || '',
            css: projectData.css || '',
            javascript: projectData.javascript || '',
            isPublished: false
          })
          
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

  // Generate project as JSON for saving
  static exportProjectAsJson(project: Project): string {
    const exportData = {
      name: project.name,
      description: project.description,
      html: project.html,
      css: project.css,
      javascript: project.javascript,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      version: '1.0.0',
      generator: 'WebBuilder A2A'
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  // Generate standalone HTML file
  static generateStandaloneHtml(project: Project): string {
    const { html, css, javascript } = project
    
    // Parse the HTML to inject CSS and JS
    let processedHtml = html
    
    // Replace external CSS link with inline styles
    if (css.trim()) {
      const cssTag = `<style>\n${css}\n</style>`
      
      // Try to replace existing link tag
      if (processedHtml.includes('<link') && processedHtml.includes('stylesheet')) {
        processedHtml = processedHtml.replace(
          /<link[^>]*rel=['"]stylesheet['"][^>]*>/gi,
          cssTag
        )
      } else {
        // Insert before </head> or at the beginning
        if (processedHtml.includes('</head>')) {
          processedHtml = processedHtml.replace('</head>', `  ${cssTag}\n</head>`)
        } else {
          processedHtml = cssTag + '\n' + processedHtml
        }
      }
    }
    
    // Replace external JS script with inline script
    if (javascript.trim()) {
      const jsTag = `<script>\n${javascript}\n</script>`
      
      // Try to replace existing script tag
      if (processedHtml.includes('<script') && processedHtml.includes('src=')) {
        processedHtml = processedHtml.replace(
          /<script[^>]*src=['"][^'"]*\.js['"][^>]*><\/script>/gi,
          jsTag
        )
      } else {
        // Insert before </body> or at the end
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