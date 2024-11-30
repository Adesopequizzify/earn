"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Home, ListTodo, Trophy, Settings, Star, ExternalLink } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { RewardsModal } from './RewardsModal'
import { Leaderboard } from './Leaderboard'
import { Tasks } from './Tasks'
import { Rank } from './Rank'

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'rank', label: 'Rank', icon: Trophy },
]

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [showRewards, setShowRewards] = useState(false)
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

  const handleJoinCommunity = () => {
    window.open('https://t.me/your_telegram_community', '_blank')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
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

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {activeTab === 'home' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="border-primary/20 bg-background/60 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Image
                    src="/assets/logos/swhit-logo.png"
                    alt="SWHIT Logo"
                    width={64}
                    height={64}
                    className="mx-auto"
                  />
                  <h2 className="text-2xl font-bold text-primary">{userData?.swhit || 0} SWHIT</h2>
                  <p className="text-sm text-muted-foreground">
                    LEGEND <span className="text-yellow-500">★</span> RANK
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              onClick={handleJoinCommunity}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Join our community
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              onClick={() => setShowRewards(true)}
            >
              <Star className="mr-2 h-4 w-4" />
              Check your rewards
            </Button>

            <Leaderboard />
          </motion.div>
        )}

        {activeTab === 'tasks' && <Tasks />}
        {activeTab === 'rank' && <Rank />}
      </main>

      <nav className="sticky bottom-0 left-0 right-0 p-4 backdrop-blur-sm bg-background/60 border-t border-muted/20">
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
      </nav>

      <RewardsModal isOpen={showRewards} onClose={() => setShowRewards(false)} />
    </div>
  )
}

