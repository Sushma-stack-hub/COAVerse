"use client"

// ============================================================================
// HARDWARE WORKSPACE
// Main 3-panel layout for 3D hardware simulation
// ============================================================================

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, ChevronLeft, RotateCcw, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useSimulation } from "@/lib/simulation-state"
import { StagePanel } from "./StagePanel"
import { Simulation3DCanvas } from "./Simulation3DCanvas"
import { ControlFeedbackPanel } from "./ControlFeedbackPanel"
import type { HardwareProject } from "@/lib/hardware-schema"

interface HardwareWorkspaceProps {
    project: HardwareProject
    onClose: () => void
}

export function HardwareWorkspace({ project, onClose }: HardwareWorkspaceProps) {
    const { state, openProject, closeProject, getProgressPercentage, triggerClock, resetSimulation } = useSimulation()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        // Only open project if not already active - prevents state reset
        if (!state.project || state.project.id !== project.id) {
            openProject(project)
        }
        return () => {
            // Export events on unmount
            if (typeof window !== "undefined") {
                (window as unknown as { __SIMULATION_EVENTS__: unknown }).__SIMULATION_EVENTS__ = state.events
            }
        }
    }, [project.id])

    const handleClose = () => {
        closeProject()
        onClose()
    }

    const progressPercentage = getProgressPercentage()
    const isCompleted = state.progress?.completedAt !== undefined

    if (!mounted) return null

    const workspaceContent = (
        <div className="fixed inset-0 z-[9999] bg-[#0a0a0f] flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <header className="h-14 border-b border-purple-500/20 flex items-center justify-between px-4 bg-[#0d0d14]">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="h-8 w-8 hover:bg-purple-500/10"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div>
                        <h1 className="text-base font-semibold text-white">{project.title}</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">
                                3D Simulation
                            </span>
                            <span>•</span>
                            <span>{project.difficulty}</span>
                            <span>•</span>
                            <span>~{project.estimatedMinutes} min</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Progress */}
                    <div className="flex items-center gap-2">
                        <div className="w-24">
                            <Progress value={progressPercentage} className="h-1.5 bg-gray-800" />
                        </div>
                        <span className="text-xs font-medium text-purple-400">
                            {progressPercentage}%
                        </span>
                    </div>

                    {/* Clock button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={triggerClock}
                        className="gap-1.5 h-7 text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                    >
                        <Play className="h-3 w-3" />
                        CLOCK
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px]">
                            {state.simulation.clockCycle}
                        </span>
                    </Button>

                    {/* Reset button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetSimulation}
                        className="gap-1.5 h-7 text-xs text-gray-400 hover:text-white"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                    </Button>

                    {/* Close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Main workspace - 3 panel layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Stage Progress */}
                <aside className="w-72 border-r border-purple-500/10 bg-[#0d0d14] overflow-y-auto">
                    <StagePanel />
                </aside>

                {/* Center Panel - 3D Canvas */}
                <main className="flex-1 relative bg-[#080810]">
                    <Simulation3DCanvas />

                    {/* Completion overlay */}
                    {isCompleted && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-purple-500/20 to-transparent border border-purple-500/30">
                                <div className="text-5xl mb-4">🎉</div>
                                <h2 className="text-2xl font-bold text-white mb-2">Project Complete!</h2>
                                <p className="text-gray-400 max-w-md">{project.reflection.whatWasBuilt}</p>
                                <Button
                                    onClick={handleClose}
                                    className="mt-6 bg-purple-600 hover:bg-purple-700"
                                >
                                    Return to Projects
                                </Button>
                            </div>
                        </div>
                    )}
                </main>

                {/* Right Panel - Control & Feedback */}
                <aside className="w-80 border-l border-purple-500/10 bg-[#0d0d14] overflow-y-auto">
                    <ControlFeedbackPanel />
                </aside>
            </div>
        </div>
    )

    return createPortal(workspaceContent, document.body)
}
