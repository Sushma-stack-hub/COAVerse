"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Sparkles, RefreshCw, Accessibility, Video } from "lucide-react"
import { AIVideoInput } from "./ai-video-input"
import { VideoResolverResult } from "@/lib/video-resolver"

interface VideoItem {
    title: string
    url: string
}

const TOPIC_VIDEOS: Record<string, VideoItem[]> = {
    "Block diagram of digital computer": [
        { title: "Introduction to Digital Computer Block Diagram", url: "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-block-diagram-digital-computer.mp4" },
        { title: "CPU Components Overview", url: "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-block-diagram-digital-computer.mp4" },
    ],
    "Register Transfer Language": [
        { title: "RTL Fundamentals", url: "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-register-transfer-language.mp4" },
        { title: "Register Notation and Symbols", url: "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-register-transfer-language.mp4" },
    ],
    "Micro-Operations: Register transfer Language": [
        { title: "Micro-Operations in RTL", url: "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-micro-operations-rtl.mp4" },
        { title: "Types of Micro-Operations", url: "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-micro-operations-rtl.mp4" },
    ],
    "Bus and Memory Transfer": [
        { title: "Bus System Architecture", url: "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-bus-and-memory-transfer.mp4" },
        { title: "Memory Read/Write Operations", url: "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-bus-and-memory-transfer.mp4" },
    ],
}

const scriptSections = [
    {
        timestamp: "00:00",
        title: "Introduction",
        content: "Welcome to this comprehensive explanation of this topic...",
    },
    {
        timestamp: "02:30",
        title: "Core Concepts",
        content: "Understanding the fundamental concepts and components...",
    },
    {
        timestamp: "05:15",
        title: "Detailed Explanation",
        content: "A deeper dive into the mechanics and operations...",
    },
    {
        timestamp: "08:40",
        title: "Practical Examples",
        content: "Real-world examples and applications...",
    },
    {
        timestamp: "12:10",
        title: "Summary",
        content: "Key takeaways and important points to remember...",
    },
]

interface TopicVideosProps {
    topic: string
    color?: string
}

