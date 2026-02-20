"use client"

// ============================================================================
// PROJECT STATE MANAGEMENT
// Centralized React Context for project workspace state
// ============================================================================

import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react"
import type {
    ProjectSchema,
    ProjectProgress,
    StageState,
    ValidationResult,
    ValidationError,
} from "./project-schema"

// State shape
interface ProjectState {
    // Current project being worked on
    activeProject: ProjectSchema | null

    // Progress tracking
    progress: ProjectProgress | null

    // UI state
    isWorkspaceOpen: boolean
    isFeedbackExpanded: boolean
    showHints: boolean

    // Real-time feedback
    currentValidation: ValidationResult | null
    pendingValidation: boolean
}

// Action types
type ProjectAction =
    | { type: "OPEN_PROJECT"; payload: ProjectSchema }
    | { type: "CLOSE_PROJECT" }
    | { type: "SET_STAGE"; payload: number }
    | { type: "UPDATE_INPUT"; payload: { stageId: string; input: unknown } }
    | { type: "VALIDATE_STAGE"; payload: { stageId: string; result: ValidationResult } }
    | { type: "REVEAL_HINT"; payload: { stageId: string; hintId: string } }
    | { type: "COMPLETE_STAGE"; payload: string }
    | { type: "TOGGLE_FEEDBACK" }
    | { type: "TOGGLE_HINTS" }
    | { type: "SET_PENDING_VALIDATION"; payload: boolean }
    | { type: "RESET_PROJECT" }
    | { type: "UPDATE_TIME_SPENT"; payload: { stageId: string; time: number } }
    | { type: "INCREMENT_ATTEMPTS"; payload: string }

// Initial state
const initialState: ProjectState = {
    activeProject: null,
    progress: null,
    isWorkspaceOpen: false,
    isFeedbackExpanded: true,
    showHints: false,
    currentValidation: null,
    pendingValidation: false,
}

