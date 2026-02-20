"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Trophy, ThumbsUp, Brain, Swords, HelpCircle, Lightbulb, Sparkles, Zap, Target, Users, Clock, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/lib/auth-context"

// ============================================================================
// TYPES
// ============================================================================

interface ArenaMessage {
    id: string
    userId: string
    username: string
    avatar: string
    level: number
    content: string
    timestamp: Date
    type: "question" | "insight" | "challenge"
    reactions: {
        gotIt: string[]
        needsClarity: string[]
        challengeMe: string[]
    }
    isNew?: boolean
    isAI?: boolean
}

interface ActiveClassmate {
    id: string
    name: string
    avatar: string
    level: number
    isTyping?: boolean
    lastActive: Date
}

interface FloatingBadge {
    id: string
    text: string
    xp: number
    x: number
    y: number
}

interface LeaderboardUser {
    id: string
    username: string
    avatar: string
    xp: number
    level: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DAILY_CHALLENGE = {
    title: "Today's Class Challenge",
    prompt: "Explain interrupt-driven I/O in 2 lines",
    xpReward: 50,
    submissions: 12,
    topResponse: {
        username: "Ananya G.",
        avatar: "AG",
        level: 20,
        content: "CPU does other work until I/O device signals completion via interrupt. ISR then handles the data transfer — no polling waste!",
        votes: 28,
    },
}

const INITIAL_MESSAGES: ArenaMessage[] = [
    {
        id: "1",
        userId: "sys",
        username: "SYS",
        avatar: "SY",
        level: 99,
        content: "Welcome to the COA Live Arena! 🎮 Every interaction earns XP. Ask questions, share insights, and challenge each other!",
        timestamp: new Date(Date.now() - 3600000),
        type: "insight",
        reactions: { gotIt: ["u1", "u2"], needsClarity: [], challengeMe: [] },
        isAI: true,
    },
    {
        id: "2",
        userId: "priya",
        username: "Priya Sharma",
        avatar: "PS",
        level: 12,
        content: "Can someone explain why we need both cache and RAM? Isn't faster memory always better?",
        timestamp: new Date(Date.now() - 1800000),
        type: "question",
        reactions: { gotIt: [], needsClarity: ["u1"], challengeMe: [] },
    },
    {
        id: "3",
        userId: "aman",
        username: "Aman Kumar",
        avatar: "AK",
        level: 18,
        content: "It's a cost-speed tradeoff! SRAM (cache) is 10x faster but 100x more expensive per bit. We use a hierarchy to get the best of both worlds.",
        timestamp: new Date(Date.now() - 1500000),
        type: "insight",
        reactions: { gotIt: ["priya", "u2", "u3"], needsClarity: [], challengeMe: ["u4"] },
    },
    {
        id: "4",
        userId: "rahul",
        username: "Rahul Verma",
        avatar: "RV",
        level: 15,
        content: "Try this: Calculate AMAT for a system with 1ns hit time, 5% miss rate, and 100ns miss penalty. What's the effective access time?",
        timestamp: new Date(Date.now() - 900000),
        type: "challenge",
        reactions: { gotIt: ["u1"], needsClarity: ["u2"], challengeMe: ["u3", "u4", "u5"] },
    },
]

const ACTIVE_CLASSMATES: ActiveClassmate[] = [
    { id: "1", name: "Ananya G.", avatar: "AG", level: 20, lastActive: new Date() },
    { id: "2", name: "Aman K.", avatar: "AK", level: 18, isTyping: true, lastActive: new Date() },
    { id: "3", name: "Rahul V.", avatar: "RV", level: 15, lastActive: new Date(Date.now() - 60000) },
    { id: "4", name: "Priya S.", avatar: "PS", level: 12, lastActive: new Date(Date.now() - 120000) },
    { id: "5", name: "Vikram S.", avatar: "VS", level: 8, lastActive: new Date(Date.now() - 300000) },
]

const LEADERBOARD: LeaderboardUser[] = [
    { id: "1", username: "Ananya G.", avatar: "AG", xp: 4200, level: 20 },
    { id: "2", username: "Aman K.", avatar: "AK", xp: 3400, level: 18 },
    { id: "3", username: "Rahul V.", avatar: "RV", xp: 2300, level: 15 },
    { id: "4", username: "Priya S.", avatar: "PS", xp: 1500, level: 12 },
    { id: "5", username: "Vikram S.", avatar: "VS", xp: 700, level: 8 },
]

const AI_NUDGES = [
    "Great question! What's your intuition about why this matters?",
    "Think about the trade-offs involved here. What would happen if we optimized for just one factor?",
    "This is a classic concept! Can you relate it to something you've seen in real hardware?",
    "Before diving deeper — what do you already know about this topic?",
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1
}

function formatTimestamp(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

function getLevelColor(level: number): string {
    if (level >= 20) return "#FFD700"
    if (level >= 15) return "#C0C0C0"
    if (level >= 10) return "#CD7F32"
    if (level >= 5) return "#22C55E"
    return "#8B7CFF"
}

function detectMessageType(content: string): "question" | "insight" | "challenge" {
    const lowerContent = content.toLowerCase()
    if (content.includes("?") || lowerContent.startsWith("what") || lowerContent.startsWith("how") || lowerContent.startsWith("why") || lowerContent.startsWith("can")) {
        return "question"
    }
    if (lowerContent.includes("try this") || lowerContent.includes("calculate") || lowerContent.includes("challenge") || lowerContent.includes("solve")) {
        return "challenge"
    }
    return "insight"
}

function getTypeConfig(type: "question" | "insight" | "challenge") {
    switch (type) {
        case "question":
            return { icon: HelpCircle, label: "Question", color: "#3B82F6", bgColor: "#3B82F620" }
        case "insight":
            return { icon: Lightbulb, label: "Insight", color: "#22C55E", bgColor: "#22C55E20" }
        case "challenge":
            return { icon: Swords, label: "Challenge", color: "#F43F5E", bgColor: "#F43F5E20" }
    }
}

// ============================================================================
// FLOATING XP BADGE COMPONENT
// ============================================================================

function FloatingXPBadge({ badge, onComplete }: { badge: FloatingBadge; onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 2000)
        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <div
            className="fixed pointer-events-none z-50 animate-float-up"
            style={{ left: badge.x, top: badge.y }}
        >
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/90 to-purple-500/90 text-white text-sm font-medium shadow-lg shadow-primary/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badge.text}</span>
                <span className="text-yellow-300 font-bold">+{badge.xp} XP</span>
            </div>
        </div>
    )
}

