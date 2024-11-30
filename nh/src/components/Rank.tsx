import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ranks = [
  { name: "Novice", threshold: 0 },
  { name: "Apprentice", threshold: 1000 },
  { name: "Adept", threshold: 5000 },
  { name: "Expert", threshold: 10000 },
  { name: "Master", threshold: 50000 },
]

export function Rank() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SWHIT Ranks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ranks.map((rank, index) => (
            <div key={rank.name} className="flex items-center justify-between">
              <span>{rank.name}</span>
              <span>{rank.threshold.toLocaleString()} SWHIT</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

