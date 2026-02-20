"use client"

import { useState } from "react"
import { Gamepad2, Clock, Target, Star, BookOpen, Cpu, Zap } from "lucide-react"
import { GameMode } from "@/components/games/game-mode"

interface InteractiveGamesProps {
    topic: string
    color?: string
}

export function InteractiveGames({ topic, color = "#38BDF8" }: InteractiveGamesProps) {
    const [isGameMode, setIsGameMode] = useState(false)

    if (isGameMode) {
        return (
            <div className="relative w-full rounded-2xl overflow-hidden border border-cyan-500/30" style={{ height: '80vh', minHeight: '600px' }}>
                <GameMode onExit={() => setIsGameMode(false)} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Launch Screen */}
            <div
                className="relative overflow-hidden rounded-2xl p-8"
                style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)',
                    border: '2px solid rgba(6,182,212,0.3)'
                }}
            >
                {/* Animated background grid */}
                <div className="absolute inset-0 opacity-20">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(6,182,212,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.2) 1px, transparent 1px)',
                            backgroundSize: '30px 30px'
                        }}
                    />
                </div>

                {/* Floating elements */}
                <div className="absolute top-4 right-4 opacity-30">
                    <div className="w-20 h-20 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
                </div>
                <div className="absolute bottom-4 left-4 opacity-30">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="relative z-10 text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 mb-6">
                        <Cpu className="w-12 h-12 text-cyan-400" />
                    </div>

                    {/* Title */}
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                        INSIDE THE CPU
                    </h2>
                    <p className="text-gray-400 text-lg mb-2">
                        A guided educational adventure
                    </p>
                    <p className="text-cyan-400 text-sm mb-8">
                        Learn how CPUs work by rebooting a crashed system!
                    </p>

                    {/* Game features */}
                    <div className="flex items-center justify-center gap-6 mb-8 text-sm">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                            <Clock className="h-4 w-4 text-cyan-400" />
                            <span className="text-gray-300">~10 min</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                            <Target className="h-4 w-4 text-purple-400" />
                            <span className="text-gray-300">6 Stages</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-gray-300">Earn XP</span>
                        </div>
                    </div>

                    {/* Stage Preview */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto mb-8">
                        <div className="p-3 rounded-xl bg-slate-800/50 border border-cyan-500/30 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">⚙️</span>
                                <span className="text-xs font-bold text-cyan-400">STAGE 1</span>
                            </div>
                            <p className="text-xs font-medium text-white">Control Unit</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-800/50 border border-blue-500/30 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">📊</span>
                                <span className="text-xs font-bold text-blue-400">STAGE 2</span>
                            </div>
                            <p className="text-xs font-medium text-white">Registers</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-800/50 border border-purple-500/30 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">💾</span>
                                <span className="text-xs font-bold text-purple-400">STAGE 3</span>
                            </div>
                            <p className="text-xs font-medium text-white">Memory</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-800/50 border border-orange-500/30 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">🔢</span>
                                <span className="text-xs font-bold text-orange-400">STAGE 4</span>
                            </div>
                            <p className="text-xs font-medium text-white">ALU</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-800/50 border border-green-500/30 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">🔌</span>
                                <span className="text-xs font-bold text-green-400">STAGE 5</span>
                            </div>
                            <p className="text-xs font-medium text-white">I/O Units</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-800/50 border border-yellow-500/30 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">🏆</span>
                                <span className="text-xs font-bold text-yellow-400">FINAL</span>
                            </div>
                            <p className="text-xs font-medium text-white">System Restored!</p>
                        </div>
                    </div>

                    {/* Launch Button */}
                    <button
                        onClick={() => setIsGameMode(true)}
                        className="group relative px-12 py-5 rounded-2xl font-bold text-xl text-white overflow-hidden transition-all hover:scale-105 active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                            boxShadow: '0 0 40px rgba(6,182,212,0.4)'
                        }}
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Gamepad2 className="h-6 w-6" />
                            START GAME
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                    </button>

                    {/* Features */}
                    <div className="flex items-center justify-center gap-6 mt-8 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Tutorial Included</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>🤖</span>
                            <span>AI Guide</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5" />
                            <span>Instant Feedback</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>🔊</span>
                            <span>Sound Effects</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
