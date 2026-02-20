"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { X, Volume2, VolumeX, Trophy, Star, Zap, ChevronRight, MousePointer, ArrowDown, Lock, CheckCircle, Skull, Flame, Crosshair, AlertTriangle } from "lucide-react"
import { LearningProgressPanel, ActivityType } from "@/components/learning-progress-panel"

// ===========================================
// TYPES
// ===========================================
type GameStage = 'WELCOME' | 'TUTORIAL' | 'INTRO' | 'CONTROL_UNIT' | 'REGISTERS' | 'MEMORY' | 'ALU' | 'IO_SYNC' | 'VICTORY'
type CharacterState = 'idle' | 'walking' | 'working' | 'success' | 'error' | 'hint'

interface Objective {
    id: string
    title: string
    description: string
    completed: boolean
}

// ===========================================
// SOUND SYSTEM
// ===========================================
const playSound = (type: 'click' | 'success' | 'error' | 'complete' | 'hint' | 'type') => {
    if (typeof window === 'undefined') return
    try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        const sounds: Record<string, () => void> = {
            click: () => { osc.frequency.value = 800; gain.gain.value = 0.05; osc.start(); setTimeout(() => osc.stop(), 50) },
            success: () => { osc.frequency.value = 523; gain.gain.value = 0.1; osc.start(); setTimeout(() => { osc.frequency.value = 784 }, 150); setTimeout(() => osc.stop(), 300) },
            error: () => { osc.frequency.value = 200; osc.type = 'sawtooth'; gain.gain.value = 0.12; osc.start(); setTimeout(() => osc.stop(), 300) },
            complete: () => { osc.frequency.value = 523; gain.gain.value = 0.12; osc.start(); setTimeout(() => { osc.frequency.value = 784 }, 150); setTimeout(() => { osc.frequency.value = 1047 }, 300); setTimeout(() => osc.stop(), 450) },
            hint: () => { osc.frequency.value = 600; gain.gain.value = 0.06; osc.start(); setTimeout(() => osc.stop(), 100) },
            type: () => { osc.frequency.value = 1200; gain.gain.value = 0.02; osc.start(); setTimeout(() => osc.stop(), 20) }
        }
        sounds[type]?.()
    } catch { /* Audio not supported */ }
}

// ===========================================
// STAGE CONFIGURATION
// ===========================================
const STAGES: { id: GameStage; name: string; stageNumber: number }[] = [
    { id: 'TUTORIAL', name: 'Tutorial', stageNumber: 0 },
    { id: 'INTRO', name: 'System Failure', stageNumber: 1 },
    { id: 'CONTROL_UNIT', name: 'Control Unit', stageNumber: 2 },
    { id: 'REGISTERS', name: 'Register Setup', stageNumber: 3 },
    { id: 'MEMORY', name: 'Memory Loading', stageNumber: 4 },
    { id: 'ALU', name: 'ALU Execution', stageNumber: 5 },
    { id: 'IO_SYNC', name: 'I/O Sync', stageNumber: 6 },
]

const DIALOGUE = {
    welcome: [
        "Welcome, Engineer! I'm SYS, your System Guide.",
        "The CPU has crashed and needs your help to reboot.",
        "I'll guide you through each step. Ready to begin?"
    ],
    tutorial: {
        step1: "First, learn how to interact. Click the highlighted button below!",
        step2: "Great! Now you know how to click targets. Watch for the pulsing glow.",
        step3: "I'll tell you what to do at each stage. Read my messages carefully!",
        complete: "Tutorial complete! Now let's save this CPU. Click CONTINUE."
    },
    intro: {
        main: "CRITICAL: The CPU is completely offline. All 5 core components need to be reactivated in the correct order.",
        explain: "We'll start with the Control Unit - it's the brain that coordinates everything."
    },
    controlUnit: {
        before: "The Control Unit must start first. It coordinates all CPU operations. Click it to activate!",
        after: "Excellent! The Control Unit is now online and coordinating. The CU tells other components what to do."
    },
    registers: {
        before: "Registers are small, fast storage units inside the CPU. Click to collect 3 data packets!",
        collect: (n: number) => `Data packet ${n}/3 collected! ${3 - n > 0 ? `${3 - n} more to go.` : 'All data loaded!'}`,
        after: "Registers loaded! They hold data that the CPU is actively using - much faster than memory."
    },
    memory: {
        before: "Memory stores data and instructions. Choose the correct address to load the program!",
        wrong: "Wrong address! Memory uses specific addresses. Look for address 0x4A2B.",
        after: "Memory accessed! The CPU can now fetch instructions from RAM using this address."
    },
    alu: {
        before: "The ALU (Arithmetic Logic Unit) performs calculations. Solve this: 42 + 17 = ?",
        wrong: "That's not right! Try again: 42 + 17 = ?",
        after: "Correct! The ALU handles all arithmetic (+, -, *, /) and logic (AND, OR, NOT) operations."
    },
    io: {
        before: "Finally, synchronize the I/O to connect with external devices. Click when the sync bar is in the green zone!",
        miss: "Missed! Wait for the indicator to enter the green zone, then click.",
        after: "I/O synchronized! The CPU can now communicate with keyboards, displays, and storage devices."
    },
    victory: "SYSTEM RESTORED! You've successfully rebooted the CPU. All components are working in harmony!"
}

