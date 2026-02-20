"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { User, Settings, Palette } from "lucide-react"

export default function ProfilePage() {
  const [explanationDepth, setExplanationDepth] = useState("exam")
  const [visualizationPreference, setVisualizationPreference] = useState("detailed")
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground leading-relaxed">Customize your learning experience</p>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">Engineering Student</p>
                <p className="text-sm text-muted-foreground">Computer Organization and Architecture</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Learning Preferences</CardTitle>
            </div>
            <CardDescription>Customize how content is presented to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Explanation Depth</Label>
              <RadioGroup value={explanationDepth} onValueChange={setExplanationDepth}>
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all">
                  <RadioGroupItem value="simple" id="simple" />
                  <div className="flex-1">
                    <Label htmlFor="simple" className="font-medium cursor-pointer">
                      Simple
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Basic explanations with minimal technical details
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-primary bg-primary/5">
                  <RadioGroupItem value="exam" id="exam" />
                  <div className="flex-1">
                    <Label htmlFor="exam" className="font-medium cursor-pointer">
                      Exam-Focused
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Balanced explanations with exam-relevant details (Recommended)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all">
                  <RadioGroupItem value="deep" id="deep" />
                  <div className="flex-1">
                    <Label htmlFor="deep" className="font-medium cursor-pointer">
                      Deep Technical
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Comprehensive explanations with advanced concepts
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Visualization Preference</Label>
              <RadioGroup value={visualizationPreference} onValueChange={setVisualizationPreference}>
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all">
                  <RadioGroupItem value="simple" id="viz-simple" />
                  <div className="flex-1">
                    <Label htmlFor="viz-simple" className="font-medium cursor-pointer">
                      Simple Diagrams
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">Clean, minimalist visualizations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-primary bg-primary/5">
                  <RadioGroupItem value="detailed" id="viz-detailed" />
                  <div className="flex-1">
                    <Label htmlFor="viz-detailed" className="font-medium cursor-pointer">
                      Detailed Diagrams
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Comprehensive visualizations with annotations
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all">
                  <RadioGroupItem value="animated" id="viz-animated" />
                  <div className="flex-1">
                    <Label htmlFor="viz-animated" className="font-medium cursor-pointer">
                      Animated
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Step-by-step animated visualizations
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Appearance & Notifications</CardTitle>
            </div>
            <CardDescription>Customize app appearance and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme for better viewing at night</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Learning Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified about your learning progress</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full">
          Save Preferences
        </Button>
      </div>
    </DashboardLayout>
  )
}
