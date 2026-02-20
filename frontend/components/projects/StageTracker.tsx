"use client"

// ============================================================================
// STAGE TRACKER
// Left panel vertical progress indicator
// ============================================================================

import { Check, Lock, Circle, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProject } from "@/lib/project-state"

interface StageTrackerProps {
    themeColor?: string
}

export function StageTracker({ themeColor = "#8B7CFF" }: StageTrackerProps) {
    const { state, goToStage, isStageAccessible, getStageState } = useProject()

    if (!state.activeProject) return null

    const stages = state.activeProject.stages
    const currentIndex = state.progress?.currentStageIndex ?? 0

    return (
        <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Build Stages
            </h2>

            <nav className="relative">
                {/* Connecting line */}
                <div
                    className="absolute left-4 top-6 bottom-6 w-0.5 bg-border/50"
                    style={{ backgroundColor: `${themeColor}20` }}
                />

                <ul className="space-y-1 relative">
                    {stages.map((stage, index) => {
                        const stageState = getStageState(stage.id)
                        const isAccessible = isStageAccessible(index)
                        const isCurrent = index === currentIndex
                        const isCompleted = stageState?.status === "completed"
                        const isLocked = stageState?.status === "locked"

                        return (
                            <li key={stage.id}>
                                <button
                                    onClick={() => isAccessible && goToStage(index)}
                                    disabled={!isAccessible}
                                    className={cn(
                                        "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200",
                                        isCurrent && "bg-card",
                                        isAccessible && !isCurrent && "hover:bg-muted/30 cursor-pointer",
                                        !isAccessible && "opacity-60 cursor-not-allowed"
                                    )}
                                    style={isCurrent ? {
                                        backgroundColor: `${themeColor}15`,
                                        boxShadow: `0 0 20px -5px ${themeColor}30`,
                                    } : undefined}
                                >
                                    {/* Status icon */}
                                    <div
                                        className={cn(
                                            "relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                            isCompleted && "bg-green-500/20 text-green-500",
                                            isCurrent && !isCompleted && "text-white",
                                            isLocked && "bg-muted text-muted-foreground",
                                            !isCompleted && !isCurrent && !isLocked && "bg-muted/50 text-muted-foreground"
                                        )}
                                        style={isCurrent && !isCompleted ? {
                                            backgroundColor: themeColor,
                                        } : undefined}
                                    >
                                        {isCompleted && <Check className="h-4 w-4" />}
                                        {isLocked && <Lock className="h-3.5 w-3.5" />}
                                        {!isCompleted && !isLocked && isCurrent && <Play className="h-4 w-4" />}
                                        {!isCompleted && !isLocked && !isCurrent && <Circle className="h-3 w-3" />}
                                    </div>

                                    {/* Stage info */}
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className={cn(
                                                "text-sm font-medium truncate",
                                                isCurrent && "font-semibold"
                                            )}
                                            style={isCurrent ? { color: themeColor } : undefined}
                                        >
                                            {stage.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {stage.estimatedMinutes ? `~${stage.estimatedMinutes} min` : ""}
                                        </div>

                                        {/* Progress indicator for stages with attempts */}
                                        {stageState && stageState.attempts > 0 && !isCompleted && (
                                            <div className="text-xs mt-1 text-amber-500">
                                                {stageState.attempts} attempt{stageState.attempts > 1 ? "s" : ""}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Summary section - shown when project complete */}
            {state.progress?.completedAt && (
                <div
                    className="mt-6 p-4 rounded-lg border"
                    style={{
                        borderColor: `${themeColor}30`,
                        backgroundColor: `${themeColor}10`
                    }}
                >
                    <div className="flex items-center gap-2 text-green-500 mb-2">
                        <Check className="h-5 w-5" />
                        <span className="font-semibold">Project Complete!</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Navigate to any stage to review your work.
                    </p>
                </div>
            )}
        </div>
    )
}
