"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Image from 'next/image'
import { Medal } from 'lucide-react'

interface LeaderboardUser {
  username: string
  points: number
  avatar?: string
}

export function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Get total users count
        const usersSnapshot = await getDocs(collection(db, 'users'))
        setTotalUsers(usersSnapshot.size)

        // Get top users
        const leaderboardQuery = query(
          collection(db, 'users'),
          orderBy('points', 'desc'),
          limit(10)
        )
        const leaderboardSnapshot = await getDocs(leaderboardQuery)
        const leaderboardData = leaderboardSnapshot.docs.map(doc => ({
          username: doc.data().username,
          points: doc.data().points,
          avatar: doc.data().avatar
        }))
        setLeaderboardData(leaderboardData)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      }
    }

    fetchLeaderboard()
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0: return 'text-yellow-500' // Gold
      case 1: return 'text-gray-300'   // Silver
      case 2: return 'text-amber-600'  // Bronze
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-4 bg-black/95 p-4 rounded-xl">
      {/* Total Users */}
      <div className="flex justify-between items-center text-white/90 px-2">
        <span className="text-xl">Total</span>
        <span className="text-xl">{formatNumber(totalUsers)} users</span>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboardData.map((user, index) => (
          <div
            key={user.username}
            className="flex items-center justify-between bg-black/40 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.username}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-6 h-6">🐾</div>
                )}
              </div>
              <div>
                <div className="text-white font-medium">{user.username}</div>
                <div className="text-white/60 text-sm">
                  {formatNumber(user.points)} PAWS
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {index < 3 ? (
                <Medal className={`w-6 h-6 ${getMedalColor(index)}`} />
              ) : (
                <span className="text-white/60">#{index + 1}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
