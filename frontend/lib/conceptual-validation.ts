// ============================================================================
// CONCEPTUAL PROJECT VALIDATION ENGINE
// Frontend-only validation for conceptual engineering projects
// ============================================================================

import type { ValidationResult } from "./project-schema"

/**
 * Validates conceptual project stages based on stage type and requirements
 * No backend calls - pure frontend validation
 */
export async function conceptualValidationEngine(
    projectId: string,
    stageId: string,
    input: unknown
): Promise<ValidationResult> {
    try {
        // Handle selection-based stages (like operations selection)
        if (stageId === "select-operations") {
            return validateOperationsSelection(input)
        }

        // Handle truth table stages
        if (stageId.includes("truth-table")) {
            return validateTruthTable(stageId, input)
        }

        // Handle architecture/design stages
        if (stageId.includes("alu-layout") || stageId.includes("design")) {
            return validateDesignStage(input)
        }

        // Handle simulation/testing stages
        if (stageId.includes("simulate") || stageId.includes("test")) {
            return validateSimulationStage(input)
        }

        // Handle reflection/summary stages
        if (stageId.includes("reflect") || stageId.includes("summary")) {
            return validateReflectionStage(input)
        }

        // Default: check if any input was provided
        return validateGenericInput(input)

    } catch (error) {
        // Never throw - always return graceful error
        console.error("Validation error:", error)
        return {
            passed: false,
            errors: [{
                type: "missing",
                message: "Unable to validate. Please try again."
            }],
            violatedConstraints: []
        }
    }
}

/**
 * Validates ALU operations selection (Stage 1)
 * Requires at least 2 operations selected
 */
function validateOperationsSelection(input: unknown): ValidationResult {
    if (!Array.isArray(input)) {
        return {
            passed: false,
            errors: [{ type: "missing", message: "Please select at least 2 ALU operations." }],
            violatedConstraints: ["min-operations"]
        }
    }

    if (input.length < 2) {
        return {
            passed: false,
            errors: [{
                type: "constraint-violation",
                message: `You selected ${input.length} operation(s). Please select at least 2 operations.`
            }],
            violatedConstraints: ["min-operations"]
        }
    }

    // Check for valid operations
    const validOps = ["add", "sub", "and", "or"]
    const invalidOps = input.filter(op => !validOps.includes(String(op).toLowerCase()))

    if (invalidOps.length > 0) {
        return {
            passed: false,
            errors: [{
                type: "constraint-violation",
                message: `Invalid operation: ${invalidOps.join(", ")}. Use only ADD, SUB, AND, OR.`
            }],
            violatedConstraints: ["valid-operations"]
        }
    }

    // Success with helpful feedback
    const hasArithmetic = input.some(op => ["add", "sub"].includes(String(op).toLowerCase()))
    const hasLogical = input.some(op => ["and", "or"].includes(String(op).toLowerCase()))

    let feedback = "Operations selected successfully!"
    if (hasArithmetic && hasLogical) {
        feedback = "Excellent choice! You have both arithmetic and logical operations."
    } else if (!hasArithmetic) {
        feedback = "Good selection! Consider adding arithmetic operations (ADD/SUB) for a complete ALU."
    }

    return {
        passed: true,
        errors: [],
        violatedConstraints: []
    }
}

/**
 * Validates truth table completion
 */
function validateTruthTable(stageId: string, input: unknown): ValidationResult {
    if (!input || typeof input !== "object") {
        return {
            passed: false,
            errors: [{ type: "missing", message: "Please complete the truth table." }],
            violatedConstraints: []
        }
    }

    // Check if output values are provided
    const tableData = input as Record<string, boolean[]>
    const outputs = Object.entries(tableData).filter(([key]) => key.includes("output") || key.includes("AND") || key.includes("OR"))

    if (outputs.length === 0) {
        return {
            passed: false,
            errors: [{ type: "missing", message: "Please fill in the output column." }],
            violatedConstraints: []
        }
    }

    // Simplified validation - just check if all cells are filled
    for (const [key, values] of outputs) {
        if (!Array.isArray(values) || values.some(v => v === null || v === undefined)) {
            return {
                passed: false,
                errors: [{ type: "missing", message: `Please complete all rows in the ${key} column.` }],
                violatedConstraints: []
            }
        }
    }

    return {
        passed: true,
        errors: [],
        violatedConstraints: []
    }
}

/**
 * Validates design/architecture stages
 */
function validateDesignStage(input: unknown): ValidationResult {
    // For design stages, just check if something was submitted
    if (!input) {
        return {
            passed: false,
            errors: [{ type: "missing", message: "Please complete the design before continuing." }],
            violatedConstraints: []
        }
    }

    return {
        passed: true,
        errors: [],
        violatedConstraints: []
    }
}

/**
 * Validates simulation/testing stages
 */
function validateSimulationStage(input: unknown): ValidationResult {
    if (!input) {
        return {
            passed: false,
            errors: [{ type: "missing", message: "Please run at least one test before continuing." }],
            violatedConstraints: []
        }
    }

    return {
        passed: true,
        errors: [],
        violatedConstraints: []
    }
}

/**
 * Validates reflection/summary stages
 */
function validateReflectionStage(input: unknown): ValidationResult {
    if (!input || (typeof input === "string" && input.trim().length < 10)) {
        return {
            passed: false,
            errors: [{ type: "missing", message: "Please write a brief reflection (at least a few words)." }],
            violatedConstraints: []
        }
    }

    return {
        passed: true,
        errors: [],
        violatedConstraints: []
    }
}

/**
 * Generic input validation fallback
 */
function validateGenericInput(input: unknown): ValidationResult {
    const hasInput = input !== null && input !== undefined

    if (!hasInput) {
        return {
            passed: false,
            errors: [{ type: "missing", message: "Please complete the required input before continuing." }],
            violatedConstraints: []
        }
    }

    // Check if array has items
    if (Array.isArray(input) && input.length === 0) {
        return {
            passed: false,
            errors: [{ type: "missing", message: "Please make at least one selection." }],
            violatedConstraints: []
        }
    }

    // Check if string has content
    if (typeof input === "string" && input.trim().length === 0) {
        return {
            passed: false,
            errors: [{ type: "missing", message: "Please enter some content." }],
            violatedConstraints: []
        }
    }

    return {
        passed: true,
        errors: [],
        violatedConstraints: []
    }
}
