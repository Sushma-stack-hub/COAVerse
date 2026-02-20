"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { backendApi, type Flashcard } from "@/lib/backend-api"
import {
    Loader2,
    ThumbsUp,
    ThumbsDown,
    RotateCw,
    Cpu,
    AlertTriangle,
    Zap,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Activity,
} from "lucide-react"

// Component type icons
const componentIcons: Record<string, typeof Cpu> = {
    "ALU": Zap,
    "Control Unit": Activity,
    "Register": Cpu,
    "Memory": Cpu,
    "default": Cpu,
}

// Interactive System Card data structure
interface SystemCard {
    id: string
    component: string
    whatItDoes: string
    whatBreaksIfFails: string
    visualCue: "pulse" | "spin" | "bounce" | "glow"
    difficulty: "Easy" | "Exam" | "Conceptual"
    relatedComponents: string[]
}

// Extended flashcard data with system context
const systemCards: SystemCard[] = [
    {
        id: "1",
        component: "Arithmetic Logic Unit (ALU)",
        whatItDoes: "Performs all arithmetic operations (addition, subtraction, multiplication) and logical operations (AND, OR, NOT, XOR) on data.",
        whatBreaksIfFails: "All calculations produce incorrect results. Mathematical programs crash. Comparison operations fail, breaking if-else conditions.",
        visualCue: "pulse",
        difficulty: "Easy",
        relatedComponents: ["Accumulator", "Flags Register", "Control Unit"],
    },
    {
        id: "2",
        component: "Program Counter (PC)",
        whatItDoes: "Holds the memory address of the next instruction to be fetched and executed. Auto-increments after each fetch.",
        whatBreaksIfFails: "CPU cannot find next instruction. Programs freeze or loop infinitely. Jump and branch instructions fail completely.",
        visualCue: "bounce",
        difficulty: "Easy",
        relatedComponents: ["Instruction Register", "Memory Address Register"],
    },
    {
        id: "3",
        component: "Control Unit (CU)",
        whatItDoes: "Decodes instructions and generates control signals that coordinate all CPU operations. Acts as the brain's 'conductor'.",
        whatBreaksIfFails: "Instructions are misinterpreted. CPU components work out of sync. Timing violations cause data corruption.",
        visualCue: "glow",
        difficulty: "Exam",
        relatedComponents: ["ALU", "Registers", "Clock"],
    },
    {
        id: "4",
        component: "Memory Address Register (MAR)",
        whatItDoes: "Temporarily holds the address of the memory location to be accessed for read or write operations.",
        whatBreaksIfFails: "Wrong memory locations are accessed. Data is written to incorrect addresses. Program crashes due to memory violations.",
        visualCue: "pulse",
        difficulty: "Exam",
        relatedComponents: ["Memory Data Register", "Address Bus"],
    },
    {
        id: "5",
        component: "Instruction Register (IR)",
        whatItDoes: "Holds the current instruction being executed. Feeds the opcode to the Control Unit for decoding.",
        whatBreaksIfFails: "Wrong instructions are decoded. Control signals become unpredictable. CPU executes random operations.",
        visualCue: "spin",
        difficulty: "Conceptual",
        relatedComponents: ["Control Unit", "Program Counter"],
    },
]

interface FlashcardsProps {
    topic: string
    color?: string
}

