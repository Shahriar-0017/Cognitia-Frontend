"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ChevronLeft,
  Download,
  ThumbsUp,
  ThumbsDown,
  Eye,
  ChevronRight,
  FileText,
  Archive,
  Flag,
  Save,
  FolderPlus,
  Upload,
  Globe,
  Lock,
} from "lucide-react"
import {
  getNoteById,
  formatRelativeTime,
  incrementNoteViewCount,
  updateNoteRating,
  type NoteFile,
  CURRENT_USER,
} from "@/lib/mock-data"
import { FileTree } from "@/components/file-tree"
import { StarRating } from "@/components/star-rating"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { ReportModal } from "@/components/report-modal"
import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

// Helper function to generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

import * as React from "react"

export default function NoteViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const source = searchParams.get("source") || "my-notes" // Default to my-notes if not specified
  const { toast } = useToast()

  // Refs for tracking mounted state
  const isMounted = useRef(true)

  // Note state
  const [note, setNote] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<NoteFile | null>(null)
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [userRating, setUserRating] = useState(0)
  const [userLiked, setUserLiked] = useState<boolean | null>(null)
  const [viewCount, setViewCount] = useState(0)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalFiles, setOriginalFiles] = useState<NoteFile[]>([])
  const [originalVisibility, setOriginalVisibility] = useState<"public" | "private">("private")
  const [visibility, setVisibility] = useState<"public" | "private">("private")

  // Root folder creation
  const [isNewRootFolderDialogOpen, setIsNewRootFolderDialogOpen] = useState(false)
  const [newRootFolderName, setNewRootFolderName] = useState("")

  // Root file upload
  const [isRootUploadDialogOpen, setIsRootUploadDialogOpen] = useState(false)
  const [uploadedRootFiles, setUploadedRootFiles] = useState<FileList | null>(null)

  // Unwrap params using React.use()
  const unwrappedParams = React.use(params)
  const noteId = unwrappedParams.id

  // Check if the current user is the author of the note
  const isAuthor = note?.authorId === CURRENT_USER.id

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Fetch note data from backend
  useEffect(() => {
    if (!noteId) return;
    setNote(null); // reset while loading
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch(`http://localhost:3001/api/notes/${noteId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async res => {
        if (res.status === 404) {
          // Note not found
          setNote(null);
          toast({
            title: "Note not found",
            description: "The note you are looking for does not exist or you do not have access.",
            variant: "destructive",
          });
          return null;
        }
        if (!res.ok) {
          // Other error
          setNote(null);
          toast({
            title: "Error loading note",
            description: `Failed to load note (status ${res.status})`,
            variant: "destructive",
          });
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.note) {
          setNote(data.note);
          setViewCount(data.note.viewCount || 0);
          setOriginalFiles(JSON.parse(JSON.stringify(data.note.files || [])));
          setVisibility(data.note.visibility === "PUBLIC" ? "public" : "private");
          setOriginalVisibility(data.note.visibility === "PUBLIC" ? "public" : "private");
          // Set the first file as selected by default
          if (data.note.files && data.note.files.length > 0) {
            const findFirstFile = (files: NoteFile[]): NoteFile | null => {
              for (const file of files) {
                if (file.type === "file") return file;
                if (file.type === "directory" && file.children) {
                  const found = findFirstFile(file.children);
                  if (found) return found;
                }
              }
              return null;
            };
            const firstFile = findFirstFile(data.note.files);
            if (firstFile) setSelectedFile(firstFile);
          }
        }
      });
  }, [noteId]);

  // Handle visibility change
  const handleVisibilityChange = useCallback(
    (checked: boolean) => {
      const newVisibility = checked ? "public" : "private"
      setVisibility(newVisibility)
      setHasUnsavedChanges(newVisibility !== originalVisibility)
    },
    [originalVisibility],
  )

  // Handle file selection
  const handleSelectFile = useCallback((file: NoteFile) => {
    if (!isMounted.current) return
    setSelectedFile(file)
    setCurrentPage(1) // Reset to first page when changing files
  }, [])

  // Handle rating
  const handleRate = useCallback(
    (rating: number) => {
      if (!isMounted.current) return
      setUserRating(rating)
      updateNoteRating(noteId, rating)
    },
    [noteId],
  )

  // Handle like/dislike
  const handleLike = useCallback(() => {
    if (!isMounted.current || !note) return

    setUserLiked((prev) => {
      const newValue = prev === true ? null : true

      setNote((prevNote: any) => ({
        ...prevNote,
        likeCount: newValue === true ? prevNote.likeCount + 1 : prevNote.likeCount - 1,
        dislikeCount: prev === false && newValue === true ? prevNote.dislikeCount - 1 : prevNote.dislikeCount,
      }))

      return newValue
    })
  }, [note])

  const handleDislike = useCallback(() => {
    if (!isMounted.current || !note) return

    setUserLiked((prev) => {
      const newValue = prev === false ? null : false

      setNote((prevNote: any) => ({
        ...prevNote,
        dislikeCount: newValue === false ? prevNote.dislikeCount + 1 : prevNote.dislikeCount - 1,
        likeCount: prev === true && newValue === false ? prevNote.likeCount - 1 : prevNote.likeCount,
      }))

      return newValue
    })
  }, [note])

  // Handle downloads
  const handleDownloadFile = useCallback(() => {
    if (!isMounted.current || !selectedFile) return

    toast({
      title: "Download started",
      description: `Downloading file: ${selectedFile.name}`,
    })
  }, [selectedFile, toast])

  const handleDownloadAll = useCallback(() => {
    if (!isMounted.current || !note) return

    toast({
      title: "Download started",
      description: `Downloading all files as ZIP for: ${note.title}`,
    })
  }, [note, toast])

  // Handle pagination
  const handleNextPage = useCallback(() => {
    if (!isMounted.current) return
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
  }, [totalPages])

  const handlePrevPage = useCallback(() => {
    if (!isMounted.current) return
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
  }, [])

  // Handle report
  const handleReport = useCallback(
    (reportData: { reason: string; details: string }) => {
      if (!isMounted.current) return

      console.log("Report submitted:", reportData)
      toast({
        title: "Report submitted",
        description: "Thank you for your report. We will review it shortly.",
      })
      setIsReportModalOpen(false)
    },
    [toast],
  )

  // File tree operations
  const handleDeleteFile = useCallback(
    (fileId: string) => {
      if (!isMounted.current || !note) return

      try {
        // Helper function to recursively remove a file from the tree
        const removeFile = (files: NoteFile[]): NoteFile[] => {
          return files.filter((file) => {
            if (file.id === fileId) return false
            if (file.type === "directory" && file.children) {
              file.children = removeFile(file.children)
            }
            return true
          })
        }

        const updatedFiles = removeFile(JSON.parse(JSON.stringify(note.files)))

        setNote((prev: any) => ({ ...prev, files: updatedFiles }))
        setHasUnsavedChanges(true)

        // If the deleted file was selected, select another file
        if (selectedFile?.id === fileId) {
          const findFirstFile = (files: NoteFile[]): NoteFile | null => {
            for (const file of files) {
              if (file.type === "file") return file
              if (file.type === "directory" && file.children && file.children.length > 0) {
                const found = findFirstFile(file.children)
                if (found) return found
              }
            }
            return null
          }

          const firstFile = findFirstFile(updatedFiles)
          setSelectedFile(firstFile)
        }

        toast({
          title: "File deleted",
          description: "The file has been deleted. Don't forget to commit your changes.",
        })
      } catch (error) {
        console.error("Error deleting file:", error)
        toast({
          title: "Error",
          description: "There was an error deleting the file. Please try again.",
          variant: "destructive",
        })
      }
    },
    [note, selectedFile, toast],
  )

  const handleCreateFolder = useCallback(
    (parentId: string, folderName: string) => {
      if (!isMounted.current || !note) return

      try {
        // Create a deep copy of the files array
        const filesCopy = JSON.parse(JSON.stringify(note.files))

        // Helper function to recursively find and update a file in the tree
        const updateFiles = (files: NoteFile[]): NoteFile[] => {
          return files.map((file) => {
            if (file.id === parentId) {
              // Create new folder
            const newFolder: NoteFile = {
              id: generateId(),
              name: folderName,
              type: "directory" as const,
              children: [],
              updatedAt: new Date(),
              size: 0,
            }

              // Add to children if it's a directory
              if (file.type === "directory") {
                return {
                  ...file,
                  children: [...(file.children || []), newFolder],
                }
              }
            }

            // Recursively update children
            if (file.type === "directory" && file.children) {
              return {
                ...file,
                children: updateFiles(file.children),
              }
            }

            return file
          })
        }

        const updatedFiles = updateFiles(filesCopy)

        setNote((prev: any) => ({ ...prev, files: updatedFiles }))
        setHasUnsavedChanges(true)

        toast({
          title: "Folder created",
          description: `Folder "${folderName}" has been created. Don't forget to commit your changes.`,
        })
      } catch (error) {
        console.error("Error creating folder:", error)
        toast({
          title: "Error",
          description: "There was an error creating the folder. Please try again.",
          variant: "destructive",
        })
      }
    },
    [note, toast],
  )

  const handleCreateRootFolder = useCallback(() => {
    if (!isMounted.current || !note || !newRootFolderName.trim()) return

    try {
      const newFolder: NoteFile = {
        id: generateId(),
        name: newRootFolderName.trim(),
        type: "directory" as const,
        children: [],
        updatedAt: new Date(),
        size: 0,
      }

      const updatedFiles = [...JSON.parse(JSON.stringify(note.files)), newFolder]

      setNote((prev: any) => ({ ...prev, files: updatedFiles }))
      setHasUnsavedChanges(true)
      setNewRootFolderName("")
      setIsNewRootFolderDialogOpen(false)

      toast({
        title: "Root folder created",
        description: `Folder "${newRootFolderName.trim()}" has been created. Don't forget to commit your changes.`,
      })
    } catch (error) {
      console.error("Error creating root folder:", error)
      toast({
        title: "Error",
        description: "There was an error creating the root folder. Please try again.",
        variant: "destructive",
      })
    }
  }, [note, newRootFolderName, toast])

  const handleUploadRootFiles = useCallback(() => {
    if (!isMounted.current || !note || !uploadedRootFiles?.length) return

    try {
      // Convert FileList to array of NoteFile objects
      const newFiles: NoteFile[] = Array.from(uploadedRootFiles).map((file) => ({
        id: generateId(),
        name: file.name,
        type: "file" as const,
        content: "# Uploaded File\n\nThis file was just uploaded and its content will be processed.",
        updatedAt: new Date(),
        size: file.size,
      }))

      const updatedFiles = [...JSON.parse(JSON.stringify(note.files)), ...newFiles]

      setNote((prev: any) => ({ ...prev, files: updatedFiles }))
      setHasUnsavedChanges(true)
      setUploadedRootFiles(null)
      setIsRootUploadDialogOpen(false)

      toast({
        title: "Files uploaded",
        description: `${newFiles.length} file(s) have been uploaded. Don't forget to commit your changes.`,
      })
    } catch (error) {
      console.error("Error uploading files:", error)
      toast({
        title: "Error",
        description: "There was an error uploading the files. Please try again.",
        variant: "destructive",
      })
    }
  }, [note, uploadedRootFiles, toast])

  const handleUploadFiles = useCallback(
    (parentId: string, fileList: FileList) => {
      if (!isMounted.current || !note) return

      try {
        // Create a deep copy of the files array
        const filesCopy = JSON.parse(JSON.stringify(note.files))

        // Convert FileList to array of NoteFile objects
        const newFiles: NoteFile[] = Array.from(fileList).map((file) => ({
          id: generateId(),
          name: file.name,
          type: "file" as const,
          content: "# Uploaded File\n\nThis file was just uploaded and its content will be processed.",
          updatedAt: new Date(),
          size: file.size,
        }))

        // Helper function to recursively find and update a file in the tree
        const updateFiles = (files: NoteFile[]): NoteFile[] => {
          return files.map((file) => {
            if (file.id === parentId && file.type === "directory") {
              return {
                ...file,
                children: [...(file.children || []), ...newFiles],
              }
            }

            // Recursively update children
            if (file.type === "directory" && file.children) {
              return {
                ...file,
                children: updateFiles(file.children),
              }
            }

            return file
          })
        }

        const updatedFiles = updateFiles(filesCopy)

        setNote((prev: any) => ({ ...prev, files: updatedFiles }))
        setHasUnsavedChanges(true)

        toast({
          title: "Files uploaded",
          description: `${newFiles.length} file(s) have been uploaded. Don't forget to commit your changes.`,
        })
      } catch (error) {
        console.error("Error uploading files:", error)
        toast({
          title: "Error",
          description: "There was an error uploading the files. Please try again.",
          variant: "destructive",
        })
      }
    },
    [note, toast],
  )

  const handleRenameFile = useCallback(
    (fileId: string, newName: string) => {
      if (!isMounted.current || !note) return

      try {
        // Create a deep copy of the files array
        const filesCopy = JSON.parse(JSON.stringify(note.files))

        // Helper function to recursively find and update a file in the tree
        const updateFiles = (files: NoteFile[]): NoteFile[] => {
          return files.map((file) => {
            if (file.id === fileId) {
              return {
                ...file,
                name: newName,
                updatedAt: new Date(),
              }
            }

            // Recursively update children
            if (file.type === "directory" && file.children) {
              return {
                ...file,
                children: updateFiles(file.children),
              }
            }

            return file
          })
        }

        const updatedFiles = updateFiles(filesCopy)

        setNote((prev: any) => ({ ...prev, files: updatedFiles }))
        setHasUnsavedChanges(true)

        // Update selected file if it was renamed
        if (selectedFile?.id === fileId) {
          setSelectedFile((prev) => (prev ? { ...prev, name: newName } : null))
        }

        toast({
          title: "File renamed",
          description: `The file has been renamed to "${newName}". Don't forget to commit your changes.`,
        })
      } catch (error) {
        console.error("Error renaming file:", error)
        toast({
          title: "Error",
          description: "There was an error renaming the file. Please try again.",
          variant: "destructive",
        })
      }
    },
    [note, selectedFile, toast],
  )

  const handleCommitChanges = useCallback(() => {
    if (!isMounted.current || !note) return

    try {
      // In a real app, this would send the changes to the backend
      setHasUnsavedChanges(false)

      // Create a deep copy of the current files to update the original files reference
      setOriginalFiles(JSON.parse(JSON.stringify(note.files || [])))
      setOriginalVisibility(visibility)

      // Update the note with the new visibility
      setNote((prev: any) => ({ ...prev, visibility }))

      toast({
        title: "Changes saved",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      console.error("Error committing changes:", error)
      toast({
        title: "Error",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive",
      })
    }
  }, [note, visibility, toast])

  const handleDiscardChanges = useCallback(() => {
    if (!isMounted.current || !note) return

    try {
      if (window.confirm("Are you sure you want to discard all changes?")) {
        // Restore the original files and visibility
        setNote((prev: any) => ({
          ...prev,
          files: JSON.parse(JSON.stringify(originalFiles)),
          visibility: originalVisibility,
        }))
        setVisibility(originalVisibility)
        setHasUnsavedChanges(false)

        toast({
          title: "Changes discarded",
          description: "Your changes have been discarded.",
        })
      }
    } catch (error) {
      console.error("Error discarding changes:", error)
      toast({
        title: "Error",
        description: "There was an error discarding your changes. Please try again.",
        variant: "destructive",
      })
    }
  }, [originalFiles, originalVisibility, note, toast])

  if (!note) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Note not found</h2>
          <p className="text-slate-500">The note you are looking for does not exist or you do not have access.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-1 text-slate-600"
          onClick={() => router.push(`/notes?tab=${source}`)}
        >
          <ChevronLeft className="h-4 w-4" /> Back to {source === "global-notes" ? "Global Notes" : "My Notes"}
        </Button>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{note.title}</h1>
            <div className="mt-1 flex items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Make the author's avatar and name clickable */}
                <Link href={`/profile/${note.authorId}`} className="flex items-center gap-2 hover:text-emerald-600">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={`/placeholder.svg?height=24&width=24`} alt={note.author?.name} />
                    <AvatarFallback>{note.author?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-slate-600 hover:text-emerald-600 hover:underline">
                    {note.author?.name || "Unknown Author"}
                  </span>
                </Link>
              </div>
              <span className="text-sm text-slate-500">Updated {formatRelativeTime(note.updatedAt)}</span>
              {note.groupName && (
                <Badge variant="outline" className="bg-slate-50">
                  {note.groupName}
                </Badge>
              )}
              {/* Visibility badge */}
              <Badge
                variant="outline"
                className={cn(
                  "bg-slate-50 flex items-center gap-1",
                  visibility === "public" ? "text-emerald-600" : "text-slate-500",
                )}
              >
                {visibility === "public" ? (
                  <>
                    <Globe className="h-3 w-3" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" /> Private
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Commit changes button for author */}
          {isAuthor && hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDiscardChanges}>
                Discard
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={handleCommitChanges}>
                <Save className="mr-2 h-4 w-4" />
                Commit Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Left Sidebar - File Tree */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              isLeftSidebarCollapsed ? "lg:col-span-0 lg:w-0 overflow-hidden" : "lg:col-span-1",
            )}
          >
            <Card className="h-full overflow-hidden">
              <div className="flex items-center justify-between border-b p-3">
                <h3 className="font-medium">Files</h3>
                <div className="flex items-center gap-2">
                  {/* Add buttons for root operations */}
                  {isAuthor && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setIsNewRootFolderDialogOpen(true)}
                        title="Add Root Folder"
                        type="button"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setIsRootUploadDialogOpen(true)}
                        title="Upload Files to Root"
                        type="button"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setIsLeftSidebarCollapsed(true)}
                    type="button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-2">
                <FileTree
                  files={note.files || []}
                  onSelectFile={handleSelectFile}
                  selectedFileId={selectedFile?.id || null}
                  isEditable={isAuthor}
                  onDeleteFile={isAuthor ? handleDeleteFile : undefined}
                  onCreateFolder={isAuthor ? handleCreateFolder : undefined}
                  onUploadFiles={isAuthor ? handleUploadFiles : undefined}
                  onRenameFile={isAuthor ? handleRenameFile : undefined}
                />
              </div>
            </Card>
          </div>

          {/* Main Content - Note Viewer */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              isLeftSidebarCollapsed ? "lg:col-span-4" : "lg:col-span-3",
            )}
          >
            <Card className="h-full overflow-hidden">
              {/* File Viewer Header */}
              <div className="flex items-center justify-between border-b p-3">
                <div className="flex items-center gap-2">
                  {isLeftSidebarCollapsed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setIsLeftSidebarCollapsed(false)}
                      type="button"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                  <h3 className="font-medium">
                    {selectedFile ? (
                      <>
                        <FileText className="mr-2 inline-block h-4 w-4 text-slate-400" />
                        {selectedFile.name}
                      </>
                    ) : (
                      "Select a file to view"
                    )}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    type="button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    type="button"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* File Content */}
              <div className="h-[calc(100vh-350px)] overflow-y-auto p-6">
                {selectedFile && selectedFile.type === "file" && selectedFile.content ? (
                  <MarkdownRenderer content={selectedFile.content} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                      <h3 className="text-lg font-medium">No file selected</h3>
                      <p className="text-sm text-slate-500">Select a file from the sidebar to view its contents.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with Actions */}
              <div className="border-t p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "flex items-center gap-1",
                          userLiked === true ? "text-emerald-600" : "text-slate-600",
                        )}
                        onClick={handleLike}
                        type="button"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{note.likeCount || 0}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "flex items-center gap-1",
                          userLiked === false ? "text-red-600" : "text-slate-600",
                        )}
                        onClick={handleDislike}
                        type="button"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{note.dislikeCount || 0}</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Eye className="h-4 w-4" />
                      <span>{viewCount} views</span>
                    </div>

                    {/* Report button for non-author in global notes */}
                    {!isAuthor && source === "global-notes" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-slate-600 hover:text-red-600"
                        onClick={() => setIsReportModalOpen(true)}
                        type="button"
                      >
                        <Flag className="h-4 w-4" />
                        <span>Report</span>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <StarRating rating={note.rating || 0} readOnly={userRating > 0} onRate={handleRate} size="sm" />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={handleDownloadFile}
                        disabled={!selectedFile}
                        type="button"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download File</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={handleDownloadAll}
                        type="button"
                      >
                        <Archive className="h-4 w-4" />
                        <span>Download All</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Visibility toggle for author */}
                {isAuthor && source === "my-notes" && (
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {visibility === "public" ? (
                        <Globe className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-slate-500" />
                      )}
                      <span className="font-medium">Visibility:</span>
                      <span className={visibility === "public" ? "text-emerald-600" : "text-slate-500"}>
                        {visibility === "public" ? "Public" : "Private"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Make Public</span>
                      <Switch checked={visibility === "public"} onCheckedChange={handleVisibilityChange} />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReport}
        noteTitle={note.title}
      />

      {/* New Root Folder Dialog */}
      <Dialog
        open={isNewRootFolderDialogOpen}
        onOpenChange={(open) => {
          if (!open) setNewRootFolderName("")
          setIsNewRootFolderDialogOpen(open)
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>Create Root Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rootFolderName">Folder Name</Label>
              <Input
                id="rootFolderName"
                value={newRootFolderName}
                onChange={(e) => setNewRootFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleCreateRootFolder()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewRootFolderDialogOpen(false)
                setNewRootFolderName("")
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRootFolder} type="button">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Root Upload Dialog */}
      <Dialog
        open={isRootUploadDialogOpen}
        onOpenChange={(open) => {
          if (!open) setUploadedRootFiles(null)
          setIsRootUploadDialogOpen(open)
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>Upload Files to Root</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rootFiles">Select Files (PDF or Images only)</Label>
              <Input
                id="rootFiles"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                multiple
                onChange={(e) => setUploadedRootFiles(e.target.files)}
              />
              <p className="text-xs text-slate-500">Only PDF and image files are allowed</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRootUploadDialogOpen(false)
                setUploadedRootFiles(null)
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button onClick={handleUploadRootFiles} type="button">
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
