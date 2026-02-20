// ============================================================================
// PROJECT VALIDATION ENGINE
// Schema-driven validation for project stages
// ============================================================================

import type {
    ProjectSchema,
    ProjectStage,
    ValidationResult,
    ValidationError,
    SelectionConfig,
    SequenceConfig,
    CodeConfig,
    TruthTableConfig,
    TextConfig,
} from "./project-schema"

/**
 * Main validation function - validates stage input based on configuration
 */
export function validateStageInput(
    stage: ProjectStage,
    input: unknown,
    projectConstraints: ProjectSchema["constraints"]
): ValidationResult {
    const errors: ValidationError[] = []
    const violatedConstraints: string[] = []

    // Check if input exists
    if (input === null || input === undefined) {
        return {
            passed: false,
            errors: [{
                type: "missing",
                message: "Please complete the required input before proceeding.",
                hint: stage.hints[0]?.text,
            }],
            violatedConstraints: [],
        }
    }

    // Validate based on input component type
    switch (stage.inputComponent.type) {
        case "selection":
            errors.push(...validateSelection(stage.inputComponent, input))
            break
        case "sequence":
            errors.push(...validateSequence(stage.inputComponent, input))
            break
        case "code":
            errors.push(...validateCode(stage.inputComponent, input))
            break
        case "truth-table":
            errors.push(...validateTruthTable(stage.inputComponent, input))
            break
        case "text":
            errors.push(...validateText(stage.inputComponent, input))
            break
    }

    // Run stage-specific validation rules
    for (const rule of stage.validation) {
        try {
            if (!rule.validate(input)) {
                errors.push({
                    type: "incorrect",
                    message: rule.message,
                    details: `Validation rule '${rule.id}' failed`,
                })
            }
        } catch {
            errors.push({
                type: "syntax",
                message: "An error occurred during validation",
                details: `Rule ${rule.id} threw an exception`,
            })
        }
    }

    // Check project constraints
    for (const constraint of projectConstraints) {
        try {
            if (!constraint.validate(input)) {
                violatedConstraints.push(constraint.id)
                errors.push({
                    type: "constraint-violation",
                    message: constraint.errorMessage,
                    details: `Constraint: ${constraint.description}`,
                })
            }
        } catch {
            // Constraint validation failed silently
        }
    }

    return {
        passed: errors.length === 0,
        errors,
        violatedConstraints,
        score: calculateScore(errors, stage.validation.length, projectConstraints.length),
    }
}

// Selection validation
function validateSelection(config: SelectionConfig, input: unknown): ValidationError[] {
    const errors: ValidationError[] = []

    if (!Array.isArray(input)) {
        errors.push({
            type: "incorrect",
            message: "Please select one or more options.",
        })
        return errors
    }

    const selections = input as string[]

    if (selections.length < config.minSelections) {
        errors.push({
            type: "missing",
            message: `Please select at least ${config.minSelections} option(s). Currently selected: ${selections.length}`,
            hint: `You need to select ${config.minSelections - selections.length} more option(s).`,
        })
    }

    if (selections.length > config.maxSelections) {
        errors.push({
            type: "incorrect",
            message: `Maximum ${config.maxSelections} selections allowed. Currently selected: ${selections.length}`,
            hint: `Please remove ${selections.length - config.maxSelections} selection(s).`,
        })
    }

    // Validate that all selected options are valid
    const validOptionIds = config.options.map(o => o.id)
    const invalidSelections = selections.filter(s => !validOptionIds.includes(s))

    if (invalidSelections.length > 0) {
        errors.push({
            type: "incorrect",
            message: `Invalid selection(s): ${invalidSelections.join(", ")}`,
        })
    }

    return errors
}

// Sequence validation
function validateSequence(config: SequenceConfig, input: unknown): ValidationError[] {
    const errors: ValidationError[] = []

    if (!Array.isArray(input)) {
        errors.push({
            type: "missing",
            message: "Please arrange the steps in the correct order.",
        })
        return errors
    }

    const sequence = input as string[]

    // Check if all required steps are present
    const missingSteps = config.correctOrder.filter(s => !sequence.includes(s))
    if (missingSteps.length > 0) {
        const missingLabels = missingSteps.map(id =>
            config.availableSteps.find(s => s.id === id)?.label || id
        )
        errors.push({
            type: "missing",
            message: `Missing steps: ${missingLabels.join(", ")}`,
            hint: "Make sure all steps are included in your sequence.",
        })
    }

    // Check order
    if (!config.allowPartialOrder) {
        let orderCorrect = true
        for (let i = 0; i < config.correctOrder.length; i++) {
            const expectedId = config.correctOrder[i]
            const actualIndex = sequence.indexOf(expectedId)

            if (actualIndex !== i) {
                orderCorrect = false
                break
            }
        }

        if (!orderCorrect) {
            errors.push({
                type: "invalid-sequence",
                message: "The steps are not in the correct order.",
                hint: "Consider the logical flow of operations.",
            })
        }
    }

    return errors
}

