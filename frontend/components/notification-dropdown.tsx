"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bell, Loader2 } from "lucide-react"
import {
  NOTIFICATIONS,
  markAllAsRead,
  markAsRead,
  getNotificationMessage,
  getUnreadCount,
} from "@/lib/notification-data"
import { formatRelativeTime } from "@/lib/mock-data"

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [unreadCount, setUnreadCount] = useState(getUnreadCount())
  const [displayedNotifications, setDisplayedNotifications] = useState([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 5

  // Load initial notifications
  useEffect(() => {
    if (isOpen) {
      loadNotifications(1)
    } else {
      // Reset pagination when dropdown is closed
      setPage(1)
      setHasMore(true)
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Load notifications with pagination
  const loadNotifications = (pageNum: number) => {
    setIsLoading(true)

    // Simulate API call with setTimeout
    setTimeout(() => {
      const start = (pageNum - 1) * ITEMS_PER_PAGE
      const end = start + ITEMS_PER_PAGE
      const newNotifications = NOTIFICATIONS.slice(start, end)

      if (pageNum === 1) {
        setDisplayedNotifications(newNotifications)
      } else {
        setDisplayedNotifications((prev) => [...prev, ...newNotifications])
      }

      setPage(pageNum)
      setHasMore(end < NOTIFICATIONS.length)
      setIsLoading(false)
    }, 500) // Simulate network delay
  }

  // Handle loading more notifications
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadNotifications(page + 1)
    }
  }

  // Handle marking a notification as read
  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
    setDisplayedNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
    setUnreadCount(getUnreadCount())
  }

  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    markAllAsRead()
    setDisplayedNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
    setUnreadCount(0)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        size="icon"
        variant="ghost"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border bg-white shadow-lg z-50">
          <div className="flex items-center justify-between p-4">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-emerald-600 hover:text-emerald-700"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
          <Separator />

          <div className="max-h-[400px] overflow-y-auto">
            {displayedNotifications.length > 0 ? (
              <>
                {displayedNotifications.map((notification) => (
                  <div key={notification.id} className="relative">
                    <Link
                      href={`/question/${notification.questionId}`}
                      className={`block p-4 hover:bg-slate-50 ${!notification.isRead ? "bg-emerald-50" : ""}`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={notification.actorAvatar || "/placeholder.svg"}
                            alt={notification.actorName}
                          />
                          <AvatarFallback>{notification.actorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">{getNotificationMessage(notification)}</p>
                          <p className="text-xs text-slate-500">{formatRelativeTime(notification.createdAt)}</p>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        </div>
                      )}
                    </Link>
                    <Separator />
                  </div>
                ))}

                {hasMore && (
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center text-sm text-emerald-600 hover:bg-slate-50"
                      onClick={handleLoadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "See more"
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
