"use client"

import { useState, useEffect } from "react"
import { Bot, Skull, User, Zap, AlertTriangle, Lightbulb, Heart } from "lucide-react"

// Character types
export type CharacterType = 'SYS' | 'GLITCH' | 'ENGINEER'
export type CharacterEmotion = 'neutral' | 'happy' | 'warning' | 'excited' | 'concerned' | 'angry'

interface CharacterAvatarProps {
    character: CharacterType
    emotion?: CharacterEmotion
    size?: 'sm' | 'md' | 'lg'
    showName?: boolean
    speaking?: boolean
}

const CHARACTER_CONFIG = {
    SYS: {
        name: 'SYS',
        title: 'System Guide',
        icon: Bot,
        color: '#06B6D4', // cyan
        bgGradient: 'from-cyan-500/30 to-blue-600/30',
        borderColor: 'border-cyan-500/50'
    },
    GLITCH: {
        name: 'GLITCH',
        title: 'System Error',
        icon: Skull,
        color: '#EF4444', // red
        bgGradient: 'from-red-500/30 to-orange-600/30',
        borderColor: 'border-red-500/50'
    },
    ENGINEER: {
        name: 'You',
        title: 'Engineer',
        icon: User,
        color: '#8B5CF6', // purple
        bgGradient: 'from-purple-500/30 to-indigo-600/30',
        borderColor: 'border-purple-500/50'
    }
}

const SIZE_CONFIG = {
    sm: { container: 'w-10 h-10', icon: 'h-5 w-5' },
    md: { container: 'w-14 h-14', icon: 'h-7 w-7' },
    lg: { container: 'w-20 h-20', icon: 'h-10 w-10' }
}

// Character Avatar Component
export function CharacterAvatar({
    character,
    emotion = 'neutral',
    size = 'md',
    showName = false,
    speaking = false
}: CharacterAvatarProps) {
    const config = CHARACTER_CONFIG[character]
    const sizeConfig = SIZE_CONFIG[size]
    const Icon = config.icon

    // Emotion-based animation
    const emotionStyles: Record<CharacterEmotion, string> = {
        neutral: '',
        happy: 'animate-bounce',
        warning: 'animate-pulse',
        excited: 'animate-bounce',
        concerned: 'animate-pulse',
        angry: ''
    }

    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className={`
                    ${sizeConfig.container} 
                    rounded-xl 
                    bg-gradient-to-br ${config.bgGradient}
                    border-2 ${config.borderColor}
                    flex items-center justify-center
                    transition-all duration-300
                    ${speaking ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''}
                    ${emotionStyles[emotion]}
                `}
                style={{
                    boxShadow: speaking ? `0 0 20px ${config.color}40, 0 0 0 2px ${config.color}` : 'none'
                }}
            >
                <Icon className={sizeConfig.icon} style={{ color: config.color }} />
            </div>
            {showName && (
                <p className="text-xs font-medium" style={{ color: config.color }}>
                    {config.name}
                </p>
            )}
        </div>
    )
}

// Character Dialogue Bubble
interface DialogueBubbleProps {
    character: CharacterType
    message: string
    emotion?: CharacterEmotion
    onDismiss?: () => void
    autoHide?: number
}

export function DialogueBubble({
    character,
    message,
    emotion = 'neutral',
    onDismiss,
    autoHide
}: DialogueBubbleProps) {
    const config = CHARACTER_CONFIG[character]

    useEffect(() => {
        if (autoHide && onDismiss) {
            const timer = setTimeout(onDismiss, autoHide)
            return () => clearTimeout(timer)
        }
    }, [autoHide, onDismiss])

    return (
        <div className="flex items-start gap-3 animate-fadeIn">
            <CharacterAvatar character={character} emotion={emotion} speaking />
            <div
                className="relative px-4 py-3 rounded-xl border max-w-md"
                style={{
                    backgroundColor: `${config.color}10`,
                    borderColor: `${config.color}40`
                }}
            >
                {/* Arrow */}
                <div
                    className="absolute -left-2 top-4 w-0 h-0"
                    style={{
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderRight: `8px solid ${config.color}40`
                    }}
                />
                <p className="text-sm text-gray-300 font-medium mb-1" style={{ color: config.color }}>
                    {config.name}
                </p>
                <p className="text-sm text-gray-300">{message}</p>
            </div>
        </div>
    )
}

// Failure Feedback Component
interface FailureFeedbackProps {
    message?: string
    xpLost?: number
    comboBreak?: boolean
    visible: boolean
}

export function FailureFeedback({
    message = "Incorrect! Try again.",
    xpLost = 0,
    comboBreak = false,
    visible
}: FailureFeedbackProps) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (visible) {
            setShow(true)
            const timer = setTimeout(() => setShow(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [visible])

    if (!show) return null

    return (
        <div className="fixed inset-0 z-[80] pointer-events-none flex items-center justify-center">
            {/* Red flash overlay */}
            <div
                className="absolute inset-0 bg-red-500/20 animate-pulse"
                style={{ animation: 'flash 0.3s ease-out' }}
            />

            {/* Feedback content */}
            <div className="relative z-10 text-center animate-bounce">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <CharacterAvatar character="GLITCH" emotion="angry" size="lg" />
                </div>

                <div
                    className="px-6 py-4 rounded-xl bg-red-900/90 border-2 border-red-500/60"
                    style={{ boxShadow: '0 0 40px rgba(239, 68, 68, 0.5)' }}
                >
                    <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-xl mb-2">
                        <AlertTriangle className="h-6 w-6" />
                        <span>{message}</span>
                    </div>

                    {comboBreak && (
                        <p className="text-orange-400 font-medium text-sm mb-1">
                            ⚡ Combo Broken!
                        </p>
                    )}

                    {xpLost > 0 && (
                        <p className="text-red-300 text-sm">
                            -{xpLost} XP
                        </p>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes flash {
                    0% { opacity: 0.5; }
                    100% { opacity: 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}

// Success Feedback Component
interface SuccessFeedbackProps {
    xpGained: number
    combo?: number
    visible: boolean
}

export function SuccessFeedback({ xpGained, combo = 0, visible }: SuccessFeedbackProps) {
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
        <div className="fixed top-24 right-8 z-[80] pointer-events-none">
            <div
                className="px-4 py-3 rounded-xl bg-green-900/90 border-2 border-green-500/60 animate-fadeIn"
                style={{ boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' }}
            >
                <div className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-yellow-400" />
                    <div>
                        <p className="text-green-400 font-bold text-lg">+{xpGained} XP</p>
                        {combo > 1 && (
                            <p className="text-yellow-400 text-sm font-medium">
                                🔥 {combo}x Combo!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Hint Bubble from SYS
interface HintBubbleProps {
    hint: string
    visible: boolean
    onDismiss?: () => void
}

export function HintBubble({ hint, visible, onDismiss }: HintBubbleProps) {
    if (!visible) return null

    return (
        <div className="fixed bottom-24 left-8 z-[70] max-w-sm animate-fadeIn">
            <DialogueBubble
                character="SYS"
                message={hint}
                emotion="neutral"
                onDismiss={onDismiss}
                autoHide={5000}
            />
        </div>
    )
}
