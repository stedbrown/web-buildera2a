import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Project, Page, GenerationProgress } from '@/types'

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  currentPageId: string | null
  generationProgress: GenerationProgress
  
  // Actions
  createProject: (name: string, description?: string) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setCurrentProject: (project: Project | null) => void
  setCurrentPage: (pageId: string | null) => void
  getCurrentPage: () => Page | null
  
  // Page management
  addPage: (projectId: string, page: Omit<Page, 'id'>) => void
  updatePage: (projectId: string, pageId: string, updates: Partial<Page>) => void
  deletePage: (projectId: string, pageId: string) => void
  duplicatePage: (projectId: string, pageId: string) => void
  
  // Legacy support for single-page projects
  updateCurrentProjectCode: (html?: string, css?: string, javascript?: string) => void
  setGenerationProgress: (progress: GenerationProgress) => void
  exportProject: (project: Project) => void
  importProject: (projectData: any) => void
}

const createDefaultHomePage = (): Page => ({
  id: crypto.randomUUID(),
  name: 'Home',
  title: 'Pagina Principale',
  slug: 'index',
  isHomePage: true,
  html: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Il Mio Sito Web</title>
    <link rel="stylesheet" href="global.css">
    <link rel="stylesheet" href="index.css">
</head>
<body>
    <nav>
        <div class="nav-container">
            <h1 class="logo">Il Mio Sito</h1>
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">Chi Siamo</a></li>
                <li><a href="contact.html">Contatti</a></li>
            </ul>
        </div>
    </nav>
    
    <header class="hero">
        <h1>Benvenuto nel mio sito web</h1>
        <p>Creato con WebBuilder A2A</p>
        <button class="cta-button">Scopri di più</button>
    </header>
    
    <main>
        <section class="intro">
            <h2>La nostra storia</h2>
            <p>Questo è un sito web generato con l'intelligenza artificiale utilizzando il protocollo A2A di Google.</p>
        </section>
        
        <section class="features">
            <h2>Le nostre caratteristiche</h2>
            <div class="features-grid">
                <div class="feature">
                    <h3>Moderno</h3>
                    <p>Design responsivo e moderno</p>
                </div>
                <div class="feature">
                    <h3>Veloce</h3>
                    <p>Caricamento rapido e ottimizzato</p>
                </div>
                <div class="feature">
                    <h3>Accessibile</h3>
                    <p>Conforme agli standard di accessibilità</p>
                </div>
            </div>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 - Realizzato con WebBuilder A2A</p>
    </footer>
    
    <script src="global.js"></script>
    <script src="index.js"></script>
</body>
</html>`,
  css: `/* Stili specifici per la home page */
.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
    padding: 4rem 2rem;
    margin-bottom: 2rem;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0;
    animation: fadeInUp 1s ease forwards;
}

.hero p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0;
    animation: fadeInUp 1s ease 0.3s forwards;
}

.cta-button {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid white;
    color: white;
    padding: 1rem 2rem;
    border-radius: 50px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    opacity: 0;
    animation: fadeInUp 1s ease 0.6s forwards;
}

.cta-button:hover {
    background: white;
    color: #667eea;
}

