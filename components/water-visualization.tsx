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

    // Make sure canvas is properly sized
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // Set the canvas size to match its display size
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    // Scale the context to ensure correct drawing operations
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Adjust glass position to give more space for measurements
    const glassLeftX = width * 0.3
    const glassRightX = width * 0.8
    const glassWidth = glassRightX - glassLeftX
    const glassCenterX = glassLeftX + glassWidth / 2

    // Draw glass container
    ctx.beginPath()
    ctx.moveTo(glassLeftX, height * 0.1)
    ctx.lineTo(glassLeftX, height * 0.9)
    ctx.lineTo(glassRightX, height * 0.9)
    ctx.lineTo(glassRightX, height * 0.1)
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
    ctx.fillRect(glassLeftX, waterY, glassWidth, waterHeight)

    // Draw water surface with wave effect
    ctx.beginPath()
    ctx.moveTo(glassLeftX, waterY)

    const waveHeight = 5
    const segments = 6
    const segmentWidth = glassWidth / segments

    for (let i = 0; i <= segments; i++) {
      const x = glassLeftX + i * segmentWidth
      const y = waterY + (i % 2 === 0 ? -waveHeight : waveHeight)
      ctx.lineTo(x, y)
    }

    ctx.lineTo(glassRightX, waterY)
    ctx.lineTo(glassRightX, height * 0.9)
    ctx.lineTo(glassLeftX, height * 0.9)
    ctx.closePath()

    ctx.fillStyle = waterGradient
    ctx.fill()

    // Draw measurement lines with correct values
    for (let i = 1; i <= 4; i++) {
      const y = height * 0.9 - height * 0.8 * (i / 4)
      const measurementValue = Math.round(goalAmount * (i / 4))

      ctx.beginPath()
      ctx.moveTo(glassLeftX - 10, y) // Increased space for measurement line
      ctx.lineTo(glassLeftX, y)
      ctx.strokeStyle = "#94a3b8"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw measurement text with more space
      ctx.font = "12px sans-serif"
      ctx.fillStyle = "#64748b"
      ctx.textAlign = "right"
      ctx.fillText(`${measurementValue}ml`, glassLeftX - 15, y + 4) // Increased space for text
    }
  }, [percentage, currentAmount, goalAmount])

  return (
    <div className="relative w-full max-w-[220px]">
      <canvas
        ref={canvasRef}
        width={220}
        height={250}
        className="w-full h-auto"
        style={{ maxWidth: "100%", display: "block" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-center bg-white bg-opacity-70 px-3 py-1 rounded-lg"
          style={{
            transform: "translateX(10%)",
            maxWidth: "90px",
          }}
        >
          <div
            className={`font-bold text-blue-700 ${percentage === 100 ? "text-xl" : "text-2xl"}`}
            suppressHydrationWarning
          >
            {percentage}%
          </div>
          <div className="text-sm text-blue-700" suppressHydrationWarning>
            {currentAmount}ml
          </div>
        </div>
      </div>
    </div>
  )
}

