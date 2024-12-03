"use client"

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { Share, Copy, Link } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export function Friends() {
  const { userData } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const getReferralLink = () => {
    return `https://t.me/wheatsol_bot/app?startapp=${userData?.referralCode}`
  }

  const handleShare = () => {
    const referralLink = getReferralLink()
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join WheatChain and earn rewards! Use my referral link:')}`)
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    const referralLink = getReferralLink()
    if (window.Telegram?.WebApp?.readTextFromClipboard) {
      window.Telegram.WebApp.readTextFromClipboard(referralLink)
      toast({
        title: "Link copied",
        description: "Referral link copied to clipboard!",
      })
    } else {
      navigator.clipboard.writeText(referralLink).then(() => {
        toast({
          title: "Link copied",
          description: "Referral link copied to clipboard!",
        })
      }, (err) => {
        console.error('Could not copy text: ', err)
      })
    }
  }

  const handleCopyCode = () => {
    if (userData?.referralCode) {
      if (window.Telegram?.WebApp?.readTextFromClipboard) {
        window.Telegram.WebApp.readTextFromClipboard(userData.referralCode)
        toast({
          title: "Code copied",
          description: "Referral code copied to clipboard!",
        })
      } else {
        navigator.clipboard.writeText(userData.referralCode).then(() => {
          toast({
            title: "Code copied",
            description: "Referral code copied to clipboard!",
          })
        }, (err) => {
          console.error('Could not copy text: ', err)
        })
      }
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

