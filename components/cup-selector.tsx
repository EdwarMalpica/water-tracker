"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CupSize {
  id: string
  name: string
  amount: number
  icon: string
}

interface CupSelectorProps {
  cupSizes: CupSize[]
  selectedCup: CupSize
  onSelectCup: (cup: CupSize) => void
}

export default function CupSelector({ cupSizes, selectedCup, onSelectCup }: CupSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {cupSizes.map((cup) => (
        <Button
          key={cup.id}
          variant={selectedCup.id === cup.id ? "default" : "outline"}
          className={cn("flex flex-col h-auto py-3 px-2", selectedCup.id === cup.id ? "border-2 border-primary" : "")}
          onClick={() => onSelectCup(cup)}
        >
          <span className="text-xl mb-1">{cup.icon}</span>
          <span className="text-xs">{cup.name}</span>
          <span className="text-xs font-bold">{cup.amount}ml</span>
        </Button>
      ))}
    </div>
  )
}

