"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, CheckCircle, CalendarPlus2Icon as CalendarIcon2, Trash2 } from "lucide-react"
import { formatDate, formatTime } from "@/lib/date-format"
import type { SubjectArea, Task } from "@/lib/study-plan-data"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScheduleSessionModal } from "./schedule-session-modal"

interface TaskDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onUpdate: (taskId: string, taskData: any) => void
  onDelete: (taskId: string) => void
  onScheduleSession: (sessionData: any) => void
  sessions: any[]
}

export function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  onUpdate,
  onDelete,
  onScheduleSession,
  sessions,
}: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date())
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [subjectArea, setSubjectArea] = useState<SubjectArea>("Mathematics")
  const [estimatedTime, setEstimatedTime] = useState("60")
  const [tags, setTags] = useState("")
  const [status, setStatus] = useState<"not_started" | "in_progress" | "completed">("not_started")
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setDueDate(new Date(task.dueDate))
      setPriority(task.priority)
      setSubjectArea(task.subjectArea)
      setEstimatedTime(task.estimatedTime?.toString() || "60")
      setTags(task.tags.join(", "))
      setStatus(task.status)
    }
  }, [task])

  const handleUpdate = () => {
    if (!task) return

    const taskData = {
      title,
      description,
      dueDate,
      priority,
      subjectArea,
      estimatedTime: Number.parseInt(estimatedTime),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      status: status ? status.toUpperCase() : undefined,
    }

    onUpdate(task.id, taskData)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!task) return
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDelete(task.id)
      onClose()
    }
  }

  const taskSessions = task ? sessions.filter((session) => session.taskId === task.id) : []

  const handleScheduleSession = (sessionData: any) => {
    if (!task) return
    onScheduleSession({
      ...sessionData,
      taskId: task.id,
    })
    setIsScheduleModalOpen(false)
  }

  if (!task) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{isEditing ? "Edit Task" : "Task Details"}</span>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-8 px-2 text-xs">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete} className="h-8 px-2 text-xs">
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </DialogTitle>
            {!isEditing && <DialogDescription>View task details and manage your study sessions.</DialogDescription>}
          </DialogHeader>

          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="sessions">Sessions ({taskSessions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              {isEditing ? (
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Task title"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what you need to do"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? formatDate(dueDate) : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="subject">Subject Area</Label>
                      <Select value={subjectArea} onValueChange={(value: any) => setSubjectArea(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Literature">Literature</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                      <Input
                        id="estimatedTime"
                        type="number"
                        min="5"
                        max="480"
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g. exam prep, chapter 5, homework"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{task.title}</h3>
                    <Badge
                      className={cn(
                        "capitalize",
                        task.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : task.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-800",
                      )}
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-sm text-slate-700">{task.description || "No description provided."}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-slate-500">Due Date</h4>
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-slate-500">Priority</h4>
                      <div className="flex items-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            task.priority === "high"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : task.priority === "medium"
                                ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                                : "border-blue-200 bg-blue-50 text-blue-700",
                          )}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-slate-500">Subject Area</h4>
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-slate-50">
                          {task.subjectArea}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-slate-500">Estimated Time</h4>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-slate-400" />
                        <span>{task.estimatedTime} minutes</span>
                      </div>
                    </div>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-slate-500">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.completedAt && (
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-slate-500">Completed On</h4>
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                        <span>{formatDate(task.completedAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sessions">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Study Sessions</h3>
                  <Button
                    size="sm"
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="h-8 bg-emerald-600 px-2 text-xs hover:bg-emerald-700"
                  >
                    Schedule Session
                  </Button>
                </div>

                {taskSessions.length > 0 ? (
                  <div className="space-y-3">
                    {taskSessions.map((session) => (
                      <div key={session.id} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center">
                            <CalendarIcon2 className="mr-2 h-4 w-4 text-slate-400" />
                            <span className="font-medium">{formatDate(session.startTime, "month-day")}</span>
                          </div>
                          <span className="text-sm text-slate-500">
                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{session.goal || "No goal specified"}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-slate-500">{session.duration} minutes</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              session.completed
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-50 text-slate-700",
                            )}
                          >
                            {session.completed ? "Completed" : "Scheduled"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="text-sm text-slate-500">No study sessions scheduled yet.</p>
                    <Button
                      variant="link"
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="mt-2 text-emerald-600"
                    >
                      Schedule your first session
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} className="bg-emerald-600 hover:bg-emerald-700">
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ScheduleSessionModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleScheduleSession}
        task={task}
      />
    </>
  )
}
