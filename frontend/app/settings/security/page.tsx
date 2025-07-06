"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Smartphone, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SecuritySettings() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    loginAlerts: true,
    trustedDevices: [
      { id: "1", name: "MacBook Pro", lastUsed: "Today", location: "New York, USA", current: true },
      { id: "2", name: "iPhone 13", lastUsed: "Yesterday", location: "New York, USA", current: false },
      { id: "3", name: "Windows PC", lastUsed: "3 days ago", location: "Boston, USA", current: false },
    ],
    loginHistory: [
      { id: "1", device: "MacBook Pro", time: "Today, 10:30 AM", location: "New York, USA", status: "success" },
      { id: "2", device: "iPhone 13", time: "Yesterday, 8:15 PM", location: "New York, USA", status: "success" },
      { id: "3", device: "Unknown Device", time: "May 15, 2023, 3:45 PM", location: "Chicago, USA", status: "blocked" },
    ],
  })

  const handleRemoveDevice = (deviceId: string) => {
    setSecuritySettings({
      ...securitySettings,
      trustedDevices: securitySettings.trustedDevices.filter((device) => device.id !== deviceId),
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Security Settings</h2>
        <p className="text-sm text-slate-500">Manage your account security and monitor login activity</p>
      </div>

      <Separator />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>Add an extra layer of security to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
                <p className="text-sm text-slate-500">
                  Require a verification code when logging in from an unrecognized device
                </p>
              </div>
              <Switch
                id="twoFactor"
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })}
              />
            </div>

            {securitySettings.twoFactorEnabled && (
              <div className="mt-4 rounded-md bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="mt-0.5 h-5 w-5 text-slate-600" />
                  <div>
                    <h4 className="font-medium">Verification Method</h4>
                    <p className="text-sm text-slate-600">SMS to (***) ***-4567</p>
                    <Button variant="link" className="h-auto p-0 text-sm">
                      Change phone number
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login Notifications</CardTitle>
            <CardDescription>Get alerted about new login attempts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="loginAlerts">Enable Login Alerts</Label>
                <p className="text-sm text-slate-500">Receive notifications when someone logs into your account</p>
              </div>
              <Switch
                id="loginAlerts"
                checked={securitySettings.loginAlerts}
                onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginAlerts: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trusted Devices</CardTitle>
            <CardDescription>Manage devices that have access to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border">
              <div className="p-4">
                <h3 className="text-sm font-medium">Your devices</h3>
                <p className="text-xs text-slate-500">These devices have been used to log into your account recently</p>
              </div>
              <div className="divide-y">
                {securitySettings.trustedDevices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-slate-100 p-1.5">
                        <Smartphone className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{device.name}</h4>
                          {device.current && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Last used: {device.lastUsed} • {device.location}
                        </p>
                      </div>
                    </div>
                    {!device.current && (
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveDevice(device.id)}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Login Activity</CardTitle>
            <CardDescription>Review recent login attempts to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="divide-y">
                {securitySettings.loginHistory.map((login) => (
                  <div key={login.id} className="flex items-center justify-between p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-slate-100 p-1.5">
                        <Clock className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{login.device}</h4>
                          {login.status === "success" ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Successful
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Blocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {login.time} • {login.location}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Full Login History
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password Security</CardTitle>
            <CardDescription>Ensure your password is strong and secure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle>Password last changed 6 months ago</AlertTitle>
              <AlertDescription>
                We recommend changing your password every 3 months for optimal security.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button>Change Password</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
