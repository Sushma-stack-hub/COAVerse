"use client"

// ============================================================================
// PROJECT EXPLORER
// Shows all project categories: Conceptual, Software, and Hardware (3D)
// ============================================================================

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Cpu, Clock, ArrowRight, Box, Sparkles,
    Brain, Code, Layers, CheckSquare, Terminal
} from "lucide-react"
import { SimulationProvider } from "@/lib/simulation-state"
import { ProjectProvider } from "@/lib/project-state"
import { HARDWARE_PROJECTS } from "@/lib/hardware-projects"
import { ALL_PROJECTS } from "@/lib/project-definitions"
import { HardwareWorkspace } from "@/components/projects/hardware/HardwareWorkspace"
import { ProjectWorkspace } from "@/components/projects/ProjectWorkspace"
import type { HardwareProject } from "@/lib/hardware-schema"
import type { ProjectSchema } from "@/lib/project-schema"
import { conceptualValidationEngine } from "@/lib/conceptual-validation"

interface ProjectExplorerProps {
    topic: string
    color?: string
}

type CategoryFilter = "all" | "conceptual" | "software" | "hardware"

export function ProjectExplorer({ topic, color }: ProjectExplorerProps) {
    const [activeHardwareProject, setActiveHardwareProject] = useState<HardwareProject | null>(null)
    const [activeConceptualProject, setActiveConceptualProject] = useState<ProjectSchema | null>(null)
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")

    const themeColor = color || "#C084FC"

    // Combine all projects
    const allProjects = useMemo(() => {
        const conceptual = ALL_PROJECTS.filter(p => p.category === "conceptual")
        const software = ALL_PROJECTS.filter(p => p.category === "software")
        const hardware = HARDWARE_PROJECTS

        return { conceptual, software, hardware }
    }, [])

    // Filter projects based on category
    const filteredProjects = useMemo(() => {
        switch (categoryFilter) {
            case "conceptual":
                return { conceptual: allProjects.conceptual, software: [], hardware: [] }
            case "software":
                return { conceptual: [], software: allProjects.software, hardware: [] }
            case "hardware":
                return { conceptual: [], software: [], hardware: allProjects.hardware }
            default:
                return allProjects
        }
    }, [categoryFilter, allProjects])

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "beginner":
                return "#22C55E"
            case "intermediate":
                return "#F59E0B"
            case "advanced":
                return "#EF4444"
            default:
                return "#8B7CFF"
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "conceptual":
                return <Brain className="h-3 w-3 mr-1" />
            case "software":
                return <Terminal className="h-3 w-3 mr-1" />
            case "hardware-inspired":
            case "hardware":
                return <Cpu className="h-3 w-3 mr-1" />
            default:
                return <Layers className="h-3 w-3 mr-1" />
        }
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "conceptual":
                return "#22D3EE" // Cyan
            case "software":
                return "#34D399" // Green
            case "hardware-inspired":
            case "hardware":
                return "#C084FC" // Purple
            default:
                return themeColor
        }
    }

    const handleOpenHardwareProject = (project: HardwareProject) => {
        setActiveHardwareProject(project)
    }

    const handleOpenConceptualProject = (project: ProjectSchema) => {
        setActiveConceptualProject(project)
    }

    const handleCloseHardwareProject = () => {
        setActiveHardwareProject(null)
    }

    const handleCloseConceptualProject = () => {
        setActiveConceptualProject(null)
    }

    const totalProjects =
        filteredProjects.conceptual.length +
        filteredProjects.software.length +
        filteredProjects.hardware.length

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${themeColor}20` }}
                        >
                            <Box className="h-5 w-5" style={{ color: themeColor }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Engineering Projects</h2>
                            <p className="text-sm text-gray-400">
                                Hands-on projects across conceptual, software, and hardware domains
                            </p>
                        </div>
                    </div>
                </div>

                {/* Category Filter Tabs */}
                <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
                    <TabsList className="bg-gray-900/50 border border-gray-700/50">
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                        >
                            <Layers className="h-4 w-4 mr-2" />
                            All ({allProjects.conceptual.length + allProjects.software.length + allProjects.hardware.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="conceptual"
                            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"
                        >
                            <Brain className="h-4 w-4 mr-2" />
                            Conceptual ({allProjects.conceptual.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="software"
                            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300"
                        >
                            <Code className="h-4 w-4 mr-2" />
                            Software ({allProjects.software.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="hardware"
                            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Hardware 3D ({allProjects.hardware.length})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Projects Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Conceptual Projects */}
                    {filteredProjects.conceptual.map((project) => {
                        const catColor = getCategoryColor(project.category)
                        const diffColor = getDifficultyColor(project.difficulty)

                        return (
                            <Card
                                key={project.id}
                                className="group relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-gray-900/80 to-gray-950 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer"
                                onClick={() => handleOpenConceptualProject(project)}
                            >
                                {/* Category Badge */}
                                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                                    <CheckSquare className="h-3 w-3 text-cyan-400" />
                                    <span className="text-[10px] font-bold text-cyan-400">Logic</span>
                                </div>

                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge
                                            variant="outline"
                                            className="capitalize text-xs"
                                            style={{
                                                borderColor: `${catColor}50`,
                                                color: catColor,
                                                backgroundColor: `${catColor}10`,
                                            }}
                                        >
                                            {getCategoryIcon(project.category)}
                                            Conceptual
                                        </Badge>

                                        <Badge
                                            variant="outline"
                                            className="text-xs capitalize"
                                            style={{
                                                borderColor: `${diffColor}50`,
                                                color: diffColor,
                                            }}
                                        >
                                            {project.difficulty}
                                        </Badge>
                                    </div>

                                    <CardTitle className="text-lg text-white group-hover:text-cyan-300 transition-colors">
                                        {project.title}
                                    </CardTitle>

                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                        <Clock className="h-3 w-3" />
                                        <span>~{project.estimatedMinutes} min</span>
                                        <span>•</span>
                                        <span>{project.stages.length} stages</span>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-400 line-clamp-2">
                                        {project.objective}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                            Truth Tables
                                        </span>
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            Logic Expressions
                                        </span>
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                            Step Validation
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {project.tags.slice(0, 4).map(tag => (
                                            <span
                                                key={tag}
                                                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>

                                <div className="px-6 pb-4">
                                    <Button
                                        className="w-full gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 group/btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleOpenConceptualProject(project)
                                        }}
                                    >
                                        Start Project
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                </div>

                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{
                                        background: `radial-gradient(circle at 50% 120%, ${catColor}15 0%, transparent 60%)`,
                                    }}
                                />
                            </Card>
                        )
                    })}

                    {/* Software Projects */}
                    {filteredProjects.software.map((project) => {
                        const catColor = getCategoryColor(project.category)
                        const diffColor = getDifficultyColor(project.difficulty)

                        return (
                            <Card
                                key={project.id}
                                className="group relative overflow-hidden border-green-500/20 bg-gradient-to-br from-gray-900/80 to-gray-950 hover:border-green-500/40 transition-all duration-300 cursor-pointer"
                                onClick={() => handleOpenConceptualProject(project)}
                            >
                                {/* Category Badge */}
                                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                                    <Terminal className="h-3 w-3 text-green-400" />
                                    <span className="text-[10px] font-bold text-green-400">Python</span>
                                </div>

                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge
                                            variant="outline"
                                            className="capitalize text-xs"
                                            style={{
                                                borderColor: `${catColor}50`,
                                                color: catColor,
                                                backgroundColor: `${catColor}10`,
                                            }}
                                        >
                                            {getCategoryIcon(project.category)}
                                            Software
                                        </Badge>

                                        <Badge
                                            variant="outline"
                                            className="text-xs capitalize"
                                            style={{
                                                borderColor: `${diffColor}50`,
                                                color: diffColor,
                                            }}
                                        >
                                            {project.difficulty}
                                        </Badge>
                                    </div>

                                    <CardTitle className="text-lg text-white group-hover:text-green-300 transition-colors">
                                        {project.title}
                                    </CardTitle>

                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                        <Clock className="h-3 w-3" />
                                        <span>~{project.estimatedMinutes} min</span>
                                        <span>•</span>
                                        <span>{project.stages.length} stages</span>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-400 line-clamp-2">
                                        {project.objective}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                            Code Editor
                                        </span>
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                            Execution Steps
                                        </span>
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            Phase Validation
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {project.tags.slice(0, 4).map(tag => (
                                            <span
                                                key={tag}
                                                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>

                                <div className="px-6 pb-4">
                                    <Button
                                        className="w-full gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 group/btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleOpenConceptualProject(project)
                                        }}
                                    >
                                        Start Coding
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                </div>

                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{
                                        background: `radial-gradient(circle at 50% 120%, ${catColor}15 0%, transparent 60%)`,
                                    }}
                                />
                            </Card>
                        )
                    })}

                    {/* Hardware 3D Projects */}
                    {filteredProjects.hardware.map((project) => {
                        const difficultyColor = getDifficultyColor(project.difficulty)

                        return (
                            <Card
                                key={project.id}
                                className="group relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-gray-900/80 to-gray-950 hover:border-purple-500/40 transition-all duration-300 cursor-pointer"
                                onClick={() => handleOpenHardwareProject(project)}
                            >
                                {/* 3D Badge */}
                                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                                    <Sparkles className="h-3 w-3 text-purple-400" />
                                    <span className="text-[10px] font-bold text-purple-400">3D</span>
                                </div>

                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge
                                            variant="outline"
                                            className="capitalize text-xs"
                                            style={{
                                                borderColor: `${themeColor}50`,
                                                color: themeColor,
                                                backgroundColor: `${themeColor}10`,
                                            }}
                                        >
                                            <Cpu className="h-3 w-3 mr-1" />
                                            Hardware Simulation
                                        </Badge>

                                        <Badge
                                            variant="outline"
                                            className="text-xs capitalize"
                                            style={{
                                                borderColor: `${difficultyColor}50`,
                                                color: difficultyColor,
                                            }}
                                        >
                                            {project.difficulty}
                                        </Badge>
                                    </div>

                                    <CardTitle className="text-lg text-white group-hover:text-purple-300 transition-colors">
                                        {project.title}
                                    </CardTitle>

                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                        <Clock className="h-3 w-3" />
                                        <span>~{project.estimatedMinutes} min</span>
                                        <span>•</span>
                                        <span>{project.stages.length} stages</span>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-400 line-clamp-2">
                                        {project.objective}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                            Drag & Place Components
                                        </span>
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                            Real-time Signals
                                        </span>
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            Clock Execution
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {project.tags.slice(0, 4).map(tag => (
                                            <span
                                                key={tag}
                                                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>

                                <div className="px-6 pb-4">
                                    <Button
                                        className="w-full gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 group/btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleOpenHardwareProject(project)
                                        }}
                                    >
                                        Launch 3D Simulation
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                </div>

                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{
                                        background: `radial-gradient(circle at 50% 120%, ${themeColor}15 0%, transparent 60%)`,
                                    }}
                                />
                            </Card>
                        )
                    })}

                    {totalProjects === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            No projects found in this category.
                        </div>
                    )}
                </div>

                {/* Coming soon teaser */}
                <div className="p-4 rounded-lg border border-dashed border-gray-700 bg-gray-900/30 text-center">
                    <p className="text-sm text-gray-500">
                        More projects coming soon: Instruction Decoder, Pipeline Visualizer, Cache Simulator
                    </p>
                </div>
            </div>

            {/* Hardware 3D Workspace Modal */}
            {activeHardwareProject && (
                <SimulationProvider>
                    <HardwareWorkspace
                        project={activeHardwareProject}
                        onClose={handleCloseHardwareProject}
                    />
                </SimulationProvider>
            )}

            {/* Conceptual/Software Project Workspace Modal */}
            {activeConceptualProject && (
                <ProjectProvider validationEngine={conceptualValidationEngine}>
                    <ProjectWorkspace
                        project={activeConceptualProject}
                        onClose={handleCloseConceptualProject}
                        themeColor={getCategoryColor(activeConceptualProject.category)}
                    />
                </ProjectProvider>
            )}
        </>
    )
}
