"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    RotateCcw, Cpu, HardDrive, CircuitBoard,
    MonitorSpeaker, Cog, Zap, Power, AlertTriangle,
    Trophy, XCircle, Shield, Activity, Bot, Lightbulb, X,
    Skull, Flame, Target, CheckCircle, ChevronRight, Crosshair
} from "lucide-react"

interface BuildTheCPUProps {
    color?: string
    onGameComplete?: () => void
}

// Sound effects
const playSound = (type: 'success' | 'error' | 'boot' | 'click' | 'ai') => {
    if (typeof window === 'undefined') return
    try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        switch (type) {
            case 'success':
                osc.frequency.value = 880
                gain.gain.value = 0.1
                osc.start()
                setTimeout(() => { osc.frequency.value = 1100 }, 100)
                setTimeout(() => osc.stop(), 200)
                break
            case 'error':
                osc.frequency.value = 200
                osc.type = 'sawtooth'
                gain.gain.value = 0.15
                osc.start()
                setTimeout(() => osc.stop(), 300)
                break
            case 'boot':
                osc.frequency.value = 440
                gain.gain.value = 0.08
                osc.start()
                setTimeout(() => { osc.frequency.value = 660 }, 150)
                setTimeout(() => { osc.frequency.value = 880 }, 300)
                setTimeout(() => osc.stop(), 450)
                break
            case 'click':
                osc.frequency.value = 600
                gain.gain.value = 0.05
                osc.start()
                setTimeout(() => osc.stop(), 50)
                break
            case 'ai':
                osc.frequency.value = 1200
                osc.type = 'sine'
                gain.gain.value = 0.04
                osc.start()
                setTimeout(() => { osc.frequency.value = 1400 }, 50)
                setTimeout(() => osc.stop(), 100)
                break
        }
    } catch {
        // Audio not supported
    }
}

// System AI Messages
const AI_MESSAGES = {
    welcome: "System AI online. Awaiting boot sequence initialization.",
    bootStart: "Power supply detected. Begin component activation sequence.",
    hint_cu: "Hint: Coordination must come first. What controls the orchestra?",
    hint_reg: "Hint: Fast storage enables data flow. Where do we hold working data?",
    hint_mem: "Hint: Instructions need a home. Where do programs reside?",
    hint_alu: "Hint: Computation requires a processor. What performs operations?",
    hint_io: "Hint: External communication is final. What interfaces with the world?",
    success_cu: "Control Unit activated. Command pathways established.",
    success_reg: "Registers online. High-speed data buffer ready.",
    success_mem: "Memory mapped. Instruction storage accessible.",
    success_alu: "ALU enabled. Computation capability confirmed.",
    success_io: "I/O interface connected. External communication active.",
    error_generic: "Warning: Incorrect sequence detected. System destabilizing.",
    crash: "Critical failure. System state unrecoverable. Restart required.",
    complete: "Boot sequence complete. All systems operational. Well done, Engineer.",
    mentor_available: "Engineer Mentor available. Request assistance?"
}

interface CPUComponent {
    id: string
    name: string
    icon: React.ReactNode
    slot: string
    activationOrder: number
    failMessage: string
    hintKey: keyof typeof AI_MESSAGES
    successKey: keyof typeof AI_MESSAGES
}

const CPU_COMPONENTS: CPUComponent[] = [
    { id: "control-unit", name: "Control Unit", icon: <Cog className="h-7 w-7" />, slot: "slot-cu", activationOrder: 1, failMessage: "Control Unit required first", hintKey: "hint_cu", successKey: "success_cu" },
    { id: "registers", name: "Registers", icon: <Cpu className="h-7 w-7" />, slot: "slot-reg", activationOrder: 2, failMessage: "Registers need CU signals", hintKey: "hint_reg", successKey: "success_reg" },
    { id: "memory", name: "Memory", icon: <HardDrive className="h-7 w-7" />, slot: "slot-mem", activationOrder: 3, failMessage: "Memory requires register access", hintKey: "hint_mem", successKey: "success_mem" },
    { id: "alu", name: "ALU", icon: <CircuitBoard className="h-7 w-7" />, slot: "slot-alu", activationOrder: 4, failMessage: "ALU needs data pathways", hintKey: "hint_alu", successKey: "success_alu" },
    { id: "io", name: "I/O Units", icon: <MonitorSpeaker className="h-7 w-7" />, slot: "slot-io", activationOrder: 5, failMessage: "I/O is last in boot", hintKey: "hint_io", successKey: "success_io" }
]

