"use client"

// ============================================================================
// CONTROL & FEEDBACK PANEL
// Right panel with control signals, validation, and hints
// ============================================================================

import { useState } from "react"
import {
    Zap,
    AlertCircle,
    CheckCircle,
    Lightbulb,
    ChevronDown,
    ChevronUp,
    Cpu,
    ToggleLeft,
    ToggleRight,
    Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSimulation } from "@/lib/simulation-state"

export function ControlFeedbackPanel() {
    const {
        state,
        getCurrentStage,
        getStageState,
        toggleSignal,
        setBusOwner,
        validateCurrentStage,
        completeStage,
        revealHint
    } = useSimulation()

    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["signals", "validation"]))
    const [isValidating, setIsValidating] = useState(false)

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

    const handleValidate = async () => {
        setIsValidating(true)
        try {
            const result = await validateCurrentStage()
            if (result.passed) {
                setTimeout(() => {
                    completeStage()
                }, 1000)
            }
        } finally {
            setIsValidating(false)
        }
    }

    if (!state.project || !currentStage) {
        return (
            <div className="p-4 text-center text-gray-500">
                <p className="text-sm">Loading project...</p>
            </div>
        )
    }

    const controlSignals = state.simulation.controlSignals
    const validation = state.currentValidation
    const hasErrors = validation && !validation.passed
    const isPassed = validation?.passed

    // Group signals
    const signalGroups = controlSignals.reduce((acc, signal) => {
        const group = signal.group || "general"
        if (!acc[group]) acc[group] = []
        acc[group].push(signal)
        return acc
    }, {} as Record<string, typeof controlSignals>)

    // Available hints
    const availableHints = currentStage.hints.filter(hint => {
        if (stageState?.hintsRevealed.includes(hint.id)) return true
        if (hint.revealCondition === "on-request") return true
        if (hint.revealCondition === "on-error" && hasErrors) return true
        if (hint.revealCondition === "after-attempts" &&
            stageState &&
            stageState.attempts >= (hint.attemptsRequired || 1)) return true
        return false
    })

    return (
        <div className="p-4 space-y-4">
            {/* Control Signals Section */}
            <div className="rounded-lg border border-purple-500/20 overflow-hidden">
                <button
                    className="w-full p-3 flex items-center justify-between bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                    onClick={() => toggleSection("signals")}
                >
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-white">Control Signals</span>
                    </div>
                    {expandedSections.has("signals") ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                </button>

                {expandedSections.has("signals") && (
                    <div className="p-3 space-y-3">
                        {Object.entries(signalGroups).map(([group, signals]) => (
                            <div key={group}>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                                    {group}
                                </div>
                                <div className="space-y-1">
                                    {signals.map(signal => (
                                        <button
                                            key={signal.id}
                                            onClick={() => toggleSignal(signal.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-2 rounded-lg transition-all",
                                                signal.active
                                                    ? "bg-green-500/20 border border-green-500/30"
                                                    : "bg-gray-900/50 border border-gray-800 hover:border-gray-700"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {signal.active ? (
                                                    <ToggleRight className="h-4 w-4 text-green-400" />
                                                ) : (
                                                    <ToggleLeft className="h-4 w-4 text-gray-500" />
                                                )}
                                                <span className={cn(
                                                    "text-sm font-mono",
                                                    signal.active ? "text-green-400" : "text-gray-400"
                                                )}>
                                                    {signal.shortName}
                                                </span>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-bold",
                                                signal.active ? "text-green-400" : "text-gray-600"
                                            )}>
                                                {signal.active ? "ON" : "OFF"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {controlSignals.length === 0 && (
                            <p className="text-xs text-gray-500 text-center py-2">
                                No control signals for this stage
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Bus Arbitration */}
            {state.simulation.components.length > 0 && (
                <div className="rounded-lg border border-amber-500/20 overflow-hidden">
                    <div className="p-3 bg-amber-500/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Cpu className="h-4 w-4 text-amber-400" />
                            <span className="text-sm font-medium text-white">Bus Owner</span>
                        </div>
                        <select
                            value={state.simulation.busOwner || ""}
                            onChange={(e) => setBusOwner(e.target.value || null)}
                            className="w-full p-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-white"
                        >
                            <option value="">None (Tristate)</option>
                            {state.simulation.components.map(comp => (
                                <option key={comp.id} value={comp.id}>
                                    {comp.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Validation Section */}
            <div className={cn(
                "rounded-lg border overflow-hidden transition-colors",
                hasErrors && "border-red-500/30",
                isPassed && "border-green-500/30",
                !validation && "border-gray-800"
            )}>
                <button
                    className="w-full p-3 flex items-center justify-between bg-gray-900/50 hover:bg-gray-900/70 transition-colors"
                    onClick={() => toggleSection("validation")}
                >
                    <div className="flex items-center gap-2">
                        {isPassed ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : hasErrors ? (
                            <AlertCircle className="h-4 w-4 text-red-400" />
                        ) : (
                            <Info className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-white">Validation</span>
                    </div>
                    {expandedSections.has("validation") ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                </button>

                {expandedSections.has("validation") && (
                    <div className="p-3 space-y-3 bg-gray-950/50">
                        {!validation && (
                            <p className="text-xs text-gray-500">
                                Complete the current task and validate your work.
                            </p>
                        )}

                        {isPassed && (
                            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                <p className="text-sm text-green-400 font-medium">
                                    ✓ {currentStage.successMessage}
                                </p>
                            </div>
                        )}

                        {hasErrors && validation.errors.map((error, index) => (
                            <div key={index} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-400">{error.message}</p>
                                {error.details && (
                                    <p className="text-xs text-red-400/70 mt-1">{error.details}</p>
                                )}
                                {error.hint && (
                                    <p className="text-xs text-gray-400 mt-1 italic">💡 {error.hint}</p>
                                )}
                            </div>
                        ))}

                        <Button
                            onClick={handleValidate}
                            disabled={isValidating}
                            className={cn(
                                "w-full",
                                isPassed ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"
                            )}
                        >
                            {isValidating ? "Validating..." : isPassed ? "Continue →" : "Validate Stage"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Hints Section */}
            <div className="rounded-lg border border-amber-500/20 overflow-hidden">
                <button
                    className="w-full p-3 flex items-center justify-between bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                    onClick={() => toggleSection("hints")}
                >
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-medium text-white">Hints</span>
                        {availableHints.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">
                                {availableHints.length}
                            </span>
                        )}
                    </div>
                    {expandedSections.has("hints") ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                </button>

                {expandedSections.has("hints") && (
                    <div className="p-3 space-y-2">
                        {availableHints.length === 0 ? (
                            <p className="text-xs text-gray-500">No hints available yet.</p>
                        ) : (
                            availableHints.map((hint, index) => {
                                const isRevealed = stageState?.hintsRevealed.includes(hint.id)

                                return (
                                    <div
                                        key={hint.id}
                                        className="p-2 rounded-lg bg-gray-900/50 border border-gray-800"
                                    >
                                        {isRevealed ? (
                                            <p className="text-xs text-gray-300">
                                                <span className="text-amber-400 font-medium">Hint {index + 1}: </span>
                                                {hint.text}
                                            </p>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => revealHint(currentStage.id, hint.id)}
                                                className="w-full h-auto py-1 text-xs text-gray-500 hover:text-amber-400"
                                            >
                                                <Lightbulb className="h-3 w-3 mr-1" />
                                                Reveal Hint {index + 1}
                                            </Button>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Stage attempts info */}
            {stageState && stageState.attempts > 0 && (
                <div className="text-xs text-gray-500 text-center">
                    Attempts: {stageState.attempts}
                </div>
            )}
        </div>
    )
}
