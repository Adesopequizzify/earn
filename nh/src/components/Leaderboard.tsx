"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from 'lucide-react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface LeaderboardUser {
  username: string
  points: number
  rank: string
}

export function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const usersRef = collection(db, 'users')
      const leaderboardQuery = query(usersRef, orderBy('points', 'desc'), limit(10))
      const leaderboardSnapshot = await getDocs(leaderboardQuery)
      const leaderboardData = leaderboardSnapshot.docs.map(doc => ({
        username: doc.data().username,
        points: doc.data().points,
        rank: doc.data().rank
      }))
      setLeaderboardData(leaderboardData)
    }

    fetchLeaderboard()
  }, [])

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
                <div className="text-right">
                  <span className="block">{user.points.toLocaleString()} SWHIT</span>
                  <span className="text-sm text-muted-foreground">{user.rank}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

