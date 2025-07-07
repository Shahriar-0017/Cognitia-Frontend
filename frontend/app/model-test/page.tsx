"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Clock, FileText, Filter, GraduationCap, History, Plus, Search, Trophy } from "lucide-react"

// Define the TestDifficulty type
type TestDifficulty = "easy" | "medium" | "hard";

export default function ModelTestPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("available")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")

  // Backend-fetched tests
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTests() {
      setLoading(true)
      setError(null)
      try {
       // const res = await fetch("http://localhost:3001/api/model-test/")
       const token = localStorage.getItem("token"); // or your actual token key
       const res = await fetch("http://localhost:3001/api/model-test/", {
       headers: {
        Authorization: `Bearer ${token}`,
        },
    });
        if (!res.ok) throw new Error("Failed to fetch tests")
        const data = await res.json()
        setTests(data.modelTests || [])
      } catch (err: any) {
        setError(err.message || "Error fetching tests")
      } finally {
        setLoading(false)
      }
    }
    fetchTests()
  }, [])

  // Filter available topics based on selected subjects
  const availableTopics = useMemo(() => {
    if (selectedSubjects.length === 0) return []

    const topics = new Set<string>()
    selectedSubjects.forEach((subject) => {
      // @ts-ignore
      TOPICS_BY_SUBJECT[subject]?.forEach((topic) => {
        topics.add(topic)
      })
    })
    return Array.from(topics).sort()
  }, [selectedSubjects])

  // Filter tests based on search and filters
  const filteredTests = tests.filter((test) => {
    if (
      searchQuery &&
      !test.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !test.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    if (selectedSubjects.length > 0 && !selectedSubjects.some((subject) => (test.subjects || []).includes(subject))) {
      return false
    }
    if (selectedDifficulty !== "all" && test.difficulty !== selectedDifficulty) {
      return false
    }
    return true
  })

  const handleStartTest = (testId: string) => {
    router.push(`/model-test/${testId}`)
  }

  // Custom test creation state
  const [customTitle, setCustomTitle] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [customTimeLimit, setCustomTimeLimit] = useState(30)
  const [customSubjects, setCustomSubjects] = useState<string[]>([])
  const [customTopics, setCustomTopics] = useState<string[]>([])
  const [customDifficulty, setCustomDifficulty] = useState<TestDifficulty>("medium")
  const [customQuestionCount, setCustomQuestionCount] = useState(15)

  const handleCreateCustomTest = () => {
    if (!customTitle || customSubjects.length === 0 || customTopics.length === 0) {
      alert("Please fill in all required fields")
      return
    }

    // Dummy implementation for createCustomTest
    function createCustomTest({
      title,
      description,
      timeLimit,
      subjects,
      topics,
      difficulty,
      questionCount,
    }: {
      title: string
      description: string
      timeLimit: number
      subjects: string[]
      topics: string[]
      difficulty: string
      questionCount: number
    }) {
      // This should be replaced with actual API call or logic
      return {
        id: Math.random().toString(36).substr(2, 9),
        title,
        description,
        timeLimit,
        subjects,
        topics,
        difficulty,
        questionCount,
        isCustom: true,
      }
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
            <div className="md:col-span-3">
              {loading ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">Loading...</div>
              ) : error ? (
                <div className="text-center py-12 bg-red-50 rounded-lg text-red-500">{error}</div>
              ) : filteredTests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">No tests found</h3>
                  <p className="mt-2 text-sm text-gray-500">Try adjusting your filters or contact admin.</p>
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
                            <span>{test.questionsCount || (test.questions ? test.questions.length : 0)} questions</span>
                          </div>
                          <div className="flex items-center">
                            <Trophy className="h-4 w-4 mr-2 text-slate-500" />
                            <span>{test.difficulty ? test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1) : "-"}</span>
                          </div>
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2 text-slate-500" />
                            <span>{(test.subjects || []).join(", ")}</span>
                          </div>
                        </div>
                        {test.topics && test.topics.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {test.topics.slice(0, 3).map((topic: string) => (
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
                        )}
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
          </TabsContent>

          {/* Remove the create and custom test UI, and subject/topic/difficulty filters */}

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test History</CardTitle>
                <CardDescription>View your previous test attempts and results.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">Test history is not available.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab("available")}>
                    Browse Available Tests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
