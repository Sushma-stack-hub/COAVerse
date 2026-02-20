// ============================================================================
// PROJECT ANALYTICS HOOKS
// Data collection and export for backend integration
// ============================================================================

import { useCallback, useEffect, useRef } from "react"
import { useProject } from "./project-state"
import type { StageState, ProjectProgress } from "./project-schema"

// Analytics payload structure (backend-ready)
export interface ProjectAnalyticsPayload {
    projectId: string
    sessionId: string
    startedAt: string // ISO timestamp
    completedAt?: string // ISO timestamp
    totalTimeSpent: number // milliseconds
    completionStatus: "not-started" | "in-progress" | "completed" | "abandoned"
    stageAnalytics: StageAnalyticsData[]
}

export interface StageAnalyticsData {
    stageId: string
    stageIndex: number
    timeSpent: number // milliseconds
    attempts: number
    errorsCount: number
    hintsRequested: number
    hintsRevealed: string[]
    status: StageState["status"]
    validationPassed: boolean
}

// Generate unique session ID
function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Analytics collector class
class ProjectAnalyticsCollector {
    private sessionId: string
    private stageTimers: Map<string, number> = new Map()
    private lastActiveStage: string | null = null

    constructor() {
        this.sessionId = generateSessionId()
    }

    // Start timing a stage
    startStageTimer(stageId: string): void {
        this.stageTimers.set(stageId, Date.now())
        this.lastActiveStage = stageId
    }

    // Get elapsed time for current stage
    getStageElapsedTime(stageId: string): number {
        const startTime = this.stageTimers.get(stageId)
        if (!startTime) return 0
        return Date.now() - startTime
    }

    // Stop timer and return elapsed time
    stopStageTimer(stageId: string): number {
        const elapsed = this.getStageElapsedTime(stageId)
        this.stageTimers.delete(stageId)
        return elapsed
    }

    // Build analytics payload from progress
    buildPayload(progress: ProjectProgress | null): ProjectAnalyticsPayload | null {
        if (!progress) return null

        const stageAnalytics: StageAnalyticsData[] = []
        let totalTimeSpent = 0
        let completedCount = 0

        let index = 0
        progress.stageStates.forEach((state, stageId) => {
            const timeSpent = state.timeSpent + this.getStageElapsedTime(stageId)
            totalTimeSpent += timeSpent

            if (state.status === "completed") completedCount++

            stageAnalytics.push({
                stageId,
                stageIndex: index,
                timeSpent,
                attempts: state.attempts,
                errorsCount: state.validationResult?.errors.length || 0,
                hintsRequested: state.hintsRevealed.length,
                hintsRevealed: state.hintsRevealed,
                status: state.status,
                validationPassed: state.validationResult?.passed || false,
            })

            index++
        })

        // Determine completion status
        let completionStatus: ProjectAnalyticsPayload["completionStatus"] = "not-started"
        if (progress.completedAt) {
            completionStatus = "completed"
        } else if (completedCount > 0) {
            completionStatus = "in-progress"
        }

        return {
            projectId: progress.projectId,
            sessionId: this.sessionId,
            startedAt: progress.startedAt.toISOString(),
            completedAt: progress.completedAt?.toISOString(),
            totalTimeSpent,
            completionStatus,
            stageAnalytics,
        }
    }

    // Reset for new project
    reset(): void {
        this.sessionId = generateSessionId()
        this.stageTimers.clear()
        this.lastActiveStage = null
    }
}

// Singleton instance
const analyticsCollector = new ProjectAnalyticsCollector()

// Expose on window for debugging (dev only)
if (typeof window !== "undefined") {
    (window as unknown as { __PROJECT_ANALYTICS_COLLECTOR__: ProjectAnalyticsCollector }).__PROJECT_ANALYTICS_COLLECTOR__ = analyticsCollector
}

/**
 * Hook to track analytics for the current project session
 */
export function useProjectAnalytics() {
    const { state } = useProject()
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const lastStageRef = useRef<string | null>(null)

    // Track stage changes
    useEffect(() => {
        const currentStage = state.activeProject?.stages[state.progress?.currentStageIndex ?? -1]

        if (currentStage && currentStage.id !== lastStageRef.current) {
            // Stop previous stage timer
            if (lastStageRef.current) {
                analyticsCollector.stopStageTimer(lastStageRef.current)
            }

            // Start new stage timer
            analyticsCollector.startStageTimer(currentStage.id)
            lastStageRef.current = currentStage.id
        }

        return () => {
            // Cleanup on unmount
            if (lastStageRef.current) {
                analyticsCollector.stopStageTimer(lastStageRef.current)
            }
        }
    }, [state.activeProject, state.progress?.currentStageIndex])

    // Reset on new project
    useEffect(() => {
        if (state.activeProject) {
            analyticsCollector.reset()
        }
    }, [state.activeProject?.id])

    // Export current analytics
    const exportAnalytics = useCallback((): ProjectAnalyticsPayload | null => {
        return analyticsCollector.buildPayload(state.progress)
    }, [state.progress])

    // Get analytics for display
    const getStageAnalytics = useCallback((stageId: string): StageAnalyticsData | null => {
        const payload = analyticsCollector.buildPayload(state.progress)
        return payload?.stageAnalytics.find(s => s.stageId === stageId) || null
    }, [state.progress])

    return {
        exportAnalytics,
        getStageAnalytics,
        sessionId: analyticsCollector["sessionId"],
    }
}

/**
 * Export analytics to console (for debugging)
 */
export function logAnalyticsToConsole(): void {
    const collector = (window as unknown as { __PROJECT_ANALYTICS_COLLECTOR__: ProjectAnalyticsCollector }).__PROJECT_ANALYTICS_COLLECTOR__
    if (collector) {
        console.log("=== PROJECT ANALYTICS ===")
        console.log(JSON.stringify(collector, null, 2))
    }
}

/**
 * Prepare payload for backend POST (returns structured JSON)
 */
export function prepareAnalyticsForBackend(progress: ProjectProgress | null): string {
    const payload = analyticsCollector.buildPayload(progress)
    return JSON.stringify(payload, null, 2)
}

// Re-export types
export type { ProjectAnalyticsPayload as AnalyticsPayload }
