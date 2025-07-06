"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  LifeBuoy,
  MessageSquare,
  FileQuestion,
  BookOpen,
  Mail,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PlusCircle,
} from "lucide-react"
import {
  SUPPORT_TICKETS,
  createSupportTicket,
  addMessageToTicket,
  updateTicketStatus,
  formatDate,
  type SupportTicket,
} from "@/lib/settings-data"
import { useToast } from "@/hooks/use-toast"

export default function SupportPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("tickets")
  const [tickets, setTickets] = useState(SUPPORT_TICKETS)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "medium" as const,
  })

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTicket.subject || !newTicket.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const ticket = createSupportTicket(newTicket.subject, newTicket.description)
    setTickets([ticket, ...tickets])
    setNewTicket({
      subject: "",
      description: "",
      priority: "medium",
    })

    toast({
      title: "Ticket created",
      description: "Your support ticket has been submitted successfully.",
    })

    // Switch to the tickets tab and select the new ticket
    setActiveTab("tickets")
    setSelectedTicket(ticket)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTicket || !newMessage.trim()) return

    const message = addMessageToTicket(selectedTicket.id, newMessage, "user")
    if (message) {
      // Update the tickets state
      setTickets(
        tickets.map((ticket) =>
          ticket.id === selectedTicket.id
            ? { ...ticket, messages: [...ticket.messages, message], updatedAt: new Date() }
            : ticket,
        ),
      )

      // Update the selected ticket
      setSelectedTicket({
        ...selectedTicket,
        messages: [...selectedTicket.messages, message],
        updatedAt: new Date(),
      })

      setNewMessage("")

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      })

      // Simulate a support response after a delay
      setTimeout(() => {
        if (selectedTicket && selectedTicket.status !== "resolved" && selectedTicket.status !== "closed") {
          const supportMessage = addMessageToTicket(
            selectedTicket.id,
            "Thank you for your message. Our support team will review it and get back to you as soon as possible.",
            "support",
          )

          if (supportMessage) {
            // Update the tickets state
            setTickets(
              tickets.map((ticket) =>
                ticket.id === selectedTicket.id
                  ? { ...ticket, messages: [...ticket.messages, supportMessage], updatedAt: new Date() }
                  : ticket,
              ),
            )

            // Update the selected ticket
            setSelectedTicket((prev) =>
              prev
                ? {
                    ...prev,
                    messages: [...prev.messages, supportMessage],
                    updatedAt: new Date(),
                  }
                : null,
            )
          }
        }
      }, 3000)
    }
  }

  const handleUpdateTicketStatus = (status: "open" | "in_progress" | "resolved" | "closed") => {
    if (!selectedTicket) return

    const updated = updateTicketStatus(selectedTicket.id, status)
    if (updated) {
      // Update the tickets state
      setTickets(
        tickets.map((ticket) =>
          ticket.id === selectedTicket.id ? { ...ticket, status, updatedAt: new Date() } : ticket,
        ),
      )

      // Update the selected ticket
      setSelectedTicket({
        ...selectedTicket,
        status,
        updatedAt: new Date(),
      })

      toast({
        title: "Status updated",
        description: `Ticket status has been updated to ${status.replace("_", " ")}.`,
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>
      case "in_progress":
        return <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case "closed":
        return <Badge className="bg-slate-100 text-slate-800">Closed</Badge>
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800">Medium</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-slate-500">Get help with your account and platform features</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets">
            <MessageSquare className="mr-2 h-4 w-4" />
            My Tickets
          </TabsTrigger>
          <TabsTrigger value="new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Ticket
          </TabsTrigger>
          <TabsTrigger value="help">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help Center
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          {/* Change the grid layout for the ticket list and details */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Ticket List - make it wider (2 columns instead of 1) */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Support Tickets</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {tickets.length === 0 ? (
                    <div className="py-8 text-center">
                      <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-slate-500">No support tickets found</p>
                      <Button variant="link" onClick={() => setActiveTab("new")} className="mt-2">
                        Create a new ticket
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={`p-4 cursor-pointer hover:bg-slate-50 ${selectedTicket?.id === ticket.id ? "bg-slate-50" : ""}`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium truncate">{ticket.subject}</h3>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="text-sm text-slate-500 truncate mb-2">{ticket.description}</p>
                          <div className="flex justify-between items-center text-xs text-slate-500">
                            <span>{formatDate(ticket.updatedAt)}</span>
                            {getPriorityBadge(ticket.priority)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ticket Details - adjust to take 3 columns */}
            <div className="md:col-span-3">
              {selectedTicket ? (
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedTicket.subject}</CardTitle>
                        <CardDescription className="mt-1">
                          Created on {formatDate(selectedTicket.createdAt)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedTicket.status)}
                        {getPriorityBadge(selectedTicket.priority)}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant={selectedTicket.status === "open" ? "default" : "outline"}
                        onClick={() => handleUpdateTicketStatus("open")}
                        disabled={selectedTicket.status === "open"}
                      >
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedTicket.status === "in_progress" ? "default" : "outline"}
                        onClick={() => handleUpdateTicketStatus("in_progress")}
                        disabled={selectedTicket.status === "in_progress"}
                      >
                        In Progress
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedTicket.status === "resolved" ? "default" : "outline"}
                        onClick={() => handleUpdateTicketStatus("resolved")}
                        disabled={selectedTicket.status === "resolved"}
                      >
                        Resolved
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedTicket.status === "closed" ? "default" : "outline"}
                        onClick={() => handleUpdateTicketStatus("closed")}
                        disabled={selectedTicket.status === "closed"}
                      >
                        Closed
                      </Button>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="flex-1 overflow-auto py-4">
                    <div className="space-y-4">
                      {selectedTicket.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender === "user"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-slate-100 text-slate-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">{formatDate(message.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t p-4">
                    {selectedTicket.status === "closed" ? (
                      <div className="w-full text-center py-2 text-slate-500">
                        This ticket is closed. You cannot send any more messages.
                      </div>
                    ) : (
                      <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                        <Textarea
                          placeholder="Type your message here..."
                          className="flex-1 min-h-[80px]"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button type="submit" className="self-end" disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    )}
                  </CardFooter>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No ticket selected</h3>
                    <p className="text-slate-500 mb-4">Select a ticket from the list to view details</p>
                    <Button onClick={() => setActiveTab("new")}>Create New Ticket</Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Create New Support Ticket</CardTitle>
              <CardDescription>Describe your issue in detail so we can help you more effectively</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket((prev) => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                      setNewTicket((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide as much detail as possible about your issue"
                    className="min-h-[150px]"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket((prev) => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("tickets")}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Ticket</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileQuestion className="mr-2 h-5 w-5 text-emerald-600" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">How do I reset my password?</h3>
                  <p className="text-sm text-slate-600">
                    You can reset your password by going to the login page and clicking on "Forgot Password". Follow the
                    instructions sent to your email.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">How do I change my email address?</h3>
                  <p className="text-sm text-slate-600">
                    You can change your email address in the Account Settings page. You'll need to verify your new email
                    address.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">How do I delete my account?</h3>
                  <p className="text-sm text-slate-600">
                    You can delete your account in the Account Settings page under the "Danger Zone" section. This
                    action is irreversible.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">How do I create a study group?</h3>
                  <p className="text-sm text-slate-600">
                    You can create a study group from the Dashboard by clicking on "Create Group" and following the
                    prompts.
                  </p>
                </div>
                <Button variant="link" className="mt-2 w-full">
                  View all FAQs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-emerald-600" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Getting Started Guide</h3>
                  <p className="text-sm text-slate-600">
                    Learn the basics of using the platform, from setting up your profile to creating your first study
                    plan.
                  </p>
                  <Button variant="link" className="p-0 h-auto">
                    Read guide
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Study Plan Features</h3>
                  <p className="text-sm text-slate-600">
                    Discover how to create effective study plans, track your progress, and optimize your learning.
                  </p>
                  <Button variant="link" className="p-0 h-auto">
                    Read guide
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Note-Taking System</h3>
                  <p className="text-sm text-slate-600">
                    Learn how to use our advanced note-taking system to organize and review your study materials.
                  </p>
                  <Button variant="link" className="p-0 h-auto">
                    Read guide
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Contest Participation</h3>
                  <p className="text-sm text-slate-600">
                    Understand how to join contests, submit solutions, and view results and rankings.
                  </p>
                  <Button variant="link" className="p-0 h-auto">
                    Read guide
                  </Button>
                </div>
                <Button variant="link" className="mt-2 w-full">
                  Browse all documentation
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LifeBuoy className="mr-2 h-5 w-5 text-emerald-600" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <Mail className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                    <h3 className="font-medium mb-1">Email Support</h3>
                    <p className="text-sm text-slate-600 mb-2">Send us an email and we'll respond within 24 hours.</p>
                    <Button variant="outline" className="w-full">
                      support@cognitia.com
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg text-center">
                    <MessageSquare className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                    <h3 className="font-medium mb-1">Live Chat</h3>
                    <p className="text-sm text-slate-600 mb-2">Chat with our support team in real-time.</p>
                    <Button className="w-full">Start Chat</Button>
                  </div>

                  <div className="p-4 border rounded-lg text-center">
                    <Clock className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                    <h3 className="font-medium mb-1">Support Hours</h3>
                    <p className="text-sm text-slate-600 mb-2">We're available Monday-Friday, 9am-5pm EST.</p>
                    <div className="text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span>Current status:</span>
                        <span className="flex items-center">
                          <CheckCircle2 className="h-3 w-3 text-green-600 mr-1" />
                          Online
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Before contacting support</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Please check our FAQ and documentation first. Many common questions are already answered there.
                        If you still need help, create a support ticket or contact us directly.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
