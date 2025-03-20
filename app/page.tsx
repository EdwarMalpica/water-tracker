import WaterTracker from "@/components/water-tracker"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Water Intake Tracker</h1>
        <WaterTracker />
      </div>
    </main>
  )
}

