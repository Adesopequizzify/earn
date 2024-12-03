"use client"

import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { Medal } from 'lucide-react'

interface LeaderboardUser {
  telegramId: string
  firstName: string
  lastName?: string
  username?: string
  points: number
  avatar?: string
}

export function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'))
        setTotalUsers(usersSnapshot.size)

        const leaderboardQuery = query(
          collection(db, 'users'),
          orderBy('points', 'desc'),
          limit(10)
        )
        const leaderboardSnapshot = await getDocs(leaderboardQuery)
        const leaderboardData = leaderboardSnapshot.docs.map(doc => ({
          telegramId: doc.id,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
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

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-500'
      case 1: return 'text-gray-300'
      case 2: return 'text-amber-600'
      default: return 'text-white/60'
    }
  }

  const getDisplayName = (user: LeaderboardUser) => {
    const fullName = `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`.trim()
    return fullName || user.username || 'Anonymous User'
  }

  return (
    <div className="space-y-4 bg-black/95 p-4 rounded-xl">
      <h1 className="text-4xl font-bold text-white mb-6">Leaderboard</h1>
      
      <div className="bg-black/40 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center text-white/90">
          <span className="text-xl">Total</span>
          <span className="text-xl">{formatNumber(totalUsers)} users</span>
        </div>
      </div>

      <div className="space-y-2">
        {leaderboardData.map((user, index) => (
          <div
            key={user.telegramId}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl",
              index === 0 ? "bg-[#423F1E]" : 
              index === 1 ? "bg-[#3A3A3A]" : 
              index === 2 ? "bg-[#3E2A21]" : 
              "bg-black/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${getDisplayName(user)}'s avatar`}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <img
                    src="/assets/logos/main.png"
                    alt="SWHIT Logo"
                    className="w-6 h-6"
                  />
                )}
              </div>
              <div>
                <div className="text-white font-medium">{getDisplayName(user)}</div>
                <div className="text-white/60 text-sm">
                  {formatNumber(user.points)} SWHIT
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

