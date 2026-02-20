// ============================================================================
// PROJECT SCHEMA TYPES
// Core TypeScript interfaces for the Guided Engineering Project System
// ============================================================================

// Project categories - affects UI flow, validation type, and input components
export type ProjectCategory = "conceptual" | "software" | "hardware-inspired"

// Validation types determine what kind of student input is expected
export type ValidationType =
    | "selection"       // Multi-select toggles/dropdowns
    | "sequence"        // Ordered step operations
    | "code"            // Python/pseudo-code/logic expressions
    | "truth-table"     // Interactive truth table builder
    | "text"            // Free-form text input
    | "diagram"         // Visual component arrangement

// Input component configuration based on validation type
export type InputComponentConfig =
    | SelectionConfig
    | SequenceConfig
    | CodeConfig
    | TruthTableConfig
    | TextConfig

export interface SelectionConfig {
    type: "selection"
    options: SelectionOption[]
    minSelections: number
    maxSelections: number
    layout: "toggles" | "dropdown" | "blocks"
}

export interface SelectionOption {
    id: string
    label: string
    description?: string
    icon?: string
}

export interface SequenceConfig {
    type: "sequence"
    availableSteps: SequenceStep[]
    correctOrder: string[] // Step IDs in correct order
    allowPartialOrder: boolean
}

export interface SequenceStep {
    id: string
    label: string
    description: string
}

export interface CodeConfig {
    type: "code"
    language: "python" | "pseudo" | "logic" | "assembly"
    template?: string
    expectedPatterns?: string[] // Regex patterns to validate
    testCases?: CodeTestCase[]
}

export interface CodeTestCase {
    input: string
    expectedOutput: string
    description: string
}

export interface TruthTableConfig {
    type: "truth-table"
    inputColumns: string[]
    outputColumns: string[]
    rows: number
    correctValues?: Record<string, boolean[]> // Column name -> expected values
}

export interface TextConfig {
    type: "text"
    placeholder: string
    requiredKeywords?: string[]
    minLength?: number
    maxLength?: number
}

// Constraint rules enforced during validation
export interface ConstraintRule {
    id: string
    description: string
    errorMessage: string
    validate: (input: unknown) => boolean
}

// Validation rule for each stage
export interface ValidationRule {
    id: string
    type: "required" | "pattern" | "range" | "custom"
    message: string
    validate: (input: unknown) => boolean
}

// Single project stage definition
export interface ProjectStage {
    id: string
    title: string
    instructions: string
    detailedDescription?: string
    type: ValidationType
    inputComponent: InputComponentConfig
    validation: ValidationRule[]
    hints: StageHint[]
    successMessage: string
    estimatedMinutes?: number
}

export interface StageHint {
    id: string
    text: string
    revealCondition?: "on-error" | "on-request" | "after-attempts"
    attemptsRequired?: number
}

// Complete project schema
export interface ProjectSchema {
    id: string
    title: string
    category: ProjectCategory
    difficulty: "beginner" | "intermediate" | "advanced"
    estimatedMinutes: number

    // Introduction section
    introduction: {
        problemStatement: string
        engineeringContext: string
        prerequisites?: string[]
    }

    // Learning objective
    objective: string

    // Constraints that must be enforced throughout
    constraints: ConstraintRule[]

    // Build stages (the main interactive content)
    stages: ProjectStage[]

    // Final reflection
    reflection: {
        whatWasBuilt: string
        conceptsReinforced: string[]
        realWorldApplications: string[]
    }

    // Metadata
    relatedTopics: string[]
    tags: string[]
}

// Student's progress state for a project
export interface ProjectProgress {
    projectId: string
    currentStageIndex: number
    stageStates: Map<string, StageState>
    startedAt: Date
    completedAt?: Date
}

export interface StageState {
    stageId: string
    status: "locked" | "unlocked" | "in-progress" | "completed" | "failed"
    studentInput: unknown
    validationResult?: ValidationResult
    attempts: number
    hintsRevealed: string[]
    timeSpent: number // milliseconds
}

export interface ValidationResult {
    passed: boolean
    errors: ValidationError[]
    violatedConstraints: string[]
    score?: number
}

export interface ValidationError {
    type: "missing" | "incorrect" | "invalid-sequence" | "constraint-violation" | "syntax"
    field?: string
    message: string
    hint?: string
    details?: string
}

// Project list item (for explorer view)
export interface ProjectListItem {
    id: string
    title: string
    category: ProjectCategory
    difficulty: "beginner" | "intermediate" | "advanced"
    concept: string
    outcome: string
    estimatedMinutes: number
    tags: string[]
}

// Convert full schema to list item
export function toProjectListItem(schema: ProjectSchema): ProjectListItem {
    return {
        id: schema.id,
        title: schema.title,
        category: schema.category,
        difficulty: schema.difficulty,
        concept: schema.relatedTopics[0] || "",
        outcome: schema.objective,
        estimatedMinutes: schema.estimatedMinutes,
        tags: schema.tags,
    }
}
