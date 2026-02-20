"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Sparkles, RefreshCw } from "lucide-react"

const videos = [
  { id: 1, title: "Evolution of Digital Computers", duration: "12:45", topic: "History" },
  { id: 2, title: "Functional Units of a Computer", duration: "15:30", topic: "Fundamentals" },
  { id: 3, title: "CPU Architecture Explained", duration: "18:20", topic: "Architecture" },
  { id: 4, title: "Registers and Register Organization", duration: "14:15", topic: "Architecture" },
  { id: 5, title: "Understanding Instruction Cycle", duration: "16:40", topic: "Execution" },
  { id: 6, title: "Instruction Formats Deep Dive", duration: "13:55", topic: "Execution" },
  { id: 7, title: "Addressing Modes Tutorial", duration: "17:25", topic: "Execution" },
  { id: 8, title: "Data Flow inside a Computer", duration: "15:10", topic: "Architecture" },
  { id: 9, title: "Micro-operations Fundamentals", duration: "14:30", topic: "Operations" },
  { id: 10, title: "Control Unit: Hardwired vs Microprogrammed", duration: "19:45", topic: "Control" },
]

const scriptSections = [
  {
    timestamp: "00:00",
    title: "Introduction",
    content: "Welcome to this comprehensive explanation of CPU Architecture...",
  },
  {
    timestamp: "02:30",
    title: "CPU Components Overview",
    content: "The CPU consists of three main components: ALU, Control Unit, and Registers...",
  },
  {
    timestamp: "05:15",
    title: "Arithmetic Logic Unit (ALU)",
    content: "The ALU performs all arithmetic and logical operations...",
  },
  {
    timestamp: "08:40",
    title: "Control Unit Functions",
    content: "The Control Unit coordinates all CPU operations by generating control signals...",
  },
  {
    timestamp: "12:10",
    title: "Register Organization",
    content: "Registers provide high-speed storage within the CPU for temporary data...",
  },
  {
    timestamp: "15:30",
    title: "Summary and Key Takeaways",
    content: "In this video, we covered the fundamental architecture of the CPU...",
  },
]

export default function VideosPage() {
  const [selectedVideo, setSelectedVideo] = useState(videos[2])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">AI-Assisted Video Explanations</h1>
          <p className="text-muted-foreground leading-relaxed">
            Watch structured video explanations with AI-generated scripts
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{selectedVideo.title}</CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI-assisted explanation (script-based)
                    </CardDescription>
                  </div>
                  <Badge>{selectedVideo.duration}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Player Placeholder */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-border">
                  <div className="text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Play className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Video Player</p>
                      <p className="text-sm text-muted-foreground">AI-generated explanation video</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <Button size="icon" variant="ghost">
                      <Play className="h-5 w-5" />
                    </Button>
                    <span className="text-sm font-medium">0:00 / {selectedVideo.duration}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Explanation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Script Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Explanation Script</CardTitle>
                <CardDescription>AI-generated scene breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scriptSections.map((section, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4 py-2">
                      <div className="flex items-center gap-3 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          {section.timestamp}
                        </Badge>
                        <h4 className="font-semibold">{section.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video List */}
          <Card>
            <CardHeader>
              <CardTitle>All Videos</CardTitle>
              <CardDescription>Digital Computers topics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedVideo.id === video.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedVideo.id === video.id ? "bg-primary-foreground/10" : "bg-background"
                      }`}
                    >
                      <Play className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1 leading-relaxed">{video.title}</p>
                      <div className="flex items-center gap-2 text-xs opacity-80">
                        <span>{video.duration}</span>
                        <span>•</span>
                        <span>{video.topic}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
