"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  LineChart,
  Clock3,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatTime, formatDate } from "@/lib/date-format"
import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { NewTaskModal } from "@/components/new-task-modal"
import { TaskDetailsModal } from "@/components/task-details-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudyPlanPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
  const [progressTimeframe, setProgressTimeframe] = useState("weekly")
  const [expandedSection, setExpandedSection] = useState<string | null>("focus")
  const [selectedSubject, setSelectedSubject] = useState("all")

  // State for tasks and sessions from API
  const [tasks, setTasks] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch tasks and today's sessions from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const [tasksRes, sessionsRes] = await Promise.all([
          fetch("http://localhost:3001/api/tasks", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3001/api/tasks/today", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        if (!tasksRes.ok || !sessionsRes.ok) throw new Error("Failed to fetch data")
        const tasksData = await tasksRes.json()
        const sessionsData = await sessionsRes.json()
        setTasks(tasksData.tasks || [])
        setSessions(sessionsData.sessions || [])
      } catch (err) {
        setError("Failed to load tasks or sessions.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Helper functions to filter tasks
  const todaysTasks = tasks.filter((task) => {
    const taskDate = new Date(task.dueDate)
    const today = new Date()
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear() &&
      task.status !== "COMPLETED" && task.status !== "completed"
    )
  })
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED" || task.status === "completed")
  const upcomingTasks = tasks.filter((task) => {
    const taskDate = new Date(task.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate > today && task.status !== "COMPLETED" && task.status !== "completed"
  })
  const todaysSessions = sessions

  // TODO: Implement handleCreateTask to POST to /api/tasks
  const handleCreateTask = async (taskData) => {
    try {
      const token = localStorage.getItem("token")
      // Map priority to uppercase for backend
      const payload = {
        ...taskData,
        priority: taskData.priority ? taskData.priority.toUpperCase() : undefined,
      }
      // Remove status, createdAt, completedAt, id if present
      delete payload.status
      delete payload.createdAt
      delete payload.completedAt
      delete payload.id
      const res = await fetch("http://localhost:3001/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to create task")
      const data = await res.json()
      setTasks((prev) => [...prev, data.task])
      setIsNewTaskModalOpen(false)
    } catch (err) {
      alert("Failed to create task.")
    }
  }

  // TODO: Implement handleUpdateTask to PUT to /api/tasks/:id
  // Update task: if only status is being updated, use /status endpoint, else use full update
  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const token = localStorage.getItem("token")
      let url = `http://localhost:3001/api/tasks/${taskId}`
      let method = "PUT"
      let payload = { ...taskData }
      // If only status is being updated, use /status endpoint
      if (Object.keys(taskData).length === 1 && taskData.status) {
        url = `http://localhost:3001/api/tasks/${taskId}/status`
        payload.status = taskData.status.toUpperCase()
      } else {
        // Map priority to uppercase if present
        if (payload.priority) payload.priority = payload.priority.toUpperCase()
        // Remove status, createdAt, completedAt, id if present (unless status is being updated)
        if (!('status' in payload)) delete payload.status
        delete payload.createdAt
        delete payload.completedAt
        delete payload.id
      }
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to update task")
      const data = await res.json()
      setTasks((prev) => prev.map((task) => (task.id === taskId ? data.task : task)))
    } catch (err) {
      alert("Failed to update task.")
    }
  }

  // TODO: Implement handleDeleteTask to DELETE /api/tasks/:id
  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to delete task")
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      setSessions((prev) => prev.filter((session) => session.taskId !== taskId))
    } catch (err) {
      alert("Failed to delete task.")
    }
  }

  // TODO: Implement handleScheduleSession to POST to /api/tasks/generate or similar if needed
  const handleScheduleSession = (sessionData) => {
    // Implement as needed, depending on backend API
    // For now, just update local state
    setSessions((prev) => [...prev, sessionData])
  }

  const openTaskDetails = (task) => {
    setSelectedTask(task)
    setIsTaskDetailsModalOpen(true)
  }

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  // No mock subject progress data. You can fetch or compute this from backend if needed.
  const filteredSubjectProgress = []

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold">Study Plan</h1>
          <div className="flex gap-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsNewTaskModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Task
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? formatDate(date) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Tabs defaultValue="today">
              <TabsList className="mb-6">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todaysSessions.length > 0 ? (
                      <div className="space-y-4">
                        {todaysSessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-start gap-4 rounded-lg border p-4 hover:bg-slate-50"
                            onClick={() => {
                              const task = tasks.find((t) => t.id === session.taskId)
                              if (task) openTaskDetails(task)
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="mb-1 flex items-center justify-between">
                                <h3 className="font-medium">{session.task?.title}</h3>
                                <span className="text-sm text-slate-500">
                                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">{session.goal}</p>
                              <div className="mt-2 flex items-center">
                                <Badge variant="outline" className="mr-2 bg-emerald-50 text-emerald-700">
                                  {session.task?.subjectArea}
                                </Badge>
                                <span className="text-xs text-slate-500">{session.duration} minutes</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        <p>No sessions scheduled for today</p>
                        <Button
                          variant="link"
                          className="mt-2 text-emerald-600"
                          onClick={() => setIsNewTaskModalOpen(true)}
                        >
                          Schedule a session
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tasks Due Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todaysTasks.length > 0 ? (
                      <div className="space-y-2">
                        {todaysTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50"
                            onClick={() => openTaskDetails(task)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300">
                              <CheckCircle2 className="h-4 w-4 text-slate-300" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="bg-slate-50 text-slate-700">
                                  {task.subjectArea}
                                </Badge>
                                <span className="text-xs text-slate-500">Priority: {task.priority}</span>
                                {task.estimatedTime && (
                                  <span className="text-xs text-slate-500">{task.estimatedTime} min</span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpdateTask(task.id, { status: "IN_PROGRESS" })
                            }}
                            >
                              Start
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        <p>No tasks due today</p>
                        <Button
                          variant="link"
                          className="mt-2 text-emerald-600"
                          onClick={() => setIsNewTaskModalOpen(true)}
                        >
                          Add a task
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {upcomingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50"
                          onClick={() => openTaskDetails(task)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-slate-300" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{task.title}</h4>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline" className="bg-slate-50 text-slate-700">
                                {task.subjectArea}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                Due: {formatDate(task.dueDate, "month-day")}
                              </span>
                              <span className="text-xs text-slate-500">Priority: {task.priority}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              const task = tasks.find((t) => t.id === task.id)
                              if (task) {
                                setSelectedTask(task)
                                setIsTaskDetailsModalOpen(true)
                              }
                            }}
                          >
                            Schedule
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Completed Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {completedTasks.length > 0 ? (
                      <div className="space-y-2">
                        {completedTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50"
                            onClick={() => openTaskDetails(task)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                              <CheckCheck className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                                  {task.subjectArea}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  Completed: {formatDate(task.completedAt!, "short")}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        <p>No completed tasks yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Progress Overview</span>
                  <Select value={progressTimeframe} onValueChange={setProgressTimeframe}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Today's Progress */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">Today&apos;s Progress</h4>
                      <span className="text-sm font-medium text-emerald-600">
                        {todaysSessions.filter((s) => s.completed).length}/{todaysSessions.length} sessions
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${
                            todaysSessions.length
                              ? (todaysSessions.filter((s) => s.completed).length / todaysSessions.length) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Weekly Progress */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">Weekly Progress</h4>
                      <span className="text-sm font-medium text-emerald-600">
                        {completedTasks.length}/{completedTasks.length + todaysTasks.length + upcomingTasks.length}{" "}
                        tasks
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${
                            completedTasks.length + todaysTasks.length + upcomingTasks.length
                              ? (
                                  completedTasks.length /
                                    (completedTasks.length + todaysTasks.length + upcomingTasks.length)
                                ) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  {/* Monthly Progress, Study Time, Focus Areas, and Subject Progress removed: use backend data or implement as needed */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleCreateTask}
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