// ===========================================
// PLAYER CHARACTER
// ===========================================
function PlayerCharacter({ x, y, state }: { x: number; y: number; state: CharacterState }) {
    const [frame, setFrame] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => setFrame(f => (f + 1) % 20), 100)
        return () => clearInterval(interval)
    }, [])

    const bounce = state === 'idle' ? Math.sin(frame * 0.5) * 2 : 0
    const shake = state === 'error' ? Math.sin(frame * 2) * 5 : 0

    return (
        <div className="absolute z-40 transition-all duration-500" style={{ left: x + shake, top: y + bounce }}>
            <div className="relative">
                <div className="w-14 relative">
                    {/* Lab Coat */}
                    <div className="w-12 h-16 bg-gradient-to-b from-gray-100 to-gray-200 rounded-t-xl rounded-b-lg border-2 border-gray-300 relative mx-auto">
                        {/* Head */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-11 h-11 bg-gradient-to-b from-amber-100 to-amber-200 rounded-full border-2 border-amber-300">
                            <div className="absolute top-0 left-1 right-1 h-5 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-full" />
                            <div className="absolute top-5 left-2 w-2.5 h-2.5 bg-gray-800 rounded-full" style={{ transform: state === 'success' ? 'scaleY(0.3)' : 'scaleY(1)' }} />
                            <div className="absolute top-5 right-2 w-2.5 h-2.5 bg-gray-800 rounded-full" style={{ transform: state === 'success' ? 'scaleY(0.3)' : 'scaleY(1)' }} />
                            <div className="absolute -left-1.5 top-3 w-2.5 h-5 bg-cyan-500 rounded-full border border-cyan-400" />
                            <div className="absolute -right-1.5 top-3 w-2.5 h-5 bg-cyan-500 rounded-full border border-cyan-400" />
                            <div className="absolute top-0 left-0 right-0 h-3 border-t-2 border-l-2 border-r-2 border-cyan-500 rounded-t-full" />
                        </div>
                        <div className="absolute top-2 left-1 w-4 h-4 bg-cyan-500 rounded-sm" />
                        <div className="absolute top-2 right-1 w-3 h-5 bg-white rounded-sm border border-gray-300" />
                    </div>
                    {/* Legs */}
                    <div className="flex gap-1 justify-center mt-[-2px]">
                        <div className="w-4 h-7 bg-gray-700 rounded-b-lg" style={{ transform: state === 'walking' ? `rotate(${Math.sin(frame) * 20}deg)` : 'none' }} />
                        <div className="w-4 h-7 bg-gray-700 rounded-b-lg" style={{ transform: state === 'walking' ? `rotate(${-Math.sin(frame) * 20}deg)` : 'none' }} />
                    </div>
                </div>
                {state === 'success' && <div className="absolute -top-4 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse"><span className="text-white text-sm">✓</span></div>}
                {state === 'error' && <div className="absolute -top-4 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse"><span className="text-white text-sm">✗</span></div>}
                {state === 'working' && <div className="absolute -top-4 -right-2 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-spin"><span className="text-white text-sm">⚙</span></div>}
            </div>
        </div>
    )
}

// ===========================================
// SYSTEM GUIDE WITH TYPEWRITER
// ===========================================
function SystemGuide({ message, visible, onComplete }: { message: string; visible: boolean; onComplete?: () => void }) {
    const [displayedText, setDisplayedText] = useState('')
    const [isTyping, setIsTyping] = useState(true)

    useEffect(() => {
        setDisplayedText('')
        setIsTyping(true)
        let index = 0
        const timer = setInterval(() => {
            if (index < message.length) {
                setDisplayedText(message.slice(0, index + 1))
                if (index % 3 === 0) playSound('type')
                index++
            } else {
                clearInterval(timer)
                setIsTyping(false)
                onComplete?.()
            }
        }, 30)
        return () => clearInterval(timer)
    }, [message, onComplete])

    if (!visible) return null

    return (
        <div className="absolute bottom-20 left-4 z-50 flex items-end gap-3 animate-in slide-in-from-left">
            <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center border-2 border-cyan-300 shadow-lg shadow-cyan-500/30 animate-pulse">
                    <span className="text-3xl">🤖</span>
                </div>
            </div>
            <div className="max-w-sm bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/40 shadow-xl relative">
                <div className="absolute -left-2 bottom-4 w-4 h-4 bg-slate-800 border-l border-b border-cyan-500/40 rotate-45" />
                <p className="text-cyan-100 text-sm font-medium min-h-[40px]">
                    {displayedText}
                    {isTyping && <span className="animate-pulse">|</span>}
                </p>
                <p className="text-cyan-400 text-xs mt-1 font-bold">— SYS GUIDE</p>
            </div>
        </div>
    )
}

// ===========================================
// OBJECTIVE DISPLAY
// ===========================================
function ObjectiveDisplay({ objective, stageProgress }: { objective: Objective | null; stageProgress: number }) {
    if (!objective) return null

    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl px-6 py-3 border border-cyan-500/30 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${objective.completed ? 'bg-green-500' : 'bg-cyan-500 animate-pulse'}`}>
                        {objective.completed ? <CheckCircle className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Current Objective</p>
                        <p className="text-cyan-100 font-bold">{objective.title}</p>
                    </div>
                </div>
                {/* Stage progress dots */}
                <div className="flex gap-1.5 mt-3 justify-center">
                    {STAGES.map((_, i) => (
                        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < stageProgress ? 'bg-green-500' : i === stageProgress ? 'bg-cyan-500 animate-pulse' : 'bg-gray-600'}`} />
                    ))}
                </div>
            </div>
        </div>
    )
}

