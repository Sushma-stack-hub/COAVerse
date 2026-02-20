"use client"

import { createContext, useContext, useReducer, ReactNode } from "react"

// ===========================================
// GAME TYPES
// ===========================================
export type GameAct = 'LOADING' | 'INTRO' | 'ACT_1' | 'ACT_2' | 'ACT_3' | 'ACT_4' | 'ACT_5' | 'VICTORY'
export type ActPhase = 'CINEMATIC' | 'EXPLORATION' | 'PUZZLE' | 'DIALOGUE' | 'TRANSITION' | 'COMPLETE'

export interface Position {
    x: number
    y: number
    z: number
}

export interface Objective {
    id: string
    title: string
    description: string
    completed: boolean
}

export interface DialogueLine {
    speaker: 'SYS' | 'GLITCH' | 'NARRATOR'
    text: string
    emotion?: 'neutral' | 'warning' | 'excited' | 'concerned'
}

export interface GameState {
    // Core state
    currentAct: GameAct
    currentPhase: ActPhase
    isPlaying: boolean
    isPaused: boolean

    // Player state
    playerPosition: Position
    playerHealth: number
    playerXP: number
    carryingData: string | null

    // Progress
    currentObjective: Objective | null
    completedObjectives: string[]
    actProgress: number // 0-100

    // Dialogue
    dialogueQueue: DialogueLine[]
    isDialogueActive: boolean

    // Environment
    activatedComponents: string[]
    glitchActive: boolean
    glitchIntensity: number

    // Audio
    musicVolume: number
    sfxVolume: number
    isMuted: boolean
}

// ===========================================
// INITIAL STATE
// ===========================================
export const initialGameState: GameState = {
    currentAct: 'LOADING',
    currentPhase: 'CINEMATIC',
    isPlaying: false,
    isPaused: false,

    playerPosition: { x: 0, y: 0, z: 0 },
    playerHealth: 100,
    playerXP: 0,
    carryingData: null,

    currentObjective: null,
    completedObjectives: [],
    actProgress: 0,

    dialogueQueue: [],
    isDialogueActive: false,

    activatedComponents: [],
    glitchActive: false,
    glitchIntensity: 0,

    musicVolume: 0.5,
    sfxVolume: 0.7,
    isMuted: false
}

// ===========================================
// ACTIONS
// ===========================================
export type GameAction =
    | { type: 'START_GAME' }
    | { type: 'PAUSE_GAME' }
    | { type: 'RESUME_GAME' }
    | { type: 'SET_ACT'; act: GameAct }
    | { type: 'SET_PHASE'; phase: ActPhase }
    | { type: 'MOVE_PLAYER'; position: Position }
    | { type: 'ADD_XP'; amount: number }
    | { type: 'TAKE_DAMAGE'; amount: number }
    | { type: 'SET_OBJECTIVE'; objective: Objective }
    | { type: 'COMPLETE_OBJECTIVE'; id: string }
    | { type: 'UPDATE_PROGRESS'; progress: number }
    | { type: 'PICK_UP_DATA'; dataId: string }
    | { type: 'DROP_DATA' }
    | { type: 'ACTIVATE_COMPONENT'; id: string }
    | { type: 'TRIGGER_GLITCH'; intensity: number }
    | { type: 'CLEAR_GLITCH' }
    | { type: 'QUEUE_DIALOGUE'; lines: DialogueLine[] }
    | { type: 'ADVANCE_DIALOGUE' }
    | { type: 'END_DIALOGUE' }
    | { type: 'SET_VOLUME'; music?: number; sfx?: number }
    | { type: 'TOGGLE_MUTE' }
    | { type: 'RESET_GAME' }

