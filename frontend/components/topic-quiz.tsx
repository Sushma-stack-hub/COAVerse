"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Cpu,
    Activity,
    GripVertical,
    Shield,
    Zap,
    Brain,
    Target,
    AlertCircle,
    BookOpen,
    Layers,
    ArrowRight,
    Trophy,
    RefreshCw,
} from "lucide-react"
import {
    getTopicScenarios,
    getAdaptiveResponse,
    type ScenarioQuestion,
    type ConfidenceLevel,
    type BloomLevel,
    type AdaptiveResponse,
} from "@/lib/assessment-scenarios"
import { LearningProgressPanel, ActivityType } from "@/components/learning-progress-panel"

const bloomLevelInfo: Record<BloomLevel, { label: string; color: string; icon: typeof Brain }> = {
    remember: { label: "Remember", color: "#22C55E", icon: Brain },
    understand: { label: "Understand", color: "#3B82F6", icon: BookOpen },
    apply: { label: "Apply", color: "#8B5CF6", icon: Target },
    analyze: { label: "Analyze", color: "#F59E0B", icon: Activity },
    evaluate: { label: "Evaluate", color: "#EF4444", icon: Shield },
}

const confidenceLevels: { value: ConfidenceLevel; label: string; emoji: string }[] = [
    { value: "guess", label: "Just Guessing", emoji: "🎲" },
    { value: "maybe", label: "Maybe Right", emoji: "🤔" },
    { value: "confident", label: "Fairly Confident", emoji: "💪" },
    { value: "certain", label: "Absolutely Certain", emoji: "🎯" },
]

// Sortable Item for sequencing
function SortableItem({ id, index, primaryColor }: { id: string; index: number; primaryColor: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-grab active:cursor-grabbing bg-card transition-all">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                    {index + 1}
                </span>
                <span className="font-medium">{id}</span>
            </div>
        </div>
    )
}

interface TopicQuizProps {
    topic: string
    color?: string
}