export function Flashcards({ topic, color }: FlashcardsProps) {
    const [cards, setCards] = useState<SystemCard[]>(systemCards)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [showFailure, setShowFailure] = useState(false)
    const [loading, setLoading] = useState(false)
    const [masteryStats, setMasteryStats] = useState({ weak: 0, strong: 0 })

    const currentCard = cards[currentIndex]
    const themeColor = color || "hsl(var(--primary))"

    // Visual animation variants
    const visualAnimations = {
        pulse: {
            scale: [1, 1.1, 1],
            transition: { duration: 1.5, repeat: Infinity },
        },
        spin: {
            rotate: 360,
            transition: { duration: 3, repeat: Infinity, ease: "linear" },
        },
        bounce: {
            y: [0, -10, 0],
            transition: { duration: 1, repeat: Infinity },
        },
        glow: {
            opacity: [0.5, 1, 0.5],
            transition: { duration: 2, repeat: Infinity },
        },
    }

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
        setShowFailure(false)
    }

    const toggleFailureView = () => {
        setShowFailure(!showFailure)
    }

    const handleMastery = (state: "Weak" | "Strong") => {
        setMasteryStats(prev => ({
            weak: state === "Weak" ? prev.weak + 1 : prev.weak,
            strong: state === "Strong" ? prev.strong + 1 : prev.strong,
        }))

        // Move to next card
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setIsFlipped(false)
            setShowFailure(false)
        } else {
            // Loop back
            setCurrentIndex(0)
            setIsFlipped(false)
            setShowFailure(false)
        }
    }

    const navigateCard = (direction: "prev" | "next") => {
        if (direction === "prev" && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        } else if (direction === "next" && currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
        setIsFlipped(false)
        setShowFailure(false)
    }

    if (loading) {
        return (
            <div className="flex h-60 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (cards.length === 0) {
        return <div className="text-center py-10">No system cards available for this topic.</div>
    }

    const Icon = componentIcons[currentCard.component] || componentIcons.default

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {/* Header with progress */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="font-medium" style={{ color: themeColor }}>
                        Card {currentIndex + 1} of {cards.length}
                    </span>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="border-green-500/50 text-green-500">
                            ✓ {masteryStats.strong}
                        </Badge>
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                            ○ {masteryStats.weak}
                        </Badge>
                    </div>
                </div>
                <Badge
                    className="text-xs font-bold"
                    style={{ backgroundColor: themeColor, color: '#fff' }}
                >
                    {currentCard.difficulty}
                </Badge>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateCard("prev")}
                    disabled={currentIndex === 0}
                    className="shrink-0"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                {/* Card Container */}
                <div className="flex-1 perspective-1000 h-[420px] cursor-pointer" onClick={handleFlip}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentCard.id + (isFlipped ? '-back' : '-front')}
                            initial={{ rotateY: isFlipped ? -180 : 0, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: isFlipped ? 0 : 180, opacity: 0 }}
                            transition={{ duration: 0.6, type: "spring" }}
                            className="h-full"
                        >
                            {!isFlipped ? (
                                /* Front - Component Overview */
                                <Card
                                    className="h-full flex flex-col items-center justify-center p-8 text-center shadow-xl rounded-2xl border-0 relative overflow-hidden"
                                    style={{
                                        background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
                                        color: '#ffffff',
                                        boxShadow: `0 20px 40px -10px ${themeColor}60`,
                                    }}
                                >
                                    {/* Animated Icon */}
                                    <motion.div
                                        animate={visualAnimations[currentCard.visualCue]}
                                        className="mb-6"
                                    >
                                        <div
                                            className="w-20 h-20 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                                        >
                                            <Icon className="h-10 w-10" />
                                        </div>
                                    </motion.div>

                                    <div className="absolute top-6 left-6 text-xs font-bold tracking-wider opacity-70">
                                        COMPONENT
                                    </div>

                                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                                        <h3 className="text-2xl md:text-3xl font-bold leading-relaxed drop-shadow-sm">
                                            {currentCard.component}
                                        </h3>

                                        {/* Related Components */}
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {currentCard.relatedComponents.map((comp, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 rounded-full text-xs"
                                                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                                                >
                                                    {comp}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>

                                    <div className="absolute bottom-6 text-xs font-medium opacity-70 flex items-center gap-2 animate-pulse">
                                        <RotateCw className="h-4 w-4" /> Click to flip
                                    </div>
                                </Card>
                            ) : (
                                /* Back - What it does / What breaks */
                                <Card
                                    className="h-full flex flex-col p-6 shadow-xl rounded-2xl bg-card border-0 overflow-hidden"
                                    style={{
                                        border: `4px solid ${themeColor}`,
                                        boxShadow: `0 20px 40px -10px ${themeColor}30`,
                                    }}
                                >
                                    <div className="flex-1 space-y-4">
                                        {/* What it does */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="p-4 rounded-lg"
                                            style={{ backgroundColor: `${themeColor}15` }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Zap className="h-4 w-4" style={{ color: themeColor }} />
                                                <span className="text-sm font-bold" style={{ color: themeColor }}>
                                                    WHAT IT DOES
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed text-muted-foreground">
                                                {currentCard.whatItDoes}
                                            </p>
                                        </motion.div>

                                        {/* Toggle to show failure */}
                                        <AnimatePresence>
                                            {!showFailure ? (
                                                <motion.button
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    onClick={(e) => { e.stopPropagation(); toggleFailureView(); }}
                                                    className="w-full p-3 rounded-lg border-2 border-dashed border-red-500/30 hover:border-red-500/50 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2 text-red-500"
                                                >
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">See what breaks if it fails</span>
                                                    <ArrowRight className="h-4 w-4" />
                                                </motion.button>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 20 }}
                                                    className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                                        <span className="text-sm font-bold text-red-500">
                                                            WHAT BREAKS IF IT FAILS
                                                        </span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                                        {currentCard.whatBreaksIfFails}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Mastery Buttons */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex gap-3 mt-4"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-[#F59E0B]/30 hover:bg-[#F59E0B]/10 hover:text-[#F59E0B] space-x-2"
                                            onClick={() => handleMastery("Weak")}
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                            <span>Need Review</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-[#22C55E]/30 hover:bg-[#22C55E]/10 hover:text-[#22C55E] space-x-2"
                                            onClick={() => handleMastery("Strong")}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            <span>Got It!</span>
                                        </Button>
                                    </motion.div>
                                </Card>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateCard("next")}
                    disabled={currentIndex === cards.length - 1}
                    className="shrink-0"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2">
                {cards.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setCurrentIndex(idx); setIsFlipped(false); setShowFailure(false); }}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'w-6' : ''
                            }`}
                        style={{
                            backgroundColor: idx === currentIndex ? themeColor : `${themeColor}40`,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
