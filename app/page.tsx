"use client"

import { useState } from 'react'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { MainContent } from '@/components/main-content'
import { useProjectStore } from '@/hooks/use-project-store'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { currentProject } = useProjectStore()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          project={currentProject}
        />
        <MainContent />
      </div>
    </div>
  )
} 