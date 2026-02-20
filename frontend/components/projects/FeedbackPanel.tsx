"use client"

// ============================================================================
// FEEDBACK PANEL
// Right panel - hints, validation results, and progress info
// ============================================================================

import { useState } from "react"
import {
    Lightbulb,
    AlertCircle,
    CheckCircle,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Target,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useProject } from "@/lib/project-state"

interface FeedbackPanelProps {
    themeColor?: string
}

export function FeedbackPanel({ themeColor = "#8B7CFF" }: FeedbackPanelProps) {
    const { state, getCurrentStage, getStageState, revealHint } = useProject()
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["validation"]))

    const currentStage = getCurrentStage()
    const stageState = currentStage ? getStageState(currentStage.id) : null

    const toggleSection = (section: string) => {
        const newSet = new Set(expandedSections)
        if (newSet.has(section)) {
            newSet.delete(section)
        } else {
            newSet.add(section)
        }
        setExpandedSections(newSet)
    }

    if (!currentStage || !state.activeProject) {
        return (
            <div className="p-4">
                <p className="text-muted-foreground text-sm text-center">
                    Select a project to begin
                </p>
            </div>
        )
    }

    const validationResult = state.currentValidation
    const hasErrors = validationResult && !validationResult.passed
    const isPassed = validationResult?.passed

    // Determine which hints are available
    const availableHints = currentStage.hints.filter(hint => {
        if (stageState?.hintsRevealed.includes(hint.id)) return true
        if (hint.revealCondition === "on-request") return true
        if (hint.revealCondition === "on-error" && hasErrors) return true
        if (hint.revealCondition === "after-attempts" &&
            stageState &&
            stageState.attempts >= (hint.attemptsRequired || 1)) return true
        return false
    })

    const handleRevealHint = (hintId: string) => {
        if (currentStage) {
            revealHint(currentStage.id, hintId)
        }
    }

    return (
        <div className="p-4 space-y-4">
            {/* Stage Progress */}
            <Card className="border-border/30">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4" style={{ color: themeColor }} />
                        Current Stage
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Est. time:</span>
                        <span>{currentStage.estimatedMinutes || 5} min</span>
                    </div>

                    {stageState && stageState.attempts > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <span className="text-muted-foreground">Attempts:</span>
                            <span>{stageState.attempts}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Validation Feedback */}
            <Card className={cn(
                "border-border/30 transition-colors",
                hasErrors && "border-red-500/30 bg-red-500/5",
                isPassed && "border-green-500/30 bg-green-500/5"
            )}>
                <button
                    className="w-full"
                    onClick={() => toggleSection("validation")}
                >
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            {isPassed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : hasErrors ? (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            Validation
                        </CardTitle>
                        {expandedSections.has("validation") ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </CardHeader>
                </button>

                {expandedSections.has("validation") && (
                    <CardContent className="pt-0 space-y-3">
                        {!validationResult && (
                            <p className="text-sm text-muted-foreground">
                                Complete the activity and click "Validate" to check your work.
                            </p>
                        )}

                        {isPassed && (
                            <div className="space-y-2">
                                <p className="text-sm text-green-500 font-medium">
                                    ✓ {currentStage.successMessage}
                                </p>
                                {validationResult.score !== undefined && (
                                    <p className="text-xs text-muted-foreground">
                                        Score: {validationResult.score}%
                                    </p>
                                )}
                            </div>
                        )}

                        {hasErrors && validationResult.errors.map((error, index) => (
                            <div key={index} className="space-y-1">
                                <p className="text-sm text-red-400 font-medium">
                                    {error.message}
                                </p>
                                {error.hint && (
                                    <p className="text-xs text-muted-foreground pl-2 border-l-2 border-red-500/30">
                                        💡 {error.hint}
                                    </p>
                                )}
                                {error.details && (
                                    <p className="text-xs text-muted-foreground italic">
                                        {error.details}
                                    </p>
                                )}
                            </div>
                        ))}

                        {hasErrors && validationResult.violatedConstraints.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/30">
                                <p className="text-xs text-amber-500 font-medium mb-1">
                                    Constraints violated:
                                </p>
                                <ul className="list-disc list-inside text-xs text-muted-foreground">
                                    {validationResult.violatedConstraints.map((c, i) => (
                                        <li key={i}>{c}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Hints Section */}
            <Card className="border-border/30">
                <button
                    className="w-full"
                    onClick={() => toggleSection("hints")}
                >
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            Hints
                            {availableHints.length > 0 && (
                                <span
                                    className="text-xs px-1.5 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: `${themeColor}20`,
                                        color: themeColor
                                    }}
                                >
                                    {availableHints.length}
                                </span>
                            )}
                        </CardTitle>
                        {expandedSections.has("hints") ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </CardHeader>
                </button>

                {expandedSections.has("hints") && (
                    <CardContent className="pt-0 space-y-3">
                        {availableHints.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No hints available yet. Try submitting an answer first.
                            </p>
                        ) : (
                            availableHints.map((hint, index) => {
                                const isRevealed = stageState?.hintsRevealed.includes(hint.id)

                                return (
                                    <div
                                        key={hint.id}
                                        className="p-3 rounded-lg bg-muted/30 border border-border/30"
                                    >
                                        {isRevealed ? (
                                            <p className="text-sm">
                                                <span className="text-amber-500 font-medium mr-2">
                                                    Hint {index + 1}:
                                                </span>
                                                {hint.text}
                                            </p>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRevealHint(hint.id)}
                                                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                                            >
                                                <Lightbulb className="h-4 w-4" />
                                                Reveal Hint {index + 1}
                                            </Button>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Project Info */}
            <Card className="border-border/30">
                <button
                    className="w-full"
                    onClick={() => toggleSection("info")}
                >
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">Project Info</CardTitle>
                        {expandedSections.has("info") ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </CardHeader>
                </button>

                {expandedSections.has("info") && (
                    <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">
                            {state.activeProject.introduction.problemStatement}
                        </p>

                        {state.activeProject.constraints.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/30">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Project Constraints:
                                </p>
                                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                    {state.activeProject.constraints.map(c => (
                                        <li key={c.id}>{c.description}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
