"use client"

import { useState, useEffect } from "react"
import {
    Bot, Skull, User, Zap, Target, Flame, Crosshair,
    AlertTriangle, CheckCircle, Star, ChevronRight,
    Cpu, Database, Calculator, HardDrive, Monitor
} from "lucide-react"
import { useGame, useGameActions } from "../engine/GameState"

// ===========================================
// CHARACTER PANEL (Side overlay during gameplay)
// ===========================================
interface CharacterPanelProps {
    character: 'SYS' | 'GLITCH' | 'ENGINEER'
    message: string
    visible: boolean
    emotion?: 'neutral' | 'warning' | 'excited' | 'concerned' | 'angry'
}

const CHARACTER_CONFIG = {
    SYS: { name: 'SYS', title: 'System Guide', icon: Bot, color: '#06B6D4', bg: 'from-cyan-900/90 to-slate-900/90' },
    GLITCH: { name: 'GLITCH', title: 'Error', icon: Skull, color: '#EF4444', bg: 'from-red-900/90 to-slate-900/90' },
    ENGINEER: { name: 'YOU', title: 'Engineer', icon: User, color: '#8B5CF6', bg: 'from-purple-900/90 to-slate-900/90' }
}

export function CharacterPanel({ character, message, visible, emotion = 'neutral' }: CharacterPanelProps) {
    const [show, setShow] = useState(false)
    const config = CHARACTER_CONFIG[character]
    const Icon = config.icon

    useEffect(() => {
        if (visible) {
            setShow(true)
        } else {
            const timer = setTimeout(() => setShow(false), 300)
            return () => clearTimeout(timer)
        }
    }, [visible])

    if (!show) return null

    return (
        <div
            className={`fixed bottom-6 left-6 z-[60] transition-all duration-300 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
        >
            <div
                className={`flex items-start gap-4 p-4 rounded-xl border backdrop-blur-sm max-w-sm bg-gradient-to-r ${config.bg}`}
                style={{ borderColor: `${config.color}40`, boxShadow: `0 0 30px ${config.color}20` }}
            >
                {/* Avatar */}
                <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${config.color}20`, border: `2px solid ${config.color}60` }}
                >
                    <Icon className="h-7 w-7" style={{ color: config.color }} />
                </div>

                {/* Message */}
                <div className="flex-1">
                    <p className="font-bold text-sm mb-1" style={{ color: config.color }}>{config.name}</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
                </div>
            </div>
        </div>
    )
}