// ===========================================
// DIRECTIONAL ARROW
// ===========================================
function DirectionalArrow({ targetX, targetY, visible }: { targetX: number; targetY: number; visible: boolean }) {
    if (!visible) return null
    return (
        <div className="absolute z-50 animate-bounce" style={{ left: targetX + 30, top: targetY - 50 }}>
            <ArrowDown className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
        </div>
    )
}

// ===========================================
// XP POPUP
// ===========================================
function XPPopup({ amount, visible }: { amount: number; visible: boolean }) {
    if (!visible) return null
    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] animate-in zoom-in fade-in duration-300">
            <div className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)] animate-pulse">
                +{amount} XP
            </div>
        </div>
    )
}

// ===========================================
// CPU COMPONENT
// ===========================================
function CPUComponent({ id, name, icon, x, y, isActive, isTarget, isLocked, onClick, disabled }: {
    id: string; name: string; icon: string; x: number; y: number
    isActive: boolean; isTarget: boolean; isLocked: boolean
    onClick: () => void; disabled: boolean
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || isActive || isLocked}
            className={`absolute transition-all duration-300 ${!disabled && !isActive && !isLocked ? 'hover:scale-110 cursor-pointer' : ''} ${isLocked ? 'grayscale' : ''}`}
            style={{ left: x, top: y }}
        >
            <div
                className={`w-28 h-28 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${isTarget ? 'ring-4 ring-cyan-400 animate-pulse' : ''}`}
                style={{
                    background: isActive
                        ? 'linear-gradient(135deg, rgba(34,197,94,0.4), rgba(34,197,94,0.2))'
                        : isLocked
                            ? 'linear-gradient(135deg, rgba(30,41,59,0.6), rgba(15,23,42,0.6))'
                            : 'linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))',
                    border: `3px solid ${isActive ? '#22C55E' : isTarget ? '#06B6D4' : isLocked ? '#334155' : '#475569'}`,
                    boxShadow: isActive ? '0 0 40px rgba(34,197,94,0.5), inset 0 0 20px rgba(34,197,94,0.2)' : isTarget ? '0 0 30px rgba(6,182,212,0.5)' : '0 4px 20px rgba(0,0,0,0.3)',
                    opacity: isLocked ? 0.4 : 1
                }}
            >
                <span className="text-3xl mb-1">{icon}</span>
                <span className={`text-xs font-bold ${isActive ? 'text-green-400' : 'text-gray-300'}`}>{name}</span>
                {isActive && <span className="text-[10px] text-green-400 mt-1 font-bold animate-pulse">● ONLINE</span>}
                {isLocked && <Lock className="absolute top-2 right-2 w-4 h-4 text-gray-500" />}
            </div>
        </button>
    )
}

// ===========================================
// GLITCH ENTITY - ENHANCED WITH SKULL CHARACTER
// ===========================================
function GlitchEntity({ visible, message }: { visible: boolean; message?: string }) {
    if (!visible) return null
    return (
        <>
            <div className="fixed inset-0 z-30 pointer-events-none" style={{
                background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 0, 0.15) 2px, rgba(255, 0, 0, 0.15) 4px)`,
                animation: 'glitchFlash 0.3s ease-out'
            }} />
            <div className="fixed top-1/4 right-8 z-50" style={{ animation: 'shake 0.5s ease-out' }}>
                <div className="relative text-center">
                    <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center border-3 shadow-lg mb-2"
                        style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.3)',
                            borderColor: 'rgba(239, 68, 68, 0.6)',
                            boxShadow: '0 0 40px rgba(239, 68, 68, 0.5)'
                        }}
                    >
                        <Skull className="w-10 h-10 text-red-400" />
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-red-900/90 border-2 border-red-500/60"
                        style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}
                    >
                        <p className="text-red-400 font-bold text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            GLITCH
                        </p>
                        {message && <p className="text-orange-300 text-xs mt-1">{message}</p>}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes glitchFlash {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-5px); }
                    40%, 80% { transform: translateX(5px); }
                }
            `}</style>
        </>
    )
}

// ===========================================
// FLOATING PARTICLES
// ===========================================
function FloatingParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full animate-pulse"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${4 + Math.random() * 8}px`,
                        height: `${4 + Math.random() * 8}px`,
                        background: i % 3 === 0 ? '#06B6D4' : i % 3 === 1 ? '#3B82F6' : '#8B5CF6',
                        boxShadow: `0 0 ${10 + Math.random() * 20}px ${i % 3 === 0 ? '#06B6D4' : i % 3 === 1 ? '#3B82F6' : '#8B5CF6'}`,
                        opacity: 0.3 + Math.random() * 0.4,
                        animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 2}s`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    25% { transform: translateY(-20px) translateX(10px); }
                    50% { transform: translateY(-10px) translateX(-10px); }
                    75% { transform: translateY(-30px) translateX(5px); }
                }
            `}</style>
        </div>
    )
}

