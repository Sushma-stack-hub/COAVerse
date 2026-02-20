"use client"

import { useState, useEffect } from "react"
import { ChevronRight, SkipForward } from "lucide-react"
import { SysGuideAvatar } from "../characters/SysGuide"
import { useGame, useGameActions, DialogueLine } from "../engine/GameState"
import { audioController } from "../engine/AudioController"

export function DialogueBox() {
    const { state } = useGame()
    const { advanceDialogue, endDialogue } = useGameActions()
    const [displayedText, setDisplayedText] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [currentLine, setCurrentLine] = useState<DialogueLine | null>(null)

    const line = state.dialogueQueue[0]

    // Typewriter effect
    useEffect(() => {
        if (!line) {
            setCurrentLine(null)
            setDisplayedText("")
            return
        }

        if (line !== currentLine) {
            setCurrentLine(line)
            setDisplayedText("")
            setIsTyping(true)
        }
    }, [line, currentLine])

    useEffect(() => {
        if (!currentLine || !isTyping) return

        const fullText = currentLine.text
        let charIndex = 0

        const typeInterval = setInterval(() => {
            if (charIndex < fullText.length) {
                setDisplayedText(fullText.substring(0, charIndex + 1))
                charIndex++
                // Typing sound every few characters
                if (charIndex % 3 === 0) {
                    audioController.playSound('dialogue')
                }
            } else {
                setIsTyping(false)
                clearInterval(typeInterval)
            }
        }, 30)

        return () => clearInterval(typeInterval)
    }, [currentLine, isTyping])

    const handleAdvance = () => {
        if (isTyping) {
            // Skip to full text
            setIsTyping(false)
            setDisplayedText(currentLine?.text || "")
        } else if (state.dialogueQueue.length > 1) {
            advanceDialogue()
        } else {
            endDialogue()
        }
        audioController.playSound('click')
    }

    const handleSkip = () => {
        endDialogue()
        audioController.playSound('click')
    }

    if (!state.isDialogueActive || !currentLine) return null

    const speakerColors = {
        SYS: 'border-cyan-500 bg-cyan-500/10',
        GLITCH: 'border-red-500 bg-red-500/10',
        NARRATOR: 'border-purple-500 bg-purple-500/10'
    }

    const speakerNames = {
        SYS: 'SYS - System Guide',
        GLITCH: 'GLITCH',
        NARRATOR: 'Narrator'
    }

    const emotionToSysEmotion = (emotion?: string): 'neutral' | 'warning' | 'excited' | 'concerned' => {
        switch (emotion) {
            case 'warning': return 'warning'
            case 'excited': return 'excited'
            case 'concerned': return 'concerned'
            default: return 'neutral'
        }
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-6">
            <div
                className={`max-w-4xl mx-auto rounded-2xl border-2 ${speakerColors[currentLine.speaker]} backdrop-blur-md p-6`}
                onClick={handleAdvance}
            >
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {currentLine.speaker === 'SYS' && (
                            <SysGuideAvatar
                                emotion={emotionToSysEmotion(currentLine.emotion)}
                                speaking={isTyping}
                            />
                        )}
                        {currentLine.speaker === 'GLITCH' && (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center border-2 border-red-400">
                                <span className="text-3xl">🐛</span>
                            </div>
                        )}
                        {currentLine.speaker === 'NARRATOR' && (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center border-2 border-purple-400">
                                <span className="text-3xl">📖</span>
                            </div>
                        )}
                    </div>

                    {/* Text content */}
                    <div className="flex-1">
                        <p className="text-xs text-gray-400 font-medium mb-2">
                            {speakerNames[currentLine.speaker]}
                        </p>
                        <p className="text-white text-lg leading-relaxed">
                            {displayedText}
                            {isTyping && <span className="animate-pulse">▌</span>}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAdvance() }}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            title={isTyping ? "Skip typing" : "Next"}
                        >
                            <ChevronRight className="h-5 w-5 text-white" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleSkip() }}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            title="Skip all"
                        >
                            <SkipForward className="h-5 w-5 text-white/60" />
                        </button>
                    </div>
                </div>

                {/* Continue hint */}
                {!isTyping && (
                    <p className="text-center text-xs text-gray-500 mt-4">
                        Click anywhere or press Enter to continue...
                    </p>
                )}
            </div>
        </div>
    )
}

// Objective complete notification
export function ObjectiveComplete({ title, xp }: { title: string; xp: number }) {
    return (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in">
            <div className="px-8 py-6 rounded-2xl bg-green-900/90 border-2 border-green-500 text-center">
                <p className="text-green-400 font-bold text-lg mb-2">OBJECTIVE COMPLETE</p>
                <p className="text-white font-medium">{title}</p>
                <p className="text-yellow-400 font-bold text-xl mt-2">+{xp} XP</p>
            </div>
        </div>
    )
}

// Act transition screen
export function ActTransition({ actName, actNumber }: { actName: string; actNumber: number }) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center">
            <div className="text-center animate-in fade-in duration-1000">
                <p className="text-cyan-400 text-xl tracking-widest mb-4">ACT {actNumber}</p>
                <h1 className="text-5xl font-black text-white">{actName}</h1>
                <div className="mt-8 flex justify-center gap-2">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${i < actNumber ? 'bg-cyan-400' : 'bg-slate-700'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
