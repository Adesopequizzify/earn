"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { useToast } from "@/hooks/use-toast"
import { Home, ListTodo, Trophy, Settings, Star, ExternalLink, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { RewardsModal } from './RewardsModal'
import { Tasks } from './Tasks'
import { Leaderboard } from './Leaderboard'
import { Friends } from './Friends'
import { collection, query, orderBy, limit, getDocs, DocumentData } from 'firebase/firestore'
import { closeTelegramWebApp } from '@/lib/telegram'

interface Banner extends DocumentData {
  id: string;
  imageUrl: string;
  createdAt: Date;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'friends', label: 'Friends', icon: Users },
]

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [showRewards, setShowRewards] = useState(false)
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const { toast } = useToast()
  const { user, userData, refreshUserData } = useAuth()

  useEffect(() => {
    const fetchBanners = async () => {
      const bannersRef = collection(db, 'banners')
      const bannersQuery = query(bannersRef, orderBy('createdAt', 'desc'), limit(5))
      const bannersSnapshot = await getDocs(bannersQuery)
      const bannersData = bannersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner))
      setBanners(bannersData)
    }

    fetchBanners()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners])

 
  const handleJoinCommunity = () => {
    window.open('https://t.me/swhit_tg', '_blank')
  }

  return (
   <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-sm border-b border-muted/20 bg-background/60">
        <div className="flex justify-between items-center p-4 max-w-4xl mx-auto w-full">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.first_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="font-medium text-primary">{user?.first_name || 'User'}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => {}}>Profile</DropdownMenuItem>
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
                    src="/assets/logos/swhit-logo.jpg"
                    alt="SWHIT Logo"
                    width={64}
                    height={64}
                    className="mx-auto"
                  />
                  <h2 className="text-2xl font-bold text-primary">{userData?.points || 0} SWHIT</h2>
                  <p className="text-sm text-muted-foreground">
                    {userData?.rank || 'NOVICE'} <span className="text-yellow-500">★</span> RANK
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-background/60 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                {banners.length > 0 ? (
                  <div className="relative h-40">
                    <Image
                      src={banners[currentBannerIndex].imageUrl}
                      alt="Banner"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-muted-foreground">
                    No banners available
                  </div>
                )}
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
          </motion.div>
        )}

        {activeTab === 'tasks' && <Tasks />}
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'friends' && <Friends />}
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

