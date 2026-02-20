"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PenTool, Layers, BrainCircuit, ArrowLeft, AlertCircle, BookOpen, Gamepad2 } from "lucide-react"
import { PracticeReview } from "@/components/practice-review"
import { Flashcards } from "@/components/flashcards"
import { TopicQuiz } from "@/components/topic-quiz"
import { AIClarificationAgent } from "@/components/ai-clarification-agent"
import { InteractiveGames } from "@/components/interactive-games"
import { topicContent, topics } from "@/lib/topic-data"

export default function AssessmentsPage() {
    const params = useParams()
    const topicId = typeof params.topicId === "string" ? decodeURIComponent(params.topicId) : ""

    const isValidTopic = topicId && topicContent[topicId]
    const [activeTab, setActiveTab] = useState("quiz")

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
        if (index === -1) return "#38BDF8"
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
            backgroundColor: isActive ? `${themeColor}20` : `${themeColor}05`,
            borderColor: isActive ? themeColor : `${themeColor}40`,
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
                        <Link href={`/topics/${encodeURIComponent(topicId)}`} className="hover:text-foreground transition-colors">{topicId}</Link>
                        <span>/</span>
                        <span style={{ color: themeColor }} className="font-medium">Assessments</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold" style={{ color: themeColor }}>
                            Assessments
                        </h1>
                        <Link href={`/topics/${encodeURIComponent(topicId)}`}>
                            <Button variant="outline" className="gap-2" style={{ borderColor: `${themeColor}40`, color: themeColor }}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to Topic
                            </Button>
                        </Link>
                    </div>
                </div>

                <Tabs defaultValue="quiz" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 h-auto bg-transparent p-0 gap-3">
                        <TabsTrigger
                            value="quiz"
                            className="gap-2 py-3 rounded-lg transition-all duration-300 hover:bg-muted/10 data-[state=active]:shadow-none"
                            style={getTabStyle("quiz")}
                        >
                            <BrainCircuit className="h-4 w-4" />
                            <span className="hidden sm:inline">Quiz</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="flashcards"
                            className="gap-2 py-3 rounded-lg transition-all duration-300 hover:bg-muted/10 data-[state=active]:shadow-none"
                            style={getTabStyle("flashcards")}
                        >
                            <Layers className="h-4 w-4" />
                            <span className="hidden sm:inline">Flashcards</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="practice"
                            className="gap-2 py-3 rounded-lg transition-all duration-300 hover:bg-muted/10 data-[state=active]:shadow-none"
                            style={getTabStyle("practice")}
                        >
                            <PenTool className="h-4 w-4" />
                            <span className="hidden sm:inline">Practice</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="games"
                            className="gap-2 py-3 rounded-lg transition-all duration-300 hover:bg-muted/10 data-[state=active]:shadow-none"
                            style={getTabStyle("games")}
                        >
                            <Gamepad2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Games</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="quiz" className="animate-in fade-in slide-in-from-bottom-2">
                        <TopicQuiz topic={topicId} color={themeColor} />
                    </TabsContent>

                    <TabsContent value="flashcards" className="animate-in fade-in slide-in-from-bottom-2">
                        <Flashcards topic={topicId} color={themeColor} />
                    </TabsContent>

                    <TabsContent value="practice" className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-2xl font-bold" style={{ color: themeColor }}>{topicId}</h2>
                                <p className="text-muted-foreground">Practice and review concepts for this topic.</p>
                            </div>
                            <PracticeReview topic={topicId} color={themeColor} />
                        </div>
                    </TabsContent>

                    <TabsContent value="games" className="animate-in fade-in slide-in-from-bottom-2">
                        <InteractiveGames topic={topicId} color={themeColor} />
                    </TabsContent>
                </Tabs>
            </div>

            <AIClarificationAgent topic={topicId} color={themeColor} />
        </DashboardLayout>
    )
}
