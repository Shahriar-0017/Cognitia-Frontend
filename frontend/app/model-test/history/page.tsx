"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MODEL_TESTS, getUserTestAttempts } from "@/lib/model-test-data"
import { Calendar, Clock, FileText, Search, Trophy } from "lucide-react"

export default function TestHistoryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  // Get user's test history
  const testHistory = getUserTestAttempts("user123") // Replace with actual user ID

  // Filter and sort test history
  const filteredHistory = testHistory
    .filter((attempt) => {
      const test = MODEL_TESTS.find((t) => t.id === attempt.testId)
      if (!test) return false

      // Filter by search query
      if (searchQuery && !test.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Filter by status
      if (filterStatus === "passed" && (attempt.score || 0) < (test.passingScore || 0)) {
        return false
      }
      if (filterStatus === "failed" && (attempt.score || 0) >= (test.passingScore || 0)) {
        return false
      }
      if (filterStatus === "completed" && attempt.status !== "completed") {
        return false
      }
      if (filterStatus === "in-progress" && attempt.status !== "in-progress") {
        return false
      }

      return true
    })
    .sort((a, b) => {
      const testA = MODEL_TESTS.find((t) => t.id === a.testId)
      const testB = MODEL_TESTS.find((t) => t.id === b.testId)

      if (!testA || !testB) return 0

      switch (sortBy) {
        case "date-asc":
          return a.startTime.getTime() - b.startTime.getTime()
        case "date-desc":
          return b.startTime.getTime() - a.startTime.getTime()
        case "score-asc":
          return (a.score || 0) - (b.score || 0)
        case "score-desc":
          return (b.score || 0) - (a.score || 0)
        case "title-asc":
          return testA.title.localeCompare(testB.title)
        case "title-desc":
          return testB.title.localeCompare(testA.title)
        default:
          return 0
      }
    })

  const handleViewResults = (attemptId: string) => {
    router.push(`/model-test/results/${attemptId}`)
  }

  const handleContinueTest = (testId: string) => {
    router.push(`/model-test/${testId}`)
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Test History</h1>
          <Button onClick={() => router.push("/model-test")}>
            <FileText className="h-4 w-4 mr-2" />
            Browse Tests
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="search"
                    placeholder="Search by test title..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tests</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="sort" className="text-sm font-medium">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                    <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                    <SelectItem value="score-desc">Score (Highest First)</SelectItem>
                    <SelectItem value="score-asc">Score (Lowest First)</SelectItem>
                    <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">No test history found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your filters or search query."
                : "You haven't taken any tests yet."}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <Button variant="outline" className="mt-4" onClick={() => router.push("/model-test")}>
                Browse Available Tests
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((attempt) => {
              const test = MODEL_TESTS.find((t) => t.id === attempt.testId)
              if (!test) return null

              const isPassed = (attempt.score || 0) >= test.passingScore

              return (
                <Card key={attempt.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold">{test.title}</h3>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {attempt.startTime.toLocaleDateString()}
                          </Badge>

                          {attempt.status === "completed" && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor((attempt.timeSpent || 0) / 60)} min
                            </Badge>
                          )}

                          {attempt.status === "completed" ? (
                            <Badge
                              className={
                                isPassed
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                              }
                            >
                              {isPassed ? "Passed" : "Failed"}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">In Progress</Badge>
                          )}

                          {test.subjects.map((subject) => (
                            <Badge key={subject} variant="outline">
                              {subject}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm text-slate-500 mt-2">{test.description}</p>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        {attempt.status === "completed" ? (
                          <>
                            <div className="text-center">
                              <div className="text-3xl font-bold">
                                {attempt.score} / {test.totalPoints}
                              </div>
                              <div className="text-sm text-slate-500">
                                {attempt.correctAnswers} of {attempt.totalQuestions} correct
                              </div>
                            </div>

                            <Button onClick={() => handleViewResults(attempt.id)} className="mt-4">
                              <Trophy className="h-4 w-4 mr-2" />
                              View Results
                            </Button>
                          </>
                        ) : (
                          <Button onClick={() => handleContinueTest(test.id)}>Continue Test</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
