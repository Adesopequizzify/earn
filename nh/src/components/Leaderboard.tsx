import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from 'lucide-react'

// Empty leaderboard array - will be populated from Firestore later
const leaderboardData: any[] = []

export function Leaderboard() {
  return (
    <Card className="border-muted/20 bg-background/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Leaderboard</span>
          <Trophy className="w-6 h-6" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboardData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No leaderboard data available
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboardData.map((user, index) => (
              <div key={user.username} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`text-lg ${index < 3 ? 'text-yellow-500' : ''}`}>
                    #{index + 1}
                  </span>
                  <span>{user.username}</span>
                </div>
                <span>{user.swhit.toLocaleString()} SWHIT</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

