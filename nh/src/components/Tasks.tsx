import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tasks = [
  { id: 1, name: "Invite 10 friends", reward: 5000, icon: "/assets/icons/invite.png" },
  { id: 2, name: "Add SWHIT emoji", reward: 6000, icon: "/assets/icons/emoji.png" },
  { id: 3, name: "Boost SWHIT channel", reward: 2500, icon: "/assets/icons/boost.png" },
  { id: 4, name: "Study SWHIT", reward: 250, icon: "/assets/icons/study.png", completed: true },
]

export function Tasks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="in-game">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="limited">Limited</TabsTrigger>
            <TabsTrigger value="in-game">In-game</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
          </TabsList>
          <TabsContent value="in-game">
            <div className="space-y-4 mt-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img src={task.icon} alt={task.name} className="w-8 h-8" />
                    <span>{task.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>+{task.reward} SWHIT</span>
                    {task.completed ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <Button size="sm">Start</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

