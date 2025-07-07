"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Clock, Flag } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function TakeTestPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string

  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false)

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Fetch test info and questions from backend
  useEffect(() => {
    async function fetchTestAndQuestions() {
      try {
        const token = localStorage.getItem("token")
        // Fetch test info
        const testRes = await fetch(`http://localhost:3001/api/model-test/${testId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const testData = await testRes.json()
        setTest(testData.modelTest)

        // Fetch questions
        const questionsRes = await fetch(`http://localhost:3001/api/model-test/${testId}/questions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const questionsData = await questionsRes.json()
        setQuestions(questionsData.questions)

        // Set timer
        setTimeRemaining((testData.modelTest?.timeLimit || 60) * 60)
      } catch (error) {
        router.push("/model-test")
      }
    }
    fetchTestAndQuestions()
    // eslint-disable-next-line
  }, [testId])

  // Timer logic
  useEffect(() => {
    if (!test) return
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowTimeUpDialog(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [test])

  if (!test || questions.length === 0) {
    return <div>Loading...</div>
  }

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length

  // Ensure options is always an array
  const currentOptions = Array.isArray(currentQuestion.options)
    ? currentQuestion.options
    : typeof currentQuestion.options === "string"
      ? (() => { try { return JSON.parse(currentQuestion.options) } catch { return [] } })()
      : [];

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: Number.parseInt(value) }
    setAnswers(newAnswers)
    // Optionally: send answer to backend here
  }

  const handleFlagQuestion = () => {
    const newFlagged = new Set(flaggedQuestions)
    if (newFlagged.has(currentQuestionIndex)) {
      newFlagged.delete(currentQuestionIndex)
    } else {
      newFlagged.add(currentQuestionIndex)
    }
    setFlaggedQuestions(newFlagged)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleSubmitTest = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/model-test/attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testId,
          answers,
          timeSpent: (test?.timeLimit || 60) * 60 - timeRemaining, // or your own logic
        }),
      });
      if (!res.ok) {
        // Optionally show an error message
        return;
      }
      const data = await res.json();
      router.push(`/model-test/results/${data.attemptId}`);
    } catch (error) {
      // Optionally show an error message
    }
  };

  const handleTimeUp = () => {
    // Optionally: send all answers to backend here
    router.push(`/model-test/results/${testId}`)
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{test.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-slate-500" />
              <span className={`font-mono font-bold ${timeRemaining < 300 ? "text-red-500" : ""}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <Button variant="outline" onClick={() => setShowSubmitDialog(true)}>
              Submit Test
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </CardTitle>
                  <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleFlagQuestion}>
                    <Flag
                      className={`h-4 w-4 ${flaggedQuestions.has(currentQuestionIndex) ? "text-red-500 fill-red-500" : ""}`}
                    />
                    {flaggedQuestions.has(currentQuestionIndex) ? "Unflag" : "Flag"}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Subject: {currentQuestion.subject}</span>
                  <span>•</span>
                  <span>Topic: {currentQuestion.topic}</span>
                  <span>•</span>
                  <span>Points: {currentQuestion.points}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  <div className="text-lg font-medium">{currentQuestion.question}</div>

                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString() || ""}
                    onValueChange={handleAnswer}
                    className="space-y-3"
                  >
                    {currentOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={handleNextQuestion} disabled={currentQuestionIndex === totalQuestions - 1}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Answered: {answeredCount}/{totalQuestions}
                    </span>
                    <span>{Math.round((answeredCount / totalQuestions) * 100)}%</span>
                  </div>
                  <Progress value={(answeredCount / totalQuestions) * 100} />
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className={`p-0 h-8 w-8 ${index === currentQuestionIndex ? "ring-2 ring-primary" : ""} ${
                        answers[questions[index].id] !== undefined ? "bg-emerald-100" : ""
                      } ${flaggedQuestions.has(index) ? "border-red-500" : ""}`}
                      onClick={() => handleJumpToQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-emerald-100 border border-emerald-300"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <div className="h-3 w-3 rounded-full bg-white border border-red-500"></div>
                    <span>Flagged</span>
                  </div>
                </div>

                {answeredCount < totalQuestions && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>You have {totalQuestions - answeredCount} unanswered questions.</AlertDescription>
                  </Alert>
                )}

                {answeredCount === totalQuestions && (
                  <Alert className="mt-4 bg-emerald-50 text-emerald-800 border-emerald-200">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>All questions answered</AlertTitle>
                    <AlertDescription>
                      You've answered all questions. You can review your answers before submitting.
                    </AlertDescription>
                  </Alert>
                )}

                <Button className="w-full mt-4" onClick={() => setShowSubmitDialog(true)}>
                  Submit Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Test Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your test? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-between mb-2">
              <span>Questions answered:</span>
              <span className="font-medium">
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            {answeredCount < totalQuestions && (
              <div className="text-red-500 text-sm mb-4">
                Warning: You have {totalQuestions - answeredCount} unanswered questions.
              </div>
            )}

            <div className="flex justify-between mb-2">
              <span>Time remaining:</span>
              <span className="font-medium">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Test
            </Button>
            <Button onClick={handleSubmitTest}>Submit Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Up Dialog */}
      <Dialog open={showTimeUpDialog} onOpenChange={setShowTimeUpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time's Up!</DialogTitle>
            <DialogDescription>
              Your test time has expired. Your answers will be submitted automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-between mb-2">
              <span>Questions answered:</span>
              <span className="font-medium">
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            {answeredCount < totalQuestions && (
              <div className="text-amber-500 text-sm">
                You have {totalQuestions - answeredCount} unanswered questions.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleTimeUp}>View Results</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