export function TopicQuiz({ topic, color }: TopicQuizProps) {
    const [questions, setQuestions] = useState<ScenarioQuestion[]>([])
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [confidence, setConfidence] = useState<ConfidenceLevel>("confident")
    const [sequenceOrder, setSequenceOrder] = useState<string[]>([])
    const [showResult, setShowResult] = useState(false)
    const [adaptiveResponse, setAdaptiveResponse] = useState<AdaptiveResponse | null>(null)
    const [stability, setStability] = useState(100)
    const [correctAnswers, setCorrectAnswers] = useState(0)
    const [quizComplete, setQuizComplete] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [apiResult, setApiResult] = useState<any>(null)
    const [questionResults, setQuestionResults] = useState<{ correct: boolean; bloomLevel: BloomLevel; component: string }[]>([])
    const [showLearningPanel, setShowLearningPanel] = useState(false)
    const startTime = useRef<number>(Date.now())

    const primaryColor = color || "#8B7CFF"

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Load topic-specific questions
    useEffect(() => {
        const topicQuestions = getTopicScenarios(topic)
        setQuestions(topicQuestions)
        startTime.current = Date.now()
    }, [topic])

    // Initialize sequence for sequencing questions
    useEffect(() => {
        const question = questions[currentQuestion]
        if (question?.type === "sequencing" && question.shuffledSequence) {
            setSequenceOrder([...question.shuffledSequence])
        }
    }, [currentQuestion, questions])

    const question = questions[currentQuestion]

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            setSequenceOrder((items) => {
                const oldIndex = items.indexOf(active.id as string)
                const newIndex = items.indexOf(over.id as string)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const checkAnswer = (): boolean => {
        if (!question) return false
        if (question.type === "diagnostic") {
            return selectedAnswer === question.correctOptionId
        } else if (question.type === "sequencing") {
            return JSON.stringify(sequenceOrder) === JSON.stringify(question.correctSequence)
        }
        return false
    }

    const handleSubmit = () => {
        if (!question) return
        const isCorrect = checkAnswer()
        setShowResult(true)

        // Get adaptive response based on confidence and correctness
        const response = getAdaptiveResponse(isCorrect, confidence, question)
        setAdaptiveResponse(response)

        // Update stability based on correctness
        if (isCorrect) {
            setCorrectAnswers(prev => prev + 1)
            setStability(prev => Math.min(100, prev + Math.floor(question.impact * 0.3)))
        } else {
            const penaltyMultiplier = confidence === "certain" ? 1.5 : confidence === "confident" ? 1.2 : 1
            setStability(prev => Math.max(0, prev - Math.floor(question.impact * penaltyMultiplier)))
        }

        setQuestionResults(prev => [...prev, {
            correct: isCorrect,
            bloomLevel: question.bloomLevel,
            component: question.component,
        }])
    }

    const submitQuiz = async () => {
        setIsSubmitting(true)
        try {
            const timeTaken = Math.round((Date.now() - startTime.current) / 1000)
            const payload = {
                studentId: "STU101",
                topic: topic,
                totalQuestions: questions.length,
                correctAnswers: correctAnswers,
                timeTakenSeconds: timeTaken,
                attempts: 1,
            }

            const response = await fetch("http://localhost:3002/submit-quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                const data = await response.json()
                setApiResult(data)
            }
        } catch (err) {
            console.error("Quiz submission error:", err)
        } finally {
            setIsSubmitting(false)
            setQuizComplete(true)
            setTimeout(() => setShowLearningPanel(true), 1500)
        }
    }

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1)
            setSelectedAnswer(null)
            setConfidence("confident")
            setShowResult(false)
            setAdaptiveResponse(null)
        } else {
            submitQuiz()
        }
    }

    const handleRestart = () => {
        setCurrentQuestion(0)
        setSelectedAnswer(null)
        setConfidence("confident")
        setSequenceOrder([])
        setShowResult(false)
        setAdaptiveResponse(null)
        setStability(100)
        setCorrectAnswers(0)
        setQuizComplete(false)
        setApiResult(null)
        setQuestionResults([])
        startTime.current = Date.now()
    }

    // No questions available for this topic
    if (questions.length === 0) {
        return (
            <Card className="max-w-2xl mx-auto border-2" style={{ borderColor: `${primaryColor}40` }}>
                <CardContent className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                        style={{ backgroundColor: `${primaryColor}20` }}>
                        <Cpu className="h-8 w-8" style={{ color: primaryColor }} />
                    </div>
                    <h3 className="text-xl font-bold">No Diagnostics Available</h3>
                    <p className="text-muted-foreground">
                        System diagnostics for "{topic}" are being prepared.
                        <br />Check back soon!
                    </p>
                </CardContent>
            </Card>
        )
    }

    // Quiz Complete - Diagnostic Report
    if (quizComplete) {
        const percentage = Math.round((correctAnswers / questions.length) * 100)
        const weakComponents = questionResults
            .filter(r => !r.correct)
            .map(r => r.component)
            .filter((v, i, a) => a.indexOf(v) === i)

        const weakBloomLevels = questionResults
            .filter(r => !r.correct)
            .map(r => r.bloomLevel)
            .filter((v, i, a) => a.indexOf(v) === i)

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto space-y-6"
            >
                <Card className="border-2 overflow-hidden" style={{ borderColor: `${primaryColor}40` }}>
                    {/* Stability Bar */}
                    <div
                        className="h-2"
                        style={{
                            background: `linear-gradient(90deg, ${stability > 60 ? '#22C55E' : stability > 30 ? '#F59E0B' : '#EF4444'} ${stability}%, transparent ${stability}%)`,
                        }}
                    />
                    <CardHeader className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ backgroundColor: `${primaryColor}1a` }}
                        >
                            <Activity className="h-10 w-10" style={{ color: primaryColor }} />
                        </motion.div>
                        <CardTitle className="text-3xl">🔧 Diagnostic Report</CardTitle>
                        <CardDescription className="text-lg">
                            Topic: {topic}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* System Stability Gauge */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">System Stability</span>
                                <span className="font-bold">{stability}%</span>
                            </div>
                            <div className="relative h-8 rounded-full overflow-hidden bg-muted">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stability}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full rounded-full flex items-center justify-center"
                                    style={{
                                        background: stability > 60 ? 'linear-gradient(90deg, #22C55E, #16A34A)' :
                                            stability > 30 ? 'linear-gradient(90deg, #F59E0B, #D97706)' :
                                                'linear-gradient(90deg, #EF4444, #DC2626)',
                                        minWidth: 'fit-content',
                                        paddingLeft: '12px',
                                        paddingRight: '12px',
                                    }}
                                >
                                    <span className="text-xs font-bold text-white whitespace-nowrap">
                                        {stability > 60 ? "🛡️ STABLE" : stability > 30 ? "⚠️ UNSTABLE" : "🚨 CRITICAL"}
                                    </span>
                                </motion.div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-4 text-center">
                                    <div className="text-3xl font-bold" style={{ color: primaryColor }}>{percentage}%</div>
                                    <div className="text-sm text-muted-foreground">Accuracy</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-4 text-center">
                                    <div className="text-3xl font-bold" style={{ color: primaryColor }}>{correctAnswers}/{questions.length}</div>
                                    <div className="text-sm text-muted-foreground">Diagnosed</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-4 text-center">
                                    <div className="text-3xl font-bold" style={{ color: primaryColor }}>
                                        {apiResult?.predicted_level || "—"}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Level</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Weak Components */}
                        {weakComponents.length > 0 && (
                            <Card className="border-2 border-red-500/50 bg-red-500/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                        🚨 Faulty Components Identified
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {weakComponents.map((comp, idx) => (
                                            <Badge key={idx} variant="outline" className="border-red-500/50 text-red-500">
                                                {comp}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Suggested Revision */}
                        {weakBloomLevels.length > 0 && (
                            <Card className="border-2 border-blue-500/50 bg-blue-500/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-blue-500" />
                                        📚 Recommended Review
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {weakBloomLevels.map((level, idx) => {
                                            const info = bloomLevelInfo[level]
                                            return (
                                                <Badge
                                                    key={idx}
                                                    variant="outline"
                                                    style={{ borderColor: info.color, color: info.color }}
                                                >
                                                    {info.label} Skills
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={handleRestart}
                                className="flex-1"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Run Diagnostics Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <LearningProgressPanel
                    activityType="assessment"
                    topic={topic}
                    performance={{ score: percentage }}
                    isOpen={showLearningPanel}
                    onClose={() => setShowLearningPanel(false)}
                />
            </motion.div>
        )
    }

    const bloomInfo = bloomLevelInfo[question.bloomLevel]
    const BloomIcon = bloomInfo.icon

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                        <Cpu className="h-6 w-6" style={{ color: primaryColor }} />
                        CPU Diagnostics
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Debug system failures in: <span className="font-medium">{topic}</span>
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className="gap-1 text-sm"
                    style={{ borderColor: bloomInfo.color, color: bloomInfo.color }}
                >
                    <BloomIcon className="h-3 w-3" />
                    {bloomInfo.label}
                </Badge>
            </div>

            {/* System Stability Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4" style={{ color: stability > 60 ? '#22C55E' : stability > 30 ? '#F59E0B' : '#EF4444' }} />
                        System Stability
                    </span>
                    <span className="font-bold">{stability}%</span>
                </div>
                <div className="relative h-3 rounded-full overflow-hidden bg-muted">
                    <motion.div
                        animate={{ width: `${stability}%` }}
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            background: stability > 60 ? 'linear-gradient(90deg, #22C55E, #16A34A)' :
                                stability > 30 ? 'linear-gradient(90deg, #F59E0B, #D97706)' :
                                    'linear-gradient(90deg, #EF4444, #DC2626)',
                        }}
                    />
                </div>
                <div className="text-xs text-muted-foreground text-right">
                    Scenario {currentQuestion + 1} of {questions.length}
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <Card className="border-2" style={{ borderColor: `${primaryColor}30` }}>
                        <CardHeader>
                            {/* Alert Banner */}
                            <div
                                className="flex items-start gap-3 p-4 rounded-lg mb-4"
                                style={{ backgroundColor: '#EF444415', border: '1px solid #EF444440' }}
                            >
                                <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-red-500 mb-2 text-lg">
                                        {question.symptom}
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {question.scenario}
                                    </p>
                                </div>
                            </div>

                            <CardTitle className="text-xl flex items-center gap-2">
                                🔍 {question.type === "diagnostic" && "Identify the Faulty Component"}
                                {question.type === "sequencing" && "Restore Correct Sequence"}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Diagnostic Choice Options */}
                            {question.type === "diagnostic" && question.options && (
                                <div className="grid gap-3">
                                    {question.options.map((option) => {
                                        const isSelected = selectedAnswer === option.id
                                        const isCorrect = showResult && option.id === question.correctOptionId
                                        const isWrong = showResult && isSelected && option.id !== question.correctOptionId

                                        return (
                                            <motion.button
                                                key={option.id}
                                                whileHover={!showResult ? { scale: 1.01 } : {}}
                                                whileTap={!showResult ? { scale: 0.99 } : {}}
                                                onClick={() => !showResult && setSelectedAnswer(option.id)}
                                                disabled={showResult}
                                                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${isCorrect ? 'border-green-500 bg-green-500/10' :
                                                    isWrong ? 'border-red-500 bg-red-500/10' :
                                                        isSelected ? '' :
                                                            'border-border hover:border-primary/50'
                                                    }`}
                                                style={!showResult && isSelected ? { borderColor: primaryColor, backgroundColor: `${primaryColor}15` } : {}}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <span
                                                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                                            style={isSelected || isCorrect ? { backgroundColor: `${primaryColor}30`, color: primaryColor } : { backgroundColor: 'rgba(255,255,255,0.1)' }}
                                                        >
                                                            {option.id.toUpperCase()}
                                                        </span>
                                                        <div>
                                                            <div className="font-semibold">{option.component}</div>
                                                            <div className="text-sm text-muted-foreground">{option.description}</div>
                                                        </div>
                                                    </div>
                                                    {isCorrect && <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />}
                                                    {isWrong && <XCircle className="h-6 w-6 text-red-500 shrink-0" />}
                                                </div>
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Sequencing - Drag and Drop */}
                            {question.type === "sequencing" && (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext items={sequenceOrder} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-2">
                                            {sequenceOrder.map((step, index) => (
                                                <SortableItem
                                                    key={step}
                                                    id={step}
                                                    index={index}
                                                    primaryColor={primaryColor}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}

                            {/* Confidence Selection */}
                            {!showResult && (
                                <div className="space-y-3 pt-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        🧠 How confident are you?
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {confidenceLevels.map((level) => (
                                            <Button
                                                key={level.value}
                                                variant={confidence === level.value ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setConfidence(level.value)}
                                                className="gap-1"
                                                style={confidence === level.value ? { backgroundColor: primaryColor } : {}}
                                            >
                                                <span>{level.emoji}</span>
                                                <span className="hidden md:inline">{level.label}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Adaptive Feedback */}
                            <AnimatePresence>
                                {showResult && adaptiveResponse && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Card className={`border-2 ${adaptiveResponse.type === "critical-misconception"
                                            ? "border-red-500 bg-red-500/5"
                                            : adaptiveResponse.type === "guided-flashcard"
                                                ? "border-yellow-500 bg-yellow-500/5"
                                                : adaptiveResponse.type === "challenge-unlock"
                                                    ? "border-green-500 bg-green-500/5"
                                                    : "border-green-500 bg-green-500/5"
                                            }`}>
                                            <CardContent className="pt-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-2xl">{adaptiveResponse.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="font-bold mb-2 text-lg">
                                                            {adaptiveResponse.title}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            {adaptiveResponse.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                {!showResult ? (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={question.type === "diagnostic" && !selectedAnswer}
                                        className="flex-1"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Zap className="mr-2 h-4 w-4" />
                                        Submit Diagnosis
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleNext}
                                        className="flex-1"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {currentQuestion < questions.length - 1 ? (
                                            <>
                                                Next Scenario
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        ) : (
                                            <>
                                                <Trophy className="mr-2 h-4 w-4" />
                                                View Report
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
