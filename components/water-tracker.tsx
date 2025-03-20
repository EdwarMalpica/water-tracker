"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Droplet, Award, Settings2 } from "lucide-react"
import CupSelector from "./cup-selector"
import WaterHistory from "./water-history"
import CelebrationAnimation from "./celebration-animation"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"

// Cup sizes in ml
const CUP_SIZES = [
  { id: "small", name: "Small", amount: 100, icon: "🥤" },
  { id: "medium", name: "Medium", amount: 250, icon: "🥛" },
  { id: "large", name: "Large", amount: 500, icon: "🍶" },
  { id: "bottle", name: "Bottle", amount: 750, icon: "🧴" },
]

// Default daily goal in ml
const DEFAULT_GOAL = 2000

export default function WaterTracker() {
  const { toast } = useToast()
  const [selectedCupSize, setSelectedCupSize] = useState(CUP_SIZES[1])
  const [dailyGoal, setDailyGoal] = useLocalStorage("waterGoal", DEFAULT_GOAL)
  const [waterIntake, setWaterIntake] = useLocalStorage("waterIntake", [])
  const [showCelebration, setShowCelebration] = useState(false)
  const [activeTab, setActiveTab] = useState("tracker")

  // Calculate today's intake
  const today = new Date().toISOString().split("T")[0]
  const todayIntake = waterIntake
    .filter((entry) => entry.date === today)
    .reduce((total, entry) => total + entry.amount, 0)

  const percentComplete = Math.min(Math.round((todayIntake / dailyGoal) * 100), 100)

  // Add water intake
  const addWater = () => {
    const newEntry = {
      id: Date.now(),
      date: today,
      time: new Date().toLocaleTimeString(),
      amount: selectedCupSize.amount,
      cupType: selectedCupSize.id,
    }

    const newIntake = [...waterIntake, newEntry]
    setWaterIntake(newIntake)

    const newTodayIntake = todayIntake + selectedCupSize.amount

    // Show toast notification
    toast({
      title: `Added ${selectedCupSize.amount}ml of water`,
      description: `Total today: ${newTodayIntake}ml / ${dailyGoal}ml`,
    })

    // Check if goal reached for the first time
    if (todayIntake < dailyGoal && newTodayIntake >= dailyGoal) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    }
  }

  // Reset today's intake
  const resetToday = () => {
    const filteredIntake = waterIntake.filter((entry) => entry.date !== today)
    setWaterIntake(filteredIntake)
    toast({
      title: "Reset today's water intake",
      description: "Starting fresh!",
    })
  }

  return (
    <>
      {showCelebration && <CelebrationAnimation />}

      <Tabs defaultValue="tracker" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracker">
            <Droplet className="h-4 w-4 mr-2" />
            Tracker
          </TabsTrigger>
          <TabsTrigger value="history">
            <Award className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings2 className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracker">
          <Card>
            <CardHeader>
              <CardTitle>Daily Water Intake</CardTitle>
              <CardDescription>Track your hydration throughout the day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Progress: {todayIntake}ml / {dailyGoal}ml
                  </span>
                  <span>{percentComplete}%</span>
                </div>
                <Progress value={percentComplete} className="h-3" />
              </div>

              <div className="py-4">
                <h3 className="mb-3 text-sm font-medium">Select cup size:</h3>
                <CupSelector cupSizes={CUP_SIZES} selectedCup={selectedCupSize} onSelectCup={setSelectedCupSize} />
              </div>

              <Button className="w-full py-6 text-lg" onClick={addWater}>
                <Droplet className="mr-2 h-5 w-5" /> Add Water ({selectedCupSize.amount}ml)
              </Button>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={resetToday}>
                Reset Today
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <WaterHistory waterIntake={waterIntake} dailyGoal={dailyGoal} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Customize your water intake goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Daily Water Goal (ml):</label>
                <div className="flex gap-2">
                  {[1500, 2000, 2500, 3000].map((goal) => (
                    <Button
                      key={goal}
                      variant={dailyGoal === goal ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setDailyGoal(goal)}
                    >
                      {goal}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

