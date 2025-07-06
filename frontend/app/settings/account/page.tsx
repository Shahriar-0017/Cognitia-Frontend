"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Smartphone, Globe, LogOut, AlertTriangle } from "lucide-react"
import { ACCOUNT_SETTINGS, updateAccountSettings } from "@/lib/settings-data"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AccountSettings() {
  const { toast } = useToast()
  const [accountData, setAccountData] = useState(ACCOUNT_SETTINGS)
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPassword((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.new !== password.confirm) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would submit the form data to an API
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully.",
    })
    setPassword({ current: "", new: "", confirm: "" })
  }

  const handleAccountDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAccountData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggle2FA = (checked: boolean) => {
    setAccountData((prev) => ({ ...prev, twoFactorEnabled: checked }))
    updateAccountSettings({ twoFactorEnabled: checked })

    toast({
      title: checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
      description: checked ? "Your account is now more secure." : "Two-factor authentication has been disabled.",
    })
  }

  const handleSaveAccountInfo = () => {
    updateAccountSettings({
      email: accountData.email,
      username: accountData.username,
      phoneNumber: accountData.phoneNumber,
    })

    toast({
      title: "Account information updated",
      description: "Your account information has been updated successfully.",
    })
  }

  const handleDisconnectAccount = (platform: "google" | "facebook" | "github") => {
    const updatedConnectedAccounts = { ...accountData.connectedAccounts }
    updatedConnectedAccounts[platform] = { connected: false }

    setAccountData((prev) => ({
      ...prev,
      connectedAccounts: updatedConnectedAccounts,
    }))

    updateAccountSettings({
      connectedAccounts: updatedConnectedAccounts,
    })

    toast({
      title: "Account disconnected",
      description: `Your ${platform} account has been disconnected.`,
    })
  }

  const handleConnectAccount = (platform: "google" | "facebook" | "github") => {
    // In a real app, this would redirect to OAuth flow
    const mockConnectedAccount = {
      google: {
        connected: true,
        email: "john.doe@gmail.com",
        lastUsed: new Date(),
      },
      github: {
        connected: true,
        username: "johndoe",
        lastUsed: new Date(),
      },
      facebook: {
        connected: true,
        name: "John Doe",
        lastUsed: new Date(),
      },
    }

    const updatedConnectedAccounts = { ...accountData.connectedAccounts }
    updatedConnectedAccounts[platform] = mockConnectedAccount[platform]

    setAccountData((prev) => ({
      ...prev,
      connectedAccounts: updatedConnectedAccounts,
    }))

    updateAccountSettings({
      connectedAccounts: updatedConnectedAccounts,
    })

    toast({
      title: "Account connected",
      description: `Your ${platform} account has been connected successfully.`,
    })
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== "DELETE") {
      toast({
        title: "Confirmation required",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would call an API to delete the account
    toast({
      title: "Account deleted",
      description: "Your account has been permanently deleted.",
    })
    setIsDeleteDialogOpen(false)
    // In a real app, you would redirect to a logout page or home page
  }

  const handleLogoutAllSessions = () => {
    // In a real app, this would call an API to invalidate all sessions
    toast({
      title: "Logged out of all sessions",
      description: "You have been logged out of all devices.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-slate-500">Manage your account settings and security preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Update your basic account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex gap-2">
              <Input id="username" name="username" value={accountData.username} onChange={handleAccountDataChange} />
              <Button onClick={handleSaveAccountInfo}>Save</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="email"
                name="email"
                type="email"
                value={accountData.email}
                onChange={handleAccountDataChange}
              />
              {accountData.emailVerified ? (
                <Badge variant="success" className="ml-2">
                  Verified
                </Badge>
              ) : (
                <Button variant="outline" size="sm">
                  Verify
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={accountData.phoneNumber || ""}
                onChange={handleAccountDataChange}
              />
              {accountData.phoneVerified ? (
                <Badge variant="success" className="ml-2">
                  Verified
                </Badge>
              ) : (
                <Button variant="outline" size="sm">
                  Verify
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <Input
                id="current"
                name="current"
                type="password"
                value={password.current}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <Input
                id="new"
                name="new"
                type="password"
                value={password.new}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                value={password.confirm}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium">iPhone 13 - Safari</p>
                  <p className="text-xs text-slate-500">New York, USA - Active now</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                Log Out
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium">Windows PC - Chrome</p>
                  <p className="text-xs text-slate-500">Boston, USA - Last active 2 days ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                Log Out
              </Button>
            </div>
          </div>
          <Separator />
          <Button variant="outline" className="w-full" size="sm" onClick={handleLogoutAllSessions}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out of All Sessions
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Manage additional security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <span
                  className={`rounded-full ${accountData.twoFactorEnabled ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"} px-2 py-0.5 text-xs font-medium`}
                >
                  {accountData.twoFactorEnabled ? "Enabled" : "Not Enabled"}
                </span>
              </div>
              <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
            </div>
            <Switch checked={accountData.twoFactorEnabled} onCheckedChange={handleToggle2FA} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Login Notifications</h3>
              <p className="text-sm text-slate-500">Get notified when someone logs into your account</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Suspicious Activity Alerts</h3>
              <p className="text-sm text-slate-500">Receive alerts about suspicious activity on your account</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Manage accounts you've connected for login and sharing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#4285F4]"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <div>
                <p className="font-medium">Google</p>
                {accountData.connectedAccounts.google?.connected ? (
                  <p className="text-xs text-slate-500">{accountData.connectedAccounts.google.email}</p>
                ) : (
                  <p className="text-xs text-slate-500">Not connected</p>
                )}
              </div>
            </div>
            {accountData.connectedAccounts.google?.connected ? (
              <Button variant="outline" size="sm" onClick={() => handleDisconnectAccount("google")}>
                Disconnect
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleConnectAccount("google")}>
                Connect
              </Button>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#1877F2]"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium">Facebook</p>
                {accountData.connectedAccounts.facebook?.connected ? (
                  <p className="text-xs text-slate-500">{accountData.connectedAccounts.facebook.name}</p>
                ) : (
                  <p className="text-xs text-slate-500">Not connected</p>
                )}
              </div>
            </div>
            {accountData.connectedAccounts.facebook?.connected ? (
              <Button variant="outline" size="sm" onClick={() => handleDisconnectAccount("facebook")}>
                Disconnect
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleConnectAccount("facebook")}>
                Connect
              </Button>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#333]"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium">GitHub</p>
                {accountData.connectedAccounts.github?.connected ? (
                  <p className="text-xs text-slate-500">{accountData.connectedAccounts.github.username}</p>
                ) : (
                  <p className="text-xs text-slate-500">Not connected</p>
                )}
              </div>
            </div>
            {accountData.connectedAccounts.github?.connected ? (
              <Button variant="outline" size="sm" onClick={() => handleDisconnectAccount("github")}>
                Disconnect
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleConnectAccount("github")}>
                Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <h3 className="font-medium text-red-600">Delete Account</h3>
              </div>
              <p className="text-sm text-slate-600">
                Once you delete your account, there is no going back. All your data will be permanently removed.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-800 text-sm">
              <p>
                Please type <strong>DELETE</strong> to confirm that you want to permanently delete your account.
              </p>
            </div>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Badge component for verified status
function Badge({ children, variant }: { children: React.ReactNode; variant: "success" | "warning" | "error" }) {
  const variantClasses = {
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-800",
  }

  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${variantClasses[variant]}`}>{children}</span>
}
