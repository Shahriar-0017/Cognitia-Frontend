"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CURRENT_USER } from "@/lib/mock-data"
import { Camera } from "lucide-react"

export default function ProfileSettings() {
  const [user, setUser] = useState({
    name: CURRENT_USER.name,
    email: CURRENT_USER.email,
    bio: "Computer Science student passionate about algorithms and data structures.",
    university: "MIT",
    department: "Computer Science",
    year: "3rd Year",
    interests: "Algorithms, Machine Learning, Web Development",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would submit the form data to an API
    alert("Profile updated successfully!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-slate-500">Manage your personal information and how it appears to others</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>This is your public profile picture visible to other users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`/placeholder.svg?height=96&width=96`} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">{user.name}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Upload New
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={user.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={user.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University/Institution</Label>
                <Input id="university" name="university" value={user.university} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={user.department} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year/Semester</Label>
                <Input id="year" name="year" value={user.year} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests</Label>
              <Input id="interests" name="interests" value={user.interests} onChange={handleChange} />
              <p className="text-xs text-slate-500">Separate interests with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={user.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about yourself"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
