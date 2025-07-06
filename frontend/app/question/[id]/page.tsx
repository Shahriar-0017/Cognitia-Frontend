"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  BookmarkPlus,
  CheckCircle2,
  Send,
  MessageSquare,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Heart,
  MoreHorizontal,
} from "lucide-react"
import { QUESTIONS, ANSWERS, formatRelativeTime, CURRENT_USER, incrementViewCount } from "@/lib/mock-data"
import { vote, getVoteCount, getUserVote } from "@/lib/voting-data"
import { saveQuestion, isItemSaved, unsaveItem } from "@/lib/saved-items-data"
import { Navbar } from "@/components/navbar"

export default function QuestionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [newAnswer, setNewAnswer] = useState("")
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<
    Array<{
      id: string
      authorId: string
      content: string
      createdAt: Date
      author: any
      likes: number
      userLiked: boolean
      replies: Array<{
        id: string
        authorId: string
        content: string
        createdAt: Date
        author: any
        likes: number
        userLiked: boolean
      }>
      showReplies: boolean
      replyText: string
    }>
  >([])
  const [questionVotes, setQuestionVotes] = useState({})
  const [answerVotes, setAnswerVotes] = useState({})
  const [savedItems, setSavedItems] = useState({})
  const [answers, setAnswers] = useState([])
  const commentsRef = useRef<HTMLDivElement>(null)

  // Find the question by ID (in a real app, you'd fetch this from an API)
  const question = QUESTIONS.find((q) => q.id === params.id) || QUESTIONS[0]

  // Initialize answers
  useEffect(() => {
    // Get answers for this question
    const questionAnswers = ANSWERS.filter((a) => a.questionId === question.id)
    setAnswers(questionAnswers)
  }, [question.id])

  // Increment view count when the page loads
  useEffect(() => {
    incrementViewCount(params.id)
  }, [params.id])

  // Scroll to comments section if URL has #comments
  useEffect(() => {
    if (window.location.hash === "#comments" && commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  const handleVote = (itemId: string, itemType: "question" | "answer", voteType: "up" | "down") => {
    vote(CURRENT_USER.id, itemId, itemType, voteType)

    if (itemType === "question") {
      setQuestionVotes({
        ...questionVotes,
        [itemId]: getVoteCount(itemId),
      })

      toast({
        title: voteType === "up" ? "Upvoted" : "Downvoted",
        description: `You've ${voteType === "up" ? "upvoted" : "downvoted"} this question`,
      })
    } else {
      setAnswerVotes({
        ...answerVotes,
        [itemId]: getVoteCount(itemId),
      })

      toast({
        title: voteType === "up" ? "Upvoted" : "Downvoted",
        description: `You've ${voteType === "up" ? "upvoted" : "downvoted"} this answer`,
      })
    }
  }

  const handleSaveItem = (itemId: string) => {
    const isSaved = isItemSaved(CURRENT_USER.id, itemId)

    if (isSaved) {
      unsaveItem(CURRENT_USER.id, itemId)
      setSavedItems({
        ...savedItems,
        [itemId]: false,
      })
      toast({
        title: "Unsaved",
        description: "Item removed from your saved items",
      })
    } else {
      saveQuestion(CURRENT_USER.id, itemId)
      setSavedItems({
        ...savedItems,
        [itemId]: true,
      })
      toast({
        title: "Saved",
        description: "Item added to your saved items",
      })
    }
  }

  const handleCopyLink = (itemId: string) => {
    // Create a URL for the question
    const url = `${window.location.origin}/question/${itemId}`

    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied",
        description: "Link copied to clipboard",
      })
    })
  }

  const handleShareToSocial = (platform: string, itemId: string, title: string) => {
    const url = `${window.location.origin}/question/${itemId}`
    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      default:
        return
    }

    window.open(shareUrl, "_blank", "width=600,height=400")
  }

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnswer.trim()) return

    // Create a new answer object
    const newAnswerObj = {
      id: Math.random().toString(36).substring(2, 15),
      questionId: question.id,
      authorId: CURRENT_USER.id,
      author: CURRENT_USER,
      content: newAnswer,
      isAccepted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      voteCount: 0,
    }

    // Add the new answer to the list
    setAnswers([...answers, newAnswerObj])

    // Clear the input
    setNewAnswer("")

    toast({
      title: "Answer submitted",
      description: "Your answer has been posted successfully",
    })
  }

  const handleAcceptAnswer = (answerId: string) => {
    setAnswers(
      answers.map((answer) => ({
        ...answer,
        isAccepted: answer.id === answerId,
      })),
    )

    toast({
      title: "Answer accepted",
      description: "You've marked this answer as accepted",
    })
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    // Create a new comment object
    const newCommentObj = {
      id: Math.random().toString(36).substring(2, 15),
      authorId: CURRENT_USER.id,
      content: newComment,
      createdAt: new Date(),
      author: CURRENT_USER,
      likes: 0,
      userLiked: false,
      replies: [],
      showReplies: false,
      replyText: "",
    }

    setComments([...comments, newCommentObj])
    setNewComment("")

    toast({
      title: "Comment added",
      description: "Your comment has been posted successfully",
    })
  }

  const handleLikeComment = (commentId: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          const newLiked = !comment.userLiked
          return {
            ...comment,
            likes: newLiked ? comment.likes + 1 : comment.likes - 1,
            userLiked: newLiked,
          }
        }
        return comment
      }),
    )
  }

  const handleToggleReplies = (commentId: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            showReplies: !comment.showReplies,
          }
        }
        return comment
      }),
    )
  }

  const handleReplyTextChange = (commentId: string, text: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replyText: text,
          }
        }
        return comment
      }),
    )
  }

  const handleSubmitReply = (commentId: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId && comment.replyText.trim()) {
          const newReply = {
            id: Math.random().toString(36).substring(2, 15),
            authorId: CURRENT_USER.id,
            content: comment.replyText,
            createdAt: new Date(),
            author: CURRENT_USER,
            likes: 0,
            userLiked: false,
          }

          return {
            ...comment,
            replies: [...comment.replies, newReply],
            replyText: "",
            showReplies: true,
          }
        }
        return comment
      }),
    )

    toast({
      title: "Reply added",
      description: "Your reply has been posted successfully",
    })
  }

  const handleLikeReply = (commentId: string, replyId: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          const updatedReplies = comment.replies.map((reply) => {
            if (reply.id === replyId) {
              const newLiked = !reply.userLiked
              return {
                ...reply,
                likes: newLiked ? reply.likes + 1 : reply.likes - 1,
                userLiked: newLiked,
              }
            }
            return reply
          })

          return {
            ...comment,
            replies: updatedReplies,
          }
        }
        return comment
      }),
    )
  }

  // Get vote counts and user votes
  const questionVoteCount = questionVotes[question.id] !== undefined ? questionVotes[question.id] : question.voteCount

  const userQuestionVote = getUserVote(CURRENT_USER.id, question.id)
  const isQuestionSaved =
    savedItems[question.id] !== undefined ? savedItems[question.id] : isItemSaved(CURRENT_USER.id, question.id)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-1 text-slate-600"
          onClick={() => router.push("/dashboard")}
        >
          ← Back to Dashboard
        </Button>

        {/* Question Card */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <Link href={`/profile/${question.author?.id}`} className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={question.author?.name} />
                    <AvatarFallback>{question.author?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium hover:text-emerald-600 hover:underline">{question.author?.name}</p>
                    <p className="text-xs text-slate-500">{formatRelativeTime(question.createdAt)}</p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  {question.isResolved && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Resolved
                    </span>
                  )}
                </div>
              </div>

              <h1 className="mb-4 text-2xl font-bold">{question.title}</h1>
              <p className="mb-4 text-slate-700">{question.body}</p>

              <div className="mb-4 flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-slate-100">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>{question.views} views</span>
                <span>{questionVoteCount} votes</span>
                <span>{answers.length} answers</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 ${userQuestionVote === "up" ? "text-emerald-600" : "text-slate-600"}`}
                  onClick={() => handleVote(question.id, "question", "up")}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Upvote</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 ${userQuestionVote === "down" ? "text-red-600" : "text-slate-600"}`}
                  onClick={() => handleVote(question.id, "question", "down")}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>Downvote</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-slate-600">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handleCopyLink(question.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Copy link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareToSocial("facebook", question.id, question.title)}>
                      <Facebook className="mr-2 h-4 w-4" />
                      <span>Share to Facebook</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareToSocial("twitter", question.id, question.title)}>
                      <Twitter className="mr-2 h-4 w-4" />
                      <span>Share to Twitter</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareToSocial("linkedin", question.id, question.title)}>
                      <Linkedin className="mr-2 h-4 w-4" />
                      <span>Share to LinkedIn</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 ${isQuestionSaved ? "text-emerald-600" : "text-slate-600"}`}
                  onClick={() => handleSaveItem(question.id)}
                >
                  <BookmarkPlus className="h-4 w-4" />
                  <span>{isQuestionSaved ? "Saved" : "Save"}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="mb-6" ref={commentsRef}>
          <h2 className="mb-4 text-xl font-semibold">
            <MessageSquare className="mr-2 inline-block h-5 w-5" />
            Comments
          </h2>

          <Card className="mb-4">
            <CardContent className="p-4">
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex gap-3">
                        <Link href={`/profile/${comment.author?.id}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={comment.author?.name} />
                            <AvatarFallback>{comment.author?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1">
                          <div className="rounded-lg bg-slate-100 p-3">
                            <Link href={`/profile/${comment.author?.id}`} className="hover:underline">
                              <p className="text-sm font-medium">{comment.author?.name}</p>
                            </Link>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          <div className="mt-1 flex gap-4 text-xs text-slate-500">
                            <button
                              className={`flex items-center gap-1 hover:text-emerald-600 ${comment.userLiked ? "text-emerald-600" : ""}`}
                              onClick={() => handleLikeComment(comment.id)}
                            >
                              <Heart className="h-3 w-3" />
                              <span>{comment.likes > 0 ? comment.likes : "Like"}</span>
                            </button>
                            <button className="hover:text-emerald-600" onClick={() => handleToggleReplies(comment.id)}>
                              <span>Reply</span>
                            </button>
                            <span>{formatRelativeTime(comment.createdAt)}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Report</DropdownMenuItem>
                            {comment.authorId === CURRENT_USER.id && <DropdownMenuItem>Delete</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Reply form */}
                      {comment.showReplies && (
                        <div className="ml-11 flex gap-3">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={`/placeholder.svg?height=28&width=28`} alt={CURRENT_USER.name} />
                            <AvatarFallback>{CURRENT_USER.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="relative flex-1">
                            <Textarea
                              placeholder="Write a reply..."
                              className="min-h-[60px] pr-10 resize-none text-sm"
                              value={comment.replyText}
                              onChange={(e) => handleReplyTextChange(comment.id, e.target.value)}
                            />
                            <Button
                              size="icon"
                              className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-emerald-600 p-1 text-white hover:bg-emerald-700"
                              disabled={!comment.replyText.trim()}
                              onClick={() => handleSubmitReply(comment.id)}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.showReplies && comment.replies.length > 0 && (
                        <div className="ml-11 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <Link href={`/profile/${reply.author?.id}`}>
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={`/placeholder.svg?height=28&width=28`} alt={reply.author?.name} />
                                  <AvatarFallback>{reply.author?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </Link>
                              <div className="flex-1">
                                <div className="rounded-lg bg-slate-100 p-3">
                                  <Link href={`/profile/${reply.author?.id}`} className="hover:underline">
                                    <p className="text-sm font-medium">{reply.author?.name}</p>
                                  </Link>
                                  <p className="text-sm">{reply.content}</p>
                                </div>
                                <div className="mt-1 flex gap-4 text-xs text-slate-500">
                                  <button
                                    className={`flex items-center gap-1 hover:text-emerald-600 ${reply.userLiked ? "text-emerald-600" : ""}`}
                                    onClick={() => handleLikeReply(comment.id, reply.id)}
                                  >
                                    <Heart className="h-3 w-3" />
                                    <span>{reply.likes > 0 ? reply.likes : "Like"}</span>
                                  </button>
                                  <span>{formatRelativeTime(reply.createdAt)}</span>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Report</DropdownMenuItem>
                                  {reply.authorId === CURRENT_USER.id && <DropdownMenuItem>Delete</DropdownMenuItem>}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-slate-500">No comments yet. Be the first to comment!</p>
              )}

              <Separator className="my-4" />

              <form onSubmit={handleSubmitComment} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={CURRENT_USER.name} />
                  <AvatarFallback>{CURRENT_USER.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="relative flex-1">
                  <Textarea
                    placeholder="Write a comment..."
                    className="min-h-[60px] pr-10 resize-none"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-emerald-600 p-1 text-white hover:bg-emerald-700"
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Answers Section */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">{answers.length} Answers</h2>

          {answers.map((answer) => {
            const answerVoteCount = answerVotes[answer.id] !== undefined ? answerVotes[answer.id] : answer.voteCount

            const userAnswerVote = getUserVote(CURRENT_USER.id, answer.id)
            const isAnswerSaved =
              savedItems[answer.id] !== undefined ? savedItems[answer.id] : isItemSaved(CURRENT_USER.id, answer.id)

            return (
              <Card key={answer.id} className="mb-4 overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <Link href={`/profile/${answer.author?.id}`} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={answer.author?.name} />
                          <AvatarFallback>{answer.author?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium hover:text-emerald-600 hover:underline">{answer.author?.name}</p>
                          <p className="text-xs text-slate-500">{formatRelativeTime(answer.createdAt)}</p>
                        </div>
                      </Link>
                      {answer.isAccepted && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Accepted Answer
                        </Badge>
                      )}
                    </div>

                    <p className="mb-4 text-slate-700">{answer.content}</p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 ${userAnswerVote === "up" ? "text-emerald-600" : "text-slate-600"}`}
                        onClick={() => handleVote(answer.id, "answer", "up")}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{answerVoteCount}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 ${userAnswerVote === "down" ? "text-red-600" : "text-slate-600"}`}
                        onClick={() => handleVote(answer.id, "answer", "down")}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-slate-600">
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={() => handleCopyLink(answer.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Copy link</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareToSocial("facebook", answer.id, question.title)}>
                            <Facebook className="mr-2 h-4 w-4" />
                            <span>Share to Facebook</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareToSocial("twitter", answer.id, question.title)}>
                            <Twitter className="mr-2 h-4 w-4" />
                            <span>Share to Twitter</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareToSocial("linkedin", answer.id, question.title)}>
                            <Linkedin className="mr-2 h-4 w-4" />
                            <span>Share to LinkedIn</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 ${isAnswerSaved ? "text-emerald-600" : "text-slate-600"}`}
                        onClick={() => handleSaveItem(answer.id)}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                        <span>{isAnswerSaved ? "Saved" : "Save"}</span>
                      </Button>
                    </div>
                    {!answer.isAccepted && question.isResolved === false && question.authorId === CURRENT_USER.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-emerald-600"
                        onClick={() => handleAcceptAnswer(answer.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Accept Answer</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Add Answer Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <Textarea
                placeholder="Write your answer here..."
                className="min-h-[150px]"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                required
              />
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                Post Your Answer
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
