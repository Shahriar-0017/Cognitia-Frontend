"use client"

import { useState } from "react"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { formatDate, type Task } from "@/lib/study-plan-data"
import { cn } from "@/lib/utils"
import { TimePicker } from "./time-picker"

interface ScheduleSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (sessionData: any) => void
  task: Task
}

export function ScheduleSessionModal({ isOpen, onClose, onSave, task }: ScheduleSessionModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState<string>("09:00")
  const [endTime, setEndTime] = useState<string>("10:00")
  const [goal, setGoal] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

  const handleSave = () => {
    if (!date) return

    // Create start and end time Date objects
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const startDateTime = new Date(date)
    startDateTime.setHours(startHour, startMinute, 0)

    const endDateTime = new Date(date)
    endDateTime.setHours(endHour, endMinute, 0)

    // Calculate duration in minutes
    const durationMs = endDateTime.getTime() - startDateTime.getTime()
    const durationMinutes = Math.round(durationMs / (1000 * 60))

    const sessionData = {
      id: Math.random().toString(36).substring(2, 11),
      taskId: task.id,
      startTime: startDateTime,
      endTime: endDateTime,
      duration: durationMinutes,
      goal,
      notes,
      completed: false,
    }

    onSave(sessionData)
    resetForm()
  }

  const resetForm = () => {
    setDate(new Date())
    setStartTime("09:00")
    setEndTime("10:00")
    setGoal("")
    setNotes("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent hideCloseButton={true} className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Study Session</DialogTitle>
          <DialogDescription>
            Plan a study session for: <span className="font-medium">{task.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? formatDate(date) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <TimePicker value={startTime} onChange={setStartTime} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <TimePicker value={endTime} onChange={setEndTime} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="goal">Session Goal</Label>
            <Input
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What do you want to accomplish?"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes for this session"
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
            Schedule Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
