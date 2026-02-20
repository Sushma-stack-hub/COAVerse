"use client"

// ============================================================================
// SEQUENCE BUILDER
// Drag-and-drop ordered step operations
// ============================================================================

import { useState } from "react"
import { GripVertical, ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SequenceConfig } from "@/lib/project-schema"

interface SequenceBuilderProps {
    config: SequenceConfig
    value?: string[]
    onChange: (value: string[]) => void
    themeColor?: string
}

export function SequenceBuilder({
    config,
    value = [],
    onChange,
    themeColor = "#8B7CFF"
}: SequenceBuilderProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

    // Get available steps (not yet in sequence)
    const availableSteps = config.availableSteps.filter(
        step => !value.includes(step.id)
    )

    // Add step to sequence
    const handleAddStep = (stepId: string) => {
        onChange([...value, stepId])
    }

    // Remove step from sequence
    const handleRemoveStep = (index: number) => {
        const newValue = [...value]
        newValue.splice(index, 1)
        onChange(newValue)
    }

    // Move step up
    const handleMoveUp = (index: number) => {
        if (index === 0) return
        const newValue = [...value]
            ;[newValue[index - 1], newValue[index]] = [newValue[index], newValue[index - 1]]
        onChange(newValue)
    }

    // Move step down
    const handleMoveDown = (index: number) => {
        if (index >= value.length - 1) return
        const newValue = [...value]
            ;[newValue[index], newValue[index + 1]] = [newValue[index + 1], newValue[index]]
        onChange(newValue)
    }

    // Drag handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return
    }

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === targetIndex) return

        const newValue = [...value]
        const [removed] = newValue.splice(draggedIndex, 1)
        newValue.splice(targetIndex, 0, removed)
        onChange(newValue)
        setDraggedIndex(null)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
    }

    const getStepLabel = (stepId: string) => {
        return config.availableSteps.find(s => s.id === stepId)?.label || stepId
    }

    const getStepDescription = (stepId: string) => {
        return config.availableSteps.find(s => s.id === stepId)?.description || ""
    }

    return (
        <div className="space-y-6">
            {/* Current sequence */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">Your Sequence:</h4>

                {value.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-border/50 rounded-lg text-center text-muted-foreground">
                        Add steps from below to build your sequence
                    </div>
                ) : (
                    <div className="space-y-2">
                        {value.map((stepId, index) => (
                            <div
                                key={`${stepId}-${index}`}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border-2 bg-card transition-all duration-200",
                                    draggedIndex === index && "opacity-50 border-dashed"
                                )}
                                style={{ borderColor: `${themeColor}30` }}
                            >
                                {/* Drag handle */}
                                <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                                    <GripVertical className="h-5 w-5" />
                                </div>

                                {/* Step number */}
                                <div
                                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    {index + 1}
                                </div>

                                {/* Step info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{getStepLabel(stepId)}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {getStepDescription(stepId)}
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleMoveUp(index)}
                                        disabled={index === 0}
                                        className="h-8 w-8"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleMoveDown(index)}
                                        disabled={index >= value.length - 1}
                                        className="h-8 w-8"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveStep(index)}
                                        className="h-8 w-8 hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available steps */}
            {availableSteps.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Available Steps:</h4>

                    <div className="grid gap-2 sm:grid-cols-2">
                        {availableSteps.map(step => (
                            <button
                                key={step.id}
                                onClick={() => handleAddStep(step.id)}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 text-left transition-colors"
                            >
                                <Plus className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{step.label}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {step.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Drag to reorder or use arrow buttons. Steps added: {value.length} / {config.availableSteps.length}
            </p>
        </div>
    )
}
