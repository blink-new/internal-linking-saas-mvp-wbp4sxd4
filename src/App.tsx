import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Header } from '@/components/layout/Header'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProjectPage } from '@/pages/ProjectPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { Toaster } from '@/components/ui/toaster'
import { useLocation } from 'react-router-dom'

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen bg-background"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

const AppContent: React.FC = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <PageWrapper>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/project/:id" element={<ProjectPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </PageWrapper>
        </main>
      </div>
    </AuthGuard>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster />
      </Router>
    </AuthProvider>
  )
}

export default App