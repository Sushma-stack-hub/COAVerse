"use client"

import { useState, useEffect } from "react"
import { Zap, Heart, Target, Pause, Volume2, VolumeX, Flame, Crosshair, Cpu, Database, Calculator, HardDrive, Monitor, ChevronRight } from "lucide-react"
import { useGame } from "../engine/GameState"

// Progress Map Component (inline for HUD)
function ProgressMap({ currentAct, completedComponents }: { currentAct: string, completedComponents: string[] }) {
    const COMPONENTS = [
        { id: 'control', name: 'Control', icon: Cpu, color: '#06B6D4' },
        { id: 'registers', name: 'Registers', icon: Database, color: '#8B5CF6' },
        { id: 'alu', name: 'ALU', icon: Calculator, color: '#F59E0B' },
        { id: 'memory', name: 'Memory', icon: HardDrive, color: '#10B981' },
        { id: 'io', name: 'I/O', icon: Monitor, color: '#EC4899' }
    ]

    // Map acts to components
    const actToComponent: Record<string, string> = {
        'ACT_1': 'control',
        'ACT_2': 'control',
        'ACT_3': 'registers',
        'ACT_4': 'alu',
        'ACT_5': 'memory'
    }

    const currentComponent = actToComponent[currentAct] || ''

    return (
        <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-600/50">
            {COMPONENTS.map((comp, index) => {
                const isCompleted = completedComponents.includes(comp.id)
                const isCurrent = currentComponent === comp.id
                const Icon = comp.icon

                return (
                    <div key={comp.id} className="flex items-center">
                        <div
                            className={`
                                relative w-7 h-7 rounded-md flex items-center justify-center
                                transition-all duration-300
                                ${isCurrent ? 'ring-1 ring-offset-1 ring-offset-slate-900 scale-110' : ''}
                            `}
                            style={{
                                backgroundColor: isCompleted || isCurrent ? `${comp.color}25` : 'transparent',
                                boxShadow: isCurrent ? `0 0 10px ${comp.color}40, 0 0 0 2px ${comp.color}` : 'none'
                            }}
                            title={comp.name}
                        >
                            <Icon
                                className="h-3.5 w-3.5"
                                style={{
                                    color: isCompleted || isCurrent ? comp.color : '#4B5563'
                                }}
                            />
                            {isCompleted && (
                                <div
                                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: '#22C55E' }}
                                >
                                    <span className="text-[6px] text-white">✓</span>
                                </div>
                            )}
                        </div>
                        {index < COMPONENTS.length - 1 && (
                            <ChevronRight
                                className="h-2.5 w-2.5 mx-0.5"
                                style={{
                                    color: isCompleted ? '#6B7280' : '#374151'
                                }}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export function GameHUD() {
    const { state } = useGame()
    const [xpPop, setXpPop] = useState<number | null>(null)
    const [lastXP, setLastXP] = useState(state.playerXP)
    const [showXpAnimation, setShowXpAnimation] = useState(false)

    // XP popup animation
    useEffect(() => {
        if (state.playerXP > lastXP) {
            const gained = state.playerXP - lastXP
            setXpPop(gained)
            setShowXpAnimation(true)
            setTimeout(() => {
                setXpPop(null)
                setShowXpAnimation(false)
            }, 1500)
        }
        setLastXP(state.playerXP)
    }, [state.playerXP, lastXP])

    const actNames: Record<string, string> = {
        'LOADING': 'Loading...',
        'INTRO': 'Prologue',
        'ACT_1': 'Mission 1: System Collapse',
        'ACT_2': 'Mission 2: Control Unit',
        'ACT_3': 'Mission 3: Registers & Timing',
        'ACT_4': 'Mission 4: ALU Operations',
        'ACT_5': 'Mission 5: System Boot',
        'VICTORY': 'Victory!'
    }

    // Simulated combo and accuracy (would come from game state in full implementation)
    const combo = state.activatedComponents.length
    const accuracy = state.actProgress > 0 ? Math.min(100, Math.round(80 + state.actProgress * 0.2)) : 100

    return (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-slate-900/95 to-transparent">
                {/* Left - Mission info */}
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-cyan-500/30">
                        <p className="text-[10px] text-cyan-400/70 font-medium uppercase tracking-wider">Mission</p>
                        <p className="text-xs text-cyan-400 font-bold">
                            {actNames[state.currentAct] || state.currentAct}
                        </p>
                    </div>

                    {/* Progress Map */}
                    <ProgressMap
                        currentAct={state.currentAct}
                        completedComponents={state.activatedComponents}
                    />
                </div>

                {/* Center - Stats */}
                <div className="flex items-center gap-4">
                    {/* Health */}
                    <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <div className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-red-500/30">
                            <div
                                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                                style={{ width: `${state.playerHealth}%` }}
                            />
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-cyan-400" />
                        <div className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
                                style={{ width: `${state.actProgress}%` }}
                            />
                        </div>
                        <span className="text-xs text-cyan-400/70">{state.actProgress}%</span>
                    </div>

                    {/* Accuracy */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/60 border border-purple-500/30">
                        <Crosshair className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-xs text-purple-400 font-medium">{accuracy}%</span>
                    </div>
                </div>

                {/* Right - XP & Combo */}
                <div className="flex items-center gap-3 pointer-events-auto">
                    {/* Combo */}
                    {combo > 0 && (
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border animate-pulse"
                            style={{
                                backgroundColor: combo >= 5 ? 'rgba(239, 68, 68, 0.15)' : combo >= 3 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                                borderColor: combo >= 5 ? 'rgba(239, 68, 68, 0.4)' : combo >= 3 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(34, 197, 94, 0.4)'
                            }}
                        >
                            <Flame
                                className="h-4 w-4"
                                style={{
                                    color: combo >= 5 ? '#EF4444' : combo >= 3 ? '#F59E0B' : '#22C55E'
                                }}
                            />
                            <span
                                className="font-bold text-sm"
                                style={{
                                    color: combo >= 5 ? '#EF4444' : combo >= 3 ? '#F59E0B' : '#22C55E'
                                }}
                            >
                                {combo}x
                            </span>
                        </div>
                    )}

                    {/* XP */}
                    <div
                        className={`relative px-3 py-1.5 rounded-lg bg-slate-800/80 border border-yellow-500/30 flex items-center gap-2 transition-all ${showXpAnimation ? 'scale-110' : ''}`}
                        style={{
                            boxShadow: showXpAnimation ? '0 0 20px rgba(234, 179, 8, 0.4)' : 'none'
                        }}
                    >
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400 font-bold">{state.playerXP}</span>
                        <span className="text-yellow-400/60 text-[10px]">XP</span>

                        {/* XP popup */}
                        {xpPop && (
                            <div
                                className="absolute -bottom-6 right-0 text-yellow-400 font-bold text-sm whitespace-nowrap"
                                style={{ animation: 'floatUp 1.5s ease-out forwards' }}
                            >
                                +{xpPop} XP!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Current Objective */}
            {state.currentObjective && (
                <div className="absolute top-16 left-4">
                    <div className="px-4 py-3 rounded-lg bg-slate-900/90 border border-purple-500/30 max-w-xs backdrop-blur-sm">
                        <p className="text-[10px] text-purple-400 font-medium mb-1 uppercase tracking-wider">Objective</p>
                        <p className="text-white font-medium text-sm">{state.currentObjective.title}</p>
                        <p className="text-gray-400 text-xs mt-1">{state.currentObjective.description}</p>
                    </div>
                </div>
            )}

            {/* Carrying Data indicator */}
            {state.carryingData && (
                <div className="absolute top-16 right-4">
                    <div className="px-4 py-3 rounded-lg bg-blue-900/90 border border-blue-500/50 animate-pulse backdrop-blur-sm">
                        <p className="text-[10px] text-blue-400 font-medium mb-1 uppercase tracking-wider">Carrying</p>
                        <p className="text-white font-medium text-sm">📦 {state.carryingData}</p>
                    </div>
                </div>
            )}

            {/* Animation styles */}
            <style>{`
                @keyframes floatUp {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-20px); opacity: 0; }
                }
            `}</style>
        </div>
    )
}

// Mini pause menu
export function PauseMenu({ onResume, onExit }: { onResume: () => void; onExit: () => void }) {
    const { state, dispatch } = useGame()

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
                <Pause className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-8">PAUSED</h2>

                {/* Current Stats */}
                <div className="flex items-center justify-center gap-6 mb-8">
                    <div className="text-center">
                        <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-yellow-400">{state.playerXP}</p>
                        <p className="text-xs text-yellow-400/60">XP</p>
                    </div>
                    <div className="text-center">
                        <Heart className="h-6 w-6 text-red-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-red-400">{state.playerHealth}%</p>
                        <p className="text-xs text-red-400/60">Health</p>
                    </div>
                    <div className="text-center">
                        <Target className="h-6 w-6 text-cyan-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-cyan-400">{state.actProgress}%</p>
                        <p className="text-xs text-cyan-400/60">Progress</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={onResume}
                        className="w-48 px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all"
                    >
                        Resume
                    </button>
                    <br />
                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
                        className="w-48 px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                        {state.isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        {state.isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <br />
                    <button
                        onClick={onExit}
                        className="w-48 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium transition-all"
                    >
                        Exit Game
                    </button>
                </div>
            </div>
        </div>
    )
}
