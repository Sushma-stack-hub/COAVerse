"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BookOpen, AlertCircle, Play, Eye, ClipboardCheck } from "lucide-react"
import { TopicExplanation } from "@/components/topic-explanation"
import { TopicVisualizer } from "@/components/topic-visualizer"
import { TopicVideos } from "@/components/topic-videos"
import { AIClarificationAgent } from "@/components/ai-clarification-agent"
import { SmartNotesPanel } from "@/components/SmartNotesPanel"
import { topicContent, topics } from "@/lib/topic-data"
import Link from "next/link"

export default function TopicPage() {
    const params = useParams()
    // decodeURIComponent is needed because topic IDs in the URL might be encoded
    const topicId = typeof params.topicId === "string" ? decodeURIComponent(params.topicId) : ""

    const isValidTopic = topicId && topicContent[topicId]
    const [activeTab, setActiveTab] = useState("read")

    // Semantic colors matching dashboard/learn pages
    const colors = [
        "#8B7CFF", // Purple
        "#EC4899", // Pink
        "#38BDF8", // Blue
        "#06B6D4", // Cyan
        "#22C55E", // Green
        "#10B981", // Emerald
        "#F59E0B", // Amber
        "#F43F5E", // Rose
    ]

    const getTopicColor = (topicName: string) => {
        const index = topics.indexOf(topicName)
        // Fallback to blue if topic not found in strict list (though isValid checks it)
        if (index === -1) return "#38BDF8"
        // Use an offset (e.g. +3) to shift the color assignment so the user sees a "new" color for the same topic
        return colors[(index + 3) % colors.length]
    }

    const themeColor = getTopicColor(topicId)

    if (!isValidTopic) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <div className="flex flex-col items-center space-y-2 text-center">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                        <h1 className="text-2xl font-bold">Topic Not Found</h1>
                        <p className="text-muted-foreground">The topic you are looking for does not exist or has been moved.</p>
                    </div>
                    <Link href="/learn">
                        <Button variant="outline" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Return to Learning Center
                        </Button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    // Helper to get tab style based on active state
    const getTabStyle = (tabValue: string) => {
        const isActive = activeTab === tabValue
        return {
            backgroundColor: isActive ? `${themeColor}20` : `${themeColor}05`, // Tint on all
            borderColor: isActive ? themeColor : `${themeColor}40`, // Border on all
            color: isActive ? themeColor : undefined,
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: isActive ? `0 0 15px -3px ${themeColor}60` : 'none',
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Link href="/learn" className="hover:text-foreground transition-colors">Learning Center</Link>
                        <span>/</span>
                        <span style={{ color: themeColor }} className="font-medium">{topicId}</span>
                    </div>

                </div>

                <Tabs defaultValue="read" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <TabsList className="grid w-full max-w-md grid-cols-3 h-auto bg-transparent p-0 gap-3">
                            <TabsTrigger
                                value="read"
                                className="gap-2 py-3 rounded-lg transition-all duration-300 hover:bg-muted/10 data-[state=active]:shadow-none"
                                style={getTabStyle("read")}
                            >
                                <BookOpen className="h-4 w-4" />
                                <span className="hidden sm:inline">Read</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="visualize"
                                className="gap-2 py-3 rounded-lg transition-all duration-300 hover:bg-muted/10 data-[state=active]:shadow-none"
                                style={getTabStyle("visualize")}
                            >
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline">Visualize</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="video"
                                className="gap-2 py-3 rounded-lg transition-all duration-300 hover:bg-muted/10 data-[state=active]:shadow-none"
                                style={getTabStyle("video")}
                            >
                                <Play className="h-4 w-4" />
                                <span className="hidden sm:inline">Video</span>
                            </TabsTrigger>
                        </TabsList>

                        <Link href={`/assessments/${encodeURIComponent(topicId)}`}>
                            <Button
                                className="gap-2"
                                style={{
                                    backgroundColor: themeColor,
                                    color: '#ffffff',
                                }}
                            >
                                <ClipboardCheck className="h-4 w-4" />
                                Go to Assessments
                            </Button>
                        </Link>
                    </div>

                    <TabsContent value="read" className="animate-in fade-in slide-in-from-bottom-2">
                        <TopicExplanation topic={topicId} color={themeColor} />
                    </TabsContent>

                    <TabsContent value="visualize" className="animate-in fade-in slide-in-from-bottom-2">
                        <TopicVisualizer topic={topicId} color={themeColor} />
                    </TabsContent>

                    <TabsContent value="video" className="animate-in fade-in slide-in-from-bottom-2">
                        <TopicVideos topic={topicId} color={themeColor} />
                    </TabsContent>
                </Tabs>
            </div>

            <AIClarificationAgent topic={topicId} color={themeColor} />

            {/* Smart Notes Panel - Voice-assisted notes */}
            <SmartNotesPanel
                topic={topicId}
                learningMode={activeTab === 'video' ? 'video' : activeTab === 'visualize' ? 'visualization' : 'general'}
            />
        </DashboardLayout>
    )
}
