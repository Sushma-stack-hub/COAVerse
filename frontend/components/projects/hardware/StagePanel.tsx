"use client"

// ============================================================================
// STAGE PANEL
// Left panel showing build stages and progress
// ============================================================================

import { Check, Lock, Circle, Play, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSimulation } from "@/lib/simulation-state"

export function StagePanel() {
    const { state, getCurrentStage, getStageState, isStageAccessible, dispatch } = useSimulation()

    if (!state.project) return null

    const stages = state.project.stages
    const currentIndex = state.progress?.currentStageIndex ?? 0
    const currentStage = getCurrentStage()

    return (
        <div className="p-4 space-y-4">
            {/* Project intro */}
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                <h2 className="text-sm font-semibold text-purple-400 mb-1">Objective</h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                    {state.project.objective}
                </p>
            </div>

            {/* Stages list */}
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 px-1">
                    Build Stages
                </h3>

                <div className="space-y-1">
                    {stages.map((stage, index) => {
                        const stageState = getStageState(stage.id)
                        const isAccessible = isStageAccessible(index)
                        const isCurrent = index === currentIndex
                        const isCompleted = stageState?.status === "completed"
                        const isLocked = stageState?.status === "locked"

                        return (
                            <button
                                key={stage.id}
                                onClick={() => isAccessible && dispatch({ type: "SET_STAGE", index })}
                                disabled={!isAccessible}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                                    isCurrent && "bg-purple-500/15 ring-1 ring-purple-500/30",
                                    isAccessible && !isCurrent && "hover:bg-white/5",
                                    !isAccessible && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {/* Status indicator */}
                                <div className={cn(
                                    "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                                    isCompleted && "bg-green-500/20 text-green-400",
                                    isCurrent && !isCompleted && "bg-purple-500 text-white",
                                    isLocked && "bg-gray-800 text-gray-600",
                                    !isCompleted && !isCurrent && !isLocked && "bg-gray-800 text-gray-500"
                                )}>
                                    {isCompleted ? <Check className="h-3.5 w-3.5" /> :
                                        isLocked ? <Lock className="h-3 w-3" /> :
                                            isCurrent ? <Play className="h-3 w-3" /> :
                                                <Circle className="h-2.5 w-2.5" />}
                                </div>

                                {/* Stage info */}
                                <div className="flex-1 min-w-0">
                                    <div className={cn(
                                        "text-sm font-medium truncate",
                                        isCurrent ? "text-purple-300" : "text-gray-300"
                                    )}>
                                        {stage.title}
                                    </div>
                                    {stage.estimatedMinutes && (
                                        <div className="text-[10px] text-gray-500">
                                            ~{stage.estimatedMinutes} min
                                        </div>
                                    )}
                                </div>

                                {isCurrent && <ChevronRight className="h-4 w-4 text-purple-400" />}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Current stage details */}
            {currentStage && (
                <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                    <h4 className="text-xs font-semibold text-white mb-2">
                        {currentStage.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        {currentStage.instructions}
                    </p>

                    {currentStage.detailedDescription && (
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            {currentStage.detailedDescription}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
