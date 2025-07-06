"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Users, Globe, Lock } from "lucide-react"

export default function PrivacySettings() {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    activityVisibility: "friends",
    searchable: true,
    showOnlineStatus: true,
    showLastSeen: true,
    allowTagging: "friends",
    showReadReceipts: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would save the privacy settings to the server
    alert("Privacy settings updated successfully!")
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Privacy Settings</h2>
        <p className="text-sm text-slate-500">Control who can see your information and how your data is used</p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Privacy</CardTitle>
            <CardDescription>Control who can see your profile and activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Who can see your profile?</Label>
              <RadioGroup
                value={privacySettings.profileVisibility}
                onValueChange={(value) => setPrivacySettings({ ...privacySettings, profileVisibility: value })}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="profile-public" />
                  <Label htmlFor="profile-public" className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-500" />
                    <span>Everyone (Public)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="friends" id="profile-friends" />
                  <Label htmlFor="profile-friends" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span>Friends Only</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="profile-private" />
                  <Label htmlFor="profile-private" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-500" />
                    <span>Only Me (Private)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Who can see your activity?</Label>
              <RadioGroup
                value={privacySettings.activityVisibility}
                onValueChange={(value) => setPrivacySettings({ ...privacySettings, activityVisibility: value })}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="activity-public" />
                  <Label htmlFor="activity-public" className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-500" />
                    <span>Everyone (Public)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="friends" id="activity-friends" />
                  <Label htmlFor="activity-friends" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span>Friends Only</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="activity-private" />
                  <Label htmlFor="activity-private" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-500" />
                    <span>Only Me (Private)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visibility Options</CardTitle>
            <CardDescription>Control additional visibility settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="searchable">Appear in Search Results</Label>
                <p className="text-sm text-slate-500">Allow others to find you by name in search</p>
              </div>
              <Switch
                id="searchable"
                checked={privacySettings.searchable}
                onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, searchable: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="onlineStatus">Show Online Status</Label>
                <p className="text-sm text-slate-500">Let others see when you're online</p>
              </div>
              <Switch
                id="onlineStatus"
                checked={privacySettings.showOnlineStatus}
                onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showOnlineStatus: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="lastSeen">Show Last Seen</Label>
                <p className="text-sm text-slate-500">Let others see when you were last active</p>
              </div>
              <Switch
                id="lastSeen"
                checked={privacySettings.showLastSeen}
                onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showLastSeen: checked })}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="tagging">Who can tag you?</Label>
              <Select
                value={privacySettings.allowTagging}
                onValueChange={(value) => setPrivacySettings({ ...privacySettings, allowTagging: value })}
              >
                <SelectTrigger id="tagging">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="none">No One</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="readReceipts">Show Read Receipts</Label>
                <p className="text-sm text-slate-500">Let others know when you've read their messages</p>
              </div>
              <Switch
                id="readReceipts"
                checked={privacySettings.showReadReceipts}
                onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showReadReceipts: checked })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="ml-auto">
              Save Privacy Settings
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
