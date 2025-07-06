"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type ContestDifficulty, createContest } from "@/lib/contest-data"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

// Add the Navbar component at the top of the component
import { Navbar } from "@/components/navbar"

export default function CreateContestPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [duration, setDuration] = useState("2")
  const [difficulty, setDifficulty] = useState<ContestDifficulty>("medium")
  const [topic, setTopic] = useState("")
  const [topics, setTopics] = useState<string[]>([])
  const [eligibility, setEligibility] = useState("Open for all")
  const [isVirtual, setIsVirtual] = useState(false)

  const handleAddTopic = () => {
    if (topic && !topics.includes(topic)) {
      setTopics([...topics, topic])
      setTopic("")
    }
  }

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter((t) => t !== topicToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!title || !description || !startDate || !startTime || !duration) {
      alert("Please fill in all required fields")
      return
    }

    // Create start date
    const startDateTime = new Date(`${startDate}T${startTime}`)

    // Create end date
    const endDateTime = new Date(startDateTime)
    endDateTime.setHours(endDateTime.getHours() + Number.parseInt(duration))

    // Create contest
    const newContest = createContest({
      title,
      description,
      startTime: startDateTime,
      endTime: endDateTime,
      status: startDateTime > new Date() ? "upcoming" : "ongoing",
      difficulty,
      topics: topics.length > 0 ? topics : ["general"],
      isVirtual,
      eligibility,
    })

    // Redirect to contest page
    router.push(`/contests/${newContest.id}`)
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Create a New Contest</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contest Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Contest Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter contest title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your contest"
                      className="min-h-32"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="24"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Problems</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-4">You'll be able to add problems after creating the contest.</p>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={difficulty} onValueChange={(value) => setDifficulty(value as ContestDifficulty)}>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contest Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topics">Topics</Label>
                    <div className="flex gap-2">
                      <Input
                        id="topics"
                        placeholder="Add a topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                      <Button type="button" variant="outline" onClick={handleAddTopic}>
                        Add
                      </Button>
                    </div>
                    {topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {topics.map((t) => (
                          <Badge key={t} variant="secondary" className="flex items-center gap-1">
                            {t}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTopic(t)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eligibility">Eligibility</Label>
                    <Select value={eligibility} onValueChange={setEligibility}>
                      <SelectTrigger id="eligibility">
                        <SelectValue placeholder="Select eligibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open for all">Open for all</SelectItem>
                        <SelectItem value="Beginners only">Beginners only</SelectItem>
                        <SelectItem value="Experienced programmers only">Experienced programmers only</SelectItem>
                        <SelectItem value="Students only">Students only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="virtual"
                      checked={isVirtual}
                      onChange={(e) => setIsVirtual(e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <Label htmlFor="virtual" className="cursor-pointer">
                      Virtual Contest (participants can start at any time)
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/contests")}>
                  Cancel
                </Button>
                <Button type="submit">Create Contest</Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