export function TopicVideos({ topic, color }: TopicVideosProps) {
    const topicVideos = TOPIC_VIDEOS[topic] || []
    // PROMPT-GATED: No video shown by default - must submit prompt first
    const [selectedVideo, setSelectedVideo] = useState<VideoItem & { isSignLanguage?: boolean } | null>(null)
    const [currentScript, setCurrentScript] = useState<any[]>(scriptSections)
    const [videoUnlocked, setVideoUnlocked] = useState(false)
    const [generatedVideos, setGeneratedVideos] = useState<Array<{ title: string, url: string, isSignLanguage: boolean }>>([])
    const videoRef = useRef<HTMLVideoElement>(null)

    const primaryColor = color || "hsl(var(--primary))"

    /**
     * Handler for AI video generation - PROMPT-GATED
     * Video only displays after a valid prompt is submitted
     */
    const handleAIVideoResolved = (result: VideoResolverResult | null, isNoMatch: boolean, format: 'standard' | 'sign-language') => {
        if (result && !isNoMatch) {
            const isSignLanguage = format === 'sign-language'
            const displayTitle = isSignLanguage
                ? `${result.title} – Sign Language`
                : `${result.title} – Standard`
            const newVideo = {
                title: displayTitle,
                url: result.video_url,
                isSignLanguage
            }
            setSelectedVideo({ title: displayTitle, url: result.video_url, isSignLanguage })
            setVideoUnlocked(true)
            // Add to generated videos list if not already present
            setGeneratedVideos(prev => {
                if (!prev.find(v => v.title === displayTitle)) {
                    return [...prev, newVideo]
                }
                return prev
            })
        } else {
            setSelectedVideo(null)
            setVideoUnlocked(false)
        }
    }

    useEffect(() => {
        if (videoRef.current && selectedVideo) {
            videoRef.current.load()
        }
    }, [selectedVideo])

    if (topicVideos.length === 0) {
        return (
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-8">
                            <div className="text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                                    <Play className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">No Videos Available</p>
                                    <p className="text-sm text-muted-foreground">Videos for this topic are coming soon.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Topic Videos</CardTitle>
                        <CardDescription>{topic}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">No videos available for this topic yet.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <CardTitle className="text-2xl">{selectedVideo?.title || topic}</CardTitle>
                                <CardDescription className="mt-2 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    AI-assisted explanation (video-based)
                                </CardDescription>
                            </div>
                            <Badge variant="outline" style={{ borderColor: color, color: color }}>{topic}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* AI Video Generator Input */}
                        <div className="p-4 bg-muted/50 rounded-lg border border-border">
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" style={{ color: primaryColor }} />
                                AI Video Generator
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                                Generate personalized concept videos on demand
                            </p>
                            <AIVideoInput
                                onVideoResolved={handleAIVideoResolved}
                                color={color}
                                currentTopic={topic}
                            />
                        </div>

                        {/* Video Player - PROMPT-GATED: Only shows after valid prompt */}
                        {videoUnlocked && selectedVideo ? (
                            <div className="aspect-video bg-black rounded-lg overflow-hidden border-2 border-border relative" style={{ borderColor: color ? `${color}40` : undefined }}>
                                {/* Check if it's a Cloudinary embed URL (for sign language) */}
                                {selectedVideo.url.includes('player.cloudinary.com/embed') ? (
                                    <iframe
                                        key={selectedVideo.url}
                                        src={selectedVideo.url}
                                        className="w-full h-full"
                                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                                        allowFullScreen
                                        title={selectedVideo.title}
                                    />
                                ) : (
                                    <video
                                        ref={videoRef}
                                        key={selectedVideo.url}
                                        className="w-full h-full object-contain"
                                        controls
                                        playsInline
                                        preload="none"
                                    >
                                        <source src={selectedVideo.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )}

                                {/* Sign Language Video Badge */}
                                {selectedVideo.isSignLanguage && (
                                    <div
                                        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium z-10"
                                        style={{
                                            backgroundColor: 'rgba(34, 197, 94, 0.9)',
                                            color: 'white'
                                        }}
                                    >
                                        <Accessibility className="h-3.5 w-3.5" />
                                        Sign Language Video (Accessibility)
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border" style={{ borderColor: color ? `${color}40` : undefined }}>
                                <div className="text-center space-y-4 max-w-md px-6">
                                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                                        style={{ backgroundColor: color ? `${color}1a` : undefined }}
                                    >
                                        <Video className="h-10 w-10" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">AI Video Generator</p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Enter a prompt above to generate a personalized educational video.
                                            Try: "Explain block diagram step by step" or "Show micro operations"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {topicVideos.length} video{topicVideos.length !== 1 ? 's' : ''} available for this topic
                                </span>
                            </div>
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
                            {currentScript.map((section, index) => (
                                <div key={index} className="border-l-2 pl-4 py-2" style={{ borderLeftColor: primaryColor }}>
                                    <div className="flex items-center gap-3 mb-1">
                                        <Badge variant="outline" className="font-mono text-xs" style={{ borderColor: primaryColor, color: primaryColor }}>
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

            {/* Video List - Sidebar */}
            <Card>
                <CardHeader>
                    <CardTitle>Generated Videos</CardTitle>
                    <CardDescription>{topic}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {generatedVideos.length === 0 ? (
                        <div className="text-center py-6">
                            <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">No videos generated yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Use the generator above to create videos</p>
                        </div>
                    ) : (
                        generatedVideos.map((video, index) => {
                            const isSelected = selectedVideo?.title === video.title
                            return (
                                <button
                                    key={`${video.title}-${index}`}
                                    onClick={() => {
                                        setSelectedVideo({ title: video.title, url: video.url, isSignLanguage: video.isSignLanguage })
                                        setVideoUnlocked(true)
                                    }}
                                    className={`w-full text-left p-4 rounded-lg transition-colors ${isSelected ? "text-primary-foreground" : "bg-muted hover:bg-muted/80"
                                        }`}
                                    style={{
                                        backgroundColor: isSelected ? primaryColor : undefined,
                                        color: isSelected ? '#ffffff' : undefined
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-primary-foreground/10" : "bg-background"
                                                }`}
                                            style={{
                                                color: isSelected ? '#ffffff' : primaryColor
                                            }}
                                        >
                                            <Play className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm mb-1 leading-relaxed">{video.title}</p>
                                            <div className="flex items-center gap-2 text-xs opacity-80">
                                                <span>Generated Video {index + 1}</span>
                                                {video.isSignLanguage && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Accessibility className="h-3 w-3" />
                                                            Accessibility
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

