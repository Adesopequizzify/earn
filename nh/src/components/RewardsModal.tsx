import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'

interface RewardsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Reward {
  id: string
  description: string
  amount: number
  date: string
}

export function RewardsModal({ isOpen, onClose }: RewardsModalProps) {
  const [rewardsData, setRewardsData] = useState<Reward[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchRewards = async () => {
      if (user) {
        const rewardsRef = collection(db, 'rewards')
        const rewardsQuery = query(
          rewardsRef,
          where('userId', '==', user.id),
          orderBy('date', 'desc'),
          limit(10)
        )
        const rewardsSnapshot = await getDocs(rewardsQuery)
        const rewardsData = rewardsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Reward))
        setRewardsData(rewardsData)
      }
    }

    if (isOpen) {
      fetchRewards()
    }
  }, [isOpen, user])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Rewards</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
          {rewardsData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No rewards claimed yet</div>
          ) : (
            <div className="space-y-4">
              {rewardsData.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between py-4 border-b last:border-b-0"
                >
                  <div>
                    <p>{reward.description}</p>
                    <p className="text-sm text-muted-foreground">{new Date(reward.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-green-500">+{reward.amount} SWHIT</span>
                    <span className="text-xs text-muted-foreground">Received</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

