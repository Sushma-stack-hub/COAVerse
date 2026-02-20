"use client"

// ============================================================================
// COMPONENT SELECTOR
// Multi-select input via toggles, dropdowns, or blocks
// ============================================================================

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SelectionConfig } from "@/lib/project-schema"

interface ComponentSelectorProps {
    config: SelectionConfig
    value?: string[]
    onChange: (value: string[]) => void
    themeColor?: string
}

export function ComponentSelector({
    config,
    value,
    onChange,
    themeColor = "#8B7CFF"
}: ComponentSelectorProps) {
    // Handle null/undefined value - state may pass null initially
    const selections = value ?? []

    const handleToggle = (optionId: string) => {
        const newValue = selections.includes(optionId)
            ? selections.filter(id => id !== optionId)
            : [...selections, optionId]

        // Enforce max selections
        if (newValue.length <= config.maxSelections) {
            onChange(newValue)
        }
    }

    if (config.layout === "toggles") {
        return (
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Select {config.minSelections} to {config.maxSelections} options:
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                    {config.options.map(option => {
                        const isSelected = selections.includes(option.id)

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleToggle(option.id)}
                                className={cn(
                                    "relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left",
                                    isSelected
                                        ? "border-current bg-current/10"
                                        : "border-border/50 hover:border-border bg-card/50 hover:bg-card"
                                )}
                                style={isSelected ? {
                                    borderColor: themeColor,
                                    backgroundColor: `${themeColor}15`,
                                } : undefined}
                            >
                                {/* Checkbox indicator */}
                                <div
                                    className={cn(
                                        "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                        isSelected ? "text-white" : "border-muted-foreground/30"
                                    )}
                                    style={isSelected ? {
                                        backgroundColor: themeColor,
                                        borderColor: themeColor,
                                    } : undefined}
                                >
                                    {isSelected && <Check className="h-3 w-3" />}
                                </div>

                                <div>
                                    <div
                                        className={cn(
                                            "font-medium",
                                            isSelected && "font-semibold"
                                        )}
                                        style={isSelected ? { color: themeColor } : undefined}
                                    >
                                        {option.label}
                                    </div>
                                    {option.description && (
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {option.description}
                                        </div>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>

                <p className="text-xs text-muted-foreground">
                    Selected: {selections.length} / {config.maxSelections}
                </p>
            </div>
        )
    }

    // Dropdown layout
    if (config.layout === "dropdown") {
        return (
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Select options from the list:
                </p>

                <div className="space-y-2">
                    {config.options.map(option => {
                        const isSelected = selections.includes(option.id)

                        return (
                            <label
                                key={option.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-muted/30 cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggle(option.id)}
                                    className="sr-only"
                                />
                                <div
                                    className={cn(
                                        "w-4 h-4 rounded border-2 flex items-center justify-center",
                                        isSelected && "text-white"
                                    )}
                                    style={isSelected ? {
                                        backgroundColor: themeColor,
                                        borderColor: themeColor,
                                    } : {
                                        borderColor: "currentColor",
                                        opacity: 0.3,
                                    }}
                                >
                                    {isSelected && <Check className="h-2.5 w-2.5" />}
                                </div>

                                <div className="flex-1">
                                    <span className="font-medium">{option.label}</span>
                                    {option.description && (
                                        <span className="text-sm text-muted-foreground ml-2">
                                            — {option.description}
                                        </span>
                                    )}
                                </div>
                            </label>
                        )
                    })}
                </div>
            </div>
        )
    }

    // Blocks layout (visual blocks)
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Click to select/deselect:
            </p>

            <div className="flex flex-wrap gap-2">
                {config.options.map(option => {
                    const isSelected = selections.includes(option.id)

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleToggle(option.id)}
                            className={cn(
                                "px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200",
                                isSelected
                                    ? "text-white"
                                    : "border-border/50 hover:border-border"
                            )}
                            style={isSelected ? {
                                backgroundColor: themeColor,
                                borderColor: themeColor,
                            } : undefined}
                        >
                            {option.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