.intro {
    text-align: center;
    margin-bottom: 3rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.feature {
    text-align: center;
    padding: 2rem;
    border-radius: 10px;
    background: linear-gradient(145deg, #f0f0f0, #e6e6e6);
    box-shadow: 5px 5px 15px #d1d1d1, -5px -5px 15px #ffffff;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}`,
  javascript: `// JavaScript specifico per la home page
console.log('Home page caricata con successo!');

document.addEventListener('DOMContentLoaded', function() {
    // Animazione per le feature cards
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            feature.style.transition = 'all 0.6s ease';
            feature.style.opacity = '1';
            feature.style.transform = 'translateY(0)';
        }, 500 + (index * 200));
    });
    
    // Click sul CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            alert('Scopri di più cliccato! Aggiungi qui la tua logica.');
        });
    }
});`
})

const defaultProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Nuovo Progetto',
  description: 'Un progetto multi-pagina creato con WebBuilder A2A',
  pages: [createDefaultHomePage()],
  globalCss: `/* CSS Globale condiviso tra tutte le pagine */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
}

/* Navigation */
nav {
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
}

.logo {
    color: #667eea;
    font-size: 1.8rem;
    font-weight: bold;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-links a:hover {
    color: #667eea;
}

/* Main content */
main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 2rem;
}

section {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;
}

h2 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2rem;
}

h3 {
    color: #667eea;
    margin-bottom: 0.5rem;
}

/* Footer */
footer {
    background: #333;
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 3rem;
}

/* Responsive */
@media (max-width: 768px) {
    .nav-container {
        flex-direction: column;
        height: auto;
        padding: 1rem 2rem;
    }
    
    .nav-links {
        margin-top: 1rem;
        gap: 1rem;
    }
    
    main {
        padding: 0 1rem 2rem;
    }
    
    section {
        padding: 1.5rem;
    }
}`,
  globalJs: `// JavaScript globale condiviso tra tutte le pagine
console.log('WebBuilder A2A - Sito multi-pagina caricato con successo!');

// Gestione navigazione attiva
document.addEventListener('DOMContentLoaded', function() {
    // Evidenzia il link attivo nella navigazione
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.style.color = '#667eea';
            link.style.borderBottom = '2px solid #667eea';
        }
    });
    
    // Smooth scroll per i link interni
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});`,
  isPublished: false,
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      currentPageId: null,
      generationProgress: {
        step: 'idle',
        message: '',
        progress: 0,
      },

      createProject: (name: string, description?: string) => {
        const newProject: Project = {
          ...defaultProject,
          id: crypto.randomUUID(),
          name,
          description: description || defaultProject.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        // Set the first page as current
        const firstPageId = newProject.pages[0]?.id || null
        
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
          currentPageId: firstPageId,
        }))
      },

      updateProject: (id: string, updates: Partial<Project>) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          ),
        }))
        
        const { currentProject } = get()
        if (currentProject?.id === id) {
          set({ currentProject: { ...currentProject, ...updates, updatedAt: new Date() } })
        }
      },

      deleteProject: (id: string) => {
        set((state) => {
          const filteredProjects = state.projects.filter((p) => p.id !== id)
          return {
            projects: filteredProjects,
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
            currentPageId: state.currentProject?.id === id ? null : state.currentPageId,
          }
        })
      },

      setCurrentProject: (project: Project | null) => {
        const firstPageId = project?.pages[0]?.id || null
        set({ 
          currentProject: project,
          currentPageId: firstPageId
        })
      },

      setCurrentPage: (pageId: string | null) => {
        set({ currentPageId: pageId })
      },

      getCurrentPage: () => {
        const { currentProject, currentPageId } = get()
        if (!currentProject || !currentPageId) return null
        return currentProject.pages.find(page => page.id === currentPageId) || null
      },

      addPage: (projectId: string, pageData: Omit<Page, 'id'>) => {
        const newPage: Page = {
          ...pageData,
          id: crypto.randomUUID(),
        }
        
        set((state) => {
          const updatedProjects = state.projects.map((project) =>
            project.id === projectId
              ? { 
                  ...project, 
                  pages: [...project.pages, newPage],
                  updatedAt: new Date() 
                }
              : project
          )
          
          const updatedCurrentProject = state.currentProject?.id === projectId
            ? { 
                ...state.currentProject, 
                pages: [...state.currentProject.pages, newPage],
                updatedAt: new Date()
              }
            : state.currentProject
          
          return {
            projects: updatedProjects,
            currentProject: updatedCurrentProject,
            currentPageId: newPage.id, // Switch to the new page
          }
        })
      },

      updatePage: (projectId: string, pageId: string, updates: Partial<Page>) => {
        set((state) => {
          const updatedProjects = state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  pages: project.pages.map((page) =>
                    page.id === pageId ? { ...page, ...updates } : page
                  ),
                  updatedAt: new Date(),
                }
              : project
          )
          
          const updatedCurrentProject = state.currentProject?.id === projectId
            ? {
                ...state.currentProject,
                pages: state.currentProject.pages.map((page) =>
                  page.id === pageId ? { ...page, ...updates } : page
                ),
                updatedAt: new Date(),
              }
            : state.currentProject
          
          return {
            projects: updatedProjects,
            currentProject: updatedCurrentProject,
          }
        })
      },

      deletePage: (projectId: string, pageId: string) => {
        set((state) => {
          const project = state.projects.find(p => p.id === projectId)
          if (!project || project.pages.length <= 1) return state // Cannot delete the last page
          
          const remainingPages = project.pages.filter(page => page.id !== pageId)
          const newCurrentPageId = state.currentPageId === pageId 
            ? remainingPages[0]?.id || null 
            : state.currentPageId
          
          const updatedProjects = state.projects.map((p) =>
            p.id === projectId
              ? { ...p, pages: remainingPages, updatedAt: new Date() }
              : p
          )
          
          const updatedCurrentProject = state.currentProject?.id === projectId
            ? { ...state.currentProject, pages: remainingPages, updatedAt: new Date() }
            : state.currentProject
          
          return {
            projects: updatedProjects,
            currentProject: updatedCurrentProject,
            currentPageId: newCurrentPageId,
          }
        })
      },

      duplicatePage: (projectId: string, pageId: string) => {
        const { projects } = get()
        const project = projects.find(p => p.id === projectId)
        const page = project?.pages.find(p => p.id === pageId)
        
        if (!page) return
        
        const duplicatedPage: Page = {
          ...page,
          id: crypto.randomUUID(),
          name: `${page.name} (Copia)`,
          title: `${page.title} (Copia)`,
          slug: `${page.slug}-copy`,
          isHomePage: false, // Copies cannot be home pages
        }
        
        get().addPage(projectId, duplicatedPage)
      },

      // Legacy support for single-page projects
      updateCurrentProjectCode: (html?: string, css?: string, javascript?: string) => {
        const { currentProject, currentPageId } = get()
        if (!currentProject || !currentPageId) return

        const updates: Partial<Page> = {}
        if (html !== undefined) updates.html = html
        if (css !== undefined) updates.css = css
        if (javascript !== undefined) updates.javascript = javascript

        get().updatePage(currentProject.id, currentPageId, updates)
      },

      setGenerationProgress: (progress: GenerationProgress) => {
        set({ generationProgress: progress })
      },

      exportProject: (project: Project) => {
        // Export multi-page project
        const exportData = {
          ...project,
          version: '2.0', // Multi-page version
          exportedAt: new Date().toISOString(),
        }
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_multipage.json`
        link.click()
        URL.revokeObjectURL(url)
      },

      importProject: (projectData: any) => {
        try {
          // Handle both single-page (legacy) and multi-page projects
          if (projectData.version === '2.0' || projectData.pages) {
            // Multi-page project
            const importedProject: Project = {
              ...projectData,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
              // Ensure pages have unique IDs
              pages: projectData.pages.map((page: any) => ({
                ...page,
                id: crypto.randomUUID(),
              })),
            }
            
            const firstPageId = importedProject.pages[0]?.id || null
            
            set((state) => ({
              projects: [...state.projects, importedProject],
              currentProject: importedProject,
              currentPageId: firstPageId,
            }))
          } else {
            // Legacy single-page project - convert to multi-page
            const homePage: Page = {
              id: crypto.randomUUID(),
              name: 'Home',
              title: projectData.name || 'Home Page',
              slug: 'index',
              isHomePage: true,
              html: projectData.html || '',
              css: projectData.css || '',
              javascript: projectData.javascript || '',
            }
            
            const convertedProject: Project = {
              id: crypto.randomUUID(),
              name: projectData.name || 'Progetto Importato',
              description: projectData.description || 'Progetto convertito da versione singola pagina',
              pages: [homePage],
              globalCss: defaultProject.globalCss,
              globalJs: defaultProject.globalJs,
              createdAt: new Date(),
              updatedAt: new Date(),
              isPublished: projectData.isPublished || false,
            }
            
            set((state) => ({
              projects: [...state.projects, convertedProject],
              currentProject: convertedProject,
              currentPageId: homePage.id,
            }))
          }
        } catch (error) {
          console.error('Error importing project:', error)
          throw new Error('Formato del file di progetto non valido')
        }
      },
    }),
    {
      name: 'webbuilder-projects',
      version: 2, // Increment version for migration
    }
  )
) 