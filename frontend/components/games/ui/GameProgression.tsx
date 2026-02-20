"use client"

import { useState, useEffect } from "react"
import { Cpu, Database, Calculator, HardDrive, Monitor, ChevronRight, Star, AlertTriangle, Zap, Target } from "lucide-react"

// Progress map showing CPU component journey
interface ProgressMapProps {
    currentComponent: string
    completedComponents: string[]
}

const COMPONENTS = [
    { id: 'control', name: 'Control Unit', icon: Cpu, color: '#06B6D4' },
    { id: 'registers', name: 'Registers', icon: Database, color: '#8B5CF6' },
    { id: 'alu', name: 'ALU', icon: Calculator, color: '#F59E0B' },
    { id: 'memory', name: 'Memory', icon: HardDrive, color: '#10B981' },
    { id: 'io', name: 'I/O', icon: Monitor, color: '#EC4899' }
]

export function ProgressMap({ currentComponent, completedComponents }: ProgressMapProps) {
    return (
        <div className="flex items-center gap-1">
            {COMPONENTS.map((comp, index) => {
                const isCompleted = completedComponents.includes(comp.id)
                const isCurrent = currentComponent === comp.id
                const Icon = comp.icon

                return (
                    <div key={comp.id} className="flex items-center">
                        <div
                            className={`
                                relative w-8 h-8 rounded-lg flex items-center justify-center
                                transition-all duration-300
                                ${isCurrent ? 'ring-2 ring-offset-1 ring-offset-slate-900 scale-110' : ''}
                                ${isCompleted ? 'bg-opacity-30' : 'bg-slate-800/60'}
                            `}
                            style={{
                                backgroundColor: isCompleted || isCurrent ? `${comp.color}30` : undefined,
                                borderColor: comp.color,
                                boxShadow: isCurrent ? `0 0 15px ${comp.color}50, 0 0 0 2px ${comp.color}` : 'none'
                            }}
                            title={comp.name}
                        >
                            <Icon
                                className="h-4 w-4"
                                style={{
                                    color: isCompleted || isCurrent ? comp.color : '#4B5563',
                                    opacity: isCompleted || isCurrent ? 1 : 0.5
                                }}
                            />
                            {isCompleted && (
                                <div
                                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: '#22C55E' }}
                                >
                                    <span className="text-[8px] text-white">✓</span>
                                </div>
                            )}
                        </div>
                        {index < COMPONENTS.length - 1 && (
                            <ChevronRight
                                className="h-3 w-3 mx-0.5"
                                style={{
                                    color: completedComponents.includes(COMPONENTS[index + 1].id) ||
                                        currentComponent === COMPONENTS[index + 1].id ||
                                        isCompleted
                                        ? '#6B7280'
                                        : '#374151'
                                }}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// Mission Briefing Component
interface Mission {
    id: string
    title: string
    objective: string
    reward: number
    failureRisk: 'low' | 'medium' | 'high'
    component: string
}

interface MissionBriefingProps {
    mission: Mission
    onStart: () => void
    visible: boolean
}

export function MissionBriefing({ mission, onStart, visible }: MissionBriefingProps) {
    const [showStart, setShowStart] = useState(false)

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => setShowStart(true), 1000)
            return () => clearTimeout(timer)
        } else {
            setShowStart(false)
        }
    }, [visible])

    if (!visible) return null

    const riskConfig = {
        low: { color: '#22C55E', label: 'Low Risk', bg: 'bg-green-500/10' },
        medium: { color: '#F59E0B', label: 'Medium Risk', bg: 'bg-amber-500/10' },
        high: { color: '#EF4444', label: 'High Risk', bg: 'bg-red-500/10' }
    }

    const risk = riskConfig[mission.failureRisk]

    return (
        <div className="fixed inset-0 z-[90] bg-slate-900/95 flex items-center justify-center">
            <div className="max-w-lg w-full mx-4 animate-fadeIn">
                {/* Mission Header */}
                <div className="text-center mb-6">
                    <p className="text-cyan-400 text-sm font-medium tracking-widest mb-2">NEW MISSION</p>
                    <h2 className="text-3xl font-black text-white">{mission.title}</h2>
                </div>

                {/* Mission Card */}
                <div
                    className="rounded-2xl border p-6 mb-6"
                    style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderColor: 'rgba(6, 182, 212, 0.3)',
                        boxShadow: '0 0 40px rgba(6, 182, 212, 0.1)'
                    }}
                >
                    {/* Objective */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-purple-400" />
                            <p className="text-xs text-purple-400 font-medium uppercase tracking-wide">Objective</p>
                        </div>
                        <p className="text-gray-300 text-lg">{mission.objective}</p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Reward */}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                            <Zap className="h-5 w-5 text-yellow-400" />
                            <div>
                                <p className="text-xs text-yellow-400/70">Reward</p>
                                <p className="text-yellow-400 font-bold">{mission.reward} XP</p>
                            </div>
                        </div>

                        {/* Failure Risk */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${risk.bg}`}
                            style={{ borderColor: `${risk.color}30` }}
                        >
                            <AlertTriangle className="h-5 w-5" style={{ color: risk.color }} />
                            <div>
                                <p className="text-xs" style={{ color: `${risk.color}99` }}>Failure Risk</p>
                                <p className="font-bold" style={{ color: risk.color }}>{risk.label}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                {showStart && (
                    <button
                        onClick={onStart}
                        className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                            boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)'
                        }}
                    >
                        START MISSION
                    </button>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    )
}

// Mission Complete Popup
interface MissionCompleteProps {
    mission: Mission
    xpEarned: number
    accuracy: number
    maxCombo: number
    visible: boolean
    onContinue: () => void
}

export function MissionComplete({
    mission,
    xpEarned,
    accuracy,
    maxCombo,
    visible,
    onContinue
}: MissionCompleteProps) {
    const [showStats, setShowStats] = useState(false)
    const [showButton, setShowButton] = useState(false)

    useEffect(() => {
        if (visible) {
            const statsTimer = setTimeout(() => setShowStats(true), 500)
            const buttonTimer = setTimeout(() => setShowButton(true), 1500)
            return () => {
                clearTimeout(statsTimer)
                clearTimeout(buttonTimer)
            }
        } else {
            setShowStats(false)
            setShowButton(false)
        }
    }, [visible])

    if (!visible) return null

    return (
        <div className="fixed inset-0 z-[90] bg-slate-900/95 flex items-center justify-center">
            <div className="max-w-md w-full mx-4 text-center animate-fadeIn">
                {/* Success Icon */}
                <div
                    className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6"
                    style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))',
                        boxShadow: '0 0 40px rgba(34, 197, 94, 0.3)'
                    }}
                >
                    <Star className="h-10 w-10 text-green-400 fill-current" />
                </div>

                <h2 className="text-3xl font-black text-green-400 mb-2">MISSION COMPLETE!</h2>
                <p className="text-gray-400 mb-8">{mission.title}</p>

                {/* Stats */}
                {showStats && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                            <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-yellow-400">{xpEarned}</p>
                            <p className="text-xs text-yellow-400/70">XP Earned</p>
                        </div>
                        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                            <Target className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-cyan-400">{accuracy}%</p>
                            <p className="text-xs text-cyan-400/70">Accuracy</p>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                            <Zap className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-purple-400">{maxCombo}x</p>
                            <p className="text-xs text-purple-400/70">Max Combo</p>
                        </div>
                    </div>
                )}

                {/* Continue Button */}
                {showButton && (
                    <button
                        onClick={onContinue}
                        className="px-8 py-4 rounded-xl font-bold text-lg bg-green-600 hover:bg-green-500 text-white transition-all"
                    >
                        Continue
                    </button>
                )}
            </div>
        </div>
    )
}

// Combo Counter Display
interface ComboCounterProps {
    combo: number
    visible: boolean
}

export function ComboCounter({ combo, visible }: ComboCounterProps) {
    if (!visible || combo < 2) return null

    const comboColor = combo >= 10 ? '#EF4444' : combo >= 5 ? '#F59E0B' : '#22C55E'

    return (
        <div
            className="fixed top-1/2 right-8 -translate-y-1/2 z-[70] animate-pulse"
            style={{ color: comboColor }}
        >
            <div
                className="text-center px-4 py-3 rounded-xl border"
                style={{
                    backgroundColor: `${comboColor}15`,
                    borderColor: `${comboColor}40`,
                    boxShadow: `0 0 20px ${comboColor}30`
                }}
            >
                <p className="text-4xl font-black">{combo}x</p>
                <p className="text-xs font-bold uppercase tracking-widest">COMBO</p>
            </div>
        </div>
    )
}
