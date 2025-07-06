"use client"

import { Button } from "@/components/ui/button"
import { ContestCard } from "@/components/contest-card"
import { ContestFilters } from "@/components/contest-filters"
import { CONTESTS, type ContestStatus } from "@/lib/contest-data"
import { PlusCircle } from "lucide-react"
import { useState, useMemo } from "react"
import Link from "next/link"
// Add the Navbar component at the top of the component
import { Navbar } from "@/components/navbar"

export default function ContestsPage() {
  const [status, setStatus] = useState<ContestStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  // Extract all unique topics from contests
  const availableTopics = useMemo(() => {
    const topics = new Set<string>()
    CONTESTS.forEach((contest) => {
      contest.topics.forEach((topic) => {
        topics.add(topic)
      })
    })
    return Array.from(topics).sort()
  }, [])

  // Filter contests based on selected filters
  const filteredContests = useMemo(() => {
    return CONTESTS.filter((contest) => {
      // Filter by status
      if (status !== "all" && contest.status !== status) {
        return false
      }

      // Filter by search query
      if (
        searchQuery &&
        !contest.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !contest.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Filter by selected topics
      if (selectedTopics.length > 0 && !selectedTopics.some((topic) => contest.topics.includes(topic))) {
        return false
      }

      return true
    })
  }, [status, searchQuery, selectedTopics])

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Contests</h1>
          <Link href="/contests/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Contest
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <ContestFilters
              status={status}
              setStatus={setStatus}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedTopics={selectedTopics}
              setSelectedTopics={setSelectedTopics}
              availableTopics={availableTopics}
            />
          </div>
          <div className="md:col-span-3">
            {filteredContests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">No contests found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try adjusting your filters or check back later for new contests.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredContests.map((contest) => (
                  <ContestCard key={contest.id} contest={contest} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
