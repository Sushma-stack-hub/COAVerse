"use client"

import { useState, useEffect, Suspense } from "react"
import dynamic from "next/dynamic"
import { GameProvider, useGame, useGameActions, GameAct } from "./engine/GameState"
import { audioController } from "./engine/AudioController"
import { GameHUD, PauseMenu } from "./ui/GameHUD"
import { DialogueBox, ActTransition } from "./ui/DialogueBox"
import { GlitchOverlay } from "./characters/GlitchEntity"
import { CharacterAvatar, FailureFeedback, SuccessFeedback, HintBubble } from "./ui/GameCharacters"
import { ComboCounter } from "./ui/GameProgression"
import { LiveScoreboard, MissionObjective, GameProgressMap, FailureOverlay, SuccessOverlay } from "./ui/GameplayOverlay"
import { X, Play, Trophy, Star, Bot, User, Skull, Zap, Target, Crosshair } from "lucide-react"

// Dynamic imports for 3D components - prevents SSR hydration issues
const Act1Scene = dynamic(
    () => import("./acts/Act1_SystemCollapse").then(mod => ({ default: mod.Act1_SystemCollapse })),
    { ssr: false, loading: () => <SceneLoader actName="System Collapse" /> }
)

const Act2Scene = dynamic(
    () => import("./acts/Act2_ControlUnit").then(mod => ({ default: mod.Act2_ControlUnit })),
    { ssr: false, loading: () => <SceneLoader actName="Control Unit Awakening" /> }
)

const Act3Scene = dynamic(
    () => import("./acts/Act3_ControlTiming").then(mod => ({ default: mod.Act3_ControlTiming })),
    { ssr: false, loading: () => <SceneLoader actName="Control & Timing" /> }
)

const Act4Scene = dynamic(
    () => import("./acts/Act4_MemoryHierarchy").then(mod => ({ default: mod.Act4_MemoryHierarchy })),
    { ssr: false, loading: () => <SceneLoader actName="Memory Hierarchy" /> }
)

const Act5Scene = dynamic(
    () => import("./acts/Act5_SystemIntegration").then(mod => ({ default: mod.Act5_SystemIntegration })),
    { ssr: false, loading: () => <SceneLoader actName="System Integration" /> }
)

// Scene loader component
function SceneLoader({ actName }: { actName: string }) {
    const [dots, setDots] = useState('')

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.')
        }, 400)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-cyan-400 text-xl font-medium">Loading{dots}</p>
                <p className="text-gray-500 text-sm mt-2">{actName}</p>
            </div>
        </div>
    )
}

// Loading screen
function LoadingScreen() {
    const [dots, setDots] = useState('')

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.')
        }, 500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-cyan-500/20 flex items-center justify-center animate-pulse">
                    <span className="text-4xl">🖥️</span>
                </div>
                <p className="text-cyan-400 text-xl">Loading{dots}</p>
                <p className="text-gray-500 text-sm mt-2">Initializing CPU World</p>
            </div>
        </div>
    )
}

