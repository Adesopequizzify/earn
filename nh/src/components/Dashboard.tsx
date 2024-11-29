"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Home, Wallet, ListTodo, LogOut } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
]

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const { toast } = useToast()

  const handleSignOut = async () => {
  try {
    await signOut(auth)
    toast({
      title: "Signed out successfully",
      description: "See you next time!",
    })
  } catch (error) {
    toast({
      title: "Error signing out",
      description: error.message || "An unexpected error occurred.",
      variant: "destructive",
    })
  }
  }
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <h1 className="text-4xl font-bold text-primary">Welcome to NH</h1>
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              {activeTab === 'home' && 'Home'}
              {activeTab === 'tasks' && 'Tasks'}
              {activeTab === 'wallet' && 'Wallet'}
            </h2>
            <p className="text-muted-foreground">
              {activeTab === 'home' && 'This is your home page. You can see an overview of your activities here.'}
              {activeTab === 'tasks' && 'Manage your tasks and to-dos here.'}
              {activeTab === 'wallet' && 'Check your points balance and transaction history here.'}
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-around items-center bg-card rounded-full p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-3 rounded-full transition-colors ${
                  activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                <tab.icon className="w-6 h-6" />
                <span className="text-xs font-medium mt-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}

