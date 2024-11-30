"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageCircle, Twitter, Zap } from 'lucide-react'

// Empty tasks array - will be populated from Firestore later
const tasks: any[] = []

// Example task structure for reference
// const tasks = [
//   { id: 1, name: "Invite 10 friends", reward: 5000, icon: Users },
//   { id: 2, name: "Join Telegram", reward: 6000, icon: MessageCircle },
//   { id: 3, name: "Follow on Twitter", reward: 2500, icon: Twitter },
//   { id: 4, name: "Complete tutorial", reward: 250, icon: Zap },
// ]

export function Tasks() {
  return (
    <Card className="bg-background/60 backdrop-blur-sm border-muted/20">
      <CardHeader>
        <CardTitle className="text-2xl">
          TASKS
        </CardTitle>
        <p className="text-xl font-light text-muted-foreground">
          GET REWARDS FOR
          <br />
          COMPLETING QUESTS
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="in-game">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="limited">Limited</TabsTrigger>
            <TabsTrigger value="in-game">
              In-game
              <span className="ml-1 text-xs rounded-full bg-primary/10 px-2">
                {tasks.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
          </TabsList>
          <TabsContent value="in-game" className="mt-4">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks available at the moment
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => {
                  const Icon = task.icon
                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span>{task.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground">
                          +{task.reward.toLocaleString()} SWHIT
                        </span>
                        {task.completed ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <Button size="sm" variant="secondary">
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
          <TabsContent value="limited">
            <div className="text-center py-8 text-muted-foreground">
              No limited tasks available
            </div>
          </TabsContent>
          <TabsContent value="partners">
            <div className="text-center py-8 text-muted-foreground">
              No partner tasks available
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

