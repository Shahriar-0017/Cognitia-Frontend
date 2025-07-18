"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, FileText, Home, List, XCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function TestResultsPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params.id as string

  const [results, setResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("summary")

  useEffect(() => {
    async function fetchResults() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`http://localhost:3001/api/model-test/attempt/${attemptId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Attempt not found")
        const data = await res.json()
        // You may need to transform the backend data to match the expected frontend structure
        setResults(data)
      } catch (error) {
        console.error("Error fetching test results:", error)
        router.push("/model-test")
      }
    }
    fetchResults()
  }, [attemptId, router])

  if (!results) {
    return null
  }

  // Extract and transform data for rendering
  const { attempt } = results
  const test = attempt.test
  const userAnswers = attempt.answers ? JSON.parse(attempt.answers) : {}
  const questions = test.questions || []
  const questionResults = questions.map((q: any, idx: number) => {
    const userAnswer = userAnswers[q.id]
    const isCorrect = userAnswer !== undefined && userAnswer === q.correctAnswer
    return {
      question: q,
      userAnswer,
      isCorrect,
    }
  })
  const isPassed = attempt.score >= test.passingScore

  // Calculate statistics
  const correctCount = questionResults.filter((r) => r.isCorrect).length
  const incorrectCount = questionResults.filter((r) => !r.isCorrect && r.userAnswer !== undefined).length
  const unansweredCount = questionResults.filter((r) => r.userAnswer === undefined).length
  const scorePercentage = Math.round(((attempt.score || 0) / test.totalPoints) * 100)

  // Format time spent
  const formatTimeSpent = (seconds: number | undefined) => {
    if (!seconds) return "N/A"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else {
      return `${minutes}m ${remainingSeconds}s`
    }
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Test Results</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/model-test")}>
              <List className="h-4 w-4 mr-2" />
              All Tests
            </Button>
            <Button onClick={() => router.push("/model-test/history")}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{test.title}</CardTitle>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-500">Score</span>
                      <span className="font-bold text-lg">
                        {attempt.score} / {test.totalPoints}
                      </span>
                    </div>
                    <Progress value={scorePercentage} className={`h-3 ${isPassed ? "bg-emerald-100" : "bg-red-100"}`} />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-slate-500">Passing: {test.passingScore}</span>
                      <span className="text-xs text-slate-500">{scorePercentage}%</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Badge
                      className={`text-lg py-1 px-4 ${
                        isPassed
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }`}
                    >
                      {isPassed ? "PASSED" : "FAILED"}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Date Taken:</span>
                      <span>{attempt.startTime ? new Date(attempt.startTime).toLocaleDateString() : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Spent:</span>
                      <span>{formatTimeSpent(attempt.timeSpent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Questions:</span>
                      <span>{Array.isArray(test.questions) ? test.questions.length : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Correct:</span>
                      <span className="text-emerald-600">{correctCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Incorrect:</span>
                      <span className="text-red-600">{incorrectCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unanswered:</span>
                      <span className="text-amber-600">{unansweredCount}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2">
                    {test.subjects.map((subject) => (
                      <Badge key={subject} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => router.push(`/model-test/${test.id}`)}>
                  Retake Test
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="summary">
                      <FileText className="h-4 w-4 mr-2" />
                      Summary
                    </TabsTrigger>
                    <TabsTrigger value="questions">
                      <List className="h-4 w-4 mr-2" />
                      All Questions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <div className="text-4xl font-bold text-emerald-600">{correctCount}</div>
                          <div className="text-sm text-slate-500 mt-1">Correct</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <div className="text-4xl font-bold text-red-600">{incorrectCount}</div>
                          <div className="text-sm text-slate-500 mt-1">Incorrect</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <div className="text-4xl font-bold text-amber-600">{unansweredCount}</div>
                          <div className="text-sm text-slate-500 mt-1">Unanswered</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance by Subject</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {test.subjects.map((subject) => {
                          const subjectQuestions = questionResults.filter((r) => r.question.subject === subject)
                          const subjectCorrect = subjectQuestions.filter((r) => r.isCorrect).length
                          const subjectPercentage = Math.round((subjectCorrect / subjectQuestions.length) * 100) || 0

                          return (
                            <div key={subject} className="mb-4">
                              <div className="flex justify-between mb-1">
                                <span>{subject}</span>
                                <span>
                                  {subjectCorrect}/{subjectQuestions.length} ({subjectPercentage}%)
                                </span>
                              </div>
                              <Progress value={subjectPercentage} className="h-2" />
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance by Topic</CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-64 overflow-y-auto">
                        {test.topics.map((topic) => {
                          const topicQuestions = questionResults.filter((r) => r.question.topic === topic)
                          if (topicQuestions.length === 0) return null

                          const topicCorrect = topicQuestions.filter((r) => r.isCorrect).length
                          const topicPercentage = Math.round((topicCorrect / topicQuestions.length) * 100) || 0

                          return (
                            <div key={topic} className="mb-4">
                              <div className="flex justify-between mb-1">
                                <span>{topic}</span>
                                <span>
                                  {topicCorrect}/{topicQuestions.length} ({topicPercentage}%)
                                </span>
                              </div>
                              <Progress value={topicPercentage} className="h-2" />
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="questions" className="space-y-6">
                    {questionResults.map((result, index) => (
                      <Card key={result.question.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">Question {index + 1}</CardTitle>
                            {result.isCorrect ? (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Correct
                              </Badge>
                            ) : result.userAnswer !== undefined ? (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                <XCircle className="h-3 w-3 mr-1" />
                                Incorrect
                              </Badge>
                            ) : (
                              <Badge variant="outline">Unanswered</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{result.question.subject}</span>
                            <span>•</span>
                            <span>{result.question.topic}</span>
                            <span>•</span>
                            <span>{result.question.points} points</span>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            <div className="font-medium">{result.question.question}</div>

                            <div className="space-y-2">
                              {result.question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`p-2 rounded-md ${
                                    result.question.correctAnswer === optionIndex
                                      ? "bg-emerald-100 border border-emerald-200"
                                      : result.userAnswer === optionIndex
                                        ? "bg-red-100 border border-red-200"
                                        : "bg-gray-50 border border-gray-200"
                                  }`}
                                >
                                  {option}
                                  {result.question.correctAnswer === optionIndex && (
                                    <span className="ml-2 text-xs text-emerald-600">(Correct Answer)</span>
                                  )}
                                  {result.userAnswer === optionIndex &&
                                    result.userAnswer !== result.question.correctAnswer && (
                                      <span className="ml-2 text-xs text-red-600">(Your Answer)</span>
                                    )}
                                </div>
                              ))}
                            </div>

                            {result.question.explanation && (
                              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                                <div className="font-medium mb-1">Explanation:</div>
                                <div className="text-sm">{result.question.explanation}</div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
