"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Home, Wallet, ListTodo, LogOut, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
]

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const { toast } = useToast()
  const { userData } = useAuth()

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
      <header className="flex justify-between items-center p-4 bg-card">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {userData?.username?.[0].toUpperCase()}
          </div>
          <span className="font-medium">{userData?.username}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => {}}>Profile</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="flex-1 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Points Balance</h2>
            <p className="text-4xl font-bold text-primary">{userData?.points || 0}</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              {activeTab === 'home' && 'Home'}
              {activeTab === 'tasks' && 'Tasks'}
              {activeTab === 'wallet' && 'Wallet'}
            </h2>
            <p className="text-muted-foreground">
              {activeTab === 'home' && 'Welcome to your dashboard. Here's an overview of your activities.'}
              {activeTab === 'tasks' && 'No tasks available at the moment.'}
              {activeTab === 'wallet' && 'Your wallet is empty. Start earning points!'}
            </p>
          </div>
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

