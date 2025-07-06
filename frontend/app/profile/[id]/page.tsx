"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Award,
  CheckCircle,
  FileText,
  MessageSquare,
  Trophy,
  Users,
  Flame,
  GitlabIcon as GitHub,
  Linkedin,
  Twitter,
  Globe,
  ExternalLink,
  School,
  Briefcase,
  Code,
  BadgeIcon as Certificate,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { getUserById, type UserProfile } from "@/lib/user-data"
import { CURRENT_USER } from "@/lib/mock-data"
import { formatRelativeTime } from "@/lib/mock-data"

export default function ProfilePage() {
  const params = useParams()
  const userId = params?.id as string

  const [user, setUser] = useState<UserProfile | null>(null)
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)

    // If no userId is provided, show current user's profile
    if (!userId || userId === "me") {
      // In a real app, you would fetch the current user's profile from an API
      // For this demo, we'll use the CURRENT_USER from mock data
      const currentUserProfile = getUserById(CURRENT_USER.id)
      setUser(currentUserProfile || null)
      setIsCurrentUser(true)
    } else {
      // Fetch the user profile by ID
      const userProfile = getUserById(userId)
      setUser(userProfile || null)
      setIsCurrentUser(userId === CURRENT_USER.id)
    }

    setIsLoading(false)
  }, [userId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto p-4">
          <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-pulse text-lg">Loading profile...</div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto p-4">
          <div className="flex flex-col justify-center items-center h-[80vh]">
            <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
            <p className="text-slate-500">The user profile you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    )
  }

  // Format join date
  const joinDate = new Date(user.joinDate)
  const joinDateFormatted = joinDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Calculate medal counts
  const goldMedals = user.contestHistory.filter((contest) => contest.result === "gold").length
  const silverMedals = user.contestHistory.filter((contest) => contest.result === "silver").length
  const bronzeMedals = user.contestHistory.filter((contest) => contest.result === "bronze").length

  // Get social icons
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return <GitHub className="h-4 w-4" />
      case "linkedin":
        return <Linkedin className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  // Get skill level color
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-blue-100 text-blue-800"
      case "intermediate":
        return "bg-green-100 text-green-800"
      case "advanced":
        return "bg-purple-100 text-purple-800"
      case "expert":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  // Get contest result badge
  const getContestResultBadge = (result: string) => {
    switch (result) {
      case "gold":
        return <Badge className="bg-yellow-500">Gold</Badge>
      case "silver":
        return <Badge className="bg-slate-400">Silver</Badge>
      case "bronze":
        return <Badge className="bg-amber-700">Bronze</Badge>
      case "participation":
        return <Badge variant="outline">Participation</Badge>
      case "disqualified":
        return <Badge variant="destructive">Disqualified</Badge>
      default:
        return null
    }
  }

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "question":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "answer":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "note":
        return <FileText className="h-4 w-4 text-purple-500" />
      case "task":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "contest":
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-slate-500" />
      default:
        return <FileText className="h-4 w-4 text-slate-500" />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto p-4">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={user.avatar || "/placeholder.svg?height=128&width=128"} alt={user.name} />
                  <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isCurrentUser && (
                  <Button variant="outline" size="sm" className="w-full">
                    Change Photo
                  </Button>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-slate-500">@{user.username}</p>
                  </div>
                  {!isCurrentUser && (
                    <Button className="mt-2 md:mt-0">
                      <Users className="mr-2 h-4 w-4" />
                      Follow
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                  {user.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Joined {joinDateFormatted}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>Last active {formatRelativeTime(user.lastActive)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>{user.stats.streak} day streak</span>
                  </div>
                </div>
                {user.bio && (
                  <div className="mb-4">
                    <p className="text-slate-700">{user.bio}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {user.socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs rounded-full bg-slate-100 px-3 py-1 hover:bg-slate-200 transition-colors"
                    >
                      {getSocialIcon(link.platform)}
                      <span>{link.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{user.stats.questionsAsked}</div>
                <div className="text-sm text-slate-500">Questions Asked</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{user.stats.questionsAnswered}</div>
                <div className="text-sm text-slate-500">Questions Answered</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{user.stats.notesCreated}</div>
                <div className="text-sm text-slate-500">Notes Created</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{user.stats.tasksCompleted}</div>
                <div className="text-sm text-slate-500">Tasks Completed</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{user.stats.contestsParticipated}</div>
                <div className="text-sm text-slate-500">Contests Participated</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{user.stats.rating}</div>
                <div className="text-sm text-slate-500">Rating</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{user.stats.followers}</div>
                <div className="text-sm text-slate-500">Followers</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{user.stats.following}</div>
                <div className="text-sm text-slate-500">Following</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="activities" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="contests">Contest History</TabsTrigger>
            <TabsTrigger value="education">Education & Skills</TabsTrigger>
          </TabsList>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0"
                    >
                      <div className="mt-1 p-1.5 rounded-full bg-slate-100">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{activity.title}</h3>
                          <span className="text-xs text-slate-500">{formatRelativeTime(activity.date)}</span>
                        </div>
                        {activity.description && <p className="text-sm text-slate-600 mt-1">{activity.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.achievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`overflow-hidden ${achievement.completed ? "border-emerald-200" : ""}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 p-2 rounded-full ${achievement.completed ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"}`}
                          >
                            <Award className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{achievement.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{achievement.description}</p>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>
                                  {achievement.progress} / {achievement.maxProgress}
                                </span>
                                <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
                              </div>
                              <Progress
                                value={(achievement.progress / achievement.maxProgress) * 100}
                                className="h-1.5"
                              />
                            </div>
                            {achievement.dateEarned && (
                              <p className="text-xs text-slate-500 mt-2">
                                Earned {formatRelativeTime(achievement.dateEarned)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contest History Tab */}
          <TabsContent value="contests">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contest History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className="text-xl font-bold text-yellow-500">{goldMedals}</div>
                      <div className="text-xs text-slate-500">Gold</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xl font-bold text-slate-400">{silverMedals}</div>
                      <div className="text-xs text-slate-500">Silver</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xl font-bold text-amber-700">{bronzeMedals}</div>
                      <div className="text-xs text-slate-500">Bronze</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xl font-bold text-emerald-600">{user.contestHistory.length}</div>
                    <div className="text-xs text-slate-500">Total Contests</div>
                  </div>
                </div>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {user.contestHistory.map((contest) => (
                    <Card key={contest.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{contest.contestName}</h3>
                              {contest.result && getContestResultBadge(contest.result)}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(contest.date)}</p>
                          </div>
                          {contest.rank && (
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center">
                                <div className="text-lg font-bold text-emerald-600">#{contest.rank}</div>
                                <div className="text-xs text-slate-500">Rank</div>
                              </div>
                              {contest.percentile && (
                                <div className="flex flex-col items-center">
                                  <div className="text-lg font-bold text-emerald-600">
                                    {contest.percentile.toFixed(1)}%
                                  </div>
                                  <div className="text-xs text-slate-500">Percentile</div>
                                </div>
                              )}
                              {contest.score && (
                                <div className="flex flex-col items-center">
                                  <div className="text-lg font-bold text-emerald-600">
                                    {contest.score}/{contest.maxScore}
                                  </div>
                                  <div className="text-xs text-slate-500">Score</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {contest.solved && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>
                                {contest.solved}/{contest.totalProblems} problems solved
                              </span>
                              <span>{Math.round((contest.solved / contest.totalProblems) * 100)}%</span>
                            </div>
                            <Progress value={(contest.solved / contest.totalProblems) * 100} className="h-1.5" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education & Skills Tab */}
          <TabsContent value="education">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.education.map((edu) => (
                      <div key={edu.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0">
                        <div className="mt-1 p-1.5 rounded-full bg-blue-100">
                          <School className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{edu.institution}</h3>
                          <p className="text-sm">
                            {edu.degree} in {edu.field}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(edu.startDate).getFullYear()} -{" "}
                            {edu.current ? "Present" : new Date(edu.endDate).getFullYear()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.experience.map((exp) => (
                      <div key={exp.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0">
                        <div className="mt-1 p-1.5 rounded-full bg-emerald-100">
                          <Briefcase className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{exp.position}</h3>
                          <p className="text-sm">{exp.company}</p>
                          {exp.location && <p className="text-xs text-slate-600">{exp.location}</p>}
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(exp.startDate).getFullYear()} -{" "}
                            {exp.current ? "Present" : new Date(exp.endDate).getFullYear()}
                          </p>
                          {exp.description && <p className="text-sm text-slate-600 mt-1">{exp.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Group skills by category */}
                    {Object.entries(
                      user.skills.reduce(
                        (acc, skill) => {
                          if (!acc[skill.category]) {
                            acc[skill.category] = []
                          }
                          acc[skill.category].push(skill)
                          return acc
                        },
                        {} as Record<string, typeof user.skills>,
                      ),
                    ).map(([category, skills]) => (
                      <div key={category}>
                        <h3 className="text-sm font-medium text-slate-500 mb-2">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <div
                              key={skill.id}
                              className="flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-slate-100"
                            >
                              <Code className="h-3 w-3" />
                              <span>{skill.name}</span>
                              <Badge className={`text-[10px] px-1.5 py-0 ${getSkillLevelColor(skill.level)}`}>
                                {skill.level}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.certifications.map((cert) => (
                      <div key={cert.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0">
                        <div className="mt-1 p-1.5 rounded-full bg-purple-100">
                          <Certificate className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{cert.name}</h3>
                            {cert.valid ? (
                              <Badge className="bg-green-100 text-green-800 text-[10px]">Valid</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 text-[10px]">Expired</Badge>
                            )}
                          </div>
                          <p className="text-sm">{cert.organization}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                            {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                          </p>
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                            >
                              <span>View Credential</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
