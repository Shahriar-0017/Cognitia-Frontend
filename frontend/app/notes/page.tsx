"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, FolderPlus, Eye, EyeOff, MoreHorizontal } from "lucide-react"
import { NotesFilterControls } from "@/components/notes-filter-controls"
import { GlobalNoteCard } from "@/components/global-note-card"
import { StarRating } from "@/components/star-rating"
import { MyNotesFilter } from "@/components/my-notes-filter"
import { NewGroupModal } from "@/components/new-group-modal"
import { NewNoteModal } from "@/components/new-note-modal"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString()
}

export default function NotesPage() {
  const router = useRouter()
  const [myNotes, setMyNotes] = useState<any[]>([])
  const [globalNotes, setGlobalNotes] = useState<any[]>([])
  const [notesGroups, setNotesGroups] = useState<any[]>([])
  const [recentlyViewedNotes, setRecentlyViewedNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters and UI state
  const [myNotesSearchTerm, setMyNotesSearchTerm] = useState("")
  const [mySortBy, setMySortBy] = useState("recent-edit")
  const [mySortOrder, setMySortOrder] = useState<"asc" | "desc">("desc")
  const [myTags, setMyTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false)
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false)
  const [globalNotesSearchTerm, setGlobalNotesSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterBy, setFilterBy] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [activeSection, setActiveSection] = useState<"my-notes" | "global-notes">("my-notes")

  // Fetch notes and groups from backend
  useEffect(() => {
    setLoading(true)
    const token = localStorage.getItem("token")
    Promise.all([
      fetch("http://localhost:3001/api/notes?visibility=all", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json()),
      fetch("http://localhost:3001/api/notes?visibility=public", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json()),
      fetch("http://localhost:3001/api/notes/groups", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json()).catch(() => ({ groups: [] })),
    ])
      .then(([myNotesData, globalNotesData, groupsData]) => {
        setMyNotes(myNotesData.notes || [])
        setGlobalNotes(globalNotesData.notes || [])
        setNotesGroups(groupsData.groups || [])
        // Recently viewed: sort by updatedAt desc, take 12
        const combinedNotes = [
          ...(myNotesData.notes || []),
          ...(globalNotesData.notes || []),
        ]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 12)
        setRecentlyViewedNotes(combinedNotes)
        // Extract tags
        const tags = new Set<string>()
        combinedNotes.forEach(note => {
          if (note.tags && Array.isArray(note.tags)) {
            note.tags.forEach((tag: string) => tags.add(tag))
          }
        })
        setMyTags(Array.from(tags))
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load notes")
        setLoading(false)
      })
  }, [])

  // Filter and sort my notes
  const filteredMyNotes = useMemo(() => {
    let result = [...myNotes]
    if (myNotesSearchTerm) {
      result = result.filter((note) => note.title.toLowerCase().includes(myNotesSearchTerm.toLowerCase()))
    }
    if (selectedTags.length > 0) {
      result = result.filter((note) =>
        note.tags && note.tags.some((tag: string) => selectedTags.includes(tag))
      )
    }
    result.sort((a, b) => {
      let comparison = 0
      switch (mySortBy) {
        case "recent-edit":
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case "recent-upload":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        default:
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
      return mySortOrder === "asc" ? -comparison : comparison
    })
    return result
  }, [myNotes, myNotesSearchTerm, mySortBy, mySortOrder, selectedTags])

  // Filter and sort global notes
  const filteredGlobalNotes = useMemo(() => {
    let result = [...globalNotes]
    if (globalNotesSearchTerm) {
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(globalNotesSearchTerm.toLowerCase()) ||
          (note.groupName && note.groupName.toLowerCase().includes(globalNotesSearchTerm.toLowerCase())) ||
          (note.author?.name && note.author.name.toLowerCase().includes(globalNotesSearchTerm.toLowerCase()))
      )
    }
    if (filterBy.length > 0) {
      result = result.filter((note) => note.groupName && filterBy.includes(note.groupName))
    }
    if (minRating > 0) {
      result = result.filter((note) => note.rating >= minRating)
    }
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "recent":
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case "likes":
          comparison = (b.likeCount || 0) - (a.likeCount || 0)
          break
        case "views":
          comparison = (b.viewCount || 0) - (a.viewCount || 0)
          break
        case "rating":
          comparison = (b.rating || 0) - (a.rating || 0)
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        default:
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
      return sortOrder === "asc" ? -comparison : comparison
    })
    return result
  }, [globalNotes, globalNotesSearchTerm, filterBy, sortBy, sortOrder, minRating])

  // Handle creating a new group
  const handleCreateGroup = (groupData: { name: string; description: string }) => {
    // In a real app, POST to backend
    alert(`Group "${groupData.name}" created successfully!`)
  }

  // Handle creating a new note
  const handleCreateNote = async (noteData: {
    title: string
    notesGroupId: string
    visibility: "public" | "private"
    tags: string[]
    files: File[]
  }) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("title", noteData.title)
      formData.append("notesGroupId", noteData.notesGroupId)
      formData.append("visibility", noteData.visibility.toUpperCase())
      // Attach files
      if (noteData.files && noteData.files.length > 0) {
        noteData.files.forEach((file) => {
          formData.append("files", file)
        })
      }
      // If you want to save tags, add them here and backend must support it
      // formData.append("tags", JSON.stringify(noteData.tags))
      const res = await fetch("http://localhost:3001/api/notes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create note")
      }
      setIsNewNoteModalOpen(false)
      // Refetch notes
      Promise.all([
        fetch("http://localhost:3001/api/notes?visibility=all", {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.json()),
        fetch("http://localhost:3001/api/notes?visibility=public", {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.json()),
        fetch("http://localhost:3001/api/notes/groups", {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.json()).catch(() => ({ groups: [] })),
      ])
        .then(([myNotesData, globalNotesData, groupsData]) => {
          setMyNotes(myNotesData.notes || [])
          setGlobalNotes(globalNotesData.notes || [])
          setNotesGroups(groupsData.groups || [])
          // Recently viewed: sort by updatedAt desc, take 12
          const combinedNotes = [
            ...(myNotesData.notes || []),
            ...(globalNotesData.notes || []),
          ]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 12)
          setRecentlyViewedNotes(combinedNotes)
          // Extract tags
          const tags = new Set<string>()
          combinedNotes.forEach(note => {
            if (note.tags && Array.isArray(note.tags)) {
              note.tags.forEach((tag: string) => tags.add(tag))
            }
          })
          setMyTags(Array.from(tags))
          setLoading(false)
        })
        .catch(() => {
          setError("Failed to load notes")
          setLoading(false)
        })
    } catch (err: any) {
      setError(err.message || "Failed to create note")
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <main className="container mx-auto p-4">
          <div className="mb-6">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 text-sm font-medium ${activeSection === "my-notes"
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
                onClick={() => setActiveSection("my-notes")}
              >
                My Notes
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${activeSection === "global-notes"
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
                onClick={() => setActiveSection("global-notes")}
              >
                Global Notes
              </button>
            </div>
          </div>

          {/* My Notes Section */}
          {activeSection === "my-notes" && (
            <>
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold">My Notes</h1>
                <div className="flex gap-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsNewNoteModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Note
                  </Button>
                  <Button variant="outline" onClick={() => setIsNewGroupModalOpen(true)}>
                    <FolderPlus className="mr-2 h-4 w-4" /> New Group
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="all">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Notes</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="groups">Groups</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  <MyNotesFilter
                    searchTerm={myNotesSearchTerm}
                    onSearchChange={setMyNotesSearchTerm}
                    sortBy={mySortBy}
                    onSortByChange={setMySortBy}
                    sortOrder={mySortOrder}
                    onSortOrderChange={setMySortOrder}
                    tags={myTags}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                  />

                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredMyNotes.map((note) => (
                      <Link key={note.id} href={`/notes/${note.id}`}>
                        <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs text-slate-500">{formatRelativeTime(note.updatedAt)}</span>
                              {note.visibility === "private" ? (
                                <EyeOff className="h-3 w-3 text-slate-400" />
                              ) : (
                                <Eye className="h-3 w-3 text-slate-400" />
                              )}
                            </div>
                            <h3 className="mb-1 font-medium">{note.title}</h3>
                            <p className="text-sm text-slate-500">
                              {note.groupName}
                            </p>
                            {note.rating > 0 && (
                              <div className="mt-2">
                                <StarRating rating={note.rating} size="sm" readOnly />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="recent" className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {(() => {
                      const seen = new Set();
                      return recentlyViewedNotes.filter(note => {
                        if (seen.has(note.id)) return false;
                        seen.add(note.id);
                        return true;
                      }).map((note) => (
                        <Card
                          key={note.id}
                          className="h-full cursor-pointer transition-shadow hover:shadow-md"
                          onClick={() => router.push(`/notes/${note.id}`)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              router.push(`/notes/${note.id}`)
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                {note.groupName || "Notes"}
                              </span>
                              <span className="text-xs text-slate-500">
                                Viewed {formatRelativeTime(note.updatedAt)}
                              </span>
                            </div>
                            <h3 className="mb-1 font-medium">{note.title}</h3>
                            <p className="text-sm text-slate-500">{note.groupName}</p>
                            {note.rating > 0 && (
                              <div className="mt-2">
                                <StarRating rating={note.rating} size="sm" readOnly />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ));
                    })()}
                  </div>
                </TabsContent>

                <TabsContent value="groups" className="space-y-6">
                  <MyNotesFilter
                    searchTerm={myNotesSearchTerm}
                    onSearchChange={setMyNotesSearchTerm}
                    sortBy={mySortBy}
                    onSortByChange={setMySortBy}
                    sortOrder={mySortOrder}
                    onSortOrderChange={setMySortOrder}
                    tags={myTags}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                  />

                  {notesGroups
                    .filter(
                      (group) =>
                        !myNotesSearchTerm ||
                        group.name.toLowerCase().includes(myNotesSearchTerm.toLowerCase()),
                    )
                    .filter(
                      (group) =>
                        selectedTags.length === 0 ||
                        selectedTags.some((tag) => group.name.toLowerCase().includes(tag.toLowerCase())),
                    )
                    .map((group) => (
                      <Card key={group.id} className="overflow-hidden">
                        <CardHeader className="bg-slate-50 p-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {myNotes.filter((note) => note.notesGroupId === group.id).map((note) => (
                              <Link key={note.id} href={`/notes/${note.id}`}>
                                <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                                  <CardContent className="p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                      <span className="text-xs text-slate-500">
                                        {formatRelativeTime(note.updatedAt)}
                                      </span>
                                      {note.visibility === "private" ? (
                                        <EyeOff className="h-3 w-3 text-slate-400" />
                                      ) : (
                                        <Eye className="h-3 w-3 text-slate-400" />
                                      )}
                                    </div>
                                    <h3 className="font-medium">{note.title}</h3>
                                    {note.rating > 0 && (
                                      <div className="mt-2">
                                        <StarRating rating={note.rating} size="sm" readOnly />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </Link>
                            ))}
                            <Card
                              className="flex h-full cursor-pointer items-center justify-center p-4 text-slate-400 transition-colors hover:bg-slate-50 hover:text-emerald-600"
                              onClick={() => setIsNewNoteModalOpen(true)}
                            >
                              <div className="text-center">
                                <Plus className="mx-auto h-8 w-8" />
                                <p className="mt-2">Add Note</p>
                              </div>
                            </Card>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* Global Notes Section */}
          {activeSection === "global-notes" && (
            <>
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold">Global Notes</h1>
                <p className="text-sm text-slate-500">Discover notes shared by the community</p>
              </div>

              <NotesFilterControls
                searchTerm={globalNotesSearchTerm}
                onSearchChange={setGlobalNotesSearchTerm}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                filterBy={filterBy}
                onFilterByChange={setFilterBy}
                minRating={minRating}
                onMinRatingChange={setMinRating}
              />

              {filteredGlobalNotes.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredGlobalNotes.map((note) => (
                    <GlobalNoteCard
                      key={note.id}
                      id={note.id}
                      title={note.title}
                      author={note.author}
                      groupName={note.groupName}
                      updatedAt={note.updatedAt}
                      viewCount={note.viewCount}
                      likeCount={note.likeCount}
                      dislikeCount={note.dislikeCount}
                      thumbnail={note.thumbnail}
                      rating={note.rating}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <BookOpen className="mb-4 h-12 w-12 text-slate-300" />
                  <h3 className="mb-2 text-xl font-medium">No notes found</h3>
                  <p className="text-sm text-slate-500">
                    {globalNotesSearchTerm || filterBy.length > 0 || minRating > 0
                      ? "Try adjusting your search or filters"
                      : "Be the first to share your notes with the community"}
                  </p>
                </div>
              )}
            </>
          )}
        </main>

        {/* Modals */}
        <NewGroupModal
          isOpen={isNewGroupModalOpen}
          onClose={() => setIsNewGroupModalOpen(false)}
          onSubmit={handleCreateGroup}
        />

        <NewNoteModal
          isOpen={isNewNoteModalOpen}
          onClose={() => setIsNewNoteModalOpen(false)}
          onSubmit={handleCreateNote}
        />
      </div>
    </>
  )
}