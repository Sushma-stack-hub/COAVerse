"use client"

// ============================================================================
// CODE EDITOR
// Simple code input with line numbers and syntax highlighting hints
// ============================================================================

import { useEffect, useRef, useState } from "react"
import { Copy, Check, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CodeConfig } from "@/lib/project-schema"

interface CodeEditorProps {
    config: CodeConfig
    value?: string
    onChange: (value: string) => void
    themeColor?: string
}

export function CodeEditor({
    config,
    value,
    onChange,
    themeColor = "#8B7CFF"
}: CodeEditorProps) {
    const [copied, setCopied] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Initialize with template
    const currentValue = value ?? config.template ?? ""

    // Calculate line numbers
    const lines = currentValue.split("\n")
    const lineCount = lines.length

    // Handle copy
    const handleCopy = async () => {
        await navigator.clipboard.writeText(currentValue)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Handle reset
    const handleReset = () => {
        onChange(config.template ?? "")
    }

    // Handle tab key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Tab") {
            e.preventDefault()
            const textarea = e.currentTarget
            const start = textarea.selectionStart
            const end = textarea.selectionEnd

            const newValue = currentValue.substring(0, start) + "    " + currentValue.substring(end)
            onChange(newValue)

            // Set cursor position after tab
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 4
            }, 0)
        }
    }

    // Sync scroll between line numbers and textarea
    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        const lineNumbers = document.getElementById("line-numbers")
        if (lineNumbers) {
            lineNumbers.scrollTop = e.currentTarget.scrollTop
        }
    }

    const getLanguageLabel = () => {
        switch (config.language) {
            case "python": return "Python"
            case "pseudo": return "Pseudo-code"
            case "logic": return "Logic Expression"
            case "assembly": return "Assembly"
            default: return "Code"
        }
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div
                    className="px-3 py-1 rounded-md text-sm font-medium"
                    style={{
                        backgroundColor: `${themeColor}20`,
                        color: themeColor
                    }}
                >
                    {getLanguageLabel()}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="gap-1 text-muted-foreground hover:text-foreground"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="gap-1 text-muted-foreground hover:text-foreground"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3.5 w-3.5 text-green-500" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <div
                className="relative rounded-lg border-2 bg-[#1a1a2e] overflow-hidden font-mono text-sm"
                style={{ borderColor: `${themeColor}30` }}
            >
                <div className="flex">
                    {/* Line numbers */}
                    <div
                        id="line-numbers"
                        className="flex-shrink-0 py-4 px-3 text-right text-muted-foreground/50 select-none overflow-hidden bg-[#12121f]"
                        style={{ minWidth: "3rem" }}
                    >
                        {Array.from({ length: lineCount }, (_, i) => (
                            <div key={i} className="leading-6">
                                {i + 1}
                            </div>
                        ))}
                    </div>

                    {/* Code textarea */}
                    <textarea
                        ref={textareaRef}
                        value={currentValue}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onScroll={handleScroll}
                        spellCheck={false}
                        className="flex-1 py-4 px-4 bg-transparent text-gray-100 resize-none outline-none leading-6"
                        style={{
                            minHeight: Math.max(200, lineCount * 24 + 32),
                            fontFamily: "'Geist Mono', 'Fira Code', 'Monaco', monospace",
                        }}
                        placeholder="Write your code here..."
                    />
                </div>
            </div>

            {/* Help text */}
            <div className="text-xs text-muted-foreground space-y-1">
                <p>• Press Tab to indent</p>
                {config.language === "python" && (
                    <p>• Use proper Python indentation (4 spaces)</p>
                )}
                {config.expectedPatterns && config.expectedPatterns.length > 0 && (
                    <p>• Your code will be checked for required patterns</p>
                )}
            </div>
        </div>
    )
}
