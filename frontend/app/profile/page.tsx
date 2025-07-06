"use client"

import type React from "react"

import { useState, useRef, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle,
  Award,
  BarChart,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle,
  CheckSquare,
  Clock,
  Edit,
  ExternalLink,
  Facebook,
  FileText,
  Github,
  GraduationCap,
  HelpCircle,
  Linkedin,
  Link2,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Star,
  Twitter,
  User,
  Zap,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { CURRENT_USER_PROFILE, formatDate, formatRelativeTime } from "@/lib/profile-data"
import { toast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: CURRENT_USER_PROFILE.name,
    email: CURRENT_USER_PROFILE.email,
    bio: CURRENT_USER_PROFILE.bio,
    university: CURRENT_USER_PROFILE.university || "",
    department: CURRENT_USER_PROFILE.department || "",
    year: CURRENT_USER_PROFILE.year || "",
    location: CURRENT_USER_PROFILE.location || "",
    phone: CURRENT_USER_PROFILE.phone || "",
    website: CURRENT_USER_PROFILE.website || "",
    interests: CURRENT_USER_PROFILE.interests.join(", "),
    github: CURRENT_USER_PROFILE.socialLinks.github || "",
    facebook: CURRENT_USER_PROFILE.socialLinks.facebook || "",
    twitter: CURRENT_USER_PROFILE.socialLinks.twitter || "",
    linkedin: CURRENT_USER_PROFILE.socialLinks.linkedin || "",
  })
  const [avatar, setAvatar] = useState(CURRENT_USER_PROFILE.avatar || "/placeholder.svg?height=96&width=96")
  const [isUploading, setIsUploading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = () => {
    // In a real app, you would save the profile data to the backend
    setIsEditing(false)
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    })
  }

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      // Simulate upload delay
      setTimeout(() => {
        // In a real app, you would upload the file to a server
        // and get back a URL to the uploaded file
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setAvatar(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
        setIsUploading(false)
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        })
      }, 1500)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatar("/placeholder.svg?height=96&width=96")
    toast({
      title: "Avatar removed",
      description: "Your profile picture has been removed.",
    })
  }

  // Get the icon component based on the icon name
  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "check-circle":
        return <CheckCircle className="h-5 w-5" />
      case "book-open":
        return <BookOpen className="h-5 w-5" />
      case "clock":
        return <Clock className="h-5 w-5" />
      case "trophy":
        return <Award className="h-5 w-5" />
      case "file-text":
        return <FileText className="h-5 w-5" />
      case "help-circle":
        return <HelpCircle className="h-5 w-5" />
      case "check-square":
        return <CheckSquare className="h-5 w-5" />
      case "zap":
        return <Zap className="h-5 w-5" />
      default:
        return <Star className="h-5 w-5" />
    }
  }

  // Get the icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "question":
        return <MessageSquare className="h-5 w-5" />
      case "answer":
        return <CheckCircle className="h-5 w-5" />
      case "note":
        return <FileText className="h-5 w-5" />
      case "task":
        return <CheckSquare className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  // Get the background color for activity type
  const getActivityBgColor = (type: string) => {
    switch (type) {
      case "question":
        return "bg-blue-100 text-blue-700"
      case "answer":
        return "bg-emerald-100 text-emerald-700"
      case "note":
        return "bg-purple-100 text-purple-700"
      case "task":
        return "bg-amber-100 text-amber-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  // Get medal color
  const getMedalColor = (medal?: string) => {
    switch (medal) {
      case "gold":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "silver":
        return "bg-slate-100 text-slate-800 border-slate-300"
      case "bronze":
        return "bg-orange-100 text-orange-800 border-orange-300"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300"
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <main className="container mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">My Profile</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Column - Profile Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatar || "/placeholder.svg"} alt={profileData.name} />
                        <AvatarFallback className="text-2xl">{profileData.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                        </div>
                      )}
                      {!isEditing ? (
                        <Button
                          size="icon"
                          variant="outline"
                          className="absolute -right-2 bottom-0 rounded-full bg-white"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="outline"
                          className="absolute -right-2 bottom-0 rounded-full bg-white"
                          onClick={handleAvatarClick}
                        >
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </Button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="w-full space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                          <Input name="name" value={profileData.name} onChange={handleInputChange} className="w-full" />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                          <Input
                            name="email"
                            type="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            className="w-full"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
                          <Textarea
                            name="bio"
                            value={profileData.bio}
                            onChange={handleInputChange}
                            className="w-full"
                            rows={4}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">
                            University/Institution
                          </label>
                          <Input
                            name="university"
                            value={profileData.university}
                            onChange={handleInputChange}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
                          <Input
                            name="department"
                            value={profileData.department}
                            onChange={handleInputChange}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Year/Grade</label>
                          <Input name="year" value={profileData.year} onChange={handleInputChange} className="w-full" />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
                          <Input
                            name="location"
                            value={profileData.location}
                            onChange={handleInputChange}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                          <Input
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Website</label>
                          <Input
                            name="website"
                            value={profileData.website}
                            onChange={handleInputChange}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Interests</label>
                          <Input
                            name="interests"
                            value={profileData.interests}
                            onChange={handleInputChange}
                            className="w-full"
                            placeholder="Separate with commas"
                          />
                          <p className="mt-1 text-xs text-slate-500">Separate interests with commas</p>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveProfile}>
                            <Save className="mr-2 h-4 w-4" /> Save Profile
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="mb-1 text-xl font-bold">{profileData.name}</h2>
                        <p className="text-sm text-slate-500">{profileData.email}</p>

                        <div className="my-4 w-full">
                          <p className="text-center text-sm text-slate-700">{profileData.bio}</p>
                        </div>

                        <div className="w-full space-y-2 text-sm">
                          {profileData.university && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-slate-500" />
                              <span>{profileData.university}</span>
                            </div>
                          )}

                          {profileData.department && (
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-slate-500" />
                              <span>{profileData.department}</span>
                            </div>
                          )}

                          {profileData.year && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-500" />
                              <span>{profileData.year}</span>
                            </div>
                          )}

                          {profileData.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-500" />
                              <span>{profileData.location}</span>
                            </div>
                          )}

                          {profileData.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-500" />
                              <span>{profileData.phone}</span>
                            </div>
                          )}

                          {profileData.website && (
                            <div className="flex items-center gap-2">
                              <Link2 className="h-4 w-4 text-slate-500" />
                              <a
                                href={`https://${profileData.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:underline"
                              >
                                {profileData.website}
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {CURRENT_USER_PROFILE.interests.map((interest, index) => (
                            <Badge key={index} variant="outline" className="bg-slate-100">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Github className="h-5 w-5 text-slate-700" />
                        <Input
                          name="github"
                          value={profileData.github}
                          onChange={handleInputChange}
                          placeholder="GitHub username"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Facebook className="h-5 w-5 text-slate-700" />
                        <Input
                          name="facebook"
                          value={profileData.facebook}
                          onChange={handleInputChange}
                          placeholder="Facebook profile"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Twitter className="h-5 w-5 text-slate-700" />
                        <Input
                          name="twitter"
                          value={profileData.twitter}
                          onChange={handleInputChange}
                          placeholder="Twitter handle"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-slate-700" />
                        <Input
                          name="linkedin"
                          value={profileData.linkedin}
                          onChange={handleInputChange}
                          placeholder="LinkedIn profile"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profileData.github && (
                        <a
                          href={`https://${profileData.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-slate-700 hover:text-emerald-600"
                        >
                          <Github className="h-5 w-5" />
                          <span>{profileData.github}</span>
                        </a>
                      )}

                      {profileData.facebook && (
                        <a
                          href={`https://${profileData.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-slate-700 hover:text-emerald-600"
                        >
                          <Facebook className="h-5 w-5" />
                          <span>{profileData.facebook}</span>
                        </a>
                      )}

                      {profileData.twitter && (
                        <a
                          href={`https://${profileData.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-slate-700 hover:text-emerald-600"
                        >
                          <Twitter className="h-5 w-5" />
                          <span>{profileData.twitter}</span>
                        </a>
                      )}

                      {profileData.linkedin && (
                        <a
                          href={`https://${profileData.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-slate-700 hover:text-emerald-600"
                        >
                          <Linkedin className="h-5 w-5" />
                          <span>{profileData.linkedin}</span>
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-slate-700" />
                        <span>Study Hours</span>
                      </div>
                      <span className="font-medium">{CURRENT_USER_PROFILE.statistics.studyHours}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-slate-700" />
                        <span>Questions Asked</span>
                      </div>
                      <span className="font-medium">{CURRENT_USER_PROFILE.statistics.questionsAsked}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-slate-700" />
                        <span>Questions Answered</span>
                      </div>
                      <span className="font-medium">{CURRENT_USER_PROFILE.statistics.questionsAnswered}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-slate-700" />
                        <span>Notes Created</span>
                      </div>
                      <span className="font-medium">{CURRENT_USER_PROFILE.statistics.notesCreated}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5 text-slate-700" />
                        <span>Tasks Completed</span>
                      </div>
                      <span className="font-medium">{CURRENT_USER_PROFILE.statistics.tasksCompleted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-slate-700" />
                        <span>Contests Participated</span>
                      </div>
                      <span className="font-medium">{CURRENT_USER_PROFILE.statistics.contestsParticipated}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-slate-700" />
                        <span>Ranking</span>
                      </div>
                      <span className="font-medium">
                        {CURRENT_USER_PROFILE.statistics.ranking} / {CURRENT_USER_PROFILE.statistics.totalUsers}
                      </span>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>Top {CURRENT_USER_PROFILE.statistics.percentile}%</span>
                      </div>
                      <Progress value={CURRENT_USER_PROFILE.statistics.percentile} className="h-2" />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-slate-700" />
                        <span>Current Streak</span>
                      </div>
                      <span className="font-medium">{CURRENT_USER_PROFILE.statistics.streak} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-slate-700" />
                        <span>Longest Streak</span>
                      </div>
                      <span className="font-medium">{CURRENT_USER_PROFILE.statistics.longestStreak} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-slate-700" />
                        <span>Total Points</span>
                      </div>
                      <span className="font-medium">{CURRENT_USER_PROFILE.statistics.points}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Tabs */}
            <div className="md:col-span-2">
              <Tabs defaultValue="achievements">
                <TabsList className="mb-6 grid w-full grid-cols-4">
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="contests">Contests</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                </TabsList>

                <TabsContent value="achievements" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Achievements</CardTitle>
                      <CardDescription>Track your progress and earn badges</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {CURRENT_USER_PROFILE.achievements.map((achievement) => (
                          <div key={achievement.id} className="flex items-start gap-4">
                            <div
                              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                achievement.completed
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {getAchievementIcon(achievement.icon)}
                            </div>
                            <div className="flex-1">
                              <div className="mb-1 flex items-center justify-between">
                                <h3 className="font-medium">{achievement.title}</h3>
                                <Badge
                                  variant={achievement.completed ? "default" : "outline"}
                                  className={achievement.completed ? "bg-emerald-100 text-emerald-800" : ""}
                                >
                                  {achievement.completed ? "Completed" : "In Progress"}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600">{achievement.description}</p>
                              {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                                <div className="mt-2">
                                  <div className="mb-1 flex items-center justify-between text-xs">
                                    <span>
                                      {achievement.progress} / {achievement.maxProgress}
                                    </span>
                                    <span>
                                      {Math.round((achievement.progress / achievement.maxProgress) * 100)}% complete
                                    </span>
                                  </div>
                                  <Progress
                                    value={(achievement.progress / achievement.maxProgress) * 100}
                                    className="h-1.5"
                                  />
                                </div>
                              )}
                              <p className="mt-1 text-xs text-slate-500">{formatRelativeTime(achievement.date)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activities" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activities</CardTitle>
                      <CardDescription>Your latest actions on the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {CURRENT_USER_PROFILE.activities.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-4">
                            <div
                              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getActivityBgColor(
                                activity.type,
                              )}`}
                            >
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-slate-600">{activity.title}</p>
                                  <p className="mt-1 text-xs text-slate-500">{formatRelativeTime(activity.date)}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-500 hover:text-emerald-600"
                                  onClick={() => router.push(activity.link)}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contests" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contest History</CardTitle>
                      <CardDescription>Your performance in past contests</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {CURRENT_USER_PROFILE.contests.map((contest) => (
                          <div key={contest.id} className="rounded-lg border p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="font-medium">{contest.name}</h3>
                              <Badge className={getMedalColor(contest.medal)}>
                                {contest.medal
                                  ? contest.medal.charAt(0).toUpperCase() + contest.medal.slice(1)
                                  : contest.rank <= 10
                                    ? "Top 10"
                                    : "Participated"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-slate-500">{formatDate(contest.date)}</p>
                              <p className="text-sm text-slate-500">{contest.category}</p>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                              <div className="rounded-md bg-slate-50 p-2">
                                <p className="text-xs text-slate-500">Rank</p>
                                <p className="font-medium">
                                  {contest.rank} / {contest.totalParticipants}
                                </p>
                              </div>
                              <div className="rounded-md bg-slate-50 p-2">
                                <p className="text-xs text-slate-500">Score</p>
                                <p className="font-medium">{contest.score}</p>
                              </div>
                              <div className="rounded-md bg-slate-50 p-2">
                                <p className="text-xs text-slate-500">Percentile</p>
                                <p className="font-medium">
                                  {Math.round(
                                    ((contest.totalParticipants - contest.rank) / contest.totalParticipants) * 100,
                                  )}
                                  %
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 w-full rounded-lg bg-slate-50 p-4">
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center">
                            <BarChart className="mx-auto h-12 w-12 text-slate-400" />
                            <p className="mt-2 text-sm text-slate-500">Performance chart will be displayed here</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="education" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Education</CardTitle>
                      <CardDescription>Your academic background</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {CURRENT_USER_PROFILE.education.map((edu) => (
                          <div key={edu.id} className="rounded-lg border p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="font-medium">{edu.institution}</h3>
                              <Badge variant="outline" className={edu.current ? "bg-emerald-100 text-emerald-800" : ""}>
                                {edu.current ? "Current" : "Completed"}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">
                              {edu.degree} in {edu.field}
                            </p>
                            <p className="text-sm text-slate-500">
                              {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : "Present"}
                            </p>
                            {edu.description && <p className="mt-2 text-sm text-slate-600">{edu.description}</p>}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Experience</CardTitle>
                      <CardDescription>Your work and research experience</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {CURRENT_USER_PROFILE.experience.map((exp) => (
                          <div key={exp.id} className="rounded-lg border p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="font-medium">{exp.title}</h3>
                              <Badge variant="outline" className={exp.current ? "bg-emerald-100 text-emerald-800" : ""}>
                                {exp.current ? "Current" : "Past"}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{exp.company}</p>
                            {exp.location && (
                              <div className="flex items-center gap-1 text-sm text-slate-500">
                                <MapPin className="h-3 w-3" />
                                <span>{exp.location}</span>
                              </div>
                            )}
                            <p className="text-sm text-slate-500">
                              {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
                            </p>
                            {exp.description && <p className="mt-2 text-sm text-slate-600">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                      <CardDescription>Your technical and professional skills</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {CURRENT_USER_PROFILE.skills.map((skill) => (
                          <div key={skill.id} className="rounded-lg border p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="font-medium">{skill.name}</h3>
                              <Badge
                                className={
                                  skill.level === "expert"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : skill.level === "advanced"
                                      ? "bg-blue-100 text-blue-800"
                                      : skill.level === "intermediate"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-slate-100 text-slate-800"
                                }
                              >
                                {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <User className="h-3 w-3" />
                              <span>{skill.endorsements} endorsements</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Certifications</CardTitle>
                      <CardDescription>Your professional certifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {CURRENT_USER_PROFILE.certifications.map((cert) => (
                          <div key={cert.id} className="rounded-lg border p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="font-medium">{cert.name}</h3>
                              <Badge
                                variant="outline"
                                className={
                                  cert.expirationDate && cert.expirationDate < new Date()
                                    ? "bg-red-100 text-red-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }
                              >
                                {cert.expirationDate && cert.expirationDate < new Date() ? "Expired" : "Active"}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{cert.organization}</p>
                            <p className="text-sm text-slate-500">
                              Issued: {formatDate(cert.issueDate)}
                              {cert.expirationDate && ` · Expires: ${formatDate(cert.expirationDate)}`}
                            </p>
                            {cert.credentialId && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-slate-500">Credential ID: {cert.credentialId}</span>
                                {cert.credentialURL && (
                                  <a
                                    href={cert.credentialURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-emerald-600 hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
