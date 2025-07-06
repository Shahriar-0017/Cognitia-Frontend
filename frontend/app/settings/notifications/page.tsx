"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function NotificationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notification Settings</h1>
        <p className="text-slate-500">Manage how and when you receive notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Configure which emails you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Question Answers</h3>
              <p className="text-sm text-slate-500">Receive emails when someone answers your questions</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Comments on Notes</h3>
              <p className="text-sm text-slate-500">Receive emails when someone comments on your notes</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Contest Reminders</h3>
              <p className="text-sm text-slate-500">Receive emails about upcoming contests you've registered for</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Study Plan Reminders</h3>
              <p className="text-sm text-slate-500">Receive emails about your study plan progress</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Marketing Emails</h3>
              <p className="text-sm text-slate-500">Receive emails about new features and promotions</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Configure which push notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Question Answers</h3>
              <p className="text-sm text-slate-500">Receive notifications when someone answers your questions</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Comments on Notes</h3>
              <p className="text-sm text-slate-500">Receive notifications when someone comments on your notes</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Contest Reminders</h3>
              <p className="text-sm text-slate-500">Receive notifications about upcoming contests</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Study Plan Reminders</h3>
              <p className="text-sm text-slate-500">Receive notifications about your study plan progress</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
          <CardDescription>Control how often you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup defaultValue="realtime">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="realtime" id="realtime" />
              <Label htmlFor="realtime" className="font-medium">
                Real-time
              </Label>
              <p className="text-sm text-slate-500 ml-2">Receive notifications as they happen</p>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily" className="font-medium">
                Daily Digest
              </Label>
              <p className="text-sm text-slate-500 ml-2">Receive a daily summary of all notifications</p>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly" className="font-medium">
                Weekly Digest
              </Label>
              <p className="text-sm text-slate-500 ml-2">Receive a weekly summary of all notifications</p>
            </div>
          </RadioGroup>
          <div className="pt-4">
            <Button>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