// Intro/Title screen with Characters
function IntroScreen({ onStart }: { onStart: () => void }) {
    const [showStart, setShowStart] = useState(false)
    const [showCharacters, setShowCharacters] = useState(false)

    useEffect(() => {
        const charTimer = setTimeout(() => setShowCharacters(true), 600)
        const startTimer = setTimeout(() => setShowStart(true), 1200)
        return () => {
            clearTimeout(charTimer)
            clearTimeout(startTimer)
        }
    }, [])

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            {/* Background animation */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            <div className="relative z-10 text-center max-w-2xl px-8">
                {/* Logo */}
                <div className="mb-6">
                    <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 flex items-center justify-center border border-cyan-500/40 mb-4">
                        <span className="text-6xl">⚡</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-2">
                        INSIDE THE
                    </h1>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500">
                        DIGITAL ENGINE
                    </h1>
                </div>

                {/* Subtitle */}
                <p className="text-gray-400 text-base mb-2">A Mission-Based Educational Adventure</p>
                <p className="text-gray-500 text-sm mb-8">Explore the CPU • Complete Missions • Master Architecture</p>

                {/* Characters Introduction */}
                {showCharacters && (
                    <div className="flex items-center justify-center gap-8 mb-8 animate-fadeIn">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 flex items-center justify-center border border-cyan-500/40 mb-2">
                                <Bot className="h-8 w-8 text-cyan-400" />
                            </div>
                            <p className="text-cyan-400 font-bold text-sm">SYS</p>
                            <p className="text-gray-500 text-xs">Your Guide</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-600/30 flex items-center justify-center border border-purple-500/40 mb-2">
                                <User className="h-8 w-8 text-purple-400" />
                            </div>
                            <p className="text-purple-400 font-bold text-sm">YOU</p>
                            <p className="text-gray-500 text-xs">Engineer</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-red-500/30 to-orange-600/30 flex items-center justify-center border border-red-500/40 mb-2">
                                <Skull className="h-8 w-8 text-red-400" />
                            </div>
                            <p className="text-red-400 font-bold text-sm">GLITCH</p>
                            <p className="text-gray-500 text-xs">System Error</p>
                        </div>
                    </div>
                )}

                {/* Start button */}
                {showStart && (
                    <button
                        onClick={() => {
                            audioController.playSound('powerup')
                            onStart()
                        }}
                        className="group relative px-10 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all hover:scale-105 active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, #06B6D4, #3B82F6, #8B5CF6)',
                            boxShadow: '0 0 40px rgba(6,182,212,0.4)'
                        }}
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Play className="h-5 w-5" />
                            START MISSION
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                    </button>
                )}

                {/* Features */}
                <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-cyan-500" />
                        <span>5 Missions</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span>Earn XP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Crosshair className="h-4 w-4 text-purple-500" />
                        <span>Track Accuracy</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    )
}

// Victory screen
function VictoryScreen({ xp, onExit }: { xp: number; onExit: () => void }) {
    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-green-900/90 via-slate-900 to-slate-900 flex items-center justify-center">
            <div className="text-center">
                <Trophy className="h-24 w-24 mx-auto text-yellow-400 mb-6 animate-bounce" />
                <h1 className="text-5xl font-black text-green-400 mb-4">MISSION COMPLETE!</h1>
                <p className="text-gray-400 text-lg mb-8">You&apos;ve restored the CPU system!</p>

                <div className="flex items-center justify-center gap-2 text-4xl font-bold text-yellow-400 mb-8 animate-pulse">
                    <Star className="h-10 w-10 fill-current" />
                    <span>{xp} XP</span>
                </div>

                <div className="space-y-4 text-left max-w-md mx-auto mb-8">
                    <div className="px-4 py-3 bg-slate-800/50 rounded-lg">
                        <p className="text-green-400 font-medium">✓ Control Unit Activated</p>
                    </div>
                    <div className="px-4 py-3 bg-slate-800/50 rounded-lg">
                        <p className="text-cyan-400 font-medium">✓ Logic Gates Mastered</p>
                    </div>
                    <div className="px-4 py-3 bg-slate-800/50 rounded-lg">
                        <p className="text-purple-400 font-medium">✓ CPU Architecture Learned</p>
                    </div>
                </div>

                <button
                    onClick={onExit}
                    className="px-8 py-4 rounded-xl font-bold text-lg bg-green-600 hover:bg-green-500 text-white transition-all"
                >
                    Continue Learning
                </button>
            </div>
        </div>
    )
}

// 3D Canvas wrapper
function GameCanvas({ children }: { children: React.ReactNode }) {
    const [canvasReady, setCanvasReady] = useState(false)

    useEffect(() => {
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => setCanvasReady(true), 100)
        return () => clearTimeout(timer)
    }, [])

    if (!canvasReady) {
        return <SceneLoader actName="Preparing 3D Environment" />
    }

    return (
        <div className="fixed inset-0 w-full h-full">
            {children}
        </div>
    )
}

