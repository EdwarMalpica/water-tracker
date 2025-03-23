"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Droplet, Home, History, Trash2 } from "lucide-react"
import CupSelector from "./cup-selector"
import WaterHistory from "./water-history"
import CelebrationAnimation from "./celebration-animation"
import WaterVisualization from "./water-visualization"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Cup sizes in ml
const CUP_SIZES = [
  { id: "small", name: "Small", amount: 100, icon: "🥤" },
  { id: "medium", name: "Medium", amount: 250, icon: "🥛" },
  { id: "large", name: "Large", amount: 500, icon: "🍶" },
  { id: "bottle", name: "Bottle", amount: 750, icon: "🧴" },
]

// Default daily goal in ml
const DEFAULT_GOAL = 2000

interface WaterEntry {
  id: number
  date: string
  time: string
  amount: number
  cupType: string
}

export default function WaterTracker() {
  const { toast } = useToast()
  const [selectedCupSize, setSelectedCupSize] = useState(CUP_SIZES[1])
  const [dailyGoal, setDailyGoal] = useLocalStorage("waterGoal", DEFAULT_GOAL)
  const [waterIntake, setWaterIntake] = useLocalStorage<WaterEntry[]>("waterIntake", [])
  const [showCelebration, setShowCelebration] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [entryToDelete, setEntryToDelete] = useState<WaterEntry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Calculate today's intake
  const today = new Date().toISOString().split("T")[0]
  const todayIntake = waterIntake
    .filter((entry) => entry.date === today)
    .reduce((total, entry) => total + entry.amount, 0)

  const percentComplete = Math.min(Math.round((todayIntake / dailyGoal) * 100), 100)

  // Add water intake
  const addWater = (amount = selectedCupSize.amount, cupType = selectedCupSize.id) => {
    // Check if adding this amount would exceed the goal
    if (todayIntake >= dailyGoal) {
      toast({
        title: "Daily goal already reached",
        description: "You've already reached your water intake goal for today!",
      })
      return
    }

    const newEntry = {
      id: Date.now(),
      date: today,
      time: new Date().toLocaleTimeString(),
      amount: amount,
      cupType: cupType,
    }

    const newIntake = [...waterIntake, newEntry]
    setWaterIntake(newIntake)

    const newTodayIntake = todayIntake + amount

    // Check if goal reached for the first time
    if (todayIntake < dailyGoal && newTodayIntake >= dailyGoal) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    }
  }

  // Confirm delete
  const confirmDelete = (entry: WaterEntry) => {
    setEntryToDelete(entry)
    setIsDeleteDialogOpen(true)
  }

  // Delete water intake entry
  const deleteEntry = () => {
    if (!entryToDelete) return

    const deletedEntry = { ...entryToDelete }

    // Remove the entry from waterIntake
    const updatedIntake = waterIntake.filter((entry) => entry.id !== deletedEntry.id)
    setWaterIntake(updatedIntake)

    // Close dialog
    setIsDeleteDialogOpen(false)

    // Show toast with undo option
    toast({
      title: "Entry deleted",
      description: `Removed ${deletedEntry.amount}ml from your history.`,
      action: (
        <Button variant="outline" size="sm" onClick={() => undoDelete(deletedEntry)}>
          Undo
        </Button>
      ),
    })
  }

  // Undo delete
  const undoDelete = (entry: WaterEntry) => {
    // Add the entry back to waterIntake
    setWaterIntake((prev) => [...prev, entry])

    toast({
      title: "Entry restored",
      description: `Added ${entry.amount}ml back to your history.`,
    })
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

  // Get recent entries
  const recentEntries = waterIntake
    .filter((entry) => entry.date === today)
    .sort((a, b) => b.id - a.id)
    .slice(0, 5)

  return (
    <>
      {showCelebration && <CelebrationAnimation />}

      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-blue-700">Water Tracker</h1>
            <p className="text-sm text-gray-600">Stay hydrated, stay healthy</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "dashboard" ? "text-white" : "text-gray-800"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "history" ? "text-white" : "text-gray-800"}`}
              onClick={() => setActiveTab("history")}
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="p-6 max-w-6xl mx-auto">
            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <Card className="col-span-2 bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle>Today's Progress</CardTitle>
                      <CardDescription>
                        {percentComplete === 100
                          ? "Congratulations! You've reached your daily goal."
                          : `${percentComplete}% of your daily goal completed`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                        <div className="mx-auto lg:mx-0">
                          <WaterVisualization
                            percentage={percentComplete}
                            currentAmount={todayIntake}
                            goalAmount={dailyGoal}
                          />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>
                                Progress: {todayIntake}ml / {dailyGoal}ml
                              </span>
                              <span>{percentComplete}%</span>
                            </div>
                            <Progress value={percentComplete} className="h-3" />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 py-2"
                              onClick={() => addWater()}
                              disabled={percentComplete >= 100}
                            >
                              <Droplet className="mr-1 h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{percentComplete >= 100 ? "Goal Reached" : "Add Water"}</span>
                            </Button>
                            <Button variant="outline" className="flex-1 py-2" onClick={resetToday}>
                              <span className="truncate">Reset Today</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Daily Goal</CardTitle>
                      <CardDescription>Your target water intake</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-4xl font-bold text-center text-blue-500">{dailyGoal}ml</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[1500, 2000, 2500, 3000].map((goal) => (
                          <Button
                            key={goal}
                            variant={dailyGoal === goal ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDailyGoal(goal)}
                          >
                            {goal}ml
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <Card className="col-span-2 bg-white">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Your latest water intake entries</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recentEntries.length > 0 ? (
                        <div className="space-y-2">
                          {recentEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center p-2 rounded-md hover:bg-gray-50">
                              <div className="text-2xl mr-3">
                                {CUP_SIZES.find((cup) => cup.id === entry.cupType)?.icon || "🥤"}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{entry.amount}ml of water</div>
                                <div className="text-sm text-gray-500">{entry.time}</div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-red-500"
                                onClick={() => confirmDelete(entry)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete entry</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          No water intake recorded today. Start drinking!
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Cup Selection</CardTitle>
                      <CardDescription>Choose your preferred cup size</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {CUP_SIZES.map((cup) => (
                          <Button
                            key={cup.id}
                            variant={selectedCupSize.id === cup.id ? "default" : "outline"}
                            className="flex flex-col h-auto py-3"
                            onClick={() => setSelectedCupSize(cup)}
                          >
                            <span className="text-2xl mb-1">{cup.icon}</span>
                            <span className="text-sm">{cup.name}</span>
                            <span className="text-sm font-bold">{cup.amount}ml</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Tracker */}
            {activeTab === "tracker" && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Add Water Intake</CardTitle>
                  <CardDescription>Track your hydration throughout the day</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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

                  <Button className="w-full py-6 text-lg" onClick={() => addWater()} disabled={percentComplete >= 100}>
                    <Droplet className="mr-2 h-5 w-5" />
                    {percentComplete >= 100 ? "Goal Reached" : `Add Water (${selectedCupSize.amount}ml)`}
                  </Button>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button variant="outline" className="w-full" onClick={resetToday}>
                    Reset Today
                  </Button>

                  <div className="w-full space-y-2">
                    <h3 className="text-sm font-medium">Daily Water Goal (ml):</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {[1500, 2000, 2500, 3000].map((goal) => (
                        <Button
                          key={goal}
                          variant={dailyGoal === goal ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDailyGoal(goal)}
                        >
                          {goal}ml
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            )}

            {/* History */}
            {activeTab === "history" && (
              <WaterHistory waterIntake={waterIntake} dailyGoal={dailyGoal} onDeleteEntry={confirmDelete} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen p-4 bg-white">
        <h1 className="text-2xl font-bold text-center mb-4 text-blue-700">Water Tracker</h1>

        <Tabs
          defaultValue="dashboard"
          value={activeTab === "dashboard" ? "tracker" : activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card className="bg-white">
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

                <Button className="w-full py-6 text-lg" onClick={() => addWater()} disabled={percentComplete >= 100}>
                  <Droplet className="mr-2 h-5 w-5" />
                  {percentComplete >= 100 ? "Goal Reached" : `Add Water (${selectedCupSize.amount}ml)`}
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button variant="outline" className="w-full" onClick={resetToday}>
                  Reset Today
                </Button>

                <div className="w-full space-y-2">
                  <h3 className="text-sm font-medium">Daily Water Goal (ml):</h3>
                  <div className="flex gap-2">
                    {[1500, 2000, 2500, 3000].map((goal) => (
                      <Button
                        key={goal}
                        variant={dailyGoal === goal ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setDailyGoal(goal)}
                      >
                        {goal}ml
                      </Button>
                    ))}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <WaterHistory waterIntake={waterIntake} dailyGoal={dailyGoal} onDeleteEntry={confirmDelete} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Water Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry of {entryToDelete?.amount}ml?
              {entryToDelete?.date === today && " This will also update your current daily progress."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteEntry} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