// ===========================================
// CIRCUIT PATTERN BACKGROUND
// ===========================================
function CircuitBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            {/* Grid lines */}
            <div className="absolute inset-0" style={{
                backgroundImage: `
                    linear-gradient(rgba(6,182,212,0.15) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(6,182,212,0.15) 1px, transparent 1px),
                    linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px'
            }} />
            {/* Circuit nodes */}
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-cyan-500 animate-pulse"
                    style={{
                        left: `${10 + (i % 4) * 25}%`,
                        top: `${15 + Math.floor(i / 4) * 30}%`,
                        boxShadow: '0 0 15px #06B6D4',
                        animationDelay: `${i * 0.2}s`
                    }}
                />
            ))}
            {/* Horizontal circuit lines */}
            <div className="absolute top-[30%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="absolute top-[60%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            {/* Vertical circuit lines */}
            <div className="absolute left-[25%] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
            <div className="absolute left-[75%] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" />
        </div>
    )
}

// ===========================================
// WELCOME SCREEN
// ===========================================
function WelcomeScreen({ onStart }: { onStart: () => void }) {
    const [step, setStep] = useState(0)
    const [typingComplete, setTypingComplete] = useState(false)
    const [pulseFrame, setPulseFrame] = useState(0)
    const [displayedText, setDisplayedText] = useState('')

    useEffect(() => {
        const interval = setInterval(() => setPulseFrame(f => (f + 1) % 100), 50)
        return () => clearInterval(interval)
    }, [])

    // Typewriter effect for welcome messages
    useEffect(() => {
        const message = DIALOGUE.welcome[step]
        setDisplayedText('')
        setTypingComplete(false)
        let index = 0
        const timer = setInterval(() => {
            if (index < message.length) {
                setDisplayedText(message.slice(0, index + 1))
                index++
            } else {
                clearInterval(timer)
                setTypingComplete(true)
            }
        }, 30)
        return () => clearInterval(timer)
    }, [step])

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at center, #1E293B 0%, #0F172A 50%, #020617 100%)' }}>

            {/* Animated backgrounds */}
            <CircuitBackground />
            <FloatingParticles />

            {/* Radial glow behind main content */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.1) 30%, transparent 70%)',
                    filter: 'blur(40px)',
                    animation: 'pulse 4s ease-in-out infinite'
                }}
            />

            <div className="text-center max-w-2xl relative z-10">
                {/* Animated CPU Icon */}
                <div className="relative mb-8">
                    {/* Outer glow rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-cyan-500/30 animate-ping" style={{ animationDuration: '3s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-blue-500/20 animate-ping" style={{ animationDuration: '4s' }} />

                    {/* Main icon container */}
                    <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-3xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(59,130,246,0.2) 50%, rgba(139,92,246,0.3) 100%)',
                            border: '3px solid rgba(6,182,212,0.5)',
                            boxShadow: `
                                0 0 60px rgba(6,182,212,0.4),
                                0 0 100px rgba(59,130,246,0.3),
                                inset 0 0 40px rgba(6,182,212,0.1)
                            `,
                            transform: `scale(${1 + Math.sin(pulseFrame * 0.1) * 0.03})`
                        }}
                    >
                        <span className="text-7xl" style={{
                            filter: 'drop-shadow(0 0 20px rgba(6,182,212,0.8))',
                            animation: 'float 3s ease-in-out infinite'
                        }}>🖥️</span>
                    </div>

                    {/* Orbiting elements */}
                    <div className="absolute top-1/2 left-1/2 w-44 h-44 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '10s' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">⚙️</div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 w-52 h-52 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl">💾</div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-xl">📊</div>
                    </div>
                </div>

                {/* Title with glow */}
                <h1 className="text-5xl md:text-6xl font-black mb-3 animate-in fade-in slide-in-from-bottom duration-700"
                    style={{
                        background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 30px rgba(6,182,212,0.5))'
                    }}
                >
                    INSIDE THE CPU
                </h1>

                <p className="text-gray-400 text-lg mb-2 animate-in fade-in slide-in-from-bottom duration-700 delay-150">
                    An Interactive Journey Through Computer Architecture
                </p>

                {/* Status badges */}
                <div className="flex items-center justify-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        🎮 Interactive
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        📚 Educational
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        ⭐ XP Rewards
                    </span>
                </div>

                {/* System Guide message - positioned in content flow */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-500 flex justify-center">
                    <div className="relative">
                        <div className="flex items-end gap-3">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center border-2 border-cyan-300 shadow-lg shadow-cyan-500/30 animate-pulse">
                                    <span className="text-3xl">🤖</span>
                                </div>
                            </div>
                            <div className="max-w-sm bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/40 shadow-xl relative">
                                <div className="absolute -left-2 bottom-4 w-4 h-4 bg-slate-800 border-l border-b border-cyan-500/40 rotate-45" />
                                <p className="text-cyan-100 text-sm font-medium min-h-[40px]">
                                    {displayedText}
                                    {!typingComplete && <span className="animate-pulse">|</span>}
                                </p>
                                <p className="text-cyan-400 text-xs mt-1 font-bold">— SYS GUIDE</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="mt-24 flex justify-center gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-700">
                    {step < DIALOGUE.welcome.length - 1 ? (
                        <button
                            onClick={() => { setStep(s => s + 1); setTypingComplete(false); playSound('click') }}
                            disabled={!typingComplete}
                            className={`group relative px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 overflow-hidden
                                ${typingComplete
                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]'
                                    : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600'
                                }`}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Continue <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            {typingComplete && <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />}
                        </button>
                    ) : (
                        <button
                            onClick={() => { playSound('success'); onStart() }}
                            disabled={!typingComplete}
                            className={`group relative px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 overflow-hidden
                                ${typingComplete
                                    ? 'text-white hover:scale-105'
                                    : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600'
                                }`}
                            style={typingComplete ? {
                                background: 'linear-gradient(135deg, #06B6D4, #3B82F6, #8B5CF6)',
                                boxShadow: '0 0 50px rgba(6,182,212,0.5), 0 0 100px rgba(59,130,246,0.3)',
                                animation: 'pulse 2s ease-in-out infinite'
                            } : {}}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                🚀 START ADVENTURE
                            </span>
                            {typingComplete && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />}
                        </button>
                    )}
                </div>

                {/* Progress dots */}
                <div className="flex gap-3 justify-center mt-8 animate-in fade-in duration-1000 delay-1000">
                    {DIALOGUE.welcome.map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${i <= step
                                ? 'bg-cyan-500 shadow-[0_0_10px_#06B6D4]'
                                : 'bg-gray-600/50 border border-gray-500'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Custom animation styles */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    )
}

// ===========================================
// TUTORIAL SCREEN
// ===========================================
function TutorialScreen({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0)
    const [clickCount, setClickCount] = useState(0)
    const [showGuide, setShowGuide] = useState(true)
    const [guideMessage, setGuideMessage] = useState(DIALOGUE.tutorial.step1)

    const handleTutorialClick = () => {
        playSound('success')
        setClickCount(c => c + 1)

        if (step === 0) {
            setGuideMessage(DIALOGUE.tutorial.step2)
            setTimeout(() => setStep(1), 1500)
        } else if (step === 1) {
            setGuideMessage(DIALOGUE.tutorial.step3)
            setTimeout(() => setStep(2), 1500)
        } else if (step === 2) {
            setGuideMessage(DIALOGUE.tutorial.complete)
            setTimeout(() => setStep(3), 1500)
        }
    }

    return (
        <div className="flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            {/* Tutorial content */}
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center mb-8">
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Tutorial Step {step + 1} of 4</p>
                    <h2 className="text-3xl font-bold text-cyan-400">Learn the Controls</h2>
                </div>

                {/* Tutorial interactive area */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {step < 3 && (
                        <>
                            <DirectionalArrow targetX={75} targetY={60} visible={true} />
                            <button
                                onClick={handleTutorialClick}
                                className="w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex flex-col items-center justify-center border-4 border-cyan-300 shadow-lg shadow-cyan-500/50 hover:scale-110 transition-all animate-pulse"
                            >
                                <MousePointer className="w-10 h-10 text-white mb-2" />
                                <span className="text-white font-bold">CLICK ME</span>
                            </button>
                        </>
                    )}
                    {step === 3 && (
                        <button
                            onClick={() => { playSound('complete'); onComplete() }}
                            className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 transition-all animate-pulse"
                        >
                            ✅ CONTINUE TO MISSION
                        </button>
                    )}
                </div>

                {/* Click counter */}
                <div className="mt-8 flex items-center gap-2 text-gray-400">
                    <span>Clicks:</span>
                    <span className="text-cyan-400 font-bold text-xl">{clickCount}</span>
                </div>

                {/* Progress dots */}
                <div className="flex gap-2 mt-8">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-3 h-3 rounded-full transition-all ${i <= step ? 'bg-cyan-500' : 'bg-gray-600'}`} />
                    ))}
                </div>
            </div>

            <SystemGuide message={guideMessage} visible={showGuide} />
        </div>
    )
}