// Reducer
function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
    switch (action.type) {
        case "OPEN_PROJECT": {
            const project = action.payload
            const stageStates = new Map<string, StageState>()

            // Initialize stage states
            project.stages.forEach((stage, index) => {
                stageStates.set(stage.id, {
                    stageId: stage.id,
                    status: index === 0 ? "unlocked" : "locked",
                    studentInput: null,
                    attempts: 0,
                    hintsRevealed: [],
                    timeSpent: 0,
                })
            })

            return {
                ...state,
                activeProject: project,
                progress: {
                    projectId: project.id,
                    currentStageIndex: 0,
                    stageStates,
                    startedAt: new Date(),
                },
                isWorkspaceOpen: true,
                currentValidation: null,
            }
        }

        case "CLOSE_PROJECT":
            return {
                ...state,
                isWorkspaceOpen: false,
                // Keep progress for potential resume
            }

        case "SET_STAGE": {
            if (!state.progress) return state
            const stageStates = new Map(state.progress.stageStates)
            const currentStage = state.activeProject?.stages[state.progress.currentStageIndex]
            const newStage = state.activeProject?.stages[action.payload]

            // Mark current stage as in-progress if moving away
            if (currentStage) {
                const currentState = stageStates.get(currentStage.id)
                if (currentState && currentState.status === "unlocked") {
                    stageStates.set(currentStage.id, { ...currentState, status: "in-progress" })
                }
            }

            // Unlock new stage if locked
            if (newStage) {
                const newState = stageStates.get(newStage.id)
                if (newState && newState.status === "locked") {
                    stageStates.set(newStage.id, { ...newState, status: "unlocked" })
                }
            }

            return {
                ...state,
                progress: {
                    ...state.progress,
                    currentStageIndex: action.payload,
                    stageStates,
                },
                currentValidation: null,
            }
        }

        case "UPDATE_INPUT": {
            if (!state.progress) return state
            const stageStates = new Map(state.progress.stageStates)
            const existing = stageStates.get(action.payload.stageId)

            if (existing) {
                stageStates.set(action.payload.stageId, {
                    ...existing,
                    studentInput: action.payload.input,
                    status: existing.status === "unlocked" ? "in-progress" : existing.status,
                })
            }

            return {
                ...state,
                progress: { ...state.progress, stageStates },
            }
        }

        case "VALIDATE_STAGE": {
            if (!state.progress) return state
            const stageStates = new Map(state.progress.stageStates)
            const existing = stageStates.get(action.payload.stageId)

            if (existing) {
                stageStates.set(action.payload.stageId, {
                    ...existing,
                    validationResult: action.payload.result,
                    status: action.payload.result.passed ? "completed" : existing.status,
                })
            }

            return {
                ...state,
                progress: { ...state.progress, stageStates },
                currentValidation: action.payload.result,
                pendingValidation: false,
            }
        }

        case "REVEAL_HINT": {
            if (!state.progress) return state
            const stageStates = new Map(state.progress.stageStates)
            const existing = stageStates.get(action.payload.stageId)

            if (existing && !existing.hintsRevealed.includes(action.payload.hintId)) {
                stageStates.set(action.payload.stageId, {
                    ...existing,
                    hintsRevealed: [...existing.hintsRevealed, action.payload.hintId],
                })
            }

            return {
                ...state,
                progress: { ...state.progress, stageStates },
                showHints: true,
            }
        }

        case "COMPLETE_STAGE": {
            if (!state.progress || !state.activeProject) return state
            const stageStates = new Map(state.progress.stageStates)
            const existing = stageStates.get(action.payload)

            if (existing) {
                stageStates.set(action.payload, { ...existing, status: "completed" })
            }

            // Unlock next stage
            const currentIndex = state.activeProject.stages.findIndex(s => s.id === action.payload)
            const nextStage = state.activeProject.stages[currentIndex + 1]

            if (nextStage) {
                const nextState = stageStates.get(nextStage.id)
                if (nextState) {
                    stageStates.set(nextStage.id, { ...nextState, status: "unlocked" })
                }
            }

            return {
                ...state,
                progress: {
                    ...state.progress,
                    stageStates,
                    currentStageIndex: nextStage ? currentIndex + 1 : state.progress.currentStageIndex,
                    ...(nextStage ? {} : { completedAt: new Date() }),
                },
            }
        }

        case "TOGGLE_FEEDBACK":
            return { ...state, isFeedbackExpanded: !state.isFeedbackExpanded }

        case "TOGGLE_HINTS":
            return { ...state, showHints: !state.showHints }

        case "SET_PENDING_VALIDATION":
            return { ...state, pendingValidation: action.payload }

        case "UPDATE_TIME_SPENT": {
            if (!state.progress) return state
            const stageStates = new Map(state.progress.stageStates)
            const existing = stageStates.get(action.payload.stageId)

            if (existing) {
                stageStates.set(action.payload.stageId, {
                    ...existing,
                    timeSpent: existing.timeSpent + action.payload.time,
                })
            }

            return {
                ...state,
                progress: { ...state.progress, stageStates },
            }
        }

        case "INCREMENT_ATTEMPTS": {
            if (!state.progress) return state
            const stageStates = new Map(state.progress.stageStates)
            const existing = stageStates.get(action.payload)

            if (existing) {
                stageStates.set(action.payload, {
                    ...existing,
                    attempts: existing.attempts + 1,
                })
            }

            return {
                ...state,
                progress: { ...state.progress, stageStates },
            }
        }

        case "RESET_PROJECT":
            return initialState

        default:
            return state
    }
}

// Context
interface ProjectContextValue {
    state: ProjectState

    // Project lifecycle
    openProject: (project: ProjectSchema) => void
    closeProject: () => void
    resetProject: () => void

    // Navigation
    goToStage: (index: number) => void
    goToNextStage: () => void
    goToPreviousStage: () => void

    // Input management
    updateInput: (stageId: string, input: unknown) => void

    // Validation
    validateCurrentStage: () => Promise<ValidationResult>

    // Hints
    revealHint: (stageId: string, hintId: string) => void
    toggleHints: () => void

    // UI
    toggleFeedback: () => void