// Main game content
function GameContent({ onExit }: { onExit: () => void }) {
    const { state } = useGame()
    const { startGame, resumeGame, pauseGame, setAct } = useGameActions()
    const [showActTransition, setShowActTransition] = useState(false)
    const [transitionAct, setTransitionAct] = useState({ name: '', number: 0 })

    // Auto-transition from LOADING to INTRO after initialization
    useEffect(() => {
        if (state.currentAct === 'LOADING') {
            const timer = setTimeout(() => {
                setAct('INTRO')
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [state.currentAct, setAct])

    // Handle keyboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (state.isPaused) resumeGame()
                else pauseGame()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [state.isPaused, resumeGame, pauseGame])

    const handleActComplete = (nextAct: GameAct) => {
        const actInfo: Record<string, { name: string; number: number }> = {
            'ACT_1': { name: 'System Collapse', number: 1 },
            'ACT_2': { name: 'Control Unit Awakening', number: 2 },
            'ACT_3': { name: 'Registers & Memory Realm', number: 3 },
            'ACT_4': { name: 'ALU Forge', number: 4 },
            'ACT_5': { name: 'System Boot', number: 5 },
        }

        if (actInfo[nextAct]) {
            setTransitionAct(actInfo[nextAct])
            setShowActTransition(true)
            setTimeout(() => {
                setShowActTransition(false)
                setAct(nextAct)
            }, 3000)
        } else {
            setAct(nextAct)
        }
    }

    const renderAct = () => {
        switch (state.currentAct) {
            case 'LOADING':
                return <LoadingScreen />

            case 'INTRO':
                return (
                    <IntroScreen onStart={() => {
                        startGame()
                        handleActComplete('ACT_1')
                    }} />
                )

            case 'ACT_1':
                return <Act1Scene onComplete={() => handleActComplete('ACT_2')} />

            case 'ACT_2':
                return <Act2Scene onComplete={() => handleActComplete('ACT_3')} />

            case 'ACT_3':
                return <Act3Scene onComplete={() => handleActComplete('ACT_4')} />

            case 'ACT_4':
                return <Act4Scene onComplete={() => handleActComplete('ACT_5')} />

            case 'ACT_5':
                return <Act5Scene onComplete={() => handleActComplete('VICTORY')} />

            case 'VICTORY':
                return <VictoryScreen xp={state.playerXP} onExit={onExit} />

            default:
                // Fallback - should not reach here with all acts implemented
                return (
                    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-cyan-400 text-2xl mb-4">Loading...</p>
                            <button
                                onClick={() => handleActComplete('VICTORY')}
                                className="px-6 py-3 bg-cyan-600 rounded-lg text-white"
                            >
                                Skip to Victory
                            </button>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900">
            {/* Game canvas/content */}
            {renderAct()}

            {/* HUD overlay - during active gameplay */}
            {state.isPlaying && state.currentAct !== 'INTRO' && state.currentAct !== 'LOADING' && state.currentAct !== 'VICTORY' && (
                <>
                    {/* Mission Objective - Top Left */}
                    <MissionObjective />

                    {/* Live Scoreboard - Top Right */}
                    <LiveScoreboard />

                    {/* Progress Map - Bottom Center */}
                    <GameProgressMap />

                    {/* Failure Feedback */}
                    <FailureOverlay visible={state.glitchActive} message="System Error!" xpLost={5} />

                    {/* Success Feedback for completed objectives */}
                    <SuccessOverlay
                        visible={state.completedObjectives.length > 0 && state.actProgress === 100}
                        xpGained={50}
                        message="Objective Complete!"
                    />
                </>
            )}

            {/* Dialogue box */}
            <DialogueBox />

            {/* Glitch overlay */}
            <GlitchOverlay visible={state.glitchActive} intensity={state.glitchIntensity} />

            {/* Act transition */}
            {showActTransition && (
                <ActTransition actName={transitionAct.name} actNumber={transitionAct.number} />
            )}

            {/* Pause menu */}
            {state.isPaused && (
                <PauseMenu onResume={resumeGame} onExit={onExit} />
            )}

            {/* Exit button (always visible except loading) */}
            {state.currentAct !== 'LOADING' && state.currentAct !== 'VICTORY' && !state.isPaused && (
                <button
                    onClick={onExit}
                    className="fixed top-4 right-20 z-[60] p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white transition-all"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    )
}

// Main export - wraps with provider
export function InsideTheDigitalEngine({ onExit }: { onExit: () => void }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        audioController.init()
    }, [])

    if (!mounted) {
        return <LoadingScreen />
    }

    return (
        <GameProvider>
            <GameContent onExit={onExit} />
        </GameProvider>
    )
}
