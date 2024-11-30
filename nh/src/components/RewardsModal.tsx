import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface RewardsModalProps {
  isOpen: boolean
  onClose: () => void
}

const rewardsData = [
  { icon: "/assets/icons/quest.png", description: "Quest reward", amount: 1000, date: "November 03 at 18:16" },
  { icon: "/assets/icons/quest.png", description: "Quest reward", amount: 2000, date: "November 01 at 23:07" },
  { icon: "/assets/icons/quest.png", description: "Quest reward", amount: 2000, date: "October 29 at 16:02" },
]

export function RewardsModal({ isOpen, onClose }: RewardsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your Rewards</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          {rewardsData.length === 0 ? (
            <p className="text-center text-muted-foreground">No rewards available</p>
          ) : (
            rewardsData.map((reward, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-2">
                  <img src={reward.icon} alt="Quest" className="w-6 h-6" />
                  <div>
                    <p>{reward.description}</p>
                    <p className="text-sm text-muted-foreground">{reward.date}</p>
                  </div>
                </div>
                <span className="text-green-500">+{reward.amount} SWHIT</span>
              </div>
            ))
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

