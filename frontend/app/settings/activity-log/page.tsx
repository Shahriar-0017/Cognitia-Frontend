"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  LogIn,
  FileEdit,
  HelpCircle,
  Settings,
  User,
  Trophy,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
} from "lucide-react"
import { getActivityLog, formatDate, type ActivityLogEntry } from "@/lib/settings-data"

export default function ActivityLogPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activityEntries, setActivityEntries] = useState<ActivityLogEntry[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [filteredEntries, setFilteredEntries] = useState<ActivityLogEntry[]>([])

  useEffect(() => {
    const { entries, totalPages: pages } = getActivityLog(currentPage, 10)
    setActivityEntries(entries)
    setTotalPages(pages)
    setFilteredEntries(entries)
  }, [currentPage])

  useEffect(() => {
    // Apply filters
    let filtered = [...activityEntries]

    // Filter by type
    if (activeTab !== "all") {
      filtered = filtered.filter((entry) => entry.type === activeTab)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.description.toLowerCase().includes(query) ||
          entry.device.toLowerCase().includes(query) ||
          (entry.location && entry.location.toLowerCase().includes(query)),
      )
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date()
      const cutoffDate = new Date()

      switch (dateFilter) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case "yesterday":
          cutoffDate.setDate(now.getDate() - 1)
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case "week":
          cutoffDate.setDate(now.getDate() - 7)
          break
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter((entry) => entry.timestamp >= cutoffDate)
    }

    setFilteredEntries(filtered)
  }, [activityEntries, activeTab, searchQuery, dateFilter])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleExportActivityLog = () => {
    // In a real app, this would generate a CSV or PDF file
    alert("Activity log exported successfully!")
  }

  // Helper function to get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return <LogIn className="h-5 w-5" />
      case "note_create":
      case "note_edit":
        return <FileEdit className="h-5 w-5" />
      case "question_post":
      case "answer_post":
        return <HelpCircle className="h-5 w-5" />
      case "profile_update":
        return <User className="h-5 w-5" />
      case "settings_change":
        return <Settings className="h-5 w-5" />
      case "contest_participation":
        return <Trophy className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  // Helper function to get color for activity type
  const getActivityColor = (type: string) => {
    switch (type) {
      case "login":
        return "bg-blue-100 text-blue-700"
      case "note_create":
      case "note_edit":
        return "bg-emerald-100 text-emerald-700"
      case "question_post":
      case "answer_post":
        return "bg-purple-100 text-purple-700"
      case "profile_update":
        return "bg-amber-100 text-amber-700"
      case "settings_change":
        return "bg-slate-100 text-slate-700"
      case "contest_participation":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-slate-500">View and manage your account activity</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Activity</CardTitle>
              <CardDescription>Recent actions performed on your account</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportActivityLog}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search activities..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 sm:grid-cols-7">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="login">Logins</TabsTrigger>
                <TabsTrigger value="note_create">Notes</TabsTrigger>
                <TabsTrigger value="question_post">Questions</TabsTrigger>
                <TabsTrigger value="answer_post">Answers</TabsTrigger>
                <TabsTrigger value="profile_update">Profile</TabsTrigger>
                <TabsTrigger value="settings_change">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                {filteredEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium">No activities found</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {searchQuery
                        ? "Try adjusting your search or filters"
                        : "No activities match the selected filters"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEntries.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-4 p-4 rounded-lg border">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getActivityColor(entry.type)}`}
                        >
                          {getActivityIcon(entry.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h3 className="font-medium">{entry.description}</h3>
                            <span className="text-sm text-slate-500">{formatDate(entry.timestamp)}</span>
                          </div>
                          <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Device:</span>
                              <span>{entry.device}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">IP:</span>
                              <span>{entry.ipAddress}</span>
                            </div>
                            {entry.location && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Location:</span>
                                <span>{entry.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-slate-500">
                          Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