// Code validation
function validateCode(config: CodeConfig, input: unknown): ValidationError[] {
    const errors: ValidationError[] = []

    if (typeof input !== "string" || input.trim() === "") {
        errors.push({
            type: "missing",
            message: "Please write your code before submitting.",
        })
        return errors
    }

    const code = input as string

    // Check for required patterns
    if (config.expectedPatterns) {
        for (const pattern of config.expectedPatterns) {
            const regex = new RegExp(pattern, "i")
            if (!regex.test(code)) {
                errors.push({
                    type: "missing",
                    message: `Your code is missing a required element.`,
                    hint: `Make sure your code includes the expected structure.`,
                })
            }
        }
    }

    // Basic syntax checks based on language
    if (config.language === "python") {
        // Check for common Python syntax issues
        if (code.includes("def ") && !code.includes(":")) {
            errors.push({
                type: "syntax",
                message: "Python function definitions require a colon (:) at the end.",
                hint: "Example: def my_function():",
            })
        }
    }

    // Run test cases if provided
    if (config.testCases && config.testCases.length > 0) {
        // Note: Actual code execution would require a sandbox
        // For now, we just check pattern presence
        errors.push({
            type: "incorrect",
            message: "Test case validation requires code execution (not implemented in frontend).",
            details: "This would be validated by a backend service.",
        })
    }

    return errors
}

// Truth table validation
function validateTruthTable(config: TruthTableConfig, input: unknown): ValidationError[] {
    const errors: ValidationError[] = []

    if (!input || typeof input !== "object") {
        errors.push({
            type: "missing",
            message: "Please complete the truth table.",
        })
        return errors
    }

    const table = input as Record<string, boolean[]>

    // Check each output column
    for (const columnName of config.outputColumns) {
        const userValues = table[columnName]
        const expectedValues = config.correctValues?.[columnName]

        if (!userValues) {
            errors.push({
                type: "missing",
                field: columnName,
                message: `Column '${columnName}' is not filled in.`,
            })
            continue
        }

        if (userValues.length !== config.rows) {
            errors.push({
                type: "incorrect",
                field: columnName,
                message: `Column '${columnName}' should have ${config.rows} values, but has ${userValues.length}.`,
            })
            continue
        }

        // Check individual values if expected values are provided
        if (expectedValues) {
            const incorrectRows: number[] = []
            for (let i = 0; i < config.rows; i++) {
                if (userValues[i] !== expectedValues[i]) {
                    incorrectRows.push(i + 1) // 1-indexed for display
                }
            }

            if (incorrectRows.length > 0) {
                errors.push({
                    type: "incorrect",
                    field: columnName,
                    message: `Column '${columnName}' has incorrect values in row(s): ${incorrectRows.join(", ")}`,
                    hint: "Double-check your logic for these input combinations.",
                })
            }
        }
    }

    return errors
}

// Text validation
function validateText(config: TextConfig, input: unknown): ValidationError[] {
    const errors: ValidationError[] = []

    if (typeof input !== "string") {
        errors.push({
            type: "missing",
            message: config.placeholder || "Please enter your response.",
        })
        return errors
    }

    const text = input.trim()

    if (config.minLength && text.length < config.minLength) {
        errors.push({
            type: "missing",
            message: `Your response should be at least ${config.minLength} characters long.`,
        })
    }

    if (config.maxLength && text.length > config.maxLength) {
        errors.push({
            type: "incorrect",
            message: `Your response should be at most ${config.maxLength} characters long.`,
        })
    }

    // Check for required keywords
    if (config.requiredKeywords) {
        const missingKeywords = config.requiredKeywords.filter(
            kw => !text.toLowerCase().includes(kw.toLowerCase())
        )

        if (missingKeywords.length > 0) {
            errors.push({
                type: "missing",
                message: `Your response is missing key concepts.`,
                hint: `Consider discussing: ${missingKeywords.slice(0, 2).join(", ")}${missingKeywords.length > 2 ? "..." : ""}`,
            })
        }
    }

    return errors
}

// Calculate score based on errors
function calculateScore(
    errors: ValidationError[],
    totalRules: number,
    totalConstraints: number
): number {
    if (errors.length === 0) return 100

    const totalChecks = Math.max(1, totalRules + totalConstraints)
    const passedChecks = totalChecks - errors.length

    return Math.max(0, Math.round((passedChecks / totalChecks) * 100))
}

/**
 * Create a validation function for the project state provider
 */
export function createValidationEngine(projects: ProjectSchema[]) {
    const projectMap = new Map(projects.map(p => [p.id, p]))

    return async (
        projectId: string,
        stageId: string,
        input: unknown
    ): Promise<ValidationResult> => {
        const project = projectMap.get(projectId)
        if (!project) {
            return {
                passed: false,
                errors: [{ type: "missing", message: "Project not found" }],
                violatedConstraints: [],
            }
        }

        const stage = project.stages.find(s => s.id === stageId)
        if (!stage) {
            return {
                passed: false,
                errors: [{ type: "missing", message: "Stage not found" }],
                violatedConstraints: [],
            }
        }

        // Simulate async validation (would be actual API call in production)
        await new Promise(resolve => setTimeout(resolve, 300))

        return validateStageInput(stage, input, project.constraints)
    }
}
