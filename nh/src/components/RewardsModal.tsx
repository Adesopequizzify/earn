import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

interface RewardsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Reward {
  id: string
  description: string
  amount: number
  date: string
  type?: 'referral' | 'welcome' | 'task'
}

export function RewardsModal({ isOpen, onClose }: RewardsModalProps) {
  const [rewardsData, setRewardsData] = useState<Reward[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchRewards = async () => {
      if (user?.id) {
        setLoading(true)
        setError(null)
        try {
          const rewardsRef = collection(db, 'rewards')
          const rewardsQuery = query(
            rewardsRef,
            where('userId', '==', user.id.toString()),
            orderBy('date', 'desc'),
            limit(50)
          )

          const rewardsSnapshot = await getDocs(rewardsQuery)
          const rewards = rewardsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Reward))

          setRewardsData(rewards)
        } catch (error) {
          console.error("Error fetching rewards:", error)
          setError("Failed to load rewards. Please try again later.")
        } finally {
          setLoading(false)
        }
      }
    }

    if (isOpen) {
      fetchRewards()
    }
  }, [isOpen, user?.id])

  const getRewardIcon = (type?: string) => {
    switch (type) {
      case 'referral':
        return '👥'
      case 'welcome':
        return '🎉'
      case 'task':
        return '✅'
      default:
        return '💰'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Rewards History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : rewardsData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No rewards claimed yet. Start inviting friends to earn rewards!
            </div>
          ) : (
            <div className="space-y-4">
              {rewardsData.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between py-4 border-b last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getRewardIcon(reward.type)}</span>
                    <div>
                      <p className="font-medium">{reward.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(reward.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-green-500 font-semibold">+{reward.amount} SWHIT</span>
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

