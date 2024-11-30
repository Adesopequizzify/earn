"use client"

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { Share, Copy } from 'lucide-react'
import { useToast } from './ui/use-toast'

export function Friends() {
  const { userData } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join WheatChain',
          text: 'Use my referral code to join WheatChain and earn rewards!',
          url: `https://swhit-g.vercel.app/signup?referral=${userData?.referralCode}`,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    const referralLink = `https://yourapp.com/signup?referral=${userData?.referralCode}`
    navigator.clipboard.writeText(referralLink).then(() => {
      toast({
        title: "Link copied",
        description: "Referral link copied to clipboard!",
      })
    }, (err) => {
      console.error('Could not copy text: ', err)
    })
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
              SHARE YOUR INVITATION LINK & GET 10% OF FRIEND'S POINTS
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
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

