import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Project, GenerationProgress } from '@/types'

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  generationProgress: GenerationProgress
  
  // Actions
  createProject: (name: string, description?: string) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setCurrentProject: (project: Project | null) => void
  updateCurrentProjectCode: (html?: string, css?: string, javascript?: string) => void
  setGenerationProgress: (progress: GenerationProgress) => void
  exportProject: (project: Project) => void
  importProject: (projectData: any) => void
}

const defaultProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Nuovo Progetto',
  description: 'Un progetto creato con WebBuilder A2A',
  html: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Il Mio Sito Web</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Benvenuto nel mio sito web</h1>
        <p>Creato con WebBuilder A2A</p>
    </header>
    
    <main>
        <section>
            <h2>Chi siamo</h2>
            <p>Questo è un sito web generato con l'intelligenza artificiale.</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 - Realizzato con WebBuilder A2A</p>
    </footer>
    
    <script src="script.js"></script>
</body>
</html>`,
  css: `/* Stili CSS generati con WebBuilder A2A */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2rem;
    text-align: center;
    color: white;
    margin-bottom: 2rem;
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

main {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
}

section {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

h2 {
    color: #667eea;
    margin-bottom: 1rem;
}

footer {
    text-align: center;
    padding: 2rem;
    color: white;
    margin-top: 2rem;
}`,
  javascript: `// JavaScript generato con WebBuilder A2A
console.log('WebBuilder A2A - Sito web caricato con successo!');

// Animazione semplice per l'header
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            header.style.transition = 'all 0.8s ease';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Animazione per le sezioni
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 300 + (index * 200));
    });
});`,
  isPublished: false,
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
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
        
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
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
          }
        })
      },

      setCurrentProject: (project: Project | null) => {
        set({ currentProject: project })
      },

      updateCurrentProjectCode: (html?: string, css?: string, javascript?: string) => {
        const { currentProject } = get()
        if (!currentProject) return

        const updates: Partial<Project> = { updatedAt: new Date() }
        if (html !== undefined) updates.html = html
        if (css !== undefined) updates.css = css
        if (javascript !== undefined) updates.javascript = javascript

        get().updateProject(currentProject.id, updates)
      },

      setGenerationProgress: (progress: GenerationProgress) => {
        set({ generationProgress: progress })
      },

      exportProject: (project: Project) => {
        // This will be implemented in the component
      },

      importProject: (projectData: any) => {
        // This will be implemented in the component
      },
    }),
    {
      name: 'webbuilder-projects',
      version: 1,
    }
  )
) 