// ===========================================
// LIVE SCOREBOARD (Top overlay during gameplay)
// ===========================================
export function LiveScoreboard() {
    const { state } = useGame()
    const [xpAnimation, setXpAnimation] = useState(false)
    const [lastXP, setLastXP] = useState(state.playerXP)
    const [xpGained, setXpGained] = useState(0)

    // Detect XP changes for animation
    useEffect(() => {
        if (state.playerXP > lastXP) {
            const gained = state.playerXP - lastXP
            setXpGained(gained)
            setXpAnimation(true)
            setTimeout(() => setXpAnimation(false), 1500)
        }
        setLastXP(state.playerXP)
    }, [state.playerXP, lastXP])

    // Calculate combo from activated components
    const combo = state.activatedComponents.length
    const accuracy = state.actProgress > 0 ? Math.min(100, Math.round(80 + state.actProgress * 0.2)) : 100

    const comboColor = combo >= 5 ? '#EF4444' : combo >= 3 ? '#F59E0B' : '#22C55E'

    return (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-3">
            {/* Combo */}
            {combo > 0 && (
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm"
                    style={{
                        backgroundColor: `${comboColor}15`,
                        borderColor: `${comboColor}40`,
                        boxShadow: combo >= 3 ? `0 0 15px ${comboColor}30` : 'none'
                    }}
                >
                    <Flame className="h-5 w-5" style={{ color: comboColor }} />
                    <span className="font-bold text-lg" style={{ color: comboColor }}>{combo}x</span>
                </div>
            )}

            {/* Accuracy */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-purple-500/30 backdrop-blur-sm">
                <Crosshair className="h-4 w-4 text-purple-400" />
                <span className="text-purple-400 font-medium">{accuracy}%</span>
            </div>

            {/* XP */}
            <div
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm transition-all ${xpAnimation ? 'scale-110' : ''}`}
                style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    borderColor: 'rgba(234, 179, 8, 0.4)',
                    boxShadow: xpAnimation ? '0 0 25px rgba(234, 179, 8, 0.5)' : 'none'
                }}
            >
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-lg">{state.playerXP}</span>
                <span className="text-yellow-400/60 text-xs">XP</span>

                {/* XP Popup */}
                {xpAnimation && (
                    <div
                        className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 font-bold whitespace-nowrap"
                        style={{ animation: 'floatUp 1.5s ease-out forwards' }}
                    >
                        +{xpGained} XP!
                    </div>
                )}
            </div>

            <style>{`
                @keyframes floatUp {
                    0% { transform: translate(-50%, 0); opacity: 1; }
                    100% { transform: translate(-50%, -20px); opacity: 0; }
                }
            `}</style>
        </div>
    )
}

// ===========================================
// MISSION OBJECTIVE PANEL
// ===========================================
export function MissionObjective() {
    const { state } = useGame()

    if (!state.currentObjective) return null

    const isComplete = state.completedObjectives.includes(state.currentObjective.id)

    return (
        <div className="fixed top-4 left-4 z-[60]">
            <div
                className={`px-4 py-3 rounded-xl border backdrop-blur-sm transition-all ${isComplete ? 'border-green-500/50 bg-green-900/30' : 'border-purple-500/30 bg-slate-900/80'}`}
                style={{ maxWidth: '280px' }}
            >
                <div className="flex items-center gap-2 mb-1">
                    {isComplete ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                        <Target className="h-4 w-4 text-purple-400" />
                    )}
                    <p className={`text-xs font-medium uppercase tracking-wider ${isComplete ? 'text-green-400' : 'text-purple-400'}`}>
                        {isComplete ? 'Completed' : 'Objective'}
                    </p>
                </div>
                <p className={`font-medium text-sm ${isComplete ? 'text-green-300 line-through' : 'text-white'}`}>
                    {state.currentObjective.title}
                </p>
                {!isComplete && (
                    <p className="text-gray-400 text-xs mt-1">{state.currentObjective.description}</p>
                )}
            </div>
        </div>
    )
}

// ===========================================
// PROGRESS MAP (Bottom center)
// ===========================================
const COMPONENTS = [
    { id: 'control', name: 'Control Unit', icon: Cpu, color: '#06B6D4' },
    { id: 'registers', name: 'Registers', icon: Database, color: '#8B5CF6' },
    { id: 'alu', name: 'ALU', icon: Calculator, color: '#F59E0B' },
    { id: 'memory', name: 'Memory', icon: HardDrive, color: '#10B981' },
    { id: 'io', name: 'I/O', icon: Monitor, color: '#EC4899' }
]

export function GameProgressMap() {
    const { state } = useGame()

    // Map acts to components
    const actToComponent: Record<string, string> = {
        'ACT_1': 'control',
        'ACT_2': 'control',
        'ACT_3': 'registers',
        'ACT_4': 'alu',
        'ACT_5': 'memory'
    }

    const currentComponent = actToComponent[state.currentAct] || ''

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/50 backdrop-blur-sm">
                {COMPONENTS.map((comp, index) => {
                    const isCompleted = state.activatedComponents.includes(comp.id)
                    const isCurrent = currentComponent === comp.id
                    const Icon = comp.icon

                    return (
                        <div key={comp.id} className="flex items-center">
                            <div
                                className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${isCurrent ? 'scale-110' : ''}`}
                                style={{
                                    backgroundColor: isCompleted || isCurrent ? `${comp.color}25` : 'rgba(30, 41, 59, 0.5)',
                                    boxShadow: isCurrent ? `0 0 20px ${comp.color}40, 0 0 0 2px ${comp.color}` : 'none'
                                }}
                                title={comp.name}
                            >
                                <Icon
                                    className="h-5 w-5"
                                    style={{ color: isCompleted || isCurrent ? comp.color : '#4B5563' }}
                                />
                                {isCompleted && (
                                    <div
                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: '#22C55E' }}
                                    >
                                        <CheckCircle className="h-3 w-3 text-white" />
                                    </div>
                                )}
                            </div>
                            {index < COMPONENTS.length - 1 && (
                                <ChevronRight
                                    className="h-4 w-4 mx-1"
                                    style={{ color: isCompleted ? '#6B7280' : '#374151' }}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ===========================================
// FAILURE FEEDBACK OVERLAY
// ===========================================
interface FailureOverlayProps {
    visible: boolean
    message?: string
    xpLost?: number
}

export function FailureOverlay({ visible, message = "Incorrect!", xpLost = 0 }: FailureOverlayProps) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (visible) {
            setShow(true)
            const timer = setTimeout(() => setShow(false), 2500)
            return () => clearTimeout(timer)
        }
    }, [visible])

    if (!show) return null

    return (
        <div className="fixed inset-0 z-[70] pointer-events-none">
            {/* Red flash */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.3), transparent 70%)',
                    animation: 'flash 0.5s ease-out'
                }}
            />

            {/* GLITCH Character Feedback */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div
                    className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
                    style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.3)',
                        border: '3px solid rgba(239, 68, 68, 0.6)',
                        boxShadow: '0 0 40px rgba(239, 68, 68, 0.5)',
                        animation: 'shake 0.5s ease-out'
                    }}
                >
                    <Skull className="h-10 w-10 text-red-400" />
                </div>

                <div
                    className="px-6 py-4 rounded-xl bg-red-900/90 border-2 border-red-500/60"
                    style={{ boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)' }}
                >
                    <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-xl mb-1">
                        <AlertTriangle className="h-5 w-5" />
                        <span>{message}</span>
                    </div>
                    <p className="text-orange-400 text-sm">Combo Broken!</p>
                    {xpLost > 0 && <p className="text-red-300 text-xs mt-1">-{xpLost} XP</p>}
                </div>
            </div>

            <style>{`
                @keyframes flash {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-5px); }
                    40%, 80% { transform: translateX(5px); }
                }
            `}</style>
        </div>
    )
}

