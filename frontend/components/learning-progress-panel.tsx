"use client"

import { useState, useEffect } from "react"
import {
    Brain,
    Target,
    BookOpen,
    Shield,
    Activity,
    ArrowRight,
    Lightbulb,
    AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

export type ActivityType = 'visualizer' | 'game' | 'assessment'

interface LearningProgressPanelProps {
    activityType: ActivityType
    topic: string
    performance?: {
        score?: number
        time?: number
        visitedSteps?: number
        errors?: number
    }
    isOpen: boolean
    onClose: () => void
}

type BloomLevel = 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create'

interface BloomConfig {
    level: BloomLevel
    color: string
    description: string
    nextAction: string
    icon: any
}

const BLOOM_LEVELS: Record<BloomLevel, BloomConfig> = {
    'Remember': {
        level: 'Remember',
        color: '#22C55E', // Green
        description: "You can recall basic facts and concepts.",
        nextAction: "Try connecting these concepts in the Visualizer.",
        icon: Brain
    },
    'Understand': {
        level: 'Understand',
        color: '#3B82F6', // Blue
        description: "You can explain ideas or concepts in your own words.",
        nextAction: "Apply your knowledge in the Game Mode.",
        icon: BookOpen
    },
    'Apply': {
        level: 'Apply',
        color: '#8B5CF6', // Purple
        description: "You can use information in new situations.",
        nextAction: "Test your analytical skills in the Quiz.",
        icon: Target
    },
    'Analyze': {
        level: 'Analyze',
        color: '#F59E0B', // Amber
        description: "You can draw connections among ideas.",
        nextAction: "Evaluate complex scenarios in Assessments.",
        icon: Activity
    },
    'Evaluate': {
        level: 'Evaluate',
        color: '#EF4444', // Red
        description: "You can justify a stand or decision.",
        nextAction: "Create your own scenarios or detailed notes.",
        icon: Shield
    },
    'Create': {
        level: 'Create',
        color: '#EC4899', // Pink
        description: "You can produce new or original work.",
        nextAction: "Teach this topic to someone else!",
        icon: Lightbulb
    }
}

export function LearningProgressPanel({
    activityType,
    topic,
    performance,
    isOpen,
    onClose
}: LearningProgressPanelProps) {
    const [currentLevel, setCurrentLevel] = useState<BloomConfig>(BLOOM_LEVELS['Remember'])
    const [misconception, setMisconception] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) return

        // 1. Determine Bloom Level based on Activity & Performance
        let level: BloomLevel = 'Remember'

        switch (activityType) {
            case 'visualizer':
                // Visualizer completion implies Understanding
                level = 'Understand'
                break
            case 'game':
                // Game completion implies Application
                level = 'Apply'
                break
            case 'assessment':
                // Assessment performance determines deeper levels
                const score = performance?.score || 0
                if (score > 85) level = 'Evaluate'
                else if (score > 60) level = 'Analyze'
                else level = 'Apply'
                break
        }
        setCurrentLevel(BLOOM_LEVELS[level])

        // 2. Identify Misconceptions (Rule-based)
        let foundMisconception: string | null = null

        if (activityType === 'visualizer') {
            // Example rule: If they rushed through steps? (Not tracked yet, using generic for now)
            // In a real scenario we'd check `time` vs expected time
        } else if (activityType === 'game') {
            if (performance?.errors && performance.errors > 2) {
                foundMisconception = "You might be confusing the sequence of 'Fetch' and 'Decode'. The Instruction must be loaded (Fetch) before it can be interpreted (Decode)."
            }
        } else if (activityType === 'assessment') {
            if (performance?.score !== undefined && performance.score < 50) {
                foundMisconception = "It seems identifying the role of the Control Unit is tricky. Remember: The CU coordinates actions; it doesn't process data itself (that's the ALU)."
            }
        }

        setMisconception(foundMisconception)

    }, [activityType, performance, isOpen])

    const Icon = currentLevel.icon

    if (isOpen) {
        return (
            <>
                <div className="fixed top-0 left-0 w-64 h-32 z-[99999] bg-red-600 text-white font-bold p-4 pointer-events-none">
                    DEBUG: COMPONENT OPEN
                    Level: {currentLevel.level}
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                    <DialogContent className="sm:max-w-[600px] border-2 shadow-2xl overflow-hidden"
                        style={{ borderColor: currentLevel.color }}>

                        {/* Decorative background glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                            style={{ backgroundColor: currentLevel.color }} />

                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${currentLevel.color}20` }}>
                                    <Icon className="w-6 h-6" style={{ color: currentLevel.color }} />
                                </div>
                                <div className="text-left">
                                    <DialogTitle className="text-xl">Learning Progress</DialogTitle>
                                    <DialogDescription>Topic: {topic}</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6 pt-2">
                            {/* Bloom Level Indicator */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Current Taxonomy Level</span>
                                    <Badge variant="outline" style={{
                                        borderColor: currentLevel.color,
                                        color: currentLevel.color,
                                        backgroundColor: `${currentLevel.color}10`
                                    }}>
                                        {currentLevel.level}
                                    </Badge>
                                </div>

                                <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${(['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].indexOf(currentLevel.level) + 1) / 6 * 100}%`,
                                            backgroundColor: currentLevel.color
                                        }} />
                                </div>

                                <p className="text-sm font-medium leading-relaxed">
                                    {currentLevel.description}
                                </p>
                            </div>

                            {/* Misconception Alert */}
                            {misconception && (
                                <div className="p-3 rounded-lg border bg-destructive/5 border-destructive/20 flex gap-3 items-start">
                                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-destructive uppercase tracking-wide">Identified Misconception</p>
                                        <p className="text-sm text-foreground/90">{misconception}</p>
                                    </div>
                                </div>
                            )}

                            {/* Next Action */}
                            <div className="bg-secondary/50 p-4 rounded-xl flex items-center justify-between gap-4 border border-border/50">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Suggested Next Step</p>
                                    <p className="text-sm font-medium">{currentLevel.nextAction}</p>
                                </div>
                                <Button size="sm" onClick={onClose} style={{ backgroundColor: currentLevel.color }}>
                                    Continue <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    return null
}
