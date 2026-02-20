"use client"

// ============================================================================
// INTRODUCTION MODULE
// Media-first introduction with embedded video and structured content
// Future-ready for interactive overlays and 3D/XR expansions
// ============================================================================

import { useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, Eye, Wrench, CheckCircle2, Rocket, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

// ============================================================================
// CONFIGURATION
// ============================================================================

const INTRO_VIDEO_URL = "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-block-diagram-digital-computer.mp4"

const PLATFORM_FEATURES = [
    {
        icon: Eye,
        title: "Learn Concepts Visually",
        description: "Interactive diagrams and 3D simulations bring abstract ideas to life",
        color: "#C084FC", // purple
    },
    {
        icon: Wrench,
        title: "Build Systems Step-by-Step",
        description: "Guided projects let you construct real architectures from the ground up",
        color: "#22D3EE", // cyan
    },
    {
        icon: CheckCircle2,
        title: "Validate Logic at Each Stage",
        description: "Instant feedback ensures you understand before moving forward",
        color: "#34D399", // green
    },
    {
        icon: Rocket,
        title: "Apply Through Guided Projects",
        description: "Hands-on engineering challenges reinforce and test your knowledge",
        color: "#F59E0B", // amber
    },
]

// ============================================================================
// VIDEO PLAYER COMPONENT
// ============================================================================

interface VideoPlayerProps {
    videoUrl: string
    // Future extensibility hooks
    onOverlayRequest?: () => void
}

function VideoPlayer({ videoUrl }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [showControls, setShowControls] = useState(true)

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    return (
        <div
            className="relative w-full aspect-video rounded-2xl overflow-hidden group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => !isPlaying && setShowControls(true)}
        >
            {/* Grid background pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

            {/* Border glow */}
            <div className="absolute inset-0 rounded-2xl border border-purple-500/30 pointer-events-none" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 blur-xl opacity-50 -z-10" />

            {/* Video element */}
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                preload="metadata"
                poster=""
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Play button overlay (shown when not playing) */}
            {!isPlaying && (
                <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group/play"
                >
                    <div className="w-20 h-20 rounded-full bg-purple-500/90 flex items-center justify-center transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-purple-400/90 shadow-lg shadow-purple-500/50">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                </button>
            )}

            {/* Bottom controls */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                    >
                        {isPlaying ? (
                            <Pause className="w-4 h-4 text-white" />
                        ) : (
                            <Play className="w-4 h-4 text-white ml-0.5" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                    >
                        {isMuted ? (
                            <VolumeX className="w-4 h-4 text-white" />
                        ) : (
                            <Volume2 className="w-4 h-4 text-white" />
                        )}
                    </Button>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-white/80">COAverse Introduction</span>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// PLATFORM GUIDE SECTION
// ============================================================================

function PlatformGuide() {
    return (
        <div className="relative p-6 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
            {/* Accent border */}
            <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-purple-500 to-cyan-500" />

            <div className="ml-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    How to Use This Platform
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                    {PLATFORM_FEATURES.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${feature.color}20` }}
                                >
                                    <Icon className="w-4 h-4" style={{ color: feature.color }} />
                                </div>
                                <div>
                                    <p className="font-medium text-white text-sm">{feature.title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// MAIN INTRODUCTION MODULE
// ============================================================================

interface IntroductionModuleProps {
    // Future extensibility
    onVideoComplete?: () => void
    showGuide?: boolean
}

export function IntroductionModule({ showGuide = true }: IntroductionModuleProps) {
    return (
        <div className="space-y-8">
            {/* Video Section - Primary Focus */}
            <section className="relative">
                {/* Background grid pattern */}
                <div className="absolute inset-0 -m-4 rounded-3xl bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <VideoPlayer videoUrl={INTRO_VIDEO_URL} />
            </section>

            {/* Content Section */}
            <section className="space-y-6">
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white">
                        Introduction to Computer Organization & Architecture
                    </h1>

                    <div className="space-y-3 text-gray-300 leading-relaxed">
                        <p className="text-lg">
                            <strong className="text-white">Computer Organization and Architecture (COA)</strong> is the study of how computers are structured and how they process information at the hardware level. It bridges the gap between high-level software and the physical circuits that execute your code.
                        </p>

                        <p>
                            Understanding COA is essential for building efficient software, optimizing performance, and designing systems that power everything from smartphones to supercomputers. Whether you&rsquo;re debugging low-level issues or designing the next generation of processors, COA knowledge is foundational.
                        </p>

                        <p className="text-purple-300/90">
                            This platform teaches COA differently. Instead of passive reading, you&rsquo;ll <strong className="text-purple-300">interact with live simulations</strong>, <strong className="text-purple-300">build working systems step-by-step</strong>, and <strong className="text-purple-300">validate your understanding in real-time</strong>. It&rsquo;s engineering-focused learning for the modern era.
                        </p>
                    </div>
                </div>

                {/* Platform Guide */}
                {showGuide && <PlatformGuide />}
            </section>
        </div>
    )
}
