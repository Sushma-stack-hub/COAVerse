"use client"

// ============================================================================
// SIMULATION STATE MANAGEMENT
// React Context for hardware simulation state
// ============================================================================

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react"
import type {
    SimulationState,
    HardwareComponent,
    DataPath,
    ControlSignal,
    HardwareProject,
    HardwareProjectProgress,
    HardwareStageState,
    HardwareValidationResult,
    DataFlowAnimation,
    Position,
    HardwareComponentType,
    SimulationEvent,
} from "./hardware-schema"
import { createComponent } from "./hardware-schema"

// ============================================================================
// STATE TYPES
// ============================================================================

interface SimulationContextState {
    // Active project
    project: HardwareProject | null
    progress: HardwareProjectProgress | null

    // Simulation state
    simulation: SimulationState

    // UI state
    isWorkspaceOpen: boolean
    selectedComponent: string | null
    draggingComponent: HardwareComponentType | null
    hoveredPort: { componentId: string; portId: string } | null

    // Validation
    currentValidation: HardwareValidationResult | null

    // Events log (for analytics)
    events: SimulationEvent[]
}

// ============================================================================
// ACTIONS
// ============================================================================

type SimulationAction =
    | { type: "OPEN_PROJECT"; project: HardwareProject }
    | { type: "CLOSE_PROJECT" }
    | { type: "SET_STAGE"; index: number }
    | { type: "PLACE_COMPONENT"; componentType: HardwareComponentType; position: Position }
    | { type: "REMOVE_COMPONENT"; componentId: string }
    | { type: "MOVE_COMPONENT"; componentId: string; position: Position }
    | { type: "SELECT_COMPONENT"; componentId: string | null }
    | { type: "START_DRAGGING"; componentType: HardwareComponentType }
    | { type: "STOP_DRAGGING" }
    | { type: "CONNECT_PATH"; fromComponent: string; fromPort: string; toComponent: string; toPort: string }
    | { type: "REMOVE_PATH"; pathId: string }
    | { type: "TOGGLE_SIGNAL"; signalId: string }
    | { type: "SET_BUS_OWNER"; componentId: string | null }
    | { type: "TRIGGER_CLOCK" }
    | { type: "SET_VALIDATION"; result: HardwareValidationResult | null }
    | { type: "COMPLETE_STAGE" }
    | { type: "REVEAL_HINT"; stageId: string; hintId: string }
    | { type: "ADD_ANIMATION"; animation: DataFlowAnimation }
    | { type: "REMOVE_ANIMATION"; animationId: string }
    | { type: "UPDATE_COMPONENT_STATE"; componentId: string; state: Partial<HardwareComponent["state"]> }
    | { type: "HOVER_PORT"; componentId: string; portId: string }
    | { type: "UNHOVER_PORT" }
    | { type: "RESET_SIMULATION" }
    | { type: "LOG_EVENT"; event: SimulationEvent }

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialSimulation: SimulationState = {
    components: [],
    dataPaths: [],
    controlSignals: [],
    clockCycle: 0,
    busOwner: null,
    isRunning: false,
    animationQueue: [],
}

const initialState: SimulationContextState = {
    project: null,
    progress: null,
    simulation: initialSimulation,
    isWorkspaceOpen: false,
    selectedComponent: null,
    draggingComponent: null,
    hoveredPort: null,
    currentValidation: null,
    events: [],
}

// ============================================================================
// REDUCER
// ============================================================================

