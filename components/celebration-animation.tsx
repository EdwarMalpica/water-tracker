"use client"

import { useEffect, useState } from "react"
import confetti from "canvas-confetti"
import { Award } from "lucide-react"

export default function CelebrationAnimation() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Trigger confetti
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="bg-primary/90 text-primary-foreground rounded-full p-6 md:p-8 animate-bounce shadow-lg">
        <div className="flex flex-col items-center">
          <Award className="h-10 w-10 md:h-12 md:w-12 mb-2" />
          <h2 className="text-lg md:text-xl font-bold">Goal Reached!</h2>
          <p className="text-sm md:text-base">Great job staying hydrated!</p>
        </div>
      </div>
    </div>
  )
}