interface Connection {
    from: string
    to: string
    type: 'control' | 'data'
    activateAfter: string
}

const CONNECTIONS: Connection[] = [
    { from: "control-unit", to: "registers", type: 'control', activateAfter: "registers" },
    { from: "control-unit", to: "alu", type: 'control', activateAfter: "alu" },
    { from: "memory", to: "registers", type: 'data', activateAfter: "memory" },
    { from: "registers", to: "alu", type: 'data', activateAfter: "alu" },
    { from: "alu", to: "registers", type: 'data', activateAfter: "alu" },
    { from: "io", to: "memory", type: 'data', activateAfter: "io" },
    { from: "memory", to: "io", type: 'data', activateAfter: "io" }
]

const CONTROL_COLOR = "#F97316"
const DATA_COLOR = "#3B82F6"

type GameState = 'idle' | 'booting' | 'running' | 'success' | 'crashed'

export function BuildTheCPU({ color = "#38BDF8", onGameComplete }: BuildTheCPUProps) {
    const [gameState, setGameState] = useState<GameState>('idle')
    const [activatedComponents, setActivatedComponents] = useState<string[]>([])
    const [stability, setStability] = useState(100)
    const [glitchEffect, setGlitchEffect] = useState(false)
    const [glitchIntensity, setGlitchIntensity] = useState(0)
    const [attempts, setAttempts] = useState(0)
    const [consecutiveErrors, setConsecutiveErrors] = useState(0)

    // NEW: XP and Combo tracking
    const [xp, setXP] = useState(0)
    const [combo, setCombo] = useState(0)
    const [maxCombo, setMaxCombo] = useState(0)
    const [accuracy, setAccuracy] = useState(100)
    const [totalActions, setTotalActions] = useState(0)
    const [correctActions, setCorrectActions] = useState(0)
    const [showXPPopup, setShowXPPopup] = useState<number | null>(null)
    const [showGlitchFeedback, setShowGlitchFeedback] = useState(false)
    const [showSuccessFeedback, setShowSuccessFeedback] = useState(false)

    // Character states
    const [aiMessage, setAiMessage] = useState<string>(AI_MESSAGES.welcome)
    const [aiVisible, setAiVisible] = useState(true)
    const [showMentor, setShowMentor] = useState(false)
    const [mentorHint, setMentorHint] = useState<string | null>(null)
    const [showGlitchCharacter, setShowGlitchCharacter] = useState(false)
    const [glitchMessage, setGlitchMessage] = useState('')

    const containerRef = useRef<HTMLDivElement>(null)
    const slotRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const [slotPositions, setSlotPositions] = useState<Record<string, { x: number; y: number }>>({})

    const updateSlotPositions = useCallback(() => {
        if (!containerRef.current) return
        const containerRect = containerRef.current.getBoundingClientRect()
        const newPositions: Record<string, { x: number; y: number }> = {}
        Object.entries(slotRefs.current).forEach(([slotId, element]) => {
            if (element) {
                const rect = element.getBoundingClientRect()
                newPositions[slotId] = {
                    x: rect.left - containerRect.left + rect.width / 2,
                    y: rect.top - containerRect.top + rect.height / 2
                }
            }
        })
        setSlotPositions(newPositions)
    }, [])

    useEffect(() => {
        const timer = setTimeout(updateSlotPositions, 100)
        window.addEventListener('resize', updateSlotPositions)
        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', updateSlotPositions)
        }
    }, [activatedComponents, updateSlotPositions])

    useEffect(() => {
        if (stability <= 0 && gameState === 'running') {
            setGameState('crashed')
            setAiMessage(AI_MESSAGES.crash)
            playSound('error')
        }
    }, [stability, gameState])

    // Show mentor after 3 consecutive errors
    useEffect(() => {
        if (consecutiveErrors >= 3 && !showMentor) {
            setShowMentor(true)
            setAiMessage(AI_MESSAGES.mentor_available)
        }
    }, [consecutiveErrors, showMentor])

    const triggerGlitch = (intensity: number) => {
        setGlitchEffect(true)
        setGlitchIntensity(intensity)
        setTimeout(() => {
            setGlitchEffect(false)
            setGlitchIntensity(0)
        }, 300 + intensity * 100)
    }

    const updateAI = (message: string, sound = true) => {
        setAiMessage(message)
        if (sound) playSound('ai')
    }

    const handleStartMission = () => {
        setGameState('booting')
        updateAI(AI_MESSAGES.bootStart)
        playSound('boot')
        setTimeout(() => {
            setGameState('running')
        }, 1500)
    }

    const handleComponentActivate = (componentId: string) => {
        if (gameState !== 'running') return
        playSound('click')

        const component = CPU_COMPONENTS.find(c => c.id === componentId)
        if (!component) return

        const expectedOrder = activatedComponents.length + 1
        const isCorrect = component.activationOrder === expectedOrder

        // Track actions for accuracy
        setTotalActions(prev => prev + 1)

        if (isCorrect) {
            playSound('success')
            setActivatedComponents(prev => [...prev, componentId])
            updateAI(AI_MESSAGES[component.successKey])
            setStability(prev => Math.min(100, prev + 5))
            setConsecutiveErrors(0)
            setShowMentor(false)
            setMentorHint(null)

            // XP and Combo logic
            const newCombo = combo + 1
            setCombo(newCombo)
            setMaxCombo(prev => Math.max(prev, newCombo))
            setCorrectActions(prev => prev + 1)

            // Calculate XP: base + combo bonus
            const baseXP = 25
            const comboBonus = Math.min(newCombo * 5, 25) // Max 25 bonus
            const earnedXP = baseXP + comboBonus
            setXP(prev => prev + earnedXP)

            // Show XP popup
            setShowXPPopup(earnedXP)
            setTimeout(() => setShowXPPopup(null), 1500)

            // Show success feedback
            setShowSuccessFeedback(true)
            setTimeout(() => setShowSuccessFeedback(false), 1500)

            // Hide GLITCH character
            setShowGlitchCharacter(false)

            // Update accuracy
            setAccuracy(Math.round((correctActions + 1) / (totalActions + 1) * 100))

            if (expectedOrder === 5) {
                setTimeout(() => {
                    setGameState('success')
                    updateAI(AI_MESSAGES.complete)
                    onGameComplete?.()
                }, 800)
            }
        } else {
            playSound('error')
            triggerGlitch(consecutiveErrors + 1)
            updateAI(AI_MESSAGES.error_generic)
            setStability(prev => Math.max(0, prev - 25))
            setAttempts(prev => prev + 1)
            setConsecutiveErrors(prev => prev + 1)

            // Reset combo on error
            setCombo(0)

            // XP penalty
            setXP(prev => Math.max(0, prev - 10))

            // Update accuracy
            setAccuracy(Math.round(correctActions / (totalActions + 1) * 100))

            // Show GLITCH character
            setShowGlitchCharacter(true)
            setGlitchMessage(component.failMessage)
            setShowGlitchFeedback(true)
            setTimeout(() => setShowGlitchFeedback(false), 2500)
        }
    }

    const handleRequestHint = () => {
        const nextOrder = activatedComponents.length + 1
        const nextComponent = CPU_COMPONENTS.find(c => c.activationOrder === nextOrder)
        if (nextComponent) {
            setMentorHint(AI_MESSAGES[nextComponent.hintKey])
        }
    }

    const handleRestart = () => {
        setGameState('idle')
        setActivatedComponents([])
        setStability(100)
        setGlitchEffect(false)
        setGlitchIntensity(0)
        setAttempts(0)
        setConsecutiveErrors(0)
        setAiMessage(AI_MESSAGES.welcome)
        setShowMentor(false)
        setMentorHint(null)
        // Reset new states
        setXP(0)
        setCombo(0)
        setMaxCombo(0)
        setAccuracy(100)
        setTotalActions(0)
        setCorrectActions(0)
        setShowGlitchCharacter(false)
        setGlitchMessage('')
    }

    const setSlotRef = (slotId: string) => (el: HTMLDivElement | null) => {
        slotRefs.current[slotId] = el
    }

    const getArrowCoords = (fromSlot: string, toSlot: string) => {
        const fromPos = slotPositions[fromSlot]
        const toPos = slotPositions[toSlot]
        if (!fromPos || !toPos) return null
        const dx = toPos.x - fromPos.x
        const dy = toPos.y - fromPos.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance === 0) return null
        const offset = 45
        return {
            x1: fromPos.x + (dx / distance) * offset,
            y1: fromPos.y + (dy / distance) * offset,
            x2: toPos.x - (dx / distance) * offset,
            y2: toPos.y - (dy / distance) * offset
        }
    }

    const getSlotForComponent = (componentId: string) => CPU_COMPONENTS.find(c => c.id === componentId)?.slot || null
    const activeConnections = CONNECTIONS.filter(c => activatedComponents.includes(c.activateAfter))

    const getStabilityColor = () => {
        if (stability > 70) return '#22C55E'
        if (stability > 40) return '#F59E0B'
        return '#EF4444'
    }

    const getStabilityLabel = () => {
        if (stability > 70) return 'STABLE'
        if (stability > 40) return 'UNSTABLE'
        return 'CRITICAL'
    }

    return (
        <div className="relative">
            {/* Main Card with Glitch Effect */}
            <Card
                className={`border-2 overflow-hidden transition-all`}
                style={{
                    borderColor: glitchEffect ? '#EF4444' : `${color}30`,
                    boxShadow: glitchEffect ? `0 0 ${30 + glitchIntensity * 10}px rgba(239,68,68,0.4)` : 'none',
                    transform: glitchEffect ? `translate(${Math.random() * glitchIntensity * 2 - glitchIntensity}px, ${Math.random() * glitchIntensity - glitchIntensity / 2}px)` : 'none',
                    filter: glitchEffect ? `hue-rotate(${glitchIntensity * 30}deg)` : 'none'
                }}
            >
                {/* Glitch Overlay */}
                {glitchEffect && (
                    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 2px, rgba(255,0,0,0.1) 4px)`,
                                animation: 'glitch-lines 0.1s infinite'
                            }}
                        />
                    </div>
                )}

                {/* Header */}
                <CardHeader className="pb-3" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="h-4 w-4 text-cyan-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Mission 1</span>
                            </div>
                            <h2 className="text-xl font-bold text-white">CPU Boot Sequence</h2>
                        </div>

                        {/* Scoreboard - visible during gameplay */}
                        {gameState !== 'idle' && (
                            <div className="flex items-center gap-3">
                                {/* Combo Counter */}
                                {combo > 0 && (
                                    <div
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
                                        style={{
                                            backgroundColor: combo >= 3 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                                            borderColor: combo >= 3 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'
                                        }}
                                    >
                                        <Flame className="h-4 w-4" style={{ color: combo >= 3 ? '#EF4444' : '#22C55E' }} />
                                        <span className="font-bold text-sm" style={{ color: combo >= 3 ? '#EF4444' : '#22C55E' }}>{combo}x</span>
                                    </div>
                                )}

                                {/* Accuracy */}
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                    <Crosshair className="h-3.5 w-3.5 text-purple-400" />
                                    <span className="text-xs text-purple-400 font-medium">{accuracy}%</span>
                                </div>

                                {/* XP */}
                                <div
                                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${showXPPopup ? 'scale-110' : ''}`}
                                    style={{
                                        backgroundColor: 'rgba(234, 179, 8, 0.15)',
                                        borderColor: 'rgba(234, 179, 8, 0.4)',
                                        boxShadow: showXPPopup ? '0 0 20px rgba(234, 179, 8, 0.4)' : 'none'
                                    }}
                                >
                                    <Zap className="h-4 w-4 text-yellow-400" />
                                    <span className="text-yellow-400 font-bold">{xp}</span>
                                    <span className="text-yellow-400/60 text-[10px]">XP</span>

                                    {/* XP Popup Animation */}
                                    {showXPPopup && (
                                        <div
                                            className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 font-bold text-sm whitespace-nowrap"
                                            style={{ animation: 'floatUp 1.5s ease-out forwards' }}
                                        >
                                            +{showXPPopup} XP!
                                        </div>
                                    )}
                                </div>

                                <Button variant="ghost" size="sm" onClick={handleRestart} className="text-gray-400 hover:text-white">
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {gameState === 'idle' && (
                            <Button variant="ghost" size="sm" onClick={handleRestart} className="text-gray-400 hover:text-white">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {gameState !== 'idle' && (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4" style={{ color: getStabilityColor() }} />
                                    <span className="text-xs font-bold uppercase" style={{ color: getStabilityColor() }}>
                                        {getStabilityLabel()}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">Errors: {attempts}</span>
                            </div>
                            <div className="h-3 bg-black/60 rounded-full overflow-hidden border border-gray-700">
                                <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${stability}%`,
                                        backgroundColor: getStabilityColor(),
                                        boxShadow: `0 0 10px ${getStabilityColor()}`
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="space-y-4 pt-4 bg-slate-950">
                    {/* Game States */}
                    {gameState === 'idle' && (
                        <div className="text-center py-12">
                            <Power className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                            <h3 className="text-lg font-bold text-gray-300 mb-2">System Offline</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                Activate CPU components in the correct boot sequence.
                            </p>
                            <Button onClick={handleStartMission} size="lg" className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                                <Zap className="h-5 w-5" />
                                Start Mission
                            </Button>
                        </div>
                    )}

                    {gameState === 'booting' && (
                        <div className="text-center py-12">
                            <Power className="h-16 w-16 mx-auto text-cyan-400 animate-pulse" />
                            <p className="text-cyan-400 mt-4 font-mono animate-pulse">Initializing...</p>
                        </div>
                    )}

                    {gameState === 'crashed' && (
                        <div className="text-center py-10">
                            <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                            <h3 className="text-xl font-bold text-red-400 mb-2">SYSTEM CRASH</h3>
                            <p className="text-sm text-gray-400 mb-6">Boot sequence failed.</p>
                            <Button onClick={handleRestart} className="gap-2 bg-red-600 hover:bg-red-700">
                                <RotateCcw className="h-4 w-4" />
                                Restart Mission
                            </Button>
                        </div>
                    )}

                    {gameState === 'success' && (
                        <div className="text-center py-10">
                            <Trophy className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
                            <h3 className="text-xl font-bold text-green-400 mb-2">BOOT SUCCESSFUL</h3>
                            <p className="text-sm text-gray-400 mb-6">All systems operational.</p>
                            <Button onClick={handleRestart} className="gap-2 bg-green-600 hover:bg-green-700">
                                <RotateCcw className="h-4 w-4" />
                                Replay
                            </Button>
                        </div>
                    )}

                    {gameState === 'running' && (
                        <>
                            {/* Component Selection */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                                    Activate Component
                                </h4>
                                <div className="grid grid-cols-5 gap-2">
                                    {CPU_COMPONENTS.map(component => {
                                        const isActivated = activatedComponents.includes(component.id)
                                        return (
                                            <button
                                                key={component.id}
                                                onClick={() => handleComponentActivate(component.id)}
                                                disabled={isActivated}
                                                className={`p-4 rounded-lg text-center transition-all ${isActivated ? 'cursor-not-allowed' : 'hover:scale-105 cursor-pointer active:scale-95'
                                                    }`}
                                                style={{
                                                    backgroundColor: isActivated ? 'rgba(34,197,94,0.15)' : 'rgba(30,41,59,0.8)',
                                                    border: `2px solid ${isActivated ? '#22C55E' : 'rgba(100,116,139,0.4)'}`,
                                                    boxShadow: isActivated ? '0 0 15px rgba(34,197,94,0.3)' : 'none'
                                                }}
                                            >
                                                <div className={isActivated ? 'text-green-400' : 'text-gray-400'}>
                                                    {component.icon}
                                                </div>
                                                <span className={`text-xs font-medium block mt-2 ${isActivated ? 'text-green-400' : 'text-gray-400'}`}>
                                                    {component.name}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* CPU Visualization */}
                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-700">
                                <div ref={containerRef} className="relative max-w-xl mx-auto">
                                    {Object.keys(slotPositions).length > 0 && (
                                        <svg className="absolute inset-0 pointer-events-none z-10" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                            <defs>
                                                {activeConnections.map((conn, i) => (
                                                    <marker key={`m-${i}`} id={`arr-${i}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                                                        <path d="M0,0 L0,8 L8,4 z" fill={conn.type === 'control' ? CONTROL_COLOR : DATA_COLOR} />
                                                    </marker>
                                                ))}
                                            </defs>
                                            {activeConnections.map((conn, i) => {
                                                const fromSlot = getSlotForComponent(conn.from)
                                                const toSlot = getSlotForComponent(conn.to)
                                                if (!fromSlot || !toSlot) return null
                                                const coords = getArrowCoords(fromSlot, toSlot)
                                                if (!coords) return null
                                                return (
                                                    <line key={i} x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2}
                                                        stroke={conn.type === 'control' ? CONTROL_COLOR : DATA_COLOR}
                                                        strokeWidth="2" strokeDasharray="6,4" markerEnd={`url(#arr-${i})`} opacity="0.8">
                                                        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.6s" repeatCount="indefinite" />
                                                    </line>
                                                )
                                            })}
                                        </svg>
                                    )}

                                    <div className="grid grid-cols-3 gap-3">
                                        <div></div>
                                        <div ref={setSlotRef("slot-cu")}><ComponentSlot comp={CPU_COMPONENTS[0]} isActive={activatedComponents.includes('control-unit')} /></div>
                                        <div></div>
                                        <div ref={setSlotRef("slot-alu")}><ComponentSlot comp={CPU_COMPONENTS[3]} isActive={activatedComponents.includes('alu')} /></div>
                                        <div ref={setSlotRef("slot-reg")}><ComponentSlot comp={CPU_COMPONENTS[1]} isActive={activatedComponents.includes('registers')} /></div>
                                        <div ref={setSlotRef("slot-mem")}><ComponentSlot comp={CPU_COMPONENTS[2]} isActive={activatedComponents.includes('memory')} /></div>
                                        <div></div>
                                        <div ref={setSlotRef("slot-io")}><ComponentSlot comp={CPU_COMPONENTS[4]} isActive={activatedComponents.includes('io')} /></div>
                                        <div></div>
                                    </div>
                                </div>

                                {activeConnections.length > 0 && (
                                    <div className="flex justify-center gap-6 mt-4 pt-3 border-t border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-0.5 rounded" style={{ backgroundColor: DATA_COLOR }} />
                                            <span className="text-[10px] text-gray-500 uppercase">Data</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-0.5 rounded" style={{ backgroundColor: CONTROL_COLOR }} />
                                            <span className="text-[10px] text-gray-500 uppercase">Control</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* SYSTEM AI - Floating Assistant */}
            {aiVisible && gameState !== 'idle' && (
                <div className="fixed bottom-4 right-4 max-w-xs z-50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-slate-900/95 border border-cyan-500/30 rounded-xl p-4 backdrop-blur-sm shadow-2xl"
                        style={{ boxShadow: '0 0 30px rgba(56,189,248,0.15)' }}>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40">
                                <Bot className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">System AI</span>
                                    <button onClick={() => setAiVisible(false)} className="text-gray-500 hover:text-gray-300">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">{aiMessage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ENGINEER MENTOR - Hint System */}
            {showMentor && gameState === 'running' && (
                <div className="fixed bottom-4 left-4 max-w-xs z-50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-amber-950/95 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm shadow-2xl">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                                <Lightbulb className="h-5 w-5 text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Engineer Mentor</span>
                                {mentorHint ? (
                                    <p className="text-xs text-amber-200 mt-1">{mentorHint}</p>
                                ) : (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-400 mb-2">Need a hint?</p>
                                        <Button size="sm" variant="outline" onClick={handleRequestHint}
                                            className="text-xs h-7 border-amber-500/40 text-amber-400 hover:bg-amber-500/20">
                                            Request Hint
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* GLITCH Character - Error Feedback */}
            {showGlitchCharacter && gameState === 'running' && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                    <div
                        className="text-center"
                        style={{ animation: showGlitchFeedback ? 'shake 0.5s ease-out' : 'none' }}
                    >
                        <div
                            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3"
                            style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.3)',
                                border: '3px solid rgba(239, 68, 68, 0.6)',
                                boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)'
                            }}
                        >
                            <Skull className="h-8 w-8 text-red-400" />
                        </div>
                        <div
                            className="px-4 py-3 rounded-xl bg-red-900/90 border-2 border-red-500/60"
                            style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}
                        >
                            <p className="text-red-400 font-bold text-sm flex items-center justify-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                {glitchMessage}
                            </p>
                            <p className="text-orange-400 text-xs mt-1">Combo Broken! -10 XP</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Feedback Overlay */}
            {showSuccessFeedback && (
                <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div
                        className="flex items-center gap-3 px-5 py-3 rounded-xl bg-green-900/90 border-2 border-green-500/60"
                        style={{
                            boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)',
                            animation: 'popIn 0.3s ease-out'
                        }}
                    >
                        <CheckCircle className="h-6 w-6 text-green-400" />
                        <div>
                            <p className="text-green-400 font-bold">Correct!</p>
                            <p className="text-yellow-400 text-sm">+{25 + Math.min(combo * 5, 25)} XP</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Map - Bottom */}
            {gameState === 'running' && (
                <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-700/50">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 text-center">Component Progress</p>
                    <div className="flex items-center justify-center gap-2">
                        {CPU_COMPONENTS.map((comp, index) => {
                            const isActivated = activatedComponents.includes(comp.id)
                            const isNext = activatedComponents.length === index
                            return (
                                <div key={comp.id} className="flex items-center">
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isNext ? 'ring-2 ring-offset-1 ring-offset-slate-900 ring-cyan-400' : ''}`}
                                        style={{
                                            backgroundColor: isActivated ? 'rgba(34, 197, 94, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                                            boxShadow: isActivated ? '0 0 10px rgba(34, 197, 94, 0.3)' : 'none'
                                        }}
                                        title={comp.name}
                                    >
                                        <div className={isActivated ? 'text-green-400' : isNext ? 'text-cyan-400' : 'text-gray-600'}>
                                            {comp.icon}
                                        </div>
                                    </div>
                                    {index < CPU_COMPONENTS.length - 1 && (
                                        <ChevronRight className="h-3 w-3 mx-0.5" style={{ color: isActivated ? '#22C55E' : '#374151' }} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                @keyframes floatUp {
                    0% { transform: translateX(-50%) translateY(0); opacity: 1; }
                    100% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-5px); }
                    40%, 80% { transform: translateX(5px); }
                }
                @keyframes popIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}

function ComponentSlot({ comp, isActive }: { comp: CPUComponent; isActive: boolean }) {
    return (
        <div className="min-h-20 p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-500"
            style={{
                backgroundColor: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(15,23,42,0.8)',
                border: `2px solid ${isActive ? '#22C55E' : 'rgba(51,65,85,0.5)'}`,
                boxShadow: isActive ? '0 0 20px rgba(34,197,94,0.25)' : 'none'
            }}>
            <div className={isActive ? 'text-green-400' : 'text-slate-600'}>{comp.icon}</div>
            <span className={`text-xs font-medium mt-1 ${isActive ? 'text-green-400' : 'text-slate-600'}`}>{comp.name}</span>
        </div>
    )
}