// ============================================================================
// ANIMATED XP COUNTER
// ============================================================================

function AnimatedXP({ value, prevValue }: { value: number; prevValue: number }) {
    const [displayValue, setDisplayValue] = useState(prevValue)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (value !== prevValue) {
            setIsAnimating(true)
            const diff = value - prevValue
            const steps = 10
            const stepValue = diff / steps
            let current = prevValue

            const interval = setInterval(() => {
                current += stepValue
                if ((diff > 0 && current >= value) || (diff < 0 && current <= value)) {
                    setDisplayValue(value)
                    setIsAnimating(false)
                    clearInterval(interval)
                } else {
                    setDisplayValue(Math.round(current))
                }
            }, 50)

            return () => clearInterval(interval)
        }
    }, [value, prevValue])

    return (
        <span className={`transition-all duration-300 ${isAnimating ? "text-yellow-400 scale-110" : ""}`}>
            {displayValue} XP
        </span>
    )
}

// ============================================================================
// ACTIVE CLASSMATES COMPONENT
// ============================================================================

function ActiveClassmatesPanel({ classmates }: { classmates: ActiveClassmate[] }) {
    const [pulsingIndex, setPulsingIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setPulsingIndex((prev) => (prev + 1) % classmates.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [classmates.length])

    return (
        <div className="p-4 border-b border-border bg-card/30">
            <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-foreground">Active Now</span>
                <span className="text-xs text-muted-foreground">({classmates.length} classmates)</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {classmates.map((classmate, index) => (
                    <Tooltip key={classmate.id}>
                        <TooltipTrigger asChild>
                            <div className="relative">
                                <Avatar
                                    className={`
                    w-9 h-9 cursor-pointer transition-all duration-300
                    ${pulsingIndex === index ? "ring-2 ring-green-500 animate-pulse-ring" : ""}
                    ${classmate.isTyping ? "ring-2 ring-primary animate-pulse" : ""}
                    hover:scale-110
                  `}
                                >
                                    <AvatarFallback
                                        className="text-xs font-medium"
                                        style={{ backgroundColor: `${getLevelColor(classmate.level)}20`, color: getLevelColor(classmate.level) }}
                                    >
                                        {classmate.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                {/* Online indicator */}
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                                {classmate.isTyping && (
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                        <span className="text-[8px]">✍️</span>
                                    </span>
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-medium">{classmate.name}</p>
                            <p className="text-xs text-muted-foreground">Level {classmate.level}</p>
                            {classmate.isTyping && <p className="text-xs text-primary">Typing...</p>}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </div>
    )
}

// ============================================================================
// DAILY CHALLENGE COMPONENT
// ============================================================================

function DailyChallengeCard({ onParticipate }: { onParticipate: () => void }) {
    return (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 overflow-hidden relative">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 animate-gradient-shift" />

            <CardHeader className="pb-3 relative z-10">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="w-5 h-5 text-primary animate-pulse-subtle" />
                    <span>{DAILY_CHALLENGE.title}</span>
                    <Badge className="ml-auto bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                        +{DAILY_CHALLENGE.xpReward} XP
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
                <p className="text-sm font-medium text-foreground bg-muted/30 p-3 rounded-lg border border-border">
                    "{DAILY_CHALLENGE.prompt}"
                </p>

                {/* Top Response */}
                <div className="p-3 rounded-lg bg-card/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs font-medium text-yellow-500">Top Response</span>
                        <span className="text-xs text-muted-foreground ml-auto">{DAILY_CHALLENGE.topResponse.votes} votes</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback
                                className="text-xs"
                                style={{ backgroundColor: `${getLevelColor(DAILY_CHALLENGE.topResponse.level)}20`, color: getLevelColor(DAILY_CHALLENGE.topResponse.level) }}
                            >
                                {DAILY_CHALLENGE.topResponse.avatar}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{DAILY_CHALLENGE.topResponse.username}</span>
                                <Badge variant="outline" className="text-[10px] h-4 px-1">Lv.{DAILY_CHALLENGE.topResponse.level}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{DAILY_CHALLENGE.topResponse.content}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{DAILY_CHALLENGE.submissions} submissions today</span>
                    <Button size="sm" onClick={onParticipate} className="gap-1">
                        <Zap className="w-3 h-3" />
                        Take Challenge
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// ============================================================================
// MESSAGE CARD COMPONENT
// ============================================================================

function ArenaMessageCard({
    message,
    currentUserId,
    onAction,
    onShowBadge,
}: {
    message: ArenaMessage
    currentUserId: string
    onAction: (messageId: string, action: "gotIt" | "needsClarity" | "challengeMe", e: React.MouseEvent) => void
    onShowBadge: (text: string, xp: number, x: number, y: number) => void
}) {
    const [isHovered, setIsHovered] = useState(false)
    const levelColor = getLevelColor(message.level)
    const typeConfig = getTypeConfig(message.type)
    const TypeIcon = typeConfig.icon

    return (
        <Card
            className={`
        transition-all duration-300 overflow-hidden
        ${message.isNew ? "animate-message-appear" : ""}
        ${isHovered ? "shadow-lg shadow-primary/10 scale-[1.01]" : "shadow-sm"}
        ${message.isAI ? "border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-transparent" : ""}
      `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Type Label Banner */}
            <div
                className="h-1 w-full"
                style={{ backgroundColor: typeConfig.color }}
            />

            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Avatar
                        className={`
              w-10 h-10 shrink-0 transition-all duration-300
              ${isHovered ? "ring-2 scale-105" : ""}
              ${message.isAI ? "ring-2 ring-yellow-500/50" : ""}
            `}
                        style={{ ringColor: isHovered ? typeConfig.color : undefined }}
                    >
                        <AvatarFallback
                            className="text-xs font-medium"
                            style={{ backgroundColor: `${levelColor}20`, color: levelColor }}
                        >
                            {message.avatar}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium ${message.isAI ? "text-yellow-500" : "text-foreground"}`}>
                                {message.username}
                                {message.isAI && <Sparkles className="w-3 h-3 inline ml-1 text-yellow-500" />}
                            </span>
                            <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5"
                                style={{ borderColor: `${levelColor}50`, color: levelColor }}
                            >
                                Lv.{message.level}
                            </Badge>
                            <Badge
                                className="text-[10px] h-5 px-1.5 gap-1"
                                style={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color, border: `1px solid ${typeConfig.color}30` }}
                            >
                                <TypeIcon className="w-3 h-3" />
                                {typeConfig.label}
                            </Badge>
                            <span className={`text-xs text-muted-foreground ml-auto transition-opacity ${isHovered ? "opacity-100" : "opacity-50"}`}>
                                {formatTimestamp(message.timestamp)}
                            </span>
                        </div>

                        <p className="text-sm text-foreground/90 mt-2 leading-relaxed">{message.content}</p>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                            {[
                                { key: "gotIt" as const, icon: ThumbsUp, label: "Got it", xp: 5, color: "#22C55E" },
                                { key: "needsClarity" as const, icon: Brain, label: "Needs clarity", xp: 3, color: "#3B82F6" },
                                { key: "challengeMe" as const, icon: Swords, label: "Challenge me", xp: 10, color: "#F43F5E" },
                            ].map(({ key, icon: Icon, label, xp, color }) => {
                                const count = message.reactions[key].length
                                const hasReacted = message.reactions[key].includes(currentUserId)

                                return (
                                    <Tooltip key={key}>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={(e) => {
                                                    onAction(message.id, key, e)
                                                    if (!hasReacted) {
                                                        const rect = e.currentTarget.getBoundingClientRect()
                                                        onShowBadge(label, xp, rect.left + rect.width / 2, rect.top - 40)
                                                    }
                                                }}
                                                className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                          transition-all duration-200 hover:scale-105 active:scale-95
                          ${hasReacted
                                                        ? "shadow-sm"
                                                        : "bg-muted/50 text-muted-foreground hover:text-foreground"
                                                    }
                        `}
                                                style={hasReacted ? { backgroundColor: `${color}20`, color: color } : undefined}
                                            >
                                                <Icon className={`w-3.5 h-3.5 ${hasReacted ? "animate-bounce-once" : ""}`} />
                                                <span>{label}</span>
                                                {count > 0 && (
                                                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-foreground/10 text-[10px]">
                                                        {count}
                                                    </span>
                                                )}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>+{xp} XP</TooltipContent>
                                    </Tooltip>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// ============================================================================
// LEADERBOARD COMPONENT
// ============================================================================

function Leaderboard({
    users,
    currentUserXp,
    prevUserXp,
    currentUserLevel,
}: {
    users: LeaderboardUser[]
    currentUserXp: number
    prevUserXp: number
    currentUserLevel: number
}) {
    return (
        <div className="w-64 border-l border-border bg-card/50 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 via-transparent to-transparent" />
            </div>

            <div className="p-4 border-b border-border relative z-10">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500 animate-pulse-subtle" />
                    Arena Champions
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Today's top performers</p>
            </div>

            <ScrollArea className="flex-1 relative z-10">
                <div className="p-3 space-y-2">
                    {users.map((user, index) => (
                        <div
                            key={user.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 transition-all duration-300 hover:scale-[1.02] hover:bg-muted/50 cursor-pointer"
                        >
                            <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{
                                    backgroundColor: index === 0 ? "#FFD70030" : index === 1 ? "#C0C0C030" : index === 2 ? "#CD7F3230" : "transparent",
                                    color: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "inherit",
                                }}
                            >
                                {index === 0 ? "👑" : index + 1}
                            </span>
                            <Avatar className="w-8 h-8">
                                <AvatarFallback
                                    className="text-[10px]"
                                    style={{ backgroundColor: `${getLevelColor(user.level)}20`, color: getLevelColor(user.level) }}
                                >
                                    {user.avatar}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
                                <p className="text-[10px] text-muted-foreground">{user.xp} XP • Lv.{user.level}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Current User Stats */}
            <div className="p-3 border-t border-border relative z-10">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 transition-all duration-300 hover:shadow-md hover:shadow-primary/10">
                    <p className="text-xs text-muted-foreground">Your Arena Stats</p>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-primary">Level {currentUserLevel}</span>
                        <AnimatedXP value={currentUserXp} prevValue={prevUserXp} />
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out animate-gradient-x"
                            style={{ width: `${(currentUserXp % 100)}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        {100 - (currentUserXp % 100)} XP to next level
                    </p>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CoaCommunity() {
    const { user } = useAuth()
    const [messages, setMessages] = useState<ArenaMessage[]>(INITIAL_MESSAGES)
    const [inputValue, setInputValue] = useState("")
    const [userXp, setUserXp] = useState(150)
    const [prevUserXp, setPrevUserXp] = useState(150)
    const [floatingBadges, setFloatingBadges] = useState<FloatingBadge[]>([])
    const [classmates, setClassmates] = useState<ActiveClassmate[]>(ACTIVE_CLASSMATES)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const currentUserId = user?.email || "current-user"
    const currentUserLevel = calculateLevel(userXp)

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Simulate classmate activity
    useEffect(() => {
        const interval = setInterval(() => {
            setClassmates(prev => {
                const updated = [...prev]
                const randomIndex = Math.floor(Math.random() * updated.length)
                updated[randomIndex] = {
                    ...updated[randomIndex],
                    isTyping: Math.random() > 0.7,
                    lastActive: Math.random() > 0.5 ? new Date() : updated[randomIndex].lastActive,
                }
                return updated
            })
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    const showBadge = useCallback((text: string, xp: number, x: number, y: number) => {
        const id = `badge-${Date.now()}`
        setFloatingBadges(prev => [...prev, { id, text, xp, x, y }])
    }, [])

    const removeBadge = useCallback((id: string) => {
        setFloatingBadges(prev => prev.filter(b => b.id !== id))
    }, [])

    const handleSendMessage = () => {
        if (!inputValue.trim()) return

        const messageType = detectMessageType(inputValue)
        const xpByType = { question: 5, insight: 10, challenge: 15 }

        const newMessage: ArenaMessage = {
            id: `msg-${Date.now()}`,
            userId: currentUserId,
            username: user?.name || "You",
            avatar: user?.name ? getInitials(user.name) : "U",
            level: currentUserLevel,
            content: inputValue.trim(),
            timestamp: new Date(),
            type: messageType,
            reactions: { gotIt: [], needsClarity: [], challengeMe: [] },
            isNew: true,
        }

        setMessages(prev => [...prev, newMessage])

        // Award XP with animation
        const xpGain = xpByType[messageType]
        setPrevUserXp(userXp)
        setUserXp(prev => prev + xpGain)

        // Show floating badge
        const typeLabels = { question: "Question Asked", insight: "Insight Shared", challenge: "Challenge Posted" }
        showBadge(typeLabels[messageType], xpGain, window.innerWidth / 2, window.innerHeight / 2)

        setInputValue("")

        // Remove isNew flag after animation
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, isNew: false } : m))
        }, 1000)

        // AI nudge for questions
        if (messageType === "question") {
            setTimeout(() => {
                const randomNudge = AI_NUDGES[Math.floor(Math.random() * AI_NUDGES.length)]

                const aiMessage: ArenaMessage = {
                    id: `ai-${Date.now()}`,
                    userId: "sys",
                    username: "SYS",
                    avatar: "SY",
                    level: 99,
                    content: randomNudge,
                    timestamp: new Date(),
                    type: "insight",
                    reactions: { gotIt: [], needsClarity: [], challengeMe: [] },
                    isNew: true,
                    isAI: true,
                }

                setMessages(prev => [...prev, aiMessage])

                setTimeout(() => {
                    setMessages(prev => prev.map(m => m.id === aiMessage.id ? { ...m, isNew: false } : m))
                }, 1000)
            }, 1500 + Math.random() * 1000)
        }
    }

    const handleAction = (messageId: string, action: "gotIt" | "needsClarity" | "challengeMe", _e: React.MouseEvent) => {
        const xpByAction = { gotIt: 5, needsClarity: 3, challengeMe: 10 }

        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const reactions = { ...msg.reactions }
                if (reactions[action].includes(currentUserId)) {
                    reactions[action] = reactions[action].filter(id => id !== currentUserId)
                } else {
                    reactions[action] = [...reactions[action], currentUserId]
                    // Award XP only when adding reaction
                    setPrevUserXp(userXp)
                    setUserXp(prev => prev + xpByAction[action])
                }
                return { ...msg, reactions }
            }
            return msg
        }))
    }

    const handleDailyChallenge = () => {
        setInputValue(`My answer to today's challenge: `)
        showBadge("Challenge Accepted", 5, window.innerWidth / 2, window.innerHeight / 2)
        setPrevUserXp(userXp)
        setUserXp(prev => prev + 5)
    }

    return (
        <>
            {/* Floating XP Badges */}
            {floatingBadges.map(badge => (
                <FloatingXPBadge
                    key={badge.id}
                    badge={badge}
                    onComplete={() => removeBadge(badge.id)}
                />
            ))}

            <div className="h-[calc(100vh-8rem)] flex rounded-xl border border-border overflow-hidden bg-background relative">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 animate-gradient-shift pointer-events-none" />

                {/* Main Arena Area */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                    {/* Arena Header */}
                    <div className="px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-primary animate-pulse" />
                                    COA Live Arena
                                </h2>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    Your classmates are learning right now
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>Session active</span>
                            </div>
                        </div>
                    </div>

                    {/* Active Classmates */}
                    <ActiveClassmatesPanel classmates={classmates} />

                    {/* Messages / Cards */}
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {/* Daily Challenge Card */}
                            <DailyChallengeCard onParticipate={handleDailyChallenge} />

                            {/* Message Cards */}
                            {messages.map(message => (
                                <ArenaMessageCard
                                    key={message.id}
                                    message={message}
                                    currentUserId={currentUserId}
                                    onAction={handleAction}
                                    onShowBadge={showBadge}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Bar */}
                    <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm relative z-10">
                        <div className="flex gap-2">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSendMessage()
                                    }
                                }}
                                placeholder="Ask a question, share an insight, or post a challenge..."
                                className="flex-1 bg-muted/50 transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className="transition-all duration-300 hover:scale-105 active:scale-95 gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send
                            </Button>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <HelpCircle className="w-3 h-3 text-blue-500" /> Questions +5 XP
                            </span>
                            <span className="flex items-center gap-1">
                                <Lightbulb className="w-3 h-3 text-green-500" /> Insights +10 XP
                            </span>
                            <span className="flex items-center gap-1">
                                <Swords className="w-3 h-3 text-red-500" /> Challenges +15 XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Sidebar */}
                <Leaderboard
                    users={LEADERBOARD}
                    currentUserXp={userXp}
                    prevUserXp={prevUserXp}
                    currentUserLevel={currentUserLevel}
                />
            </div>

            {/* CSS Animations */}
            <style jsx global>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
        }

        @keyframes message-appear {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes bounce-once {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
        }

        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes gradient-shift {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-float-up { animation: float-up 2s ease-out forwards; }
        .animate-message-appear { animation: message-appear 0.4s ease-out; }
        .animate-bounce-once { animation: bounce-once 0.3s ease-out; }
        .animate-pulse-ring { animation: pulse-ring 2s infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
        .animate-gradient-shift { animation: gradient-shift 4s ease-in-out infinite; }
        .animate-gradient-x { 
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite; 
        }
      `}</style>
        </>
    )
}
