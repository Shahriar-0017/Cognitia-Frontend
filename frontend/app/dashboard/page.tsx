"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  MessageSquare,
  ThumbsUp,
  Share2,
  BookmarkPlus,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"
import { QuestionModal } from "@/components/question-modal"
import { Navbar } from "@/components/navbar"
import { TaskDetailsModal } from "@/components/task-details-modal"
import { toast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [showLeftSidebar, setShowLeftSidebar] = useState(!isMobile)
  const [showRightSidebar, setShowRightSidebar] = useState(!isMobile)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [recentNotes, setRecentNotes] = useState<any[]>([])
  const [studyPlans, setStudyPlans] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questionVotes, setQuestionVotes] = useState<{ [key: string]: number }>({})
  const [savedQuestions, setSavedQuestions] = useState<{ [key: string]: boolean }>({})

  // Fetch dashboard data from backend
  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch("http://localhost:3001/api/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          router.push("/login")
          return {}
        }
        return res.json()
      })
      .then((data: {
        recentNotes?: any[]
        feed?: any[]
        studyPlans?: any[]
        tasks?: any[]
        sessions?: any[]
        currentUser?: any
      }) => {
        console.log("Dashboard data:", data)
        setRecentNotes(data.recentNotes || [])
        setQuestions(data.feed || [])
        setStudyPlans(data.studyPlans || [])
        setTasks(data.tasks || [])
        setSessions(data.sessions || [])
        setCurrentUser(data.currentUser || null)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load dashboard data")
        setLoading(false)
      })
  }, [router])

  const handlePostClick = (questionId: string) => {
    router.push(`/question/${questionId}`)
  }

  const handleProfileClick = (e: React.MouseEvent, authorId: string) => {
    e.stopPropagation()
    router.push(`/profile/${authorId}`)
  }

  const handleVote = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation()
    setQuestionVotes((prev) => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + 1,
    }))
    toast({
      title: "Upvoted",
      description: "You've upvoted this question",
    })
  }

  const handleSaveQuestion = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation()
    setSavedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
    toast({
      title: savedQuestions[questionId] ? "Unsaved" : "Saved",
      description: savedQuestions[questionId]
        ? "Question removed from your saved items"
        : "Question added to your saved items",
    })
  }

  const handleCopyLink = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation()
    const url = `${window.location.origin}/question/${questionId}`
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied",
        description: "Question link copied to clipboard",
      })
    })
  }

  const handleShareToSocial = (
    e: React.MouseEvent,
    platform: string,
    questionId: string,
    questionTitle: string,
  ) => {
    e.stopPropagation()
    const url = `${window.location.origin}/question/${questionId}`
    let shareUrl = ""
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(questionTitle)}&url=${encodeURIComponent(url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      default:
        return
    }
    window.open(shareUrl, "_blank", "width=600,height=400")
  }

  const handleActionClick = (
    e: React.MouseEvent,
    action: string,
    questionId: string,
    questionTitle?: string,
  ) => {
    e.stopPropagation()
    switch (action) {
      case "vote":
        handleVote(e, questionId)
        break
      case "comment":
        router.push(`/question/${questionId}#comments`)
        break
      case "save":
        handleSaveQuestion(e, questionId)
        break
      default:
        break
    }
  }

  const handleQuestionSubmit = (questionData: { title: string; body: string; tags: string[] }) => {
    toast({
      title: "Question posted",
      description: "Your question has been posted successfully",
    })
  }

  const openTaskDetails = (task: any) => {
    setSelectedTask(task)
    setIsTaskDetailsModalOpen(true)
  }

  const handleUpdateTask = (taskId: string, taskData: any) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          if (taskData.status === "completed" && task.status !== "completed") {
            taskData.completedAt = new Date()
          }
          if (taskData.status !== "completed" && task.status === "completed") {
            taskData.completedAt = undefined
          }
          return {
            ...task,
            ...taskData,
            updatedAt: new Date(),
          }
        }
        return task
      }),
    )
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    setSessions(sessions.filter((session) => session.taskId !== taskId))
  }

  const handleScheduleSession = (sessionData: any) => {
    // You may want to POST to backend here instead of local state
    const newSession = {
      ...sessionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setSessions([...sessions, newSession])
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto p-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          {showLeftSidebar && (
            <aside className="w-full lg:w-1/4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recently Viewed Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(recentNotes || []).map((note) => (
                      <li key={note.id}>
                        <Link
                          href={`/notes/${note.id}`}
                          className="flex items-start gap-2 rounded-md p-2 hover:bg-slate-100"
                        >
                          <BookOpen className="mt-0.5 h-4 w-4 text-slate-500" />
                          <div>
                            <p className="font-medium text-slate-800">{note.title}</p>
                            <p className="text-xs text-slate-500">
                              Last viewed: {note.lastViewed || note.updatedAt}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </aside>
          )}

          <section className="flex-1 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div
                  className="flex items-center gap-3 rounded-md bg-slate-50 p-3 cursor-pointer hover:bg-slate-100"
                  onClick={() => setIsQuestionModalOpen(true)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.avatar || `/placeholder.svg?height=32&width=32`} alt={currentUser?.name || "U"} />
                    <AvatarFallback>{currentUser?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-slate-500">Ask a question...</span>
                </div>
              </CardContent>
            </Card>

            {loading && <p>Loading questions...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {questions.map((question) => {
              const voteCount =
                questionVotes[question.id] !== undefined ? questionVotes[question.id] : question.voteCount
              const isSaved = savedQuestions[question.id] || false

              return (
                <Card
                  key={question.id}
                  className="overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => handlePostClick(question.id)}
                >
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => handleProfileClick(e, question.author?.id)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={question.author?.avatar || `/placeholder.svg?height=40&width=40`} alt={question.author?.name} />
                            <AvatarFallback>{question.author?.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium hover:underline">{question.author?.name}</p>
                            <p className="text-xs text-slate-500">{question.createdAt && new Date(question.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {question.isResolved && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              Resolved
                            </span>
                          )}
                          {question.tags && question.tags[0] && (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                              {question.tags[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">{question.title}</h3>
                      <p className="text-slate-600">{question.body}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {question.tags && question.tags.slice(1).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="bg-slate-100">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 text-slate-600`}
                        onClick={(e) => handleActionClick(e, "vote", question.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{voteCount}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-slate-600"
                        onClick={(e) => handleActionClick(e, "comment", question.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{question.views}</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-slate-600">
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={(e) => handleCopyLink(e, question.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Copy link</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleShareToSocial(e, "facebook", question.id, question.title)}
                          >
                            <Facebook className="mr-2 h-4 w-4" />
                            <span>Share to Facebook</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleShareToSocial(e, "twitter", question.id, question.title)}
                          >
                            <Twitter className="mr-2 h-4 w-4" />
                            <span>Share to Twitter</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleShareToSocial(e, "linkedin", question.id, question.title)}
                          >
                            <Linkedin className="mr-2 h-4 w-4" />
                            <span>Share to LinkedIn</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 ${isSaved ? "text-emerald-600" : "text-slate-600"}`}
                        onClick={(e) => handleActionClick(e, "save", question.id)}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                        <span>{isSaved ? "Saved" : "Save"}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </section>

          {showRightSidebar && (
            <aside className="w-full lg:w-1/4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today&apos;s Study Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {(studyPlans || []).map((plan) => {
                      const task = tasks.find((t) => t.id === plan.id)
                      return (
                        <Card
                          key={plan.id}
                          className="bg-gradient-to-br from-emerald-50 to-teal-50 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => task && openTaskDetails(task)}
                        >
                          <CardContent className="p-3">
                            <h3 className="font-medium text-slate-800">{plan.title}</h3>
                            <p className="text-xs text-slate-500">{plan.duration}</p>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span>
                                  {plan.completed}/{plan.total} tasks
                                </span>
                                <span>{Math.round((plan.completed / plan.total) * 100)}%</span>
                              </div>
                              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${(plan.completed / plan.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </aside>
          )}
        </div>
      </main>
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onSubmit={handleQuestionSubmit}
      />
      <TaskDetailsModal
        isOpen={isTaskDetailsModalOpen}
        onClose={() => setIsTaskDetailsModalOpen(false)}
        task={selectedTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onScheduleSession={handleScheduleSession}
        sessions={sessions}
      />
    </div>
  )
}