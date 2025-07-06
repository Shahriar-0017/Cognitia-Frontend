"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark, Trash2, MessageCircle, Eye, ThumbsUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CURRENT_USER, QUESTIONS, formatRelativeTime } from "@/lib/mock-data"
import { getSavedQuestions, getSavedNotes, unsaveItem } from "@/lib/saved-items-data"
import { getNoteById } from "@/lib/mock-data"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function SavedItemsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("questions")
  const [savedQuestions, setSavedQuestions] = useState([])
  const [savedNotes, setSavedNotes] = useState([])

  useEffect(() => {
    // Load saved items when component mounts
    loadSavedItems()
  }, [])

  const loadSavedItems = () => {
    // Get saved questions
    const questionItems = getSavedQuestions(CURRENT_USER.id)
    const questions = questionItems
      .map((item) => {
        const question = QUESTIONS.find((q) => q.id === item.itemId)
        return {
          ...question,
          savedAt: item.savedAt,
        }
      })
      .filter(Boolean)

    // Get saved notes
    const noteItems = getSavedNotes(CURRENT_USER.id)
    const notes = noteItems
      .map((item) => {
        const note = getNoteById(item.itemId)
        return note
          ? {
              ...note,
              savedAt: item.savedAt,
            }
          : null
      })
      .filter(Boolean)

    setSavedQuestions(questions)
    setSavedNotes(notes)
  }

  const handleUnsave = (e, itemId) => {
    e.stopPropagation() // Prevent navigation when clicking unsave
    unsaveItem(CURRENT_USER.id, itemId)

    // Refresh the lists
    loadSavedItems()

    toast({
      title: "Item removed",
      description: "Item removed from your saved items",
    })
  }

  const navigateToQuestion = (questionId) => {
    router.push(`/question/${questionId}`)
  }

  const navigateToNote = (noteId) => {
    router.push(`/notes/${noteId}`)
  }

  // Mock data for demonstration
  const mockSavedQuestions = [
    {
      id: "q1",
      title: "Understanding Calculus Integration Techniques",
      body: "I'm struggling with integration by parts. Can someone explain when to use it versus substitution methods?",
      author: {
        id: "user_2",
        name: "Alice Smith",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      tags: ["Mathematics", "Calculus", "Integration"],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      savedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      voteCount: 24,
      views: 124,
      answers: 3,
    },
    {
      id: "q2",
      title: "Quantum Mechanics Probability Question",
      body: "How do we interpret the probability density function in quantum mechanics? I'm confused about the physical meaning.",
      author: {
        id: "user_3",
        name: "Bob Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      tags: ["Physics", "Quantum Mechanics", "Probability"],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      savedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      voteCount: 18,
      views: 89,
      answers: 2,
    },
    {
      id: "q3",
      title: "Recursion vs Iteration Efficiency",
      body: "In what scenarios is recursion more efficient than iteration? I'm trying to optimize an algorithm for tree traversal.",
      author: {
        id: "user_4",
        name: "Carol Williams",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      tags: ["Computer Science", "Algorithms", "Recursion"],
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      savedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      voteCount: 32,
      views: 156,
      answers: 5,
    },
  ]

  const mockSavedNotes = [
    {
      id: "n1",
      title: "Advanced Algorithms and Data Structures",
      author: {
        id: "user_2",
        name: "Alice Smith",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      groupName: "Computer Science",
      thumbnail: "/placeholder.svg?height=200&width=300",
      updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      viewCount: 567,
      likeCount: 124,
      rating: 4.8,
    },
    {
      id: "n2",
      title: "Quantum Field Theory Fundamentals",
      author: {
        id: "user_3",
        name: "Bob Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      groupName: "Advanced Physics",
      thumbnail: "/placeholder.svg?height=200&width=300",
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      viewCount: 342,
      likeCount: 87,
      rating: 4.7,
    },
    {
      id: "n3",
      title: "Linear Algebra Applications",
      author: {
        id: "user_4",
        name: "Carol Williams",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      groupName: "Mathematics",
      thumbnail: "/placeholder.svg?height=200&width=300",
      updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
      savedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      viewCount: 189,
      likeCount: 45,
      rating: 4.2,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Saved Items</h3>
        <p className="text-sm text-muted-foreground">View and manage your saved questions and notes.</p>
      </div>

      <Tabs defaultValue="questions" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="mt-4 space-y-4">
          {mockSavedQuestions.length > 0 ? (
            mockSavedQuestions.map((question) => (
              <Card
                key={question.id}
                className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigateToQuestion(question.id)}
              >
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={question.author?.avatar || "/placeholder.svg"}
                            alt={question.author?.name}
                          />
                          <AvatarFallback>{question.author?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/profile/${question.author.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm font-medium hover:underline"
                          >
                            {question.author?.name}
                          </Link>
                          <p className="text-xs text-slate-500">{formatRelativeTime(question.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs text-slate-500">Saved {formatRelativeTime(question.savedAt)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-500"
                          onClick={(e) => handleUnsave(e, question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="mb-2 text-lg font-semibold hover:text-emerald-600">{question.title}</h3>
                    <p className="text-slate-600 line-clamp-2">{question.body}</p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {question.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-slate-100">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{question.voteCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{question.answers}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{question.views}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bookmark className="h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium">No saved questions</h3>
              <p className="mt-2 text-sm text-slate-500">
                You haven't saved any questions yet. Click the bookmark icon on questions to save them for later.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-4 space-y-4">
          {mockSavedNotes.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockSavedNotes.map((note) => (
                <Card
                  key={note.id}
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
                  onClick={() => navigateToNote(note.id)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                      <img
                        src={note.thumbnail || "/placeholder.svg"}
                        alt={note.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{note.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={note.author?.avatar || "/placeholder.svg"} alt={note.author?.name} />
                            <AvatarFallback>{note.author?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <Link
                            href={`/profile/${note.author.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium hover:underline"
                          >
                            {note.author?.name}
                          </Link>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-500"
                          onClick={(e) => handleUnsave(e, note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <h3 className="mb-1 line-clamp-2 font-medium leading-tight hover:text-emerald-600">
                        {note.title}
                      </h3>
                      <p className="mb-2 text-xs text-slate-500">{note.groupName}</p>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-slate-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{note.viewCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{note.likeCount}</span>
                          </div>
                        </div>
                        <span className="text-slate-500">Saved {formatRelativeTime(note.savedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bookmark className="h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium">No saved notes</h3>
              <p className="mt-2 text-sm text-slate-500">
                You haven't saved any notes yet. Click the bookmark icon on notes to save them for later.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Missing Star component
function Star(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