// ===========================================
// SUCCESS FEEDBACK OVERLAY
// ===========================================
interface SuccessOverlayProps {
    visible: boolean
    xpGained?: number
    message?: string
}

export function SuccessOverlay({ visible, xpGained = 0, message = "Correct!" }: SuccessOverlayProps) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (visible) {
            setShow(true)
            const timer = setTimeout(() => setShow(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [visible])

    if (!show) return null

    return (
        <div className="fixed inset-0 z-[70] pointer-events-none">
            {/* Green flash */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.2), transparent 70%)',
                    animation: 'flash 0.5s ease-out'
                }}
            />

            {/* Success indicator */}
            <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2"
                style={{ animation: 'popIn 0.3s ease-out' }}
            >
                <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-green-900/90 border-2 border-green-500/60"
                    style={{ boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' }}
                >
                    <CheckCircle className="h-8 w-8 text-green-400" />
                    <div>
                        <p className="text-green-400 font-bold text-lg">{message}</p>
                        {xpGained > 0 && (
                            <p className="text-yellow-400 font-medium">+{xpGained} XP</p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes popIn {
                    0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
                    100% { transform: translateX(-50%) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}

// ===========================================
// MISSION COMPLETE POPUP
// ===========================================
interface MissionCompletePopupProps {
    visible: boolean
    missionName: string
    xpEarned: number
    onContinue: () => void
}

export function MissionCompletePopup({ visible, missionName, xpEarned, onContinue }: MissionCompletePopupProps) {
    const [showButton, setShowButton] = useState(false)

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => setShowButton(true), 1000)
            return () => clearTimeout(timer)
        } else {
            setShowButton(false)
        }
    }, [visible])

    if (!visible) return null

    return (
        <div className="fixed inset-0 z-[80] bg-slate-900/90 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <div
                    className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6"
                    style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))',
                        boxShadow: '0 0 50px rgba(34, 197, 94, 0.4)'
                    }}
                >
                    <Star className="h-12 w-12 text-green-400 fill-current" />
                </div>

                <h2 className="text-4xl font-black text-green-400 mb-2">MISSION COMPLETE!</h2>
                <p className="text-gray-400 text-lg mb-6">{missionName}</p>

                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-yellow-400 mb-8">
                    <Zap className="h-8 w-8" />
                    <span>+{xpEarned} XP</span>
                </div>

                {showButton && (
                    <button
                        onClick={onContinue}
                        className="px-8 py-4 rounded-xl font-bold text-lg bg-green-600 hover:bg-green-500 text-white transition-all hover:scale-105"
                    >
                        Continue to Next Mission
                    </button>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
