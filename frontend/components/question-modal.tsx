"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CURRENT_USER } from "@/lib/mock-data"

interface QuestionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (questionData: {
    title: string
    body: string
    tags: string[]
  }) => void
}

export function QuestionModal({ isOpen, onClose, onSubmit }: QuestionModalProps) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const modalRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Focus the title input when the modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput) {
      e.preventDefault()
      handleAddTag()
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && body.trim() && tags.length > 0) {
      onSubmit({
        title: title.trim(),
        body: body.trim(),
        tags,
      })
      setTitle("")
      setBody("")
      setTags([])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-lg bg-white shadow-xl transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">Ask a Question</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="mb-4 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={CURRENT_USER.name} />
                <AvatarFallback>{CURRENT_USER.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{CURRENT_USER.name}</p>
                <p className="text-xs text-slate-500">{CURRENT_USER.institute}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  ref={titleInputRef}
                  placeholder="Question title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-0 text-lg font-medium placeholder:text-slate-400 focus-visible:ring-0"
                  required
                />
              </div>

              <div>
                <Textarea
                  placeholder="What would you like to ask?"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[150px] resize-none border-0 placeholder:text-slate-400 focus-visible:ring-0"
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} className="bg-emerald-100 text-emerald-800">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 rounded-full hover:bg-emerald-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tags (e.g., Mathematics, Physics)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag} disabled={!tagInput.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t p-4">
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
              disabled={!title.trim() || !body.trim() || tags.length === 0}
            >
              Post Question
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
