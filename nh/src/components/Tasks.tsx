"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { collection, query, where, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Loader2, Check, Zap, Trophy, Users, Rocket, Activity, Target, Bookmark, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  name: string
  reward: number
  icon: string
  type: 'limited' | 'in-game' | 'partners'
  link?: string
  completed?: boolean
}

type TaskStatus = 'idle' | 'checking' | 'claiming' | 'completed'

const iconMap: { [key: string]: React.ElementType } = {
  'zap': Zap,
  'trophy': Trophy,
  'users': Users,
  'rocket': Rocket,
  'activity': Activity,
  'target': Target,
  'bookmark': Bookmark,
  'star': Star,
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskStatus, setTaskStatus] = useState<Record<string, TaskStatus>>({})
  const { user, userData } = useAuth()

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksRef = collection(db, 'tasks')
        const tasksQuery = query(tasksRef, where('active', '==', true))
        const tasksSnapshot = await getDocs(tasksQuery)
        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          completed: userData?.completedTasks?.includes(doc.id)
        } as Task))
        setTasks(tasksData)
        
        const initialStatuses: Record<string, TaskStatus> = {}
        tasksData.forEach(task => {
          initialStatuses[task.id] = task.completed ? 'completed' : 'idle'
        })
        setTaskStatus(initialStatuses)
      } catch (error) {
        console.error('Error fetching tasks:', error)
      }
    }

    if (userData) {
      fetchTasks()
    }
  }, [userData])

  const handleTaskAction = async (task: Task) => {
    if (!user || taskStatus[task.id] === 'completed') return

    if (taskStatus[task.id] === 'idle') {
      if (task.link) {
        window.open(task.link, '_blank')
      }
      setTaskStatus(prev => ({ ...prev, [task.id]: 'checking' }))
      
      setTimeout(() => {
        setTaskStatus(prev => ({ ...prev, [task.id]: 'claiming' }))
      }, 5000)
    } else if (taskStatus[task.id] === 'claiming') {
      try {
        const userRef = doc(db, 'users', user.uid)
        await updateDoc(userRef, {
          points: (userData?.points || 0) + task.reward,
          completedTasks: [...(userData?.completedTasks || []), task.id]
        })

        const rewardRef = doc(collection(db, 'rewards'))
        await setDoc(rewardRef, {
          userId: user.uid,
          taskId: task.id,
          amount: task.reward,
          description: `Completed: ${task.name}`,
          date: new Date().toISOString()
        })

        setTaskStatus(prev => ({ ...prev, [task.id]: 'completed' }))
      } catch (error) {
        console.error('Error claiming reward:', error)
      }
    }
  }

  const getTaskButton = (task: Task) => {
    const status = taskStatus[task.id]
    
    if (status === 'completed') {
      return <Check className="w-5 h-5 text-green-500" />
    }
    
    if (status === 'checking') {
      return (
        <button
          className="px-4 py-1.5 rounded-full bg-blue-500 text-white flex items-center gap-2"
          disabled
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking
        </button>
      )
    }
    
    if (status === 'claiming') {
      return (
        <button
          onClick={() => handleTaskAction(task)}
          className="px-4 py-1.5 rounded-full bg-green-500 text-white"
        >
          Claim
        </button>
      )
    }
    
    return (
      <button
        onClick={() => handleTaskAction(task)}
        className="px-4 py-1.5 rounded-full bg-white text-black font-medium"
      >
        Start
      </button>
    )
  }

  return (
    <div className="bg-black/95 p-4 rounded-xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">TASKS</h1>
        <div>
          <span className="text-2xl font-light text-white">GET REWARDS </span>
          <span className="text-2xl font-light text-gray-500">FOR</span>
          <br />
          <span className="text-2xl font-light text-gray-500">COMPLETING QUESTS</span>
        </div>
      </div>

      <Tabs defaultValue="in-game">
        <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-white/10 mb-4">
          <TabsTrigger 
            value="limited"
            className={cn(
              "data-[state=active]:bg-white data-[state=active]:text-black rounded-full",
              "text-white/60"
            )}
          >
            Limited
          </TabsTrigger>
          <TabsTrigger 
            value="in-game"
            className={cn(
              "data-[state=active]:bg-white data-[state=active]:text-black rounded-full",
              "text-white/60"
            )}
          >
            In-game
            <span className="ml-1 text-xs bg-white/10 px-2 rounded-full">
              {tasks.filter(t => t.type === 'in-game' && !taskStatus[t.id]?.includes('completed')).length}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="partners"
            className={cn(
              "data-[state=active]:bg-white data-[state=active]:text-black rounded-full",
              "text-white/60"
            )}
          >
            Partners
          </TabsTrigger>
        </TabsList>

        {['limited', 'in-game', 'partners'].map(tabValue => (
          <TabsContent key={tabValue} value={tabValue}>
            <div className="space-y-4">
              {tasks
                .filter(task => task.type === tabValue)
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border-b border-white/10 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        taskStatus[task.id] === 'completed' ? 'bg-green-500/20' : 'bg-white/10'
                      )}>
                        {iconMap[task.icon] ? (
                          React.createElement(iconMap[task.icon], { className: "w-6 h-6 text-white" })
                        ) : (
                          <Zap className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">{task.name}</div>
                        <div className="text-white/60 text-sm">
                          +{task.reward.toLocaleString()} SWHIT
                        </div>
                      </div>
                    </div>
                    {getTaskButton(task)}
                  </div>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

