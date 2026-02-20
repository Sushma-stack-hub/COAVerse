// ============================================================================
// ADAPTIVE PLANNER LOGIC
// Frontend-only intelligence for Learning Planner
// Makes task ordering and hints personalized without external APIs
// ============================================================================

import type { PlannerEvent } from "./backend-api"

// ============================================================================
// TYPES
// ============================================================================

// Extended event with adaptive fields
export interface AdaptiveTask extends PlannerEvent {
    adaptiveHint?: string       // Reason-aware suggestion
    priority: number            // Computed priority (lower = higher priority)
    isSuggested?: boolean       // Whether task is AI-suggested
    category?: "conceptual" | "software" | "hardware"
    isCustom?: boolean          // Whether task is user-created
}


// Learner signals from localStorage/session
export interface LearnerSignals {
    // Failures and struggles
    failedValidations: { stageId: string; projectId: string; count: number }[]
    hardwareProjectsIncomplete: string[]
    conceptsStruggled: string[]

    // Progress
    tasksCompleted: number
    tasksTotal: number
    quizScores: { topicId: string; score: number }[]
    flashcardMastery: { strong: number; weak: number; total: number }

    // Time and attempts
    hintsUsed: number
    totalRetries: number
    avgTimePerTask: number // minutes
}

// Readiness metrics
export interface ReadinessMetrics {
    conceptualReadiness: number      // 0-100
    hardwareBuildStability: number   // 0-100
    executionConfidence: number      // 0-100
    overallReadiness: string         // "Strong" | "Building" | "Needs Practice"
}

// ============================================================================
// SIGNAL GATHERING (from localStorage)
// ============================================================================

const STORAGE_KEY = "coa_learner_signals"

/**
 * Get learner signals from localStorage
 * Falls back to default signals if not available
 */
export function getLearnerSignals(): LearnerSignals {
    if (typeof window === "undefined") return getDefaultSignals()

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return { ...getDefaultSignals(), ...JSON.parse(stored) }
        }
    } catch (e) {
        console.warn("Failed to load learner signals:", e)
    }

    return getDefaultSignals()
}

/**
 * Update learner signals in localStorage
 */
export function updateLearnerSignals(updates: Partial<LearnerSignals>): void {
    if (typeof window === "undefined") return

    try {
        const current = getLearnerSignals()
        const updated = { ...current, ...updates }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
        console.warn("Failed to save learner signals:", e)
    }
}

/**
 * Record a validation failure
 */
export function recordValidationFailure(projectId: string, stageId: string): void {
    const signals = getLearnerSignals()
    const existing = signals.failedValidations.find(
        f => f.projectId === projectId && f.stageId === stageId
    )

    if (existing) {
        existing.count++
    } else {
        signals.failedValidations.push({ projectId, stageId, count: 1 })
    }

    signals.totalRetries++
    updateLearnerSignals(signals)
}

/**
 * Record concept struggle
 */
export function recordConceptStruggle(concept: string): void {
    const signals = getLearnerSignals()
    if (!signals.conceptsStruggled.includes(concept)) {
        signals.conceptsStruggled.push(concept)
    }
    updateLearnerSignals(signals)
}

function getDefaultSignals(): LearnerSignals {
    return {
        failedValidations: [],
        hardwareProjectsIncomplete: ["cpu-data-path"], // Mock: assume HW project is incomplete
        conceptsStruggled: ["control-signals"], // Mock: one struggled concept
        tasksCompleted: 12,
        tasksTotal: 15,
        quizScores: [
            { topicId: "register-transfer", score: 85 },
            { topicId: "alu-operations", score: 62 }, // Low score
        ],
        flashcardMastery: { strong: 8, weak: 4, total: 15 },
        hintsUsed: 3,
        totalRetries: 5,
        avgTimePerTask: 8,
    }
}

// ============================================================================
// ADAPTIVE TASK ORDERING
// ============================================================================

// Concept to task mapping (for recommendations)
const CONCEPT_TASK_MAP: Record<string, string[]> = {
    "control-signals": ["Complete CPU Architecture", "Review Control Signal Basics"],
    "register-transfer": ["Register Transfer Topic", "Review Flashcards: Registers"],
    "alu-operations": ["ALU Operations Quiz", "Design a 4-bit ALU"],
    "bus-architecture": ["Bus and Memory Transfer Topic"],
}

// Task hints based on context
const ADAPTIVE_HINTS: Record<string, (signals: LearnerSignals) => string | null> = {
    "Complete CPU Architecture": (signals) => {
        if (signals.conceptsStruggled.includes("control-signals")) {
            return "Recommended — reinforces control signal concepts you found challenging"
        }
        return null
    },
    "Instruction Cycle Quiz": (signals) => {
        const lowScore = signals.quizScores.find(q => q.score < 70)
        if (lowScore) {
            return "Practice quiz to build confidence before hardware projects"
        }
        return null
    },
    "Review Flashcards: Registers": (signals) => {
        if (signals.flashcardMastery.weak > signals.flashcardMastery.strong) {
            return "Focus here — several flashcards need review"
        }
        return null
    },
}

/**
 * Reorder tasks based on learner signals
 * Priority: Lower number = higher priority
 */
