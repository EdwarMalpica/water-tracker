"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplet, Trash2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface WaterEntry {
  id: number
  date: string
  time: string
  amount: number
  cupType: string
}

interface WaterHistoryProps {
  waterIntake: WaterEntry[]
  dailyGoal: number
  onDeleteEntry: (entry: WaterEntry) => void
}

export default function WaterHistory({ waterIntake, dailyGoal, onDeleteEntry }: WaterHistoryProps) {
  // Group entries by date
  const groupedByDate = useMemo(() => {
    const grouped = waterIntake.reduce(
      (acc, entry) => {
        if (!acc[entry.date]) {
          acc[entry.date] = {
            entries: [],
            total: 0,
          }
        }
        acc[entry.date].entries.push(entry)
        acc[entry.date].total += entry.amount
        return acc
      },
      {} as Record<string, { entries: WaterEntry[]; total: number }>,
    )

    // Sort dates in descending order
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(([date, data]) => ({
        date,
        entries: data.entries.sort((a, b) => b.id - a.id), // Sort entries by time (newest first)
        total: data.total,
        percentComplete: Math.min(Math.round((data.total / dailyGoal) * 100), 100),
      }))
  }, [waterIntake, dailyGoal])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  if (groupedByDate.length === 0) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Water History</CardTitle>
          <CardDescription>Your water intake history will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">No water intake recorded yet. Start drinking!</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Water History</CardTitle>
        <CardDescription>Your recent water intake</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {groupedByDate.map(({ date, entries, total, percentComplete }) => (
            <div key={date} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{formatDate(date)}</h3>
                  <div className="text-sm">
                    <span className="font-medium">{total}ml</span>
                    <span className="text-gray-500"> / {dailyGoal}ml</span>
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={percentComplete} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{percentComplete}% of daily goal</span>
                    <span>{entries.length} entries</span>
                  </div>
                </div>
              </div>

              <div className="divide-y">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center p-3 hover:bg-gray-50">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Droplet className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{entry.amount}ml of water</div>
                      <div className="text-sm text-gray-500">{entry.time}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => onDeleteEntry(entry)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete entry</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

