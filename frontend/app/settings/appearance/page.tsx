"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Sun, Moon, Monitor } from "lucide-react"

export default function AppearanceSettings() {
  const [fontSize, setFontSize] = useState(16)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appearance Settings</h1>
        <p className="text-slate-500">Customize how Cognitia looks and feels</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your preferred color theme</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="light" className="grid grid-cols-3 gap-4">
            <div>
              <RadioGroupItem value="light" id="light" className="sr-only" />
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-slate-50 hover:border-slate-200 [&:has([data-state=checked])]:border-emerald-500"
              >
                <Sun className="mb-3 h-6 w-6 text-slate-600" />
                <span className="font-medium">Light</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="dark" id="dark" className="sr-only" />
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-slate-950 p-4 hover:bg-slate-900 hover:border-slate-800 [&:has([data-state=checked])]:border-emerald-500"
              >
                <Moon className="mb-3 h-6 w-6 text-slate-400" />
                <span className="font-medium text-white">Dark</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="system" id="system" className="sr-only" />
              <Label
                htmlFor="system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gradient-to-br from-white to-slate-950 p-4 hover:from-slate-50 hover:to-slate-900 hover:border-slate-300 [&:has([data-state=checked])]:border-emerald-500"
              >
                <Monitor className="mb-3 h-6 w-6 text-slate-600" />
                <span className="font-medium">System</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Font Size</CardTitle>
          <CardDescription>Adjust the text size for better readability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Small</span>
              <span className="text-sm font-medium">{fontSize}px</span>
              <span className="text-sm">Large</span>
            </div>
            <Slider defaultValue={[16]} min={12} max={24} step={1} onValueChange={(value) => setFontSize(value[0])} />
          </div>
          <div className="rounded-md border p-4">
            <p style={{ fontSize: `${fontSize}px` }} className="font-medium">
              Sample Text
            </p>
            <p style={{ fontSize: `${fontSize}px` }} className="text-slate-500">
              This is how your content will look with the selected font size.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>Customize accessibility settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Reduce Motion</h3>
              <p className="text-sm text-slate-500">Minimize animations and transitions</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">High Contrast</h3>
              <p className="text-sm text-slate-500">Increase contrast for better visibility</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Screen Reader Optimization</h3>
              <p className="text-sm text-slate-500">Optimize the interface for screen readers</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Preferences</Button>
      </div>
    </div>
  )
}
