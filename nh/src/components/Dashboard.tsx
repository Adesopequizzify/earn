"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Home, Wallet, ListTodo, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"

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
    <div className="flex flex-col min-h-screen bg-background/95">
      <header className="sticky top-0 z-50 backdrop-blur-sm border-b border-muted/20 bg-background/60">
        <div className="flex justify-between items-center p-4 max-w-4xl mx-auto w-full">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              {userData?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="font-medium text-primary">{userData?.username || 'User'}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => {}}>Profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={handleSignOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Card className="border-primary/20 bg-background/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2"
              >
                <h2 className="text-lg font-medium text-primary/80">Points Balance</h2>
                <p className="text-4xl font-bold text-primary">{userData?.points || 0}</p>
              </motion.div>
            </CardContent>
          </Card>

          <Card className="border-muted/20 bg-background/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-primary">
                {activeTab === 'home' && 'Home'}
                {activeTab === 'tasks' && 'Tasks'}
                {activeTab === 'wallet' && 'Wallet'}
              </h2>
              <p className="text-muted-foreground">
                {activeTab === 'home' && 'Welcome to your dashboard. Here\'s an overview of your activities.'}
                {activeTab === 'tasks' && 'No tasks available at the moment.'}
                {activeTab === 'wallet' && 'Your wallet is empty. Start earning points!'}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm bg-background/60 border-t border-muted/20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-muted/20 bg-background/60">
            <CardContent className="p-2">
              <div className="flex justify-around items-center">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                      activeTab === tab.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="text-xs font-medium mt-1">{tab.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

