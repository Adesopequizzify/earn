"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { Share, Copy, Link } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { getReferralStats } from '@/lib/referralSystem'

export function Friends() {
  const { userData } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()
  const [referralStats, setReferralStats] = useState({ totalReferrals: 0, totalPoints: 0 })

  useEffect(() => {
    const fetchReferralStats = async () => {
      if (userData) {
        const stats = await getReferralStats(userData.telegramId)
        setReferralStats(stats)
      }
    }
    fetchReferralStats()
  }, [userData])

  const getReferralLink = () => {
    return `https://t.me/wheatsol_bot/app?startapp=${userData?.referralCode}`
  }

  const handleShare = () => {
    const referralLink = getReferralLink()
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join WheatChain and earn rewards! Use my referral link:')}`)
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    const referralLink = getReferralLink()
    navigator.clipboard.writeText(referralLink).then(() => {
      toast({
        title: "Link copied",
        description: "Referral link copied to clipboard!",
      })
    }, (err) => {
      console.error('Could not copy text: ', err)
      toast({
        title: "Error",
        description: "Failed to copy referral link",
        variant: "destructive",
      })
    })
  }

  const handleCopyCode = () => {
    if (userData?.referralCode) {
      navigator.clipboard.writeText(userData.referralCode).then(() => {
        toast({
          title: "Code copied",
          description: "Referral code copied to clipboard!",
        })
      }, (err) => {
        console.error('Could not copy text: ', err)
        toast({
          title: "Error",
          description: "Failed to copy referral code",
          variant: "destructive",
        })
      })
    } else {
      toast({
        title: "Error",
        description: "Referral code not available.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-background/60 backdrop-blur-sm border-muted/20">
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center text-primary">Invite Friends</h2>
            <p className="text-center text-muted-foreground">
              SHARE YOUR INVITATION CODE & GET 10% OF FRIEND'S POINTS
            </p>
            <div className="flex justify-center">
              <Image
                src="/assets/logos/main-logo.jpg"
                alt="WheatChain Logo"
                width={100}
                height={100}
                className="rounded-xl"
              />
            </div>
            <p className="text-center text-muted-foreground">
              There is nothing else. Invite to get more rewards.
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="w-full">
              Invite
            </Button>
            <div className="text-center">
              <p>Total Referrals: {referralStats.totalReferrals}</p>
              <p>Total Points Earned: {referralStats.totalPoints}</p>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Friends</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={handleShare} className="w-full flex items-center justify-start">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={handleCopyLink} className="w-full flex items-center justify-start">
              <Link className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button onClick={handleCopyCode} className="w-full flex items-center justify-start">
              <Copy className="mr-2 h-4 w-4" />
              Copy Referral Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