// ===========================================
// REDUCER
// ===========================================
export function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'START_GAME':
            return { ...state, isPlaying: true, currentAct: 'INTRO', currentPhase: 'CINEMATIC' }

        case 'PAUSE_GAME':
            return { ...state, isPaused: true }

        case 'RESUME_GAME':
            return { ...state, isPaused: false }

        case 'SET_ACT':
            return { ...state, currentAct: action.act, actProgress: 0, currentPhase: 'CINEMATIC' }

        case 'SET_PHASE':
            return { ...state, currentPhase: action.phase }

        case 'MOVE_PLAYER':
            return { ...state, playerPosition: action.position }

        case 'ADD_XP':
            return { ...state, playerXP: state.playerXP + action.amount }

        case 'TAKE_DAMAGE':
            return {
                ...state,
                playerHealth: Math.max(0, state.playerHealth - action.amount),
                glitchActive: true,
                glitchIntensity: Math.min(3, state.glitchIntensity + 1)
            }

        case 'SET_OBJECTIVE':
            return { ...state, currentObjective: action.objective }

        case 'COMPLETE_OBJECTIVE':
            return {
                ...state,
                completedObjectives: [...state.completedObjectives, action.id],
                currentObjective: state.currentObjective?.id === action.id ? null : state.currentObjective,
                playerXP: state.playerXP + 50
            }

        case 'UPDATE_PROGRESS':
            return { ...state, actProgress: Math.min(100, action.progress) }

        case 'PICK_UP_DATA':
            return { ...state, carryingData: action.dataId }

        case 'DROP_DATA':
            return { ...state, carryingData: null }

        case 'ACTIVATE_COMPONENT':
            if (state.activatedComponents.includes(action.id)) return state
            return { ...state, activatedComponents: [...state.activatedComponents, action.id] }

        case 'TRIGGER_GLITCH':
            return { ...state, glitchActive: true, glitchIntensity: action.intensity }

        case 'CLEAR_GLITCH':
            return { ...state, glitchActive: false, glitchIntensity: 0 }

        case 'QUEUE_DIALOGUE':
            return { ...state, dialogueQueue: [...state.dialogueQueue, ...action.lines], isDialogueActive: true }

        case 'ADVANCE_DIALOGUE':
            const newQueue = state.dialogueQueue.slice(1)
            return { ...state, dialogueQueue: newQueue, isDialogueActive: newQueue.length > 0 }

        case 'END_DIALOGUE':
            return { ...state, dialogueQueue: [], isDialogueActive: false }

        case 'SET_VOLUME':
            return {
                ...state,
                musicVolume: action.music ?? state.musicVolume,
                sfxVolume: action.sfx ?? state.sfxVolume
            }

        case 'TOGGLE_MUTE':
            return { ...state, isMuted: !state.isMuted }

        case 'RESET_GAME':
            return initialGameState

        default:
            return state
    }
}

// ===========================================
// CONTEXT
// ===========================================
interface GameContextType {
    state: GameState
    dispatch: React.Dispatch<GameAction>
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(gameReducer, initialGameState)

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGame() {
    const context = useContext(GameContext)
    if (!context) {
        throw new Error('useGame must be used within a GameProvider')
    }
    return context
}

// ===========================================
// HELPER HOOKS
// ===========================================
export function useGameActions() {
    const { dispatch } = useGame()

    return {
        startGame: () => dispatch({ type: 'START_GAME' }),
        pauseGame: () => dispatch({ type: 'PAUSE_GAME' }),
        resumeGame: () => dispatch({ type: 'RESUME_GAME' }),
        setAct: (act: GameAct) => dispatch({ type: 'SET_ACT', act }),
        setPhase: (phase: ActPhase) => dispatch({ type: 'SET_PHASE', phase }),
        movePlayer: (position: Position) => dispatch({ type: 'MOVE_PLAYER', position }),
        addXP: (amount: number) => dispatch({ type: 'ADD_XP', amount }),
        takeDamage: (amount: number) => dispatch({ type: 'TAKE_DAMAGE', amount }),
        setObjective: (objective: Objective) => dispatch({ type: 'SET_OBJECTIVE', objective }),
        completeObjective: (id: string) => dispatch({ type: 'COMPLETE_OBJECTIVE', id }),
        updateProgress: (progress: number) => dispatch({ type: 'UPDATE_PROGRESS', progress }),
        pickUpData: (dataId: string) => dispatch({ type: 'PICK_UP_DATA', dataId }),
        dropData: () => dispatch({ type: 'DROP_DATA' }),
        activateComponent: (id: string) => dispatch({ type: 'ACTIVATE_COMPONENT', id }),
        triggerGlitch: (intensity: number) => dispatch({ type: 'TRIGGER_GLITCH', intensity }),
        clearGlitch: () => dispatch({ type: 'CLEAR_GLITCH' }),
        queueDialogue: (lines: DialogueLine[]) => dispatch({ type: 'QUEUE_DIALOGUE', lines }),
        advanceDialogue: () => dispatch({ type: 'ADVANCE_DIALOGUE' }),
        endDialogue: () => dispatch({ type: 'END_DIALOGUE' }),
        setVolume: (music?: number, sfx?: number) => dispatch({ type: 'SET_VOLUME', music, sfx }),
        toggleMute: () => dispatch({ type: 'TOGGLE_MUTE' }),
        resetGame: () => dispatch({ type: 'RESET_GAME' })
    }
}
