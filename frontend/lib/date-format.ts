// Robust date/time formatting helpers for the study plan and dashboard

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "--"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "--"
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatDate(date: Date | string | null | undefined, format = "full"): string {
  if (!date) return "--"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "--"
  if (format === "full") {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } else if (format === "short") {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  } else if (format === "month-day") {
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })
  }
  return d.toLocaleDateString()
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "--"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "--"
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"} ago`
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`
  }
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
  }
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`
  }
  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`
}
