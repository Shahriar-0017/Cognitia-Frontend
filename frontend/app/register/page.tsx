"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const STUDY_FIELDS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Literature",
  "History",
  "Geography",
  "Economics",
  "Psychology",
  "Philosophy",
  "Art",
  "Music",
  "Engineering",
  "Medicine",
  "Law",
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<"details" | "interests" | "otp">("details")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [interests, setInterests] = useState<string[]>([])
  const [otp, setOtp] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("interests")
  }

  const handleInterestsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData }),
        // body: JSON.stringify({
        //   ...formData,
        //   interests, // Only if you want to save interests
        // }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.log("Registration error:", errorData)
        // Show all validation messages
        if (errorData.details && Array.isArray(errorData.details)) {
          alert(errorData.details.map((d: any) => d.msg).join("\n"))
        } else {
          alert(errorData.error || "Registration failed")
        }
        return
      }
      setStep("otp")
    } catch (err) {
      alert("Registration failed")
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Send OTP and email to backend for verification
      const response = await fetch("http://localhost:3001/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.error || "OTP verification failed")
        return
      }
      // OTP verified, registration complete
      alert("Registration complete! You can now log in.")
      router.push("/login")
    } catch (err) {
      alert("OTP verification failed")
    }
  }

  const addInterest = (interest: string) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest])
    }
    setSearchTerm("")
  }

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest))
  }

  const filteredFields = STUDY_FIELDS.filter(
    (field) => field.toLowerCase().includes(searchTerm.toLowerCase()) && !interests.includes(field),
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            {step === "details" && "Fill in your details to get started"}
            {step === "interests" && "Select your study interests"}
            {step === "otp" && "Verify your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "details" && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Continue
              </Button>
            </form>
          )}

          {step === "interests" && (
            <form onSubmit={handleInterestsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interests">Study Interests</Label>
                <Input
                  id="interests"
                  placeholder="Search for study fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="ml-1 rounded-full hover:bg-emerald-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {searchTerm && filteredFields.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white p-1">
                  {filteredFields.map((field) => (
                    <button
                      key={field}
                      type="button"
                      className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-100"
                      onClick={() => addInterest(field)}
                    >
                      {field}
                    </button>
                  ))}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={interests.length === 0}
              >
                Continue
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-slate-500">We&apos;ve sent a verification code to {formData.email}</p>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Create Account
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
