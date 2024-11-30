import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

const leaderboardData = [
  { username: "elkanadi", swhit: 838496259, rank: 1 },
  { username: "BB9B9N", swhit: 152739901, rank: 2 },
  { username: "imGet", swhit: 151059137, rank: 3 },
  { username: "xaffizmedia", swhit: 117817858, rank: 4 },
  { username: "Q700k", swhit: 102658327, rank: 5 },
]

export function Leaderboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Leaderboard</span>
          <Image
            src="/assets/logos/trophy.png"
            alt="Trophy"
            width={24}
            height={24}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboardData.map((user, index) => (
            <div key={user.username} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Image
                  src="/assets/logos/paw-logo.png"
                  alt="SWHIT Logo"
                  width={24}
                  height={24}
                />
                <span>{user.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{user.swhit.toLocaleString()} SWHIT</span>
                {index < 3 && (
                  <Image
                    src={`/assets/icons/medal-${index + 1}.png`}
                    alt={`Rank ${index + 1}`}
                    width={16}
                    height={16}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

                