    // Computed helpers
    getCurrentStage: () => ProjectSchema["stages"][number] | null
    getStageState: (stageId: string) => StageState | null
    isStageAccessible: (stageIndex: number) => boolean
    getProgressPercentage: () => number
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

// Provider component
interface ProjectProviderProps {
    children: ReactNode
    validationEngine?: (projectId: string, stageId: string, input: unknown) => Promise<ValidationResult>
}

export function ProjectProvider({ children, validationEngine }: ProjectProviderProps) {
    const [state, dispatch] = useReducer(projectReducer, initialState)

    // Project lifecycle
    const openProject = useCallback((project: ProjectSchema) => {
        dispatch({ type: "OPEN_PROJECT", payload: project })
    }, [])

    const closeProject = useCallback(() => {
        dispatch({ type: "CLOSE_PROJECT" })
    }, [])

    const resetProject = useCallback(() => {
        dispatch({ type: "RESET_PROJECT" })
    }, [])

    // Navigation
    const goToStage = useCallback((index: number) => {
        if (!state.activeProject) return
        if (index < 0 || index >= state.activeProject.stages.length) return
        dispatch({ type: "SET_STAGE", payload: index })
    }, [state.activeProject])

    const goToNextStage = useCallback(() => {
        if (!state.progress || !state.activeProject) return
        const nextIndex = state.progress.currentStageIndex + 1
        if (nextIndex < state.activeProject.stages.length) {
            dispatch({ type: "SET_STAGE", payload: nextIndex })
        }
    }, [state.progress, state.activeProject])

    const goToPreviousStage = useCallback(() => {
        if (!state.progress) return
        const prevIndex = state.progress.currentStageIndex - 1
        if (prevIndex >= 0) {
            dispatch({ type: "SET_STAGE", payload: prevIndex })
        }
    }, [state.progress])

    // Input management
    const updateInput = useCallback((stageId: string, input: unknown) => {
        dispatch({ type: "UPDATE_INPUT", payload: { stageId, input } })
    }, [])

    // Validation
    const validateCurrentStage = useCallback(async (): Promise<ValidationResult> => {
        if (!state.activeProject || !state.progress) {
            return { passed: false, errors: [{ type: "missing", message: "No active project" }], violatedConstraints: [] }
        }

        const currentStage = state.activeProject.stages[state.progress.currentStageIndex]
        const stageState = state.progress.stageStates.get(currentStage.id)

        dispatch({ type: "SET_PENDING_VALIDATION", payload: true })
        dispatch({ type: "INCREMENT_ATTEMPTS", payload: currentStage.id })

        let result: ValidationResult

        if (validationEngine) {
            result = await validationEngine(
                state.activeProject.id,
                currentStage.id,
                stageState?.studentInput
            )
        } else {
            // Default validation - check if input exists
            const hasInput = stageState?.studentInput !== null && stageState?.studentInput !== undefined
            result = {
                passed: hasInput,
                errors: hasInput ? [] : [{ type: "missing", message: "Please complete the required input" }],
                violatedConstraints: [],
            }
        }

        dispatch({ type: "VALIDATE_STAGE", payload: { stageId: currentStage.id, result } })

        if (result.passed) {
            dispatch({ type: "COMPLETE_STAGE", payload: currentStage.id })
        }

        return result
    }, [state.activeProject, state.progress, validationEngine])

    // Hints
    const revealHint = useCallback((stageId: string, hintId: string) => {
        dispatch({ type: "REVEAL_HINT", payload: { stageId, hintId } })
    }, [])

    const toggleHints = useCallback(() => {
        dispatch({ type: "TOGGLE_HINTS" })
    }, [])

    // UI
    const toggleFeedback = useCallback(() => {
        dispatch({ type: "TOGGLE_FEEDBACK" })
    }, [])

    // Computed helpers
    const getCurrentStage = useCallback(() => {
        if (!state.activeProject || !state.progress) return null
        return state.activeProject.stages[state.progress.currentStageIndex] || null
    }, [state.activeProject, state.progress])

    const getStageState = useCallback((stageId: string) => {
        return state.progress?.stageStates.get(stageId) || null
    }, [state.progress])

    const isStageAccessible = useCallback((stageIndex: number) => {
        if (!state.activeProject || !state.progress) return false
        const stage = state.activeProject.stages[stageIndex]
        if (!stage) return false
        const stageState = state.progress.stageStates.get(stage.id)
        return stageState?.status !== "locked"
    }, [state.activeProject, state.progress])

    const getProgressPercentage = useCallback(() => {
        if (!state.progress || !state.activeProject) return 0
        const completed = Array.from(state.progress.stageStates.values())
            .filter(s => s.status === "completed").length
        return Math.round((completed / state.activeProject.stages.length) * 100)
    }, [state.progress, state.activeProject])

    const value: ProjectContextValue = {
        state,
        openProject,
        closeProject,
        resetProject,
        goToStage,
        goToNextStage,
        goToPreviousStage,
        updateInput,
        validateCurrentStage,
        revealHint,
        toggleHints,
        toggleFeedback,
        getCurrentStage,
        getStageState,
        isStageAccessible,
        getProgressPercentage,
    }

    return (
        <ProjectContext.Provider value= { value } >
        { children }
        </ProjectContext.Provider>
  )
}

// Hook
export function useProject() {
    const context = useContext(ProjectContext)
    if (!context) {
        throw new Error("useProject must be used within a ProjectProvider")
    }
    return context
}

// Export types
export type { ProjectState, ProjectAction, ProjectContextValue }
