"use client"

// ============================================================================
// PROJECT WORKSPACE
// Main 3-panel layout for interactive project building
// ============================================================================

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, ChevronLeft, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useProject } from "@/lib/project-state"
import { useProjectAnalytics } from "@/lib/project-analytics"
import { StageTracker } from "./StageTracker"
import { BuildArea } from "./BuildArea"
import { FeedbackPanel } from "./FeedbackPanel"
import type { ProjectSchema } from "@/lib/project-schema"

interface ProjectWorkspaceProps {
    project: ProjectSchema
    onClose: () => void
    themeColor?: string
}

export function ProjectWorkspace({ project, onClose, themeColor = "#8B7CFF" }: ProjectWorkspaceProps) {
    const { state, openProject, closeProject, getProgressPercentage } = useProject()
    const { exportAnalytics } = useProjectAnalytics()
    const [mounted, setMounted] = useState(false)

    // Ensure we're on client before using portal
    useEffect(() => {
        setMounted(true)
    }, [])

    // Initialize project on mount
    useEffect(() => {
        openProject(project)

        return () => {
            // Log analytics on unmount for debugging
            const analytics = exportAnalytics()
            if (analytics) {
                console.log("=== PROJECT ANALYTICS ===")
                console.log(JSON.stringify(analytics, null, 2))
                // Expose for backend integration
                if (typeof window !== "undefined") {
                    (window as unknown as { __PROJECT_ANALYTICS__: unknown }).__PROJECT_ANALYTICS__ = analytics
                }
            }
        }
    }, [project.id])

    const handleClose = () => {
        closeProject()
        onClose()
    }

    const progressPercentage = getProgressPercentage()
    const isCompleted = state.progress?.completedAt !== undefined

    // Don't render until mounted (client-side)
    if (!mounted) return null

    const workspaceContent = (
        <div className="fixed inset-0 z-[9999] bg-background animate-in fade-in duration-200">
            {/* Header */}
            <header
                className="h-16 border-b border-border/50 flex items-center justify-between px-6"
                style={{ borderBottomColor: `${themeColor}30` }}
            >
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="hover:bg-muted/50"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <div>
                        <h1 className="text-lg font-semibold">{project.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span
                                className="capitalize px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                    backgroundColor: `${themeColor}20`,
                                    color: themeColor
                                }}
                            >
                                {project.category}
                            </span>
                            <span>•</span>
                            <span>{project.difficulty}</span>
                            <span>•</span>
                            <span>~{project.estimatedMinutes} min</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Progress */}
                    <div className="flex items-center gap-3">
                        <div className="w-32">
                            <Progress
                                value={progressPercentage}
                                className="h-2"
                                style={{
                                    // @ts-expect-error CSS custom property
                                    "--primary": themeColor
                                }}
                            />
                        </div>
                        <span className="text-sm font-medium" style={{ color: themeColor }}>
                            {progressPercentage}%
                        </span>
                    </div>

                    {/* Analytics indicator */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            const analytics = exportAnalytics()
                            console.log("=== CURRENT ANALYTICS ===")
                            console.log(JSON.stringify(analytics, null, 2))
                        }}
                    >
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Analytics</span>
                    </Button>

                    {/* Close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Main workspace area - 3 column layout */}
            <div className="h-[calc(100vh-4rem)] flex">
                {/* Left Panel - Stage Tracker */}
                <aside
                    className="w-64 border-r border-border/30 overflow-y-auto p-4"
                    style={{ borderRightColor: `${themeColor}20` }}
                >
                    <StageTracker themeColor={themeColor} />
                </aside>

                {/* Center Panel - Build Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    <BuildArea themeColor={themeColor} isCompleted={isCompleted} />
                </main>

                {/* Right Panel - Feedback */}
                <aside
                    className="w-80 border-l border-border/30 overflow-y-auto"
                    style={{ borderLeftColor: `${themeColor}20` }}
                >
                    <FeedbackPanel themeColor={themeColor} />
                </aside>
            </div>
        </div>
    )

    // Use portal to render at document.body level, escaping any parent layout constraints
    return createPortal(workspaceContent, document.body)
}
