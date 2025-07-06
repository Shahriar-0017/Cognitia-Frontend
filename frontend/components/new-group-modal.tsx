"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface NewGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (groupData: { name: string; description: string }) => void
}

export function NewGroupModal({ isOpen, onClose, onSubmit }: NewGroupModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        description: description.trim(),
      })
      setName("")
      setDescription("")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">Create New Group</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Calculus, Physics, Programming"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-description">Description (Optional)</Label>
              <Textarea
                id="group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this group"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end border-t p-4">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={!name.trim()}>
              Create Group
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
