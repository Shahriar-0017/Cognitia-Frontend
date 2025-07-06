import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Cognitia</h1>
          <p className="mt-2 text-sm text-slate-600">Your personalized learning companion</p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
            <Link href="/login">Login</Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Register</Link>
          </Button>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Get personalized study plans, connect with peers, and track your progress</p>
        </div>
      </div>
    </div>
  )
}
