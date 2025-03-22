"use client"

import { useEffect, useRef } from "react"

interface WaterVisualizationProps {
  percentage: number
  currentAmount: number
  goalAmount: number
}

export default function WaterVisualization({ percentage, currentAmount, goalAmount }: WaterVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw glass container
    ctx.beginPath()
    ctx.moveTo(width * 0.2, height * 0.1)
    ctx.lineTo(width * 0.2, height * 0.9)
    ctx.lineTo(width * 0.8, height * 0.9)
    ctx.lineTo(width * 0.8, height * 0.1)
    ctx.strokeStyle = "#94a3b8"
    ctx.lineWidth = 3
    ctx.stroke()

    // Calculate water height based on percentage
    const waterHeight = height * 0.8 * (percentage / 100)
    const waterY = height * 0.9 - waterHeight

    // Draw water
    const waterGradient = ctx.createLinearGradient(0, waterY, 0, height * 0.9)
    waterGradient.addColorStop(0, "rgba(59, 130, 246, 0.8)")
    waterGradient.addColorStop(1, "rgba(59, 130, 246, 0.5)")

    ctx.fillStyle = waterGradient
    ctx.fillRect(width * 0.2, waterY, width * 0.6, waterHeight)

    // Draw water surface with wave effect
    ctx.beginPath()
    ctx.moveTo(width * 0.2, waterY)

    const waveHeight = 5
    const segments = 6
    const segmentWidth = (width * 0.6) / segments

    for (let i = 0; i <= segments; i++) {
      const x = width * 0.2 + i * segmentWidth
      const y = waterY + (i % 2 === 0 ? -waveHeight : waveHeight)
      ctx.lineTo(x, y)
    }

    ctx.lineTo(width * 0.8, waterY)
    ctx.lineTo(width * 0.8, height * 0.9)
    ctx.lineTo(width * 0.2, height * 0.9)
    ctx.closePath()

    ctx.fillStyle = waterGradient
    ctx.fill()

    // Draw measurement lines
    for (let i = 1; i <= 4; i++) {
      const y = height * 0.9 - height * 0.8 * (i / 4)

      ctx.beginPath()
      ctx.moveTo(width * 0.15, y)
      ctx.lineTo(width * 0.2, y)
      ctx.strokeStyle = "#94a3b8"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw measurement text
      ctx.font = "12px sans-serif"
      ctx.fillStyle = "#64748b"
      ctx.textAlign = "right"
      ctx.fillText(`${Math.round(goalAmount * (i / 4))}ml`, width * 0.14, y + 4)
    }
  }, [percentage, currentAmount, goalAmount])

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={200} height={250} className="mx-auto" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center bg-white bg-opacity-70 px-3 py-1 rounded-lg">
          <div className="text-3xl font-bold text-blue-700">{percentage}%</div>
          <div className="text-sm text-blue-700">{currentAmount}ml</div>
        </div>
      </div>
    </div>
  )
}

