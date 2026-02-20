"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    AlertTriangle, RotateCcw, Play, Pause, Wrench,
    Trophy, XCircle, Shield, Zap, Clock, Bot, Lightbulb, X
} from "lucide-react"

interface InstructionCycleProps {
    color?: string
    onGameComplete?: () => void
}

// Sound effects
const playSound = (type: 'success' | 'error' | 'tick' | 'alarm' | 'ai') => {
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
            case 'tick':
                osc.frequency.value = 500
                gain.gain.value = 0.03
                osc.start()
                setTimeout(() => osc.stop(), 30)
                break
            case 'alarm':
                osc.frequency.value = 440
                osc.type = 'square'
                gain.gain.value = 0.1
                osc.start()
                setTimeout(() => { osc.frequency.value = 330 }, 200)
                setTimeout(() => { osc.frequency.value = 440 }, 400)
                setTimeout(() => osc.stop(), 600)
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
    welcome: "Monitoring system ready. Pipeline observation commencing.",
    running: "Pipeline executing normally. Watch for anomalies.",
    failure: "ALERT: Pipeline disruption detected. Diagnose immediately.",
    diagnosing: "Diagnosis mode active. Identify and deploy the correct fix.",
    correct: "Fix deployed successfully. Pipeline stabilized.",
    wrong: "Incorrect fix. System further destabilized.",
    timeout: "Diagnosis timeout. System unrecoverable.",
    complete: "Mission complete. All cycles debugged. Excellent work, Engineer.",
    crashed: "Critical failure. Too many incorrect interventions.",
    hint_fetch: "The issue relates to instruction retrieval. Check memory addressing.",
    hint_decode: "The problem is in instruction interpretation. Examine opcode handling.",
    hint_execute: "Computation error detected. Verify ALU operations.",
    hint_memory: "Data access issue identified. Check memory permissions.",
    hint_writeback: "Result storage failure. Examine register write path."
}

interface CycleStage {
    id: string
    name: string
    shortName: string
    description: string
    failureCause: string
    fixDescription: string
    hintKey: keyof typeof AI_MESSAGES
}

const CYCLE_STAGES: CycleStage[] = [
    { id: "fetch", name: "Fetch", shortName: "FE", description: "Retrieve instruction", failureCause: "Memory address corruption", fixDescription: "Reset memory address register", hintKey: "hint_fetch" },
    { id: "decode", name: "Decode", shortName: "DE", description: "Interpret opcode", failureCause: "Invalid opcode encountered", fixDescription: "Flush instruction register", hintKey: "hint_decode" },
    { id: "execute", name: "Execute", shortName: "EX", description: "Perform operation", failureCause: "ALU overflow exception", fixDescription: "Clear ALU flags", hintKey: "hint_execute" },
    { id: "memory", name: "Memory", shortName: "MEM", description: "Access data memory", failureCause: "Memory access violation", fixDescription: "Restore memory permissions", hintKey: "hint_memory" },
    { id: "writeback", name: "WriteBack", shortName: "WB", description: "Store result", failureCause: "Register write conflict", fixDescription: "Clear write buffer", hintKey: "hint_writeback" }
]

type GameState = 'idle' | 'running' | 'paused' | 'failed' | 'diagnosing' | 'success'

