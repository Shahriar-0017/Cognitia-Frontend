"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MODEL_TESTS,
  SUBJECTS,
  TOPICS_BY_SUBJECT,
  createCustomTest,
  getUserTestAttempts,
  type TestDifficulty,
} from "@/lib/model-test-data"
import { Clock, FileText, Filter, GraduationCap, History, Plus, Search, Trophy } from "lucide-react"

export default function ModelTestPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("available")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")

  // Custom test creation state
  const [customTitle, setCustomTitle] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [customTimeLimit, setCustomTimeLimit] = useState(30)
  const [customSubjects, setCustomSubjects] = useState<string[]>([])
  const [customTopics, setCustomTopics] = useState<string[]>([])
  const [customDifficulty, setCustomDifficulty] = useState<TestDifficulty>("medium")
  const [customQuestionCount, setCustomQuestionCount] = useState(15)

  // Filter available topics based on selected subjects
  const availableTopics = useMemo(() => {
    if (customSubjects.length === 0) return []

    const topics = new Set<string>()
    customSubjects.forEach((subject) => {
      TOPICS_BY_SUBJECT[subject]?.forEach((topic) => {
        topics.add(topic)
      })
    })
    return Array.from(topics).sort()
  }, [customSubjects])

  // Filter tests based on search and filters
  const filteredTests = useMemo(() => {
    return MODEL_TESTS.filter((test) => {
      // Filter by search query
      if (
        searchQuery &&
        !test.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !test.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Filter by selected subjects
      if (selectedSubjects.length > 0 && !selectedSubjects.some((subject) => test.subjects.includes(subject))) {
        return false
      }

      // Filter by difficulty
      if (selectedDifficulty !== "all" && test.difficulty !== selectedDifficulty) {
        return false
      }

      return true
    })
  }, [searchQuery, selectedSubjects, selectedDifficulty])

  // Get user's test history
  const testHistory = getUserTestAttempts("user123") // Replace with actual user ID

  const handleCreateCustomTest = () => {
    if (!customTitle || customSubjects.length === 0 || customTopics.length === 0) {
      alert("Please fill in all required fields")
      return
    }

    const newTest = createCustomTest({
      title: customTitle,
      description: customDescription,
      timeLimit: customTimeLimit,
      subjects: customSubjects,
      topics: customTopics,
      difficulty: customDifficulty,
      questionCount: customQuestionCount,
    })

    router.push(`/model-test/${newTest.id}`)
  }

  const handleStartTest = (testId: string) => {
    router.push(`/model-test/${testId}`)
  }

  const handleViewResults = (attemptId: string) => {
    router.push(`/model-test/results/${attemptId}`)
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Model Tests</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="available">
              <FileText className="h-4 w-4 mr-2" />
              Available Tests
            </TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              Create Test
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Test History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Filter className="h-5 w-5 mr-2" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="search">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="search"
                          placeholder="Search tests..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Subjects</Label>
                      <div className="space-y-2">
                        {SUBJECTS.map((subject) => (
                          <div key={subject} className="flex items-center space-x-2">
                            <Checkbox
                              id={`subject-${subject}`}
                              checked={selectedSubjects.includes(subject)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedSubjects([...selectedSubjects, subject])
                                } else {
                                  setSelectedSubjects(selectedSubjects.filter((s) => s !== subject))
                                }
                              }}
                            />
                            <label
                              htmlFor={`subject-${subject}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {subject}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Difficulties</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedSubjects([])
                        setSelectedDifficulty("all")
                      }}
                    >
                      Reset Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-3">
                {filteredTests.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">No tests found</h3>
                    <p className="mt-2 text-sm text-gray-500">Try adjusting your filters or create a custom test.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredTests.map((test) => (
                      <Card key={test.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{test.title}</CardTitle>
                              <CardDescription className="mt-1">{test.description}</CardDescription>
                            </div>
                            <Badge variant={test.isCustom ? "outline" : "secondary"}>
                              {test.isCustom ? "Custom" : "Official"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-slate-500" />
                              <span>{test.timeLimit} minutes</span>
                            </div>
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-slate-500" />
                              <span>{test.questions.length} questions</span>
                            </div>
                            <div className="flex items-center">
                              <Trophy className="h-4 w-4 mr-2 text-slate-500" />
                              <span>{test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}</span>
                            </div>
                            <div className="flex items-center">
                              <GraduationCap className="h-4 w-4 mr-2 text-slate-500" />
                              <span>{test.subjects.join(", ")}</span>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {test.topics.slice(0, 3).map((topic) => (
                              <Badge key={topic} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {test.topics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{test.topics.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                          <Button className="w-full" onClick={() => handleStartTest(test.id)}>
                            Start Test
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Custom Test</CardTitle>
                <CardDescription>
                  Design your own test by selecting subjects, topics, and difficulty level.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-title">Test Title</Label>
                      <Input
                        id="custom-title"
                        placeholder="Enter test title"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-description">Description (Optional)</Label>
                      <Input
                        id="custom-description"
                        placeholder="Enter test description"
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-time-limit">Time Limit (minutes)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="custom-time-limit"
                          min={10}
                          max={120}
                          step={5}
                          value={[customTimeLimit]}
                          onValueChange={(value) => setCustomTimeLimit(value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">{customTimeLimit}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-difficulty">Difficulty</Label>
                      <Select
                        value={customDifficulty}
                        onValueChange={(value) => setCustomDifficulty(value as TestDifficulty)}
                      >
                        <SelectTrigger id="custom-difficulty">
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
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-subjects">Subjects</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {SUBJECTS.map((subject) => (
                          <div key={subject} className="flex items-center space-x-2">
                            <Checkbox
                              id={`custom-subject-${subject}`}
                              checked={customSubjects.includes(subject)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCustomSubjects([...customSubjects, subject])
                                  // Clear topics when subjects change
                                  setCustomTopics([])
                                } else {
                                  setCustomSubjects(customSubjects.filter((s) => s !== subject))
                                  // Remove topics from this subject
                                  const topicsToRemove = TOPICS_BY_SUBJECT[subject] || []
                                  setCustomTopics(customTopics.filter((t) => !topicsToRemove.includes(t)))
                                }
                              }}
                            />
                            <label
                              htmlFor={`custom-subject-${subject}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {subject}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-topics">Topics</Label>
                      <div className="h-40 overflow-y-auto border rounded-md p-2">
                        {availableTopics.length === 0 ? (
                          <p className="text-sm text-gray-500 p-2">
                            Select at least one subject to see available topics
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2">
                            {availableTopics.map((topic) => (
                              <div key={topic} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`custom-topic-${topic}`}
                                  checked={customTopics.includes(topic)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setCustomTopics([...customTopics, topic])
                                    } else {
                                      setCustomTopics(customTopics.filter((t) => t !== topic))
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`custom-topic-${topic}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {topic}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-question-count">Number of Questions</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="custom-question-count"
                          min={5}
                          max={50}
                          step={5}
                          value={[customQuestionCount]}
                          onValueChange={(value) => setCustomQuestionCount(value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">{customQuestionCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setActiveTab("available")}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCustomTest}>Create and Start Test</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test History</CardTitle>
                <CardDescription>View your previous test attempts and results.</CardDescription>
              </CardHeader>
              <CardContent>
                {testHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You haven't taken any tests yet.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab("available")}>
                      Browse Available Tests
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testHistory.map((attempt) => {
                      const test = MODEL_TESTS.find((t) => t.id === attempt.testId)
                      if (!test) return null

                      return (
                        <Card key={attempt.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div>
                                <h3 className="font-medium">{test.title}</h3>
                                <p className="text-sm text-gray-500">
                                  Taken on {attempt.startTime.toLocaleDateString()}
                                </p>
                                <div className="flex items-center mt-2">
                                  <Badge
                                    variant={attempt.status === "completed" ? "default" : "outline"}
                                    className="mr-2"
                                  >
                                    {attempt.status === "completed" ? "Completed" : "In Progress"}
                                  </Badge>
                                  {attempt.status === "completed" && (
                                    <Badge
                                      variant={(attempt.score || 0) >= test.passingScore ? "success" : "destructive"}
                                    >
                                      {(attempt.score || 0) >= test.passingScore ? "Passed" : "Failed"}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col items-end">
                                {attempt.status === "completed" && (
                                  <>
                                    <div className="text-2xl font-bold">
                                      {attempt.score} / {test.totalPoints}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      {attempt.correctAnswers} of {attempt.totalQuestions} correct
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => handleViewResults(attempt.id)}
                                    >
                                      View Results
                                    </Button>
                                  </>
                                )}
                                {attempt.status === "in-progress" && (
                                  <Button size="sm" onClick={() => handleStartTest(test.id)}>
                                    Continue Test
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
