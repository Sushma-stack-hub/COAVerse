"use client"

// ============================================================================
// BUILD AREA
// Center panel - dynamic content based on stage type
// ============================================================================

import { useState } from "react"
import { ArrowRight, ArrowLeft, Loader2, CheckCircle, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProject } from "@/lib/project-state"
import { ComponentSelector } from "./inputs/ComponentSelector"
import { SequenceBuilder } from "./inputs/SequenceBuilder"
import { CodeEditor } from "./inputs/CodeEditor"
import { TruthTableBuilder } from "./inputs/TruthTableBuilder"
import { TextInput } from "./inputs/TextInput"

interface BuildAreaProps {
    themeColor?: string
    isCompleted?: boolean
}

export function BuildArea({ themeColor = "#8B7CFF", isCompleted }: BuildAreaProps) {
    const {
        state,
        getCurrentStage,
        getStageState,
        updateInput,
        validateCurrentStage,
        goToNextStage,
        goToPreviousStage
    } = useProject()

    const [isValidating, setIsValidating] = useState(false)

    const currentStage = getCurrentStage()
    const stageState = currentStage ? getStageState(currentStage.id) : null
    const currentIndex = state.progress?.currentStageIndex ?? 0
    const totalStages = state.activeProject?.stages.length ?? 0

    // Show completion screen when project is done
    if (isCompleted && state.activeProject) {
        return (
            <div className="max-w-2xl mx-auto text-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: `${themeColor}20` }}
                >
                    <Trophy className="h-10 w-10" style={{ color: themeColor }} />
                </div>

                <h2 className="text-2xl font-bold mb-4">Project Complete!</h2>

                <Card className="text-left mt-8 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg">What You Built</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            {state.activeProject.reflection.whatWasBuilt}
                        </p>

                        <div>
                            <h4 className="font-medium mb-2">Concepts Reinforced:</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {state.activeProject.reflection.conceptsReinforced.map((concept, i) => (
                                    <li key={i}>{concept}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">Real-World Applications:</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {state.activeProject.reflection.realWorldApplications.map((app, i) => (
                                    <li key={i}>{app}</li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!currentStage || !state.activeProject) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Handle input changes
    const handleInputChange = (value: unknown) => {
        updateInput(currentStage.id, value)
    }

    // Handle validation
    const handleValidate = async () => {
        setIsValidating(true)
        try {
            const result = await validateCurrentStage()
            if (result.passed) {
                // Auto-advance after short delay on success
                setTimeout(() => {
                    goToNextStage()
                }, 1500)
            }
        } finally {
            setIsValidating(false)
        }
    }

    // Render the appropriate input component
    const renderInputComponent = () => {
        const config = currentStage.inputComponent
        const currentInput = stageState?.studentInput

        switch (config.type) {
            case "selection":
                return (
                    <ComponentSelector
                        config={config}
                        value={currentInput as string[] | undefined}
                        onChange={handleInputChange}
                        themeColor={themeColor}
                    />
                )
            case "sequence":
                return (
                    <SequenceBuilder
                        config={config}
                        value={currentInput as string[] | undefined}
                        onChange={handleInputChange}
                        themeColor={themeColor}
                    />
                )
            case "code":
                return (
                    <CodeEditor
                        config={config}
                        value={currentInput as string | undefined}
                        onChange={handleInputChange}
                        themeColor={themeColor}
                    />
                )
            case "truth-table":
                return (
                    <TruthTableBuilder
                        config={config}
                        value={currentInput as Record<string, boolean[]> | undefined}
                        onChange={handleInputChange}
                        themeColor={themeColor}
                    />
                )
            case "text":
                return (
                    <TextInput
                        config={config}
                        value={currentInput as string | undefined}
                        onChange={handleInputChange}
                        themeColor={themeColor}
                    />
                )
            default:
                return <p className="text-muted-foreground">Unknown input type</p>
        }
    }

    const isStageCompleted = stageState?.status === "completed"
    const hasInput = stageState?.studentInput !== null && stageState?.studentInput !== undefined

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Stage header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Stage {currentIndex + 1} of {totalStages}</span>
                    {isStageCompleted && (
                        <span className="flex items-center gap-1 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            Complete
                        </span>
                    )}
                </div>
                <h2 className="text-2xl font-bold" style={{ color: themeColor }}>
                    {currentStage.title}
                </h2>
            </div>

            {/* Instructions */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{currentStage.instructions}</p>
                    {currentStage.detailedDescription && (
                        <p className="text-sm text-muted-foreground/80 mt-2">
                            {currentStage.detailedDescription}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Interactive input area */}
            <Card
                className="border-2 transition-colors"
                style={{ borderColor: `${themeColor}30` }}
            >
                <CardContent className="pt-6">
                    {renderInputComponent()}
                </CardContent>
            </Card>

            {/* Navigation and validation */}
            <div className="flex items-center justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={goToPreviousStage}
                    disabled={currentIndex === 0}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                </Button>

                {isStageCompleted ? (
                    <Button
                        onClick={goToNextStage}
                        disabled={currentIndex >= totalStages - 1}
                        className="gap-2"
                        style={{ backgroundColor: themeColor }}
                    >
                        {currentIndex >= totalStages - 1 ? "Finish" : "Next Stage"}
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleValidate}
                        disabled={!hasInput || isValidating}
                        className="gap-2"
                        style={{ backgroundColor: themeColor }}
                    >
                        {isValidating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Validating...
                            </>
                        ) : (
                            <>
                                Validate & Continue
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}
