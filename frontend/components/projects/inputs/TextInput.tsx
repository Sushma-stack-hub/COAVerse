"use client"

// ============================================================================
// TEXT INPUT
// Free-form text input for reflection/summary stages
// ============================================================================

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import type { TextConfig } from "@/lib/project-schema"

interface TextInputProps {
    config: TextConfig
    value?: string
    onChange: (value: string) => void
    themeColor?: string
}

export function TextInput({
    config,
    value = "",
    onChange,
    themeColor = "#8B7CFF"
}: TextInputProps) {
    const [charCount, setCharCount] = useState(value.length)

    useEffect(() => {
        setCharCount(value.length)
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value

        // Enforce max length
        if (config.maxLength && newValue.length > config.maxLength) {
            return
        }

        onChange(newValue)
    }

    // Determine character count color
    const getCharCountColor = () => {
        if (config.minLength && charCount < config.minLength) {
            return "text-amber-500"
        }
        if (config.maxLength && charCount >= config.maxLength * 0.9) {
            return "text-red-500"
        }
        return "text-muted-foreground"
    }

    // Check for required keywords
    const getMissingKeywords = () => {
        if (!config.requiredKeywords) return []
        return config.requiredKeywords.filter(
            kw => !value.toLowerCase().includes(kw.toLowerCase())
        )
    }

    const missingKeywords = getMissingKeywords()

    return (
        <div className="space-y-4">
            <Textarea
                value={value}
                onChange={handleChange}
                placeholder={config.placeholder}
                className="min-h-[150px] resize-y border-2 focus:border-current transition-colors"
                style={{
                    borderColor: `${themeColor}30`,
                }}
            />

            {/* Character count and requirements */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                    {config.requiredKeywords && config.requiredKeywords.length > 0 && (
                        <div className="text-xs">
                            <span className="text-muted-foreground">Suggested concepts: </span>
                            {config.requiredKeywords.map((kw, i) => {
                                const isPresent = value.toLowerCase().includes(kw.toLowerCase())
                                return (
                                    <span key={kw}>
                                        <span className={isPresent ? "text-green-500" : "text-muted-foreground/60"}>
                                            {kw}
                                        </span>
                                        {i < config.requiredKeywords!.length - 1 && ", "}
                                    </span>
                                )
                            })}
                        </div>
                    )}

                    {missingKeywords.length > 0 && charCount > 0 && (
                        <p className="text-xs text-amber-500">
                            Consider mentioning: {missingKeywords.slice(0, 3).join(", ")}
                        </p>
                    )}
                </div>

                <div className={`text-xs ${getCharCountColor()}`}>
                    {charCount}
                    {config.minLength && ` / ${config.minLength} min`}
                    {config.maxLength && ` / ${config.maxLength} max`}
                </div>
            </div>
        </div>
    )
}
