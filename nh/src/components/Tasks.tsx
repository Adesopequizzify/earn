"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import * as Icons from 'lucide-react'

interface Task {
  id: string
  name: string
  reward: number
  icon: string
  type: 'limited' | 'in-game' | 'partners'
  link: string
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksRef = collection(db, 'tasks')
      const tasksQuery = query(tasksRef, where('active', '==', true))
      const tasksSnapshot = await getDocs(tasksQuery)
      const tasksData = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task))
      setTasks(tasksData)
    }

    fetchTasks()
  }, [])

  const renderIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons]
    return Icon ? <Icon className="w-6 h-6" /> : null
  }

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
                {tasks.filter(task => task.type === 'in-game').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
          </TabsList>
          {['limited','in-game', 'partners'].map(tabValue => (
            <TabsContent key={tabValue} value={tabValue} className="mt-4">
              {tasks.filter(task => task.type === tabValue).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {tabValue} tasks available at the moment
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.filter(task => task.type === tabValue).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {renderIcon(task.icon)}
                        </div>
                        <span>{task.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground">
                          +{task.reward.toLocaleString()} SWHIT
                        </span>
                        <Button size="sm" variant="secondary" onClick={() => window.open(task.link, '_blank')}>
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