// ===========================================
// STAGE COMPONENTS CONFIG
// ===========================================
const CPU_COMPONENTS = [
    { id: 'control-unit', name: 'Control Unit', icon: '⚙️', stageUnlock: 'CONTROL_UNIT', x: 300, y: 80 },
    { id: 'registers', name: 'Registers', icon: '📊', stageUnlock: 'REGISTERS', x: 120, y: 200 },
    { id: 'memory', name: 'Memory', icon: '💾', stageUnlock: 'MEMORY', x: 480, y: 200 },
    { id: 'alu', name: 'ALU', icon: '🔢', stageUnlock: 'ALU', x: 200, y: 340 },
    { id: 'io', name: 'I/O Units', icon: '🔌', stageUnlock: 'IO_SYNC', x: 400, y: 340 }
]

// ===========================================
// MAIN GAME STAGE
// ===========================================
function MainGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [stage, setStage] = useState<GameStage>('INTRO')
    const [activated, setActivated] = useState<string[]>([])
    const [score, setScore] = useState(0)
    const [showXP, setShowXP] = useState(false)
    const [xpAmount, setXpAmount] = useState(0)
    const [showGlitch, setShowGlitch] = useState(false)
    const [glitchMessage, setGlitchMessage] = useState('')
    const [playerState, setPlayerState] = useState<CharacterState>('idle')
    const [playerPos, setPlayerPos] = useState({ x: 30, y: 420 })
    const [guideMessage, setGuideMessage] = useState(DIALOGUE.intro.main)
    const [showGuide, setShowGuide] = useState(true)
    const [currentObjective, setCurrentObjective] = useState<Objective | null>(null)
    const [dataCollected, setDataCollected] = useState(0)
    const [memoryAnswer, setMemoryAnswer] = useState('')
    const [aluAnswer, setAluAnswer] = useState('')
    const [syncPosition, setSyncPosition] = useState(0)
    const [introStep, setIntroStep] = useState(0)
    const [waitingForClick, setWaitingForClick] = useState(false)
    const [showLearningPanel, setShowLearningPanel] = useState(false)

    // NEW: Combo and accuracy tracking
    const [combo, setCombo] = useState(0)
    const [maxCombo, setMaxCombo] = useState(0)
    const [totalActions, setTotalActions] = useState(0)
    const [correctActions, setCorrectActions] = useState(0)
    const accuracy = totalActions > 0 ? Math.round((correctActions / totalActions) * 100) : 100

    // Get current stage index for progress display
    const stageIndex = STAGES.findIndex(s => s.id === stage)

    // Check if component should be target or locked
    const getComponentState = (componentId: string) => {
        const comp = CPU_COMPONENTS.find(c => c.id === componentId)
        if (!comp) return { isActive: false, isTarget: false, isLocked: true }
        const isActive = activated.includes(componentId)
        const isTarget = comp.stageUnlock === stage && !isActive
        const isLocked = !isActive && comp.stageUnlock !== stage
        return { isActive, isTarget, isLocked }
    }

    // Award XP with combo bonus
    const awardXP = (baseAmount: number) => {
        const newCombo = combo + 1
        setCombo(newCombo)
        setMaxCombo(prev => Math.max(prev, newCombo))
        setCorrectActions(prev => prev + 1)
        setTotalActions(prev => prev + 1)

        const comboBonus = Math.min((newCombo - 1) * 5, 25)
        const totalXP = baseAmount + comboBonus

        setXpAmount(totalXP)
        setShowXP(true)
        setScore(s => s + totalXP)
        setTimeout(() => setShowXP(false), 1500)
    }

    // Track errors
    const trackError = (message: string) => {
        setCombo(0)
        setTotalActions(prev => prev + 1)
        setGlitchMessage(message)
        setShowGlitch(true)
        playSound('error')
        setTimeout(() => setShowGlitch(false), 1500)
    }

    // Handle intro progression
    const handleIntroNext = useCallback(() => {
        if (introStep === 0) {
            setGuideMessage(DIALOGUE.intro.explain)
            setIntroStep(1)
            setWaitingForClick(true)
        } else if (introStep === 1) {
            setStage('CONTROL_UNIT')
            setGuideMessage(DIALOGUE.controlUnit.before)
            setCurrentObjective({ id: 'cu', title: 'Activate Control Unit', description: 'Click the Control Unit to start', completed: false })
            setWaitingForClick(false)
        }
    }, [introStep])

    // Handle component click
    const handleComponentClick = (componentId: string) => {
        const { isTarget } = getComponentState(componentId)
        if (!isTarget) {
            playSound('error')
            setShowGlitch(true)
            setTimeout(() => setShowGlitch(false), 500)
            return
        }

        playSound('success')
        setPlayerState('success')

        if (stage === 'CONTROL_UNIT') {
            setActivated(prev => [...prev, componentId])
            awardXP(25)
            setGuideMessage(DIALOGUE.controlUnit.after)
            setWaitingForClick(true)
            setTimeout(() => {
                setPlayerState('idle')
                // Move to registers stage
                setStage('REGISTERS')
                setGuideMessage(DIALOGUE.registers.before)
                setCurrentObjective({ id: 'reg', title: 'Collect Data Packets', description: 'Click Registers 3 times', completed: false })
                setWaitingForClick(false)
            }, 3000)
        } else if (stage === 'REGISTERS') {
            const newCount = dataCollected + 1
            setDataCollected(newCount)
            awardXP(10)
            setGuideMessage(DIALOGUE.registers.collect(newCount))

            if (newCount >= 3) {
                setActivated(prev => [...prev, componentId])
                setTimeout(() => {
                    setGuideMessage(DIALOGUE.registers.after)
                    setWaitingForClick(true)
                    setTimeout(() => {
                        setStage('MEMORY')
                        setGuideMessage(DIALOGUE.memory.before)
                        setCurrentObjective({ id: 'mem', title: 'Access Memory', description: 'Enter correct address', completed: false })
                        setWaitingForClick(false)
                    }, 3000)
                }, 1500)
            }
            setTimeout(() => setPlayerState('idle'), 500)
        }
    }

    // Memory stage handler
    const handleMemorySubmit = () => {
        if (memoryAnswer.toUpperCase() === '0X4A2B' || memoryAnswer === '4A2B') {
            playSound('success')
            setPlayerState('success')
            setActivated(prev => [...prev, 'memory'])
            awardXP(30)
            setGuideMessage(DIALOGUE.memory.after)
            setTimeout(() => {
                setPlayerState('idle')
                setStage('ALU')
                setGuideMessage(DIALOGUE.alu.before)
                setCurrentObjective({ id: 'alu', title: 'Calculate Result', description: 'Solve: 42 + 17 = ?', completed: false })
            }, 3000)
        } else {
            playSound('error')
            setShowGlitch(true)
            setGuideMessage(DIALOGUE.memory.wrong)
            setTimeout(() => setShowGlitch(false), 500)
        }
    }

    // ALU stage handler
    const handleALUSubmit = () => {
        if (aluAnswer === '59') {
            playSound('success')
            setPlayerState('success')
            setActivated(prev => [...prev, 'alu'])
            awardXP(30)
            setGuideMessage(DIALOGUE.alu.after)
            setTimeout(() => {
                setPlayerState('idle')
                setStage('IO_SYNC')
                setGuideMessage(DIALOGUE.io.before)
                setCurrentObjective({ id: 'io', title: 'Sync I/O', description: 'Click in the green zone', completed: false })
            }, 3000)
        } else {
            playSound('error')
            setShowGlitch(true)
            setGuideMessage(DIALOGUE.alu.wrong)
            setTimeout(() => setShowGlitch(false), 500)
        }
    }

    // Sync bar animation for I/O stage - use ref to avoid effect restart
    const syncDirectionRef = useRef(1)
    useEffect(() => {
        if (stage !== 'IO_SYNC') return
        const timer = setInterval(() => {
            setSyncPosition(pos => {
                const newPos = pos + syncDirectionRef.current * 3
                if (newPos >= 100) {
                    syncDirectionRef.current = -1
                    return 100
                }
                if (newPos <= 0) {
                    syncDirectionRef.current = 1
                    return 0
                }
                return newPos
            })
        }, 30)
        return () => clearInterval(timer)
    }, [stage])

    // I/O sync handler
    const handleIOSync = () => {
        // Green zone is 40-60
        if (syncPosition >= 40 && syncPosition <= 60) {
            playSound('complete')
            setPlayerState('success')
            setActivated(prev => [...prev, 'io'])
            awardXP(40)
            setGuideMessage(DIALOGUE.io.after)
            setTimeout(() => {
                setPlayerState('idle')
                setStage('VICTORY')
                setGuideMessage(DIALOGUE.victory)
                setTimeout(() => setShowLearningPanel(true), 1000)
            }, 2000)
        } else {
            playSound('error')
            setShowGlitch(true)
            setGuideMessage(DIALOGUE.io.miss)
            setTimeout(() => setShowGlitch(false), 500)
        }
    }

    // Victory screen
    if (stage === 'VICTORY') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
                <div className="animate-in fade-in zoom-in">
                    <Trophy className="h-24 w-24 mx-auto text-yellow-400 mb-6 animate-bounce" />
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 mb-4">
                        CPU RESTORED!
                    </h1>
                    <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
                        {DIALOGUE.victory}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-4xl font-bold text-yellow-400 mb-8 animate-pulse">
                        <Star className="h-10 w-10 fill-current" />
                        <span>{score} XP</span>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => onComplete(score)}
                            className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 transition-all"
                        >
                            🎉 Complete
                        </button>
                    </div>
                </div>
                <LearningProgressPanel
                    activityType="game"
                    topic="CPU Architecture"
                    performance={{ score: score, errors: totalActions - correctActions }}
                    isOpen={showLearningPanel}
                    onClose={() => setShowLearningPanel(false)}
                />
            </div>
        )
    }

    return (
        <div className="flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            {/* SCOREBOARD - Top Right */}
            <div className="absolute top-4 right-4 z-40 flex items-center gap-3">
                {/* Combo */}
                {combo > 0 && (
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm"
                        style={{
                            backgroundColor: combo >= 3 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                            borderColor: combo >= 3 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)',
                            boxShadow: combo >= 3 ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none'
                        }}
                    >
                        <Flame className="h-5 w-5" style={{ color: combo >= 3 ? '#EF4444' : '#22C55E' }} />
                        <span className="font-bold text-lg" style={{ color: combo >= 3 ? '#EF4444' : '#22C55E' }}>{combo}x</span>
                    </div>
                )}

                {/* Accuracy */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-purple-500/40 backdrop-blur-sm">
                    <Crosshair className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-400 font-medium">{accuracy}%</span>
                </div>

                {/* XP Score */}
                <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm transition-all ${showXP ? 'scale-110' : ''}`}
                    style={{
                        backgroundColor: 'rgba(234, 179, 8, 0.2)',
                        borderColor: 'rgba(234, 179, 8, 0.5)',
                        boxShadow: showXP ? '0 0 25px rgba(234, 179, 8, 0.5)' : 'none'
                    }}
                >
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-lg">{score}</span>
                    <span className="text-yellow-400/60 text-xs">XP</span>
                </div>
            </div>

            {/* Objective Display */}
            <ObjectiveDisplay objective={currentObjective} stageProgress={stageIndex} />

            {/* CPU Components */}
            {CPU_COMPONENTS.map(comp => {
                const state = getComponentState(comp.id)
                return (
                    <CPUComponent
                        key={comp.id}
                        id={comp.id}
                        name={comp.name}
                        icon={comp.icon}
                        x={comp.x}
                        y={comp.y}
                        isActive={state.isActive}
                        isTarget={state.isTarget}
                        isLocked={state.isLocked}
                        onClick={() => handleComponentClick(comp.id)}
                        disabled={stage === 'INTRO' || stage === 'MEMORY' || stage === 'ALU' || stage === 'IO_SYNC'}
                    />
                )
            })}

            {/* Directional arrow for targets */}
            {(stage === 'CONTROL_UNIT' || (stage === 'REGISTERS' && dataCollected < 3)) && (
                <DirectionalArrow
                    targetX={CPU_COMPONENTS.find(c => c.stageUnlock === stage)?.x || 0}
                    targetY={CPU_COMPONENTS.find(c => c.stageUnlock === stage)?.y || 0}
                    visible={true}
                />
            )}

            {/* Memory input panel */}
            {stage === 'MEMORY' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-slate-900/95 rounded-2xl p-8 border border-cyan-500/40 shadow-2xl">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">Memory Access</h3>
                    <p className="text-gray-300 mb-4">Enter memory address: <span className="text-cyan-400 font-mono">0x4A2B</span></p>
                    <input
                        type="text"
                        value={memoryAnswer}
                        onChange={e => setMemoryAnswer(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-cyan-100 font-mono text-lg mb-4 focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                        onClick={handleMemorySubmit}
                        className="w-full py-3 rounded-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all"
                    >
                        Access Memory
                    </button>
                </div>
            )}

            {/* ALU input panel */}
            {stage === 'ALU' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-slate-900/95 rounded-2xl p-8 border border-orange-500/40 shadow-2xl">
                    <h3 className="text-xl font-bold text-orange-400 mb-4">ALU Calculation</h3>
                    <p className="text-gray-300 mb-4 text-2xl font-mono">42 + 17 = <span className="text-orange-400">?</span></p>
                    <input
                        type="text"
                        value={aluAnswer}
                        onChange={e => setAluAnswer(e.target.value)}
                        placeholder="Enter result"
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-orange-100 font-mono text-lg mb-4 focus:border-orange-500 focus:outline-none"
                    />
                    <button
                        onClick={handleALUSubmit}
                        className="w-full py-3 rounded-lg font-bold bg-orange-600 hover:bg-orange-500 text-white transition-all"
                    >
                        Calculate
                    </button>
                </div>
            )}

            {/* I/O Sync panel */}
            {stage === 'IO_SYNC' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-slate-900/95 rounded-2xl p-8 border border-purple-500/40 shadow-2xl">
                    <h3 className="text-xl font-bold text-purple-400 mb-4">I/O Synchronization</h3>
                    <p className="text-gray-300 mb-4">Click when the indicator is in the <span className="text-green-400">green zone</span>!</p>
                    {/* Sync bar */}
                    <div className="relative w-64 h-10 bg-slate-700 rounded-lg overflow-hidden mb-4">
                        {/* Green zone */}
                        <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-green-500/50" />
                        {/* Indicator */}
                        <div
                            className="absolute top-0 bottom-0 w-2 bg-white rounded shadow-lg"
                            style={{ left: `${syncPosition}%`, transition: 'none' }}
                        />
                    </div>
                    <button
                        onClick={handleIOSync}
                        className="w-full py-3 rounded-lg font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all"
                    >
                        SYNC NOW
                    </button>
                </div>
            )}

            {/* Intro continue button */}
            {stage === 'INTRO' && (
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50">
                    <button
                        onClick={handleIntroNext}
                        className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105 transition-all animate-pulse"
                    >
                        {introStep === 0 ? 'Understand ▶' : 'Begin Repair ▶'}
                    </button>
                </div>
            )}

            {/* Player Character */}
            <PlayerCharacter x={playerPos.x} y={playerPos.y} state={playerState} />

            {/* System Guide */}
            <SystemGuide message={guideMessage} visible={showGuide} />

            {/* Glitch Entity */}
            <GlitchEntity visible={showGlitch} message={glitchMessage} />

            {/* XP Popup */}
            <XPPopup amount={xpAmount} visible={showXP} />

            {/* HUD */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-40">
                <div className="px-4 py-2 rounded-lg bg-slate-800/80 border border-slate-600 text-white">
                    Stage: <span className="text-cyan-400 font-bold">{STAGES.find(s => s.id === stage)?.name || stage}</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-slate-800/80 border border-slate-600 flex items-center gap-2 text-white">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">{score} XP</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-40">
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${(activated.length / 5) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Components: {activated.length}/5</span>
                    <span>{Math.round((activated.length / 5) * 100)}% Complete</span>
                </div>
            </div>
        </div>
    )
}

// ===========================================
// MAIN GAME MODE COMPONENT
// ===========================================
export function GameMode({ onExit }: { onExit: () => void }) {
    const [gamePhase, setGamePhase] = useState<'WELCOME' | 'TUTORIAL' | 'PLAYING' | 'COMPLETE'>('WELCOME')
    const [finalScore, setFinalScore] = useState(0)
    const [sound, setSound] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleComplete = (score: number) => {
        setFinalScore(score)
        setGamePhase('COMPLETE')
    }

    if (!mounted) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center">
                <div className="text-cyan-400 text-xl animate-pulse">Loading Game...</div>
            </div>
        )
    }

    const renderContent = () => {
        switch (gamePhase) {
            case 'WELCOME':
                return <WelcomeScreen onStart={() => setGamePhase('TUTORIAL')} />
            case 'TUTORIAL':
                return <TutorialScreen onComplete={() => setGamePhase('PLAYING')} />
            case 'PLAYING':
                return <MainGame onComplete={handleComplete} />
            case 'COMPLETE':
                return (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
                        <Trophy className="h-32 w-32 text-yellow-400 mb-8 animate-bounce" />
                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
                            MISSION COMPLETE!
                        </h1>
                        <p className="text-gray-300 text-xl mb-8">You've mastered the CPU boot sequence!</p>
                        <div className="text-4xl font-bold text-yellow-400 mb-8 flex items-center gap-3">
                            <Star className="h-10 w-10 fill-current" />
                            {finalScore} XP Earned
                        </div>
                        <button
                            onClick={onExit}
                            className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 transition-all"
                        >
                            Exit Game
                        </button>
                    </div>
                )
            default:
                return <WelcomeScreen onStart={() => setGamePhase('TUTORIAL')} />
        }
    }

    return (
        <div
            className="absolute inset-0 z-10 flex flex-col text-white overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <span className="text-2xl animate-bounce">🖥️</span>
                    <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        INSIDE THE CPU
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setSound(!sound)} className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                        {sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-gray-500" />}
                    </button>
                    <button onClick={onExit} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center gap-2 transition-all hover:scale-105">
                        <X className="h-4 w-4" />Exit Game
                    </button>
                </div>
            </div>

            {/* Content */}
            {renderContent()}
        </div>
    )
}
