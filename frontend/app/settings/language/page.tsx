"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Languages } from "lucide-react"

const languages = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
]

export default function LanguageSettings() {
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [contentLanguage, setContentLanguage] = useState("auto")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would save the language settings to the server
    alert("Language settings updated successfully!")
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Language Settings</h2>
        <p className="text-sm text-slate-500">Choose your preferred language for the interface and content</p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Interface Language</CardTitle>
            <CardDescription>Select the language you want to use for the Cognitia interface</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
              className="grid gap-2 md:grid-cols-2"
            >
              {languages.map((language) => (
                <div
                  key={language.code}
                  className="flex items-center space-x-2 rounded-md border p-3 hover:bg-slate-50"
                >
                  <RadioGroupItem value={language.code} id={`lang-${language.code}`} />
                  <Label htmlFor={`lang-${language.code}`} className="flex items-center gap-2 cursor-pointer w-full">
                    <span className="text-xl">{language.flag}</span>
                    <div>
                      <div className="font-medium">{language.name}</div>
                      <div className="text-xs text-slate-500">{language.nativeName}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Language</CardTitle>
            <CardDescription>Choose which languages you want to see content in</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={contentLanguage} onValueChange={setContentLanguage} className="space-y-3">
              <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-slate-50">
                <RadioGroupItem value="auto" id="content-auto" />
                <Label htmlFor="content-auto" className="flex items-center gap-2 cursor-pointer w-full">
                  <Languages className="h-5 w-5 text-slate-600" />
                  <div>
                    <div className="font-medium">Automatic (Based on interface language)</div>
                    <div className="text-xs text-slate-500">Show content in your interface language when available</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-slate-50">
                <RadioGroupItem value="all" id="content-all" />
                <Label htmlFor="content-all" className="flex items-center gap-2 cursor-pointer w-full">
                  <Languages className="h-5 w-5 text-slate-600" />
                  <div>
                    <div className="font-medium">All Languages</div>
                    <div className="text-xs text-slate-500">Show content in any language</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-slate-50">
                <RadioGroupItem value="specific" id="content-specific" />
                <Label htmlFor="content-specific" className="flex items-center gap-2 cursor-pointer w-full">
                  <Languages className="h-5 w-5 text-slate-600" />
                  <div>
                    <div className="font-medium">Specific Languages</div>
                    <div className="text-xs text-slate-500">Choose which languages to include</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="ml-auto">
              Save Language Settings
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
