import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Assuming these imports exist
import { Trophy, Award, Medal, Shield, User } from "@/components/icons"; // Assuming these imports exist

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Empty rewards array - will be populated from Firestore later
const rewardsData: any[] = [];

export function RewardsModal({ isOpen, onClose }: RewardsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Rewards</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
          {rewardsData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No rewards claimed yet
            </div>
          ) : (
            <div className="space-y-4">
              {rewardsData.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 border-b last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">{reward.icon}</div>
                    <div>
                      <p>{reward.description}</p>
                      <p className="text-sm text-muted-foreground">{reward.date}</p>
                    </div>
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
        {rewardsData.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={onClose}>
              Show more
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function Rank() {
  return (
    <Card className="border-muted/20 bg-background/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>SWHIT Ranks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-card/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium">Legend</p>
                <p className="text-sm text-muted-foreground">50,000+ SWHIT</p>
              </div>
            </div>
            <div className="text-yellow-500">★★★★★</div>
          </div>

          {/* Repeat for other ranks */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-card/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium">Novice</p>
                <p className="text-sm text-muted-foreground">0+ SWHIT</p>
              </div>
            </div>
            <div className="text-yellow-500">★</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
          }