export function reorderTasks(
    tasks: PlannerEvent[],
    signals: LearnerSignals
): AdaptiveTask[] {
    const adaptiveTasks = tasks.map(task => {
        let priority = 50 // Default priority
        let adaptiveHint: string | undefined
        let isSuggested = false
        const category = inferCategory(task)

        // Rule 1: If conceptual task relates to a struggled concept, boost priority
        for (const concept of signals.conceptsStruggled) {
            const relatedTasks = CONCEPT_TASK_MAP[concept] || []
            if (relatedTasks.some(t => task.title.includes(t) || t.includes(task.title))) {
                priority -= 20
                adaptiveHint = `Recommended — strengthens ${concept.replace(/-/g, " ")}`
            }
        }

        // Rule 2: If hardware project is incomplete, boost conceptual prereqs
        if (signals.hardwareProjectsIncomplete.length > 0 && category === "conceptual") {
            if (task.title.toLowerCase().includes("cpu") ||
                task.title.toLowerCase().includes("register") ||
                task.title.toLowerCase().includes("control")) {
                priority -= 10
                if (!adaptiveHint) {
                    adaptiveHint = "Complete before continuing hardware project"
                }
            }
        }

        // Rule 3: If quiz scores are low, prioritize review tasks
        const lowScore = signals.quizScores.find(q => q.score < 70)
        if (lowScore && task.type === "Flashcard") {
            priority -= 15
            if (!adaptiveHint) {
                adaptiveHint = "Review recommended to improve quiz readiness"
            }
        }

        // Rule 4: Completed tasks go to the bottom
        if (task.status === "Done") {
            priority += 100
        }

        // Rule 5: Check for hint generator
        const hintGen = ADAPTIVE_HINTS[task.title]
        if (hintGen && !adaptiveHint) {
            adaptiveHint = hintGen(signals) || undefined
        }

        return {
            ...task,
            priority,
            adaptiveHint,
            isSuggested,
            category,
        }
    })

    // Sort by priority (lower first), then by due date
    return adaptiveTasks.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
}

/**
 * Infer task category from type and title
 */
function inferCategory(task: PlannerEvent): "conceptual" | "software" | "hardware" {
    const title = task.title.toLowerCase()

    if (title.includes("breadboard") || title.includes("hardware") || title.includes("3d")) {
        return "hardware"
    }
    if (title.includes("simulator") || title.includes("python") || title.includes("code")) {
        return "software"
    }
    return "conceptual"
}

// ============================================================================
// READINESS METRICS
// ============================================================================

/**
 * Compute readiness metrics from learner signals
 */
export function computeReadinessMetrics(signals: LearnerSignals): ReadinessMetrics {
    // Conceptual Readiness: Based on quiz scores and flashcard mastery
    const avgQuizScore = signals.quizScores.length > 0
        ? signals.quizScores.reduce((sum, q) => sum + q.score, 0) / signals.quizScores.length
        : 75 // Default

    const flashcardRatio = signals.flashcardMastery.total > 0
        ? (signals.flashcardMastery.strong / signals.flashcardMastery.total) * 100
        : 50

    const conceptualReadiness = Math.round((avgQuizScore * 0.6 + flashcardRatio * 0.4))

    // Hardware Build Stability: Based on incomplete projects and failures
    const hwPenalty = signals.hardwareProjectsIncomplete.length * 20
    const failurePenalty = Math.min(signals.failedValidations.length * 10, 40)
    const hardwareBuildStability = Math.max(0, 100 - hwPenalty - failurePenalty)

    // Execution Confidence: Based on completion rate and retries
    const completionRate = signals.tasksTotal > 0
        ? (signals.tasksCompleted / signals.tasksTotal) * 100
        : 50
    const retryPenalty = Math.min(signals.totalRetries * 5, 30)
    const executionConfidence = Math.round(Math.max(0, completionRate - retryPenalty + 10))

    // Overall readiness label
    const avgReadiness = (conceptualReadiness + hardwareBuildStability + executionConfidence) / 3
    let overallReadiness: string
    if (avgReadiness >= 75) {
        overallReadiness = "Strong"
    } else if (avgReadiness >= 50) {
        overallReadiness = "Building"
    } else {
        overallReadiness = "Needs Practice"
    }

    return {
        conceptualReadiness,
        hardwareBuildStability,
        executionConfidence,
        overallReadiness,
    }
}

// ============================================================================
// SUGGESTED TASK INSERTION
// ============================================================================

/**
 * Generate suggested tasks based on struggles
 * Returns new tasks to insert before hardware projects
 */
export function getSuggestedTasks(signals: LearnerSignals): AdaptiveTask[] {
    const suggested: AdaptiveTask[] = []

    // If hardware project is incomplete and concepts are struggled
    if (signals.hardwareProjectsIncomplete.length > 0) {
        for (const concept of signals.conceptsStruggled) {
            suggested.push({
                id: `suggested-${concept}`,
                title: `Review: ${concept.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`,
                type: "Topic",
                status: "Pending",
                dueDate: new Date().toISOString().split("T")[0],
                priority: 5, // High priority
                adaptiveHint: "Suggested before continuing hardware build",
                isSuggested: true,
                category: "conceptual",
            })
        }
    }

    return suggested
}