export function InstructionCycleSim({ color = "#38BDF8", onGameComplete }: InstructionCycleProps) {
    const [gameState, setGameState] = useState<GameState>('idle')
    const [currentStage, setCurrentStage] = useState(0)
    const [failureStage, setFailureStage] = useState<number | null>(null)
    const [selectedFix, setSelectedFix] = useState<string | null>(null)
    const [cyclesCompleted, setCyclesCompleted] = useState(0)
    const [wrongFixes, setWrongFixes] = useState(0)
    const [timeRemaining, setTimeRemaining] = useState(30)
    const [score, setScore] = useState(0)
    const [glitchEffect, setGlitchEffect] = useState(false)

    // Character states
    const [aiMessage, setAiMessage] = useState<string>(AI_MESSAGES.welcome)
    const [aiVisible, setAiVisible] = useState(true)
    const [showMentor, setShowMentor] = useState(false)
    const [mentorHint, setMentorHint] = useState<string | null>(null)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const updateAI = (message: string, sound = true) => {
        setAiMessage(message)
        if (sound) playSound('ai')
    }

    const triggerGlitch = () => {
        setGlitchEffect(true)
        setTimeout(() => setGlitchEffect(false), 400)
    }

    // Cycle animation
    useEffect(() => {
        if (gameState === 'running' && failureStage === null) {
            intervalRef.current = setInterval(() => {
                setCurrentStage(prev => {
                    const next = (prev + 1) % CYCLE_STAGES.length
                    playSound('tick')

                    if (next === 0) {
                        setCyclesCompleted(c => c + 1)
                        if (cyclesCompleted >= 1 && Math.random() < 0.4) {
                            const failAt = Math.floor(Math.random() * CYCLE_STAGES.length)
                            setTimeout(() => injectFailure(failAt), 500)
                        }
                    }
                    return next
                })
            }, 600)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [gameState, failureStage, cyclesCompleted])

    // Countdown timer
    useEffect(() => {
        if (gameState === 'diagnosing') {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleTimeout()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [gameState])

    // Show mentor after wrong fixes
    useEffect(() => {
        if (wrongFixes >= 1 && !showMentor && gameState === 'diagnosing') {
            setShowMentor(true)
        }
    }, [wrongFixes, showMentor, gameState])

    const injectFailure = (stageIndex: number) => {
        setFailureStage(stageIndex)
        setCurrentStage(stageIndex)
        setGameState('failed')
        updateAI(AI_MESSAGES.failure)
        playSound('alarm')
        triggerGlitch()
    }

    const handleTimeout = () => {
        playSound('error')
        updateAI(AI_MESSAGES.timeout)
        setGameState('failed')
        setFailureStage(null)
    }

    const handleStart = () => {
        setGameState('running')
        updateAI(AI_MESSAGES.running)
        setCurrentStage(0)
        setFailureStage(null)
        setCyclesCompleted(0)
        setWrongFixes(0)
        setScore(0)
        setTimeRemaining(30)
        setShowMentor(false)
        setMentorHint(null)
    }

    const handlePause = () => {
        if (gameState === 'running') {
            setGameState('paused')
        } else if (gameState === 'paused') {
            setGameState('running')
        }
    }

    const handleDiagnose = () => {
        if (gameState === 'failed' && failureStage !== null) {
            setGameState('diagnosing')
            updateAI(AI_MESSAGES.diagnosing)
            setTimeRemaining(15)
            setSelectedFix(null)
        }
    }

    const handleApplyFix = (stageId: string) => {
        if (gameState !== 'diagnosing' || failureStage === null) return

        setSelectedFix(stageId)
        const correctStage = CYCLE_STAGES[failureStage]

        setTimeout(() => {
            if (stageId === correctStage.id) {
                playSound('success')
                updateAI(AI_MESSAGES.correct)
                setScore(prev => prev + Math.max(10, timeRemaining * 2))
                setFailureStage(null)
                setShowMentor(false)
                setMentorHint(null)
                setGameState('running')

                if (cyclesCompleted >= 4) {
                    setTimeout(() => {
                        setGameState('success')
                        updateAI(AI_MESSAGES.complete)
                        onGameComplete?.()
                    }, 1000)
                }
            } else {
                playSound('error')
                triggerGlitch()
                updateAI(AI_MESSAGES.wrong)
                setWrongFixes(prev => prev + 1)
                setScore(prev => Math.max(0, prev - 10))
                setSelectedFix(null)

                if (wrongFixes >= 2) {
                    updateAI(AI_MESSAGES.crashed)
                    setGameState('failed')
                    setFailureStage(null)
                }
            }
        }, 300)
    }

    const handleRequestHint = () => {
        if (failureStage !== null) {
            setMentorHint(AI_MESSAGES[CYCLE_STAGES[failureStage].hintKey])
        }
    }

    const handleRestart = () => {
        setGameState('idle')
        setCurrentStage(0)
        setFailureStage(null)
        setCyclesCompleted(0)
        setWrongFixes(0)
        setScore(0)
        setTimeRemaining(30)
        setSelectedFix(null)
        setGlitchEffect(false)
        updateAI(AI_MESSAGES.welcome)
        setShowMentor(false)
        setMentorHint(null)
    }

    return (
        <div className="relative">
            <Card
                className="border-2 overflow-hidden transition-all"
                style={{
                    borderColor: glitchEffect ? '#EF4444' : `${color}30`,
                    boxShadow: glitchEffect ? '0 0 30px rgba(239,68,68,0.3)' : 'none',
                    filter: glitchEffect ? 'hue-rotate(20deg)' : 'none'
                }}
            >
                {/* Glitch Overlay */}
                {glitchEffect && (
                    <div className="absolute inset-0 z-50 pointer-events-none">
                        <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                    </div>
                )}

                {/* Header */}
                <CardHeader className="pb-3" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="h-4 w-4 text-purple-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Mission 2</span>
                            </div>
                            <h2 className="text-xl font-bold text-white">Instruction Cycle Debug</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleRestart} className="text-gray-400 hover:text-white">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>

                    {gameState !== 'idle' && (
                        <div className="flex items-center justify-between mt-4 text-xs">
                            <div className="flex gap-4">
                                <span className="text-gray-500">Cycles: <span className="text-white">{cyclesCompleted}</span>/5</span>
                                <span className="text-gray-500">Score: <span className="text-purple-400">{score}</span></span>
                            </div>
                            {gameState === 'diagnosing' && (
                                <div className="flex items-center gap-1 text-amber-400 animate-pulse">
                                    <Clock className="h-3 w-3" />
                                    <span className="font-mono">{timeRemaining}s</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardHeader>

                <CardContent className="space-y-4 pt-4 bg-slate-950">
                    {/* IDLE */}
                    {gameState === 'idle' && (
                        <div className="text-center py-10">
                            <Zap className="h-16 w-16 mx-auto text-purple-500 mb-4" />
                            <h3 className="text-lg font-bold text-gray-300 mb-2">Pipeline Monitoring</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                Watch the instruction cycle. When failures occur, diagnose and deploy fixes.
                            </p>
                            <Button onClick={handleStart} size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700">
                                <Play className="h-5 w-5" />
                                Start Monitoring
                            </Button>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {gameState === 'success' && (
                        <div className="text-center py-10">
                            <Trophy className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
                            <h3 className="text-xl font-bold text-green-400 mb-2">MISSION COMPLETE</h3>
                            <p className="text-2xl font-bold text-purple-400 mb-6">Score: {score}</p>
                            <Button onClick={handleRestart} className="gap-2 bg-green-600 hover:bg-green-700">
                                <RotateCcw className="h-4 w-4" />
                                Replay
                            </Button>
                        </div>
                    )}

                    {/* FAILED (Game Over) */}
                    {gameState === 'failed' && failureStage === null && (
                        <div className="text-center py-10">
                            <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                            <h3 className="text-xl font-bold text-red-400 mb-2">SYSTEM CRASH</h3>
                            <p className="text-sm text-gray-400 mb-6">Pipeline unrecoverable.</p>
                            <Button onClick={handleRestart} className="gap-2 bg-red-600 hover:bg-red-700">
                                <RotateCcw className="h-4 w-4" />
                                Restart
                            </Button>
                        </div>
                    )}

                    {/* Active States */}
                    {(gameState === 'running' || gameState === 'paused' || (gameState === 'failed' && failureStage !== null) || gameState === 'diagnosing') && (
                        <>
                            {/* Failure Alert */}
                            {(gameState === 'failed' || gameState === 'diagnosing') && failureStage !== null && (
                                <div className="p-4 rounded-lg bg-red-950/80 border border-red-500/50">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
                                        <div>
                                            <p className="text-sm font-bold text-red-300">
                                                FAILURE: {CYCLE_STAGES[failureStage].name} Stage
                                            </p>
                                            <p className="text-xs text-red-400/80">{CYCLE_STAGES[failureStage].failureCause}</p>
                                        </div>
                                    </div>
                                    {gameState === 'failed' && (
                                        <Button onClick={handleDiagnose} size="sm" className="mt-3 gap-2 bg-amber-600 hover:bg-amber-700">
                                            <Wrench className="h-4 w-4" />
                                            Diagnose & Fix
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Pipeline */}
                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Pipeline</h4>
                                    {gameState === 'running' && (
                                        <Button onClick={handlePause} size="sm" variant="ghost" className="h-7 text-gray-400">
                                            <Pause className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {gameState === 'paused' && (
                                        <Button onClick={handlePause} size="sm" variant="ghost" className="h-7 text-gray-400">
                                            <Play className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    {CYCLE_STAGES.map((stage, i) => {
                                        const isActive = currentStage === i
                                        const isFailed = failureStage === i
                                        return (
                                            <div key={stage.id} className="flex-1">
                                                <div
                                                    className={`p-3 rounded-lg text-center transition-all ${isFailed ? 'animate-pulse' : ''}`}
                                                    style={{
                                                        backgroundColor: isFailed ? 'rgba(239,68,68,0.2)' : isActive ? 'rgba(139,92,246,0.2)' : 'rgba(30,41,59,0.5)',
                                                        border: `2px solid ${isFailed ? '#EF4444' : isActive ? '#8B5CF6' : 'rgba(71,85,105,0.4)'}`,
                                                        boxShadow: isActive || isFailed ? `0 0 15px ${isFailed ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.3)'}` : 'none'
                                                    }}
                                                >
                                                    <span className={`text-sm font-bold ${isFailed ? 'text-red-400' : isActive ? 'text-purple-400' : 'text-gray-500'}`}>
                                                        {stage.shortName}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 text-center mt-1 truncate">{stage.name}</p>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${((currentStage + 1) / CYCLE_STAGES.length) * 100}%`,
                                            backgroundColor: failureStage !== null ? '#EF4444' : '#8B5CF6'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Fix Selection */}
                            {gameState === 'diagnosing' && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                                        Deploy Fix
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {CYCLE_STAGES.map(stage => (
                                            <button
                                                key={stage.id}
                                                onClick={() => handleApplyFix(stage.id)}
                                                disabled={selectedFix !== null}
                                                className={`p-3 rounded-lg text-left transition-all ${selectedFix === stage.id ? 'opacity-50' : 'hover:scale-[1.01]'}`}
                                                style={{
                                                    backgroundColor: 'rgba(30,41,59,0.6)',
                                                    border: '1px solid rgba(71,85,105,0.4)'
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Wrench className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-300">{stage.fixDescription}</p>
                                                        <p className="text-xs text-gray-500">Target: {stage.name}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* SYSTEM AI */}
            {aiVisible && gameState !== 'idle' && (
                <div className="fixed bottom-4 right-4 max-w-xs z-50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-slate-900/95 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm shadow-2xl"
                        style={{ boxShadow: '0 0 30px rgba(139,92,246,0.15)' }}>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/40">
                                <Bot className="h-5 w-5 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">System AI</span>
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

            {/* ENGINEER MENTOR */}
            {showMentor && gameState === 'diagnosing' && (
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
                                        <p className="text-xs text-gray-400 mb-2">Need guidance?</p>
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
        </div>
    )
}
