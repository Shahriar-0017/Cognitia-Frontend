"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload, Folder, File, Eye, EyeOff, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { NOTES_GROUPS } from "@/lib/mock-data"

interface NewNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (noteData: {
    title: string
    notesGroupId: string
    visibility: "public" | "private"
    tags: string[]
    files: File[]
  }) => void
}

export function NewNoteModal({ isOpen, onClose, onSubmit }: NewNoteModalProps) {
  const [title, setTitle] = useState("")
  const [groupId, setGroupId] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList)
    setFiles((prevFiles) => [...prevFiles, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

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
    if (title.trim() && groupId && files.length > 0) {
      onSubmit({
        title: title.trim(),
        notesGroupId: groupId,
        visibility: isPublic ? "public" : "private",
        tags,
        files,
      })

      // Reset form
      setTitle("")
      setGroupId("")
      setIsPublic(false)
      setTags([])
      setFiles([])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">Create New Note</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="note-title">Note Title</Label>
              <Input
                id="note-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Calculus Integration Techniques"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-group">Group</Label>
              <Select value={groupId} onValueChange={setGroupId} required>
                <SelectTrigger id="note-group">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {NOTES_GROUPS.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="note-visibility">Make Public</Label>
                <Switch id="note-visibility" checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
              <p className="text-xs text-slate-500">
                {isPublic ? (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> This note will be visible to everyone in Global Notes
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <EyeOff className="h-3 w-3" /> This note will only be visible to you
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
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
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload Files</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  dragActive ? "border-emerald-500 bg-emerald-50" : "border-slate-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-10 w-10 text-slate-400" />
                  <p className="text-sm font-medium">Drag and drop files here</p>
                  <p className="text-xs text-slate-500">or</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    Browse Files
                  </Button>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Selected Files ({files.length})</h4>
                  <ul className="max-h-40 overflow-y-auto border rounded-md divide-y">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-2 text-sm">
                        <div className="flex items-center gap-2">
                          {file.name.includes(".") ? (
                            <File className="h-4 w-4 text-slate-400" />
                          ) : (
                            <Folder className="h-4 w-4 text-slate-400" />
                          )}
                          <span className="truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end border-t p-4 mt-auto">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!title.trim() || !groupId || files.length === 0}
            >
              Create Note
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
