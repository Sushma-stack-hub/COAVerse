"use client"

import { useState, useCallback } from "react"
import {
    resolveVideoFromPrompt,
    VideoResolverResult,
    getVideoByTopicId
} from "@/lib/video-resolver"

/**
 * React hook for video prompt resolution
 * 
 * Wraps the video resolver for easy component integration.
 * - Accepts natural language prompts
 * - Returns resolved video with state management
 * - Never throws errors - always returns a valid video (fallback if needed)
 */
export function useVideoResolver() {
    const [result, setResult] = useState<VideoResolverResult | null>(null)
    const [isResolving, setIsResolving] = useState(false)
    const [lastPrompt, setLastPrompt] = useState("")

    /**
     * Resolve a natural language prompt to a video
     */
    const resolve = useCallback((prompt: string) => {
        setIsResolving(true)
        setLastPrompt(prompt)

        // Simulate brief "AI thinking" delay for UX
        setTimeout(() => {
            const resolved = resolveVideoFromPrompt(prompt)
            setResult(resolved)
            setIsResolving(false)
        }, 300)
    }, [])

    /**
     * Resolve directly by topic ID (for programmatic use)
     */
    const resolveByTopicId = useCallback((topicId: string) => {
        const video = getVideoByTopicId(topicId)
        setResult({
            success: true,
            topic_id: video.topic_id,
            title: video.title,
            video_url: video.video_url,
            matched_alias: null,
            confidence: 1.0,
            is_fallback: video.topic_id === "introductory_video"
        })
    }, [])

    /**
     * Clear the current resolution
     */
    const clear = useCallback(() => {
        setResult(null)
        setLastPrompt("")
    }, [])

    return {
        // State
        result,
        isResolving,
        lastPrompt,

        // Derived state
        hasResult: result !== null,
        isFallback: result?.is_fallback ?? false,
        videoUrl: result?.video_url ?? null,
        videoTitle: result?.title ?? null,

        // Actions
        resolve,
        resolveByTopicId,
        clear
    }
}

export type UseVideoResolverReturn = ReturnType<typeof useVideoResolver>
