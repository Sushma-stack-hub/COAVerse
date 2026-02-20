"use client"

import { useState, FormEvent } from "react"
import { Sparkles, Send, Loader2, CheckCircle2, AlertCircle, Accessibility, Video, X } from "lucide-react"
import { resolveVideoFromPrompt, VideoResolverResult } from "@/lib/video-resolver"

type VideoFormat = 'standard' | 'sign-language'

// Sign language video configuration - ONLY for Block diagram topic
const SIGN_LANGUAGE_CONFIG = {
    supportedTopic: "Block diagram of digital computer",
    cloudName: "dsh27hhgj",
    publicId: "block_diagram_signlanguage",
    embedUrl: "https://player.cloudinary.com/embed/?cloud_name=dsh27hhgj&public_id=block_diagram_signlanguage&profile=cld-default",
    title: "Block Diagram of Digital Computer – Sign Language"
}

interface AIVideoInputProps {
    onVideoResolved?: (result: VideoResolverResult | null, isNoMatch: boolean, format: VideoFormat) => void
    color?: string
    currentTopic?: string  // Required to scope sign language to specific topic
}

/**
 * AI Video Generator Component
 * 
 * A stylized input for generating educational videos based on prompts.
 * Supports separate standard and sign language video generation.
 */
export function AIVideoInput({ onVideoResolved, color, currentTopic }: AIVideoInputProps) {
    // Check if current topic supports sign language video
    const supportsSignLanguage = currentTopic === SIGN_LANGUAGE_CONFIG.supportedTopic
    const [prompt, setPrompt] = useState("")
    const [showFormatPanel, setShowFormatPanel] = useState(false)
    const [selectedFormat, setSelectedFormat] = useState<VideoFormat | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationStage, setGenerationStage] = useState<string>("")
    const [result, setResult] = useState<VideoResolverResult | null>(null)
    const [noMatch, setNoMatch] = useState(false)

    const primaryColor = color || "hsl(var(--primary))"

    const handleOpenFormatPanel = (e: FormEvent) => {
        e.preventDefault()
        if (!prompt.trim() || isGenerating) return
        setShowFormatPanel(true)
        setSelectedFormat(null)
    }

    const handleGenerateVideo = () => {
        if (!selectedFormat || !prompt.trim()) return

        setShowFormatPanel(false)
        setIsGenerating(true)
        setNoMatch(false)
        setResult(null)

        // SIGN LANGUAGE: Direct load for Block diagram topic
        if (selectedFormat === 'sign-language' && supportsSignLanguage) {
            // Show brief loading animation then load pre-existing Cloudinary video
            const stages = [
                "Loading sign language video...",
                "Preparing accessibility content...",
                "Ready to play..."
            ]
            let stageIndex = 0
            setGenerationStage(stages[0])

            const stageInterval = setInterval(() => {
                stageIndex++
                if (stageIndex < stages.length) {
                    setGenerationStage(stages[stageIndex])
                }
            }, 400)

            // Quick load for pre-existing video
            setTimeout(() => {
                clearInterval(stageInterval)
                // Create a result that uses the Cloudinary embed
                const signLanguageResult: VideoResolverResult = {
                    success: true,
                    topic_id: "block-diagram-of-digital-computer",
                    title: SIGN_LANGUAGE_CONFIG.title,
                    video_url: SIGN_LANGUAGE_CONFIG.embedUrl,
                    matched_alias: "block diagram sign language",
                    confidence: 1,
                    is_fallback: false
                }
                setResult(signLanguageResult)
                setNoMatch(false)
                setIsGenerating(false)
                setGenerationStage("")

                if (onVideoResolved) {
                    onVideoResolved(signLanguageResult, false, selectedFormat)
                }
            }, 1200)
            return
        }

        // Standard video generation flow
        const stages = [
            "Analyzing your prompt...",
            "Generating script and scenes...",
            "Creating visual elements...",
            "Rendering narration...",
            "Finalizing video..."
        ]

        let stageIndex = 0
        setGenerationStage(stages[0])

        const stageInterval = setInterval(() => {
            stageIndex++
            if (stageIndex < stages.length) {
                setGenerationStage(stages[stageIndex])
            }
        }, 600)

        // Simulate generation completion
        setTimeout(() => {
            clearInterval(stageInterval)
            const resolved = resolveVideoFromPrompt(prompt)

            const isNoMatch = resolved.is_fallback && resolved.matched_alias === null && resolved.confidence === 0

            setResult(resolved)
            setNoMatch(isNoMatch)
            setIsGenerating(false)
            setGenerationStage("")

            if (onVideoResolved) {
                onVideoResolved(isNoMatch ? null : resolved, isNoMatch, selectedFormat)
            }
        }, 3000)
    }

    return (
        <div className="space-y-4">
            {/* Input Form */}
            <form onSubmit={handleOpenFormatPanel} className="flex gap-2">
                <div className="relative flex-1">
                    <Sparkles
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                        style={{ color: primaryColor }}
                    />
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe what you want explained (e.g., 'Explain block diagram step by step')"
                        className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{
                            // @ts-ignore
                            '--tw-ring-color': primaryColor
                        }}
                        disabled={isGenerating}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!prompt.trim() || isGenerating}
                    className="px-5 py-3 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                >
                    {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Video className="h-4 w-4" />
                    )}
                    <span>
                        {isGenerating ? "Generating..." : "Generate Video"}
                    </span>
                </button>
            </form>

            {/* Format Selection Panel */}
            {showFormatPanel && (
                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: `${primaryColor}40`
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-sm">Choose Video Format</h4>
                        <button
                            onClick={() => setShowFormatPanel(false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Standard Video Option */}
                        <button
                            type="button"
                            onClick={() => setSelectedFormat('standard')}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedFormat === 'standard'
                                ? 'border-solid'
                                : 'border-dashed border-muted hover:border-muted-foreground'
                                }`}
                            style={selectedFormat === 'standard' ? {
                                borderColor: primaryColor,
                                backgroundColor: `${primaryColor}10`
                            } : undefined}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                        backgroundColor: selectedFormat === 'standard' ? `${primaryColor}20` : 'rgba(255,255,255,0.05)'
                                    }}
                                >
                                    <Video
                                        className="h-5 w-5"
                                        style={{ color: selectedFormat === 'standard' ? primaryColor : 'var(--muted-foreground)' }}
                                    />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Standard Concept Video</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        AI-generated explanatory video with visuals and narration
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Sign Language Video Option - ONLY for Block diagram topic */}
                        {supportsSignLanguage && (
                            <button
                                type="button"
                                onClick={() => setSelectedFormat('sign-language')}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedFormat === 'sign-language'
                                    ? 'border-solid'
                                    : 'border-dashed border-muted hover:border-muted-foreground'
                                    }`}
                                style={selectedFormat === 'sign-language' ? {
                                    borderColor: '#22C55E',
                                    backgroundColor: 'rgba(34, 197, 94, 0.1)'
                                } : undefined}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                                        style={{
                                            backgroundColor: selectedFormat === 'sign-language' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        <Accessibility
                                            className="h-5 w-5"
                                            style={{ color: selectedFormat === 'sign-language' ? '#22C55E' : 'var(--muted-foreground)' }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">Sign Language Video (Accessibility)</p>
                                            <span
                                                className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                                                style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22C55E' }}
                                            >
                                                Available
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Pre-recorded video with sign language interpretation
                                        </p>
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerateVideo}
                        disabled={!selectedFormat}
                        className="w-full mt-4 px-4 py-3 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ backgroundColor: selectedFormat ? primaryColor : 'var(--muted)' }}
                    >
                        <Video className="h-4 w-4" />
                        Generate Selected Video
                    </button>
                </div>
            )}

            {/* Generation Progress State */}
            {isGenerating && (
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-3 mb-3">
                        <Loader2 className="h-5 w-5 animate-spin" style={{ color: primaryColor }} />
                        <div>
                            <p className="font-medium">
                                Generating {selectedFormat === 'sign-language' ? 'Sign Language' : 'Standard'} Video…
                            </p>
                            <p className="text-sm text-muted-foreground">{generationStage}</p>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                backgroundColor: selectedFormat === 'sign-language' ? '#22C55E' : primaryColor,
                                width: '60%',
                                animation: 'progressPulse 2s ease-in-out infinite'
                            }}
                        />
                    </div>
                    <style>{`
                        @keyframes progressPulse {
                            0%, 100% { width: 30%; }
                            50% { width: 80%; }
                        }
                    `}</style>
                </div>
            )}

            {/* Success Result */}
            {result && !isGenerating && !noMatch && (
                <div
                    className="flex items-start gap-3 p-4 rounded-lg border"
                    style={{
                        backgroundColor: selectedFormat === 'sign-language' ? 'rgba(34, 197, 94, 0.1)' : `${primaryColor}10`,
                        borderColor: selectedFormat === 'sign-language' ? 'rgba(34, 197, 94, 0.4)' : `${primaryColor}40`
                    }}
                >
                    <CheckCircle2
                        className="h-5 w-5 mt-0.5 shrink-0"
                        style={{ color: selectedFormat === 'sign-language' ? '#22C55E' : primaryColor }}
                    />
                    <div>
                        <p className="font-medium" style={{ color: selectedFormat === 'sign-language' ? '#22C55E' : primaryColor }}>
                            {selectedFormat === 'sign-language' ? 'Sign Language Video Generated' : 'Video Generated'}: {result.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Ready to play
                        </p>
                    </div>
                </div>
            )}

            {/* No Match Result */}
            {noMatch && !isGenerating && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/40">
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-amber-500" />
                    <div>
                        <p className="font-medium text-amber-600 dark:text-amber-400">
                            Could not generate video for this prompt
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Try rephrasing. Supported topics: block diagram, register transfer, micro-operations, bus and memory transfer
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
