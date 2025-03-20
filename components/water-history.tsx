"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplet } from "lucide-react"
import { Progress } from "@/components/ui/progress"

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
}

export default function WaterHistory({ waterIntake, dailyGoal }: WaterHistoryProps) {
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
      <Card>
        <CardHeader>
          <CardTitle>Water History</CardTitle>
          <CardDescription>Your water intake history will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No water intake recorded yet. Start drinking!</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Water History</CardTitle>
        <CardDescription>Your recent water intake</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedByDate.map(({ date, entries, total, percentComplete }) => (
          <div key={date} className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{formatDate(date)}</h3>
              <span className="text-sm text-muted-foreground">
                {total}ml / {dailyGoal}ml
              </span>
            </div>

            <Progress value={percentComplete} className="h-2" />

            <div className="space-y-2 mt-2">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center text-sm">
                  <Droplet className="h-3 w-3 mr-2 text-blue-500" />
                  <span className="text-muted-foreground">{entry.time}</span>
                  <span className="ml-auto font-medium">+{entry.amount}ml</span>
                </div>
              ))}
              {entries.length > 5 && (
                <div className="text-xs text-center text-muted-foreground">+ {entries.length - 5} more entries</div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