function simulationReducer(state: SimulationContextState, action: SimulationAction): SimulationContextState {
    switch (action.type) {
        case "OPEN_PROJECT": {
            const project = action.project
            const progress: HardwareProjectProgress = {
                projectId: project.id,
                currentStageIndex: 0,
                stageStates: new Map(
                    project.stages.map((stage, index) => [
                        stage.id,
                        {
                            status: index === 0 ? "active" : "locked",
                            attempts: 0,
                            hintsRevealed: [],
                            timeSpent: 0,
                            errors: [],
                        } as HardwareStageState,
                    ])
                ),
                startedAt: new Date(),
            }

            // Initialize simulation with project's initial state
            const simulation: SimulationState = {
                ...initialSimulation,
                ...project.initialState,
                controlSignals: project.controlSignals.map(s => ({ ...s })),
            }

            // Add pre-placed components from first stage
            const firstStage = project.stages[0]
            if (firstStage?.preplacedComponents) {
                simulation.components = [...firstStage.preplacedComponents]
            }

            return {
                ...state,
                project,
                progress,
                simulation,
                isWorkspaceOpen: true,
                currentValidation: null,
                events: [{
                    type: "stage_started",
                    projectId: project.id,
                    stageId: firstStage?.id || "",
                    timestamp: Date.now(),
                }],
            }
        }

        case "CLOSE_PROJECT":
            return {
                ...initialState,
            }

        case "SET_STAGE": {
            if (!state.progress || !state.project) return state

            const newStageStates = new Map(state.progress.stageStates)
            const currentStage = state.project.stages[state.progress.currentStageIndex]
            const newStage = state.project.stages[action.index]

            // Update current stage if moving forward
            if (action.index > state.progress.currentStageIndex && currentStage) {
                const currentState = newStageStates.get(currentStage.id)
                if (currentState) {
                    newStageStates.set(currentStage.id, { ...currentState, status: "completed" })
                }
            }

            // Update new stage
            if (newStage) {
                const newStageState = newStageStates.get(newStage.id)
                if (newStageState) {
                    newStageStates.set(newStage.id, { ...newStageState, status: "active" })
                }
            }

            return {
                ...state,
                progress: {
                    ...state.progress,
                    currentStageIndex: action.index,
                    stageStates: newStageStates,
                },
                currentValidation: null,
                events: [...state.events, {
                    type: "stage_started",
                    projectId: state.project.id,
                    stageId: newStage?.id || "",
                    timestamp: Date.now(),
                }],
            }
        }

        case "PLACE_COMPONENT": {
            const newComponent = createComponent(action.componentType, action.position)
            return {
                ...state,
                simulation: {
                    ...state.simulation,
                    components: [...state.simulation.components, newComponent],
                },
                selectedComponent: newComponent.id,
                draggingComponent: null,
                events: [...state.events, {
                    type: "component_placed",
                    componentType: action.componentType,
                    position: action.position,
                    timestamp: Date.now(),
                }],
            }
        }

        case "REMOVE_COMPONENT": {
            return {
                ...state,
                simulation: {
                    ...state.simulation,
                    components: state.simulation.components.filter(c => c.id !== action.componentId),
                    dataPaths: state.simulation.dataPaths.filter(
                        p => p.fromComponent !== action.componentId && p.toComponent !== action.componentId
                    ),
                },
                selectedComponent: state.selectedComponent === action.componentId ? null : state.selectedComponent,
                events: [...state.events, {
                    type: "component_removed",
                    componentId: action.componentId,
                    timestamp: Date.now(),
                }],
            }
        }

        case "MOVE_COMPONENT": {
            return {
                ...state,
                simulation: {
                    ...state.simulation,
                    components: state.simulation.components.map(c =>
                        c.id === action.componentId && !c.locked
                            ? { ...c, position: action.position }
                            : c
                    ),
                },
            }
        }

        case "SELECT_COMPONENT":
            return {
                ...state,
                selectedComponent: action.componentId,
            }

        case "START_DRAGGING":
            return {
                ...state,
                draggingComponent: action.componentType,
            }

        case "STOP_DRAGGING":
            return {
                ...state,
                draggingComponent: null,
            }

        case "CONNECT_PATH": {
            const newPath: DataPath = {
                id: `path-${Date.now()}`,
                fromComponent: action.fromComponent,
                fromPort: action.fromPort,
                toComponent: action.toComponent,
                toPort: action.toPort,
                active: false,
            }
            return {
                ...state,
                simulation: {
                    ...state.simulation,
                    dataPaths: [...state.simulation.dataPaths, newPath],
                },
                events: [...state.events, {
                    type: "path_connected",
                    fromComponent: action.fromComponent,
                    toComponent: action.toComponent,
                    timestamp: Date.now(),
                }],
            }
        }

        case "REMOVE_PATH":
            return {
                ...state,
                simulation: {
                    ...state.simulation,
                    dataPaths: state.simulation.dataPaths.filter(p => p.id !== action.pathId),
                },
            }

        case "TOGGLE_SIGNAL": {
            const updatedSignals = state.simulation.controlSignals.map(s =>
                s.id === action.signalId ? { ...s, active: !s.active } : s
            )
            const toggledSignal = updatedSignals.find(s => s.id === action.signalId)

            return {
                ...state,
                simulation: {
                    ...state.simulation,
                    controlSignals: updatedSignals,
                },
                events: [...state.events, {
                    type: "signal_toggled",
                    signalId: action.signalId,
                    newState: toggledSignal?.active ?? false,
                    timestamp: Date.now(),
                }],
            }
        }

        case "SET_BUS_OWNER":
            return {
                ...state,
                simulation: {
                    ...state.simulation,
                    busOwner: action.componentId,
                },
            }

        case "TRIGGER_CLOCK": {
            return {
                ...state,
                simulation: {
                    ...state.simulation,
                    clockCycle: state.simulation.clockCycle + 1,
                },
                events: [...state.events, {
                    type: "clock_triggered",
                    cycleNumber: state.simulation.clockCycle + 1,
                    timestamp: Date.now(),
                }],
            }
        }

        case "SET_VALIDATION":
            return {
                ...state,
                currentValidation: action.result,
            }

        case "COMPLETE_STAGE": {
            if (!state.progress || !state.project) return state

            const currentIndex = state.progress.currentStageIndex
            const nextIndex = currentIndex + 1
            const isLastStage = nextIndex >= state.project.stages.length

            const newStageStates = new Map(state.progress.stageStates)
            const currentStage = state.project.stages[currentIndex]

            if (currentStage) {
                const stageState = newStageStates.get(currentStage.id)
                if (stageState) {
                    newStageStates.set(currentStage.id, { ...stageState, status: "completed" })
                }
            }

            if (!isLastStage) {
                const nextStage = state.project.stages[nextIndex]
                if (nextStage) {
                    const nextState = newStageStates.get(nextStage.id)
                    if (nextState) {
                        newStageStates.set(nextStage.id, { ...nextState, status: "active" })
                    }
                }
            }

            return {
                ...state,
                progress: {
                    ...state.progress,
                    currentStageIndex: isLastStage ? currentIndex : nextIndex,
                    stageStates: newStageStates,
                    completedAt: isLastStage ? new Date() : undefined,
                },
                currentValidation: null,
            }
        }

        case "REVEAL_HINT": {
            if (!state.progress) return state

            const newStageStates = new Map(state.progress.stageStates)
            const stageState = newStageStates.get(action.stageId)

            if (stageState && !stageState.hintsRevealed.includes(action.hintId)) {
                newStageStates.set(action.stageId, {
                    ...stageState,
                    hintsRevealed: [...stageState.hintsRevealed, action.hintId],
                })
            }

            return {
                ...state,
                progress: {
                    ...state.progress,
                    stageStates: newStageStates,
                },
                events: [...state.events, {
                    type: "hint_revealed",
                    stageId: action.stageId,
                    hintId: action.hintId,
                    timestamp: Date.now(),
                }],
            }
        }

        case "ADD_ANIMATION":
            return {
                ...state,
                simulation: {
                    ...state.simulation,
                    animationQueue: [...state.simulation.animationQueue, action.animation],
                },
            }

        case "REMOVE_ANIMATION":
            return {
                ...state,
                simulation: {
                    ...state.simulation,
                    animationQueue: state.simulation.animationQueue.filter(a => a.id !== action.animationId),
                },
            }

        case "UPDATE_COMPONENT_STATE": {
            return {
                ...state,
                simulation: {
                    ...state.simulation,
                    components: state.simulation.components.map(c =>
                        c.id === action.componentId
                            ? { ...c, state: { ...c.state, ...action.state } }
                            : c
                    ),
                },
            }
        }

        case "HOVER_PORT":
            return {
                ...state,
                hoveredPort: { componentId: action.componentId, portId: action.portId },
            }

        case "UNHOVER_PORT":
            return {
                ...state,
                hoveredPort: null,
            }

        case "RESET_SIMULATION":
            return {
                ...state,
                simulation: {
                    ...initialSimulation,
                    controlSignals: state.simulation.controlSignals.map(s => ({ ...s, active: false })),
                },
                selectedComponent: null,
                currentValidation: null,
            }

        case "LOG_EVENT":
            return {
                ...state,
                events: [...state.events, action.event],
            }

        default:
            return state
    }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface SimulationContextValue {
    state: SimulationContextState
    dispatch: React.Dispatch<SimulationAction>

    // Helper functions
    openProject: (project: HardwareProject) => void
    closeProject: () => void
    placeComponent: (type: HardwareComponentType, position: Position) => void
    removeComponent: (id: string) => void
    moveComponent: (id: string, position: Position) => void
    selectComponent: (id: string | null) => void
    connectPath: (fromComponent: string, fromPort: string, toComponent: string, toPort: string) => void
    toggleSignal: (signalId: string) => void
    setBusOwner: (componentId: string | null) => void
    triggerClock: () => void
    validateCurrentStage: () => Promise<HardwareValidationResult>
    completeStage: () => void
    revealHint: (stageId: string, hintId: string) => void
    resetSimulation: () => void

    // Getters
    getCurrentStage: () => HardwareProject["stages"][0] | null
    getStageState: (stageId: string) => HardwareStageState | null
    getProgressPercentage: () => number
    isStageAccessible: (index: number) => boolean
    getComponent: (id: string) => HardwareComponent | undefined
    getComponentsOfType: (type: HardwareComponentType) => HardwareComponent[]
    getActiveSignals: () => ControlSignal[]
    exportEvents: () => SimulationEvent[]
}

const SimulationContext = createContext<SimulationContextValue | null>(null)

// ============================================================================
// PROVIDER
// ============================================================================

interface SimulationProviderProps {
    children: ReactNode
    validationEngine?: (project: HardwareProject, stageId: string, simulation: SimulationState) => Promise<HardwareValidationResult>
}

export function SimulationProvider({ children, validationEngine }: SimulationProviderProps) {
    const [state, dispatch] = useReducer(simulationReducer, initialState)

    // Helper functions
    const openProject = useCallback((project: HardwareProject) => {
        dispatch({ type: "OPEN_PROJECT", project })
    }, [])

    const closeProject = useCallback(() => {
        dispatch({ type: "CLOSE_PROJECT" })
    }, [])

    const placeComponent = useCallback((type: HardwareComponentType, position: Position) => {
        dispatch({ type: "PLACE_COMPONENT", componentType: type, position })
    }, [])

    const removeComponent = useCallback((id: string) => {
        dispatch({ type: "REMOVE_COMPONENT", componentId: id })
    }, [])

    const moveComponent = useCallback((id: string, position: Position) => {
        dispatch({ type: "MOVE_COMPONENT", componentId: id, position })
    }, [])

    const selectComponent = useCallback((id: string | null) => {
        dispatch({ type: "SELECT_COMPONENT", componentId: id })
    }, [])

    const connectPath = useCallback((fromComponent: string, fromPort: string, toComponent: string, toPort: string) => {
        dispatch({ type: "CONNECT_PATH", fromComponent, fromPort, toComponent, toPort })
    }, [])

    const toggleSignal = useCallback((signalId: string) => {
        dispatch({ type: "TOGGLE_SIGNAL", signalId })
    }, [])

    const setBusOwner = useCallback((componentId: string | null) => {
        dispatch({ type: "SET_BUS_OWNER", componentId })
    }, [])

    const triggerClock = useCallback(() => {
        dispatch({ type: "TRIGGER_CLOCK" })
    }, [])

    const validateCurrentStage = useCallback(async (): Promise<HardwareValidationResult> => {
        if (!state.project || !state.progress) {
            return { passed: false, errors: [{ type: "error", message: "No active project" }] }
        }

        const currentStage = state.project.stages[state.progress.currentStageIndex]
        if (!currentStage) {
            return { passed: false, errors: [{ type: "error", message: "Invalid stage" }] }
        }

        let result: HardwareValidationResult

        if (validationEngine) {
            result = await validationEngine(state.project, currentStage.id, state.simulation)
        } else {
            // Default validation: check all validation rules
            const errors: HardwareValidationResult["errors"] = []

            for (const validation of currentStage.validation) {
                try {
                    if (!validation.check(state.simulation)) {
                        errors.push({
                            type: validation.type,
                            message: validation.message,
                        })
                    }
                } catch {
                    errors.push({
                        type: "error",
                        message: `Validation check "${validation.id}" failed`,
                    })
                }
            }

            result = {
                passed: errors.length === 0,
                errors,
                score: errors.length === 0 ? 100 : Math.max(0, 100 - errors.length * 20),
            }
        }

        dispatch({ type: "SET_VALIDATION", result })

        // Log validation event
        dispatch({
            type: "LOG_EVENT",
            event: {
                type: "stage_validated",
                stageId: currentStage.id,
                passed: result.passed,
                errors: result.errors.map(e => e.message),
                timestamp: Date.now(),
            },
        })

        return result
    }, [state.project, state.progress, state.simulation, validationEngine])

    const completeStage = useCallback(() => {
        dispatch({ type: "COMPLETE_STAGE" })
    }, [])

    const revealHint = useCallback((stageId: string, hintId: string) => {
        dispatch({ type: "REVEAL_HINT", stageId, hintId })
    }, [])

    const resetSimulation = useCallback(() => {
        dispatch({ type: "RESET_SIMULATION" })
    }, [])

    // Getters
    const getCurrentStage = useCallback(() => {
        if (!state.project || !state.progress) return null
        return state.project.stages[state.progress.currentStageIndex] || null
    }, [state.project, state.progress])

    const getStageState = useCallback((stageId: string) => {
        return state.progress?.stageStates.get(stageId) || null
    }, [state.progress])

    const getProgressPercentage = useCallback(() => {
        if (!state.project || !state.progress) return 0
        const completed = Array.from(state.progress.stageStates.values()).filter(s => s.status === "completed").length
        return Math.round((completed / state.project.stages.length) * 100)
    }, [state.project, state.progress])

    const isStageAccessible = useCallback((index: number) => {
        if (!state.project || !state.progress) return false
        const stage = state.project.stages[index]
        if (!stage) return false
        const stageState = state.progress.stageStates.get(stage.id)
        return stageState?.status !== "locked"
    }, [state.project, state.progress])

    const getComponent = useCallback((id: string) => {
        return state.simulation.components.find(c => c.id === id)
    }, [state.simulation.components])

    const getComponentsOfType = useCallback((type: HardwareComponentType) => {
        return state.simulation.components.filter(c => c.type === type)
    }, [state.simulation.components])

    const getActiveSignals = useCallback(() => {
        return state.simulation.controlSignals.filter(s => s.active)
    }, [state.simulation.controlSignals])

    const exportEvents = useCallback(() => {
        return [...state.events]
    }, [state.events])

    const value: SimulationContextValue = {
        state,
        dispatch,
        openProject,
        closeProject,
        placeComponent,
        removeComponent,
        moveComponent,
        selectComponent,
        connectPath,
        toggleSignal,
        setBusOwner,
        triggerClock,
        validateCurrentStage,
        completeStage,
        revealHint,
        resetSimulation,
        getCurrentStage,
        getStageState,
        getProgressPercentage,
        isStageAccessible,
        getComponent,
        getComponentsOfType,
        getActiveSignals,
        exportEvents,
    }

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    )
}

// ============================================================================
// HOOK
// ============================================================================

export function useSimulation() {
    const context = useContext(SimulationContext)
    if (!context) {
        throw new Error("useSimulation must be used within a SimulationProvider")
    }
    return context
}
