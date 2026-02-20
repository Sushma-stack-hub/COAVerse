// Topic-specific scenario questions for assessments
// Each topic has its own set of diagnostic scenarios

import type { LucideIcon } from "lucide-react"

export type QuestionType = "diagnostic" | "sequencing" | "cause-effect"
export type BloomLevel = "remember" | "understand" | "apply" | "analyze" | "evaluate"
export type ConfidenceLevel = "guess" | "maybe" | "confident" | "certain"

export interface DiagnosticOption {
    id: string
    component: string
    description: string
}

export interface ScenarioQuestion {
    id: string
    topicId: string
    type: QuestionType
    bloomLevel: BloomLevel
    scenario: string
    component: string
    symptom: string
    options?: DiagnosticOption[]
    correctOptionId?: string
    correctSequence?: string[]
    shuffledSequence?: string[]
    explanation: string
    criticalMisconception?: string
    guidedFlashcardHint?: string
    challengeUnlock?: string
    impact: number
}

// Topic-specific scenario questions
export const topicScenarios: Record<string, ScenarioQuestion[]> = {
    "Block diagram of digital computer": [
        {
            id: "bd-1",
            topicId: "Block diagram of digital computer",
            type: "diagnostic",
            bloomLevel: "analyze",
            scenario: "🚨 SYSTEM ALERT: The computer receives input from keyboard but nothing appears on screen. All processing seems to halt after input is received.",
            component: "CPU",
            symptom: "Input received but no processing occurs",
            options: [
                { id: "a", component: "Input Unit", description: "Receives data from external devices" },
                { id: "b", component: "Central Processing Unit", description: "Processes instructions and data" },
                { id: "c", component: "Memory Unit", description: "Stores data and instructions" },
                { id: "d", component: "Output Unit", description: "Sends results to external devices" },
            ],
            correctOptionId: "b",
            explanation: "The CPU (Central Processing Unit) is responsible for processing all data. When input is received but no processing occurs, the CPU is the faulty component. The input unit is working (data was received), but the CPU isn't executing instructions on that data.",
            criticalMisconception: "Many confuse Input/Output issues with CPU issues. Remember: if data ENTERS the system but isn't PROCESSED, it's CPU. If data is processed but doesn't DISPLAY, it's Output.",
            guidedFlashcardHint: "Review the role of each functional unit in the digital computer block diagram.",
            challengeUnlock: "Debug a multi-component failure scenario",
            impact: 20,
        },
        {
            id: "bd-2",
            topicId: "Block diagram of digital computer",
            type: "sequencing",
            bloomLevel: "understand",
            scenario: "⚠️ BOOT SEQUENCE FAILURE: The computer's startup sequence is corrupted. Arrange the correct order of data flow in a digital computer system.",
            component: "Data Flow",
            symptom: "Boot sequence disorder",
            correctSequence: ["Input Unit", "Memory Unit (Store)", "CPU", "Memory Unit (Fetch)", "Output Unit"],
            shuffledSequence: ["CPU", "Output Unit", "Input Unit", "Memory Unit (Fetch)", "Memory Unit (Store)"],
            explanation: "Data flows: Input Unit → Memory (storage) → CPU (processing) → Memory (results) → Output Unit. The CPU fetches data from memory, processes it, stores results back, then output displays it.",
            criticalMisconception: "Data doesn't flow directly from Input to CPU. It must be stored in Memory first!",
            guidedFlashcardHint: "Focus on how data moves between functional units.",
            challengeUnlock: "Trace data flow in a real program execution",
            impact: 25,
        },
        {
            id: "bd-3",
            topicId: "Block diagram of digital computer",
            type: "diagnostic",
            bloomLevel: "apply",
            scenario: "🧠 MEMORY CRISIS: A program runs correctly but loses all data when power is turned off. Volatile storage is suspected.",
            component: "RAM",
            symptom: "Data loss on power off",
            options: [
                { id: "a", component: "ROM", description: "Non-volatile, stores firmware" },
                { id: "b", component: "RAM", description: "Volatile, stores running programs" },
                { id: "c", component: "Hard Drive", description: "Non-volatile, permanent storage" },
                { id: "d", component: "Cache", description: "Fast temporary storage" },
            ],
            correctOptionId: "b",
            explanation: "RAM (Random Access Memory) is volatile - it loses all data when power is removed. This is normal behavior, not a malfunction. Data must be saved to non-volatile storage (HDD/SSD) to persist.",
            criticalMisconception: "This is actually NORMAL behavior! RAM is designed to be volatile. The 'fix' is using Save functions to write to permanent storage.",
            guidedFlashcardHint: "Review volatile vs non-volatile memory types.",
            challengeUnlock: "Design a memory hierarchy",
            impact: 15,
        },
    ],

    "Register Transfer Language": [
        {
            id: "rtl-1",
            topicId: "Register Transfer Language",
            type: "diagnostic",
            bloomLevel: "analyze",
            scenario: "🚨 REGISTER ERROR: The instruction R2 ← R1 + R3 is executing, but R2 shows incorrect value. R1=5, R3=3, but R2 shows 5 instead of 8.",
            component: "ALU",
            symptom: "Addition operation failure",
            options: [
                { id: "a", component: "R1 Register", description: "Source register holding value 5" },
                { id: "b", component: "R3 Register", description: "Source register holding value 3" },
                { id: "c", component: "ALU", description: "Performs the addition operation" },
                { id: "d", component: "R2 Register", description: "Destination register" },
            ],
            correctOptionId: "c",
            explanation: "The ALU performs the addition. If R1 and R3 have correct values but the result is wrong, the ALU's addition circuit is faulty. R2 is receiving R1's value directly, suggesting the ALU is bypassed or broken.",
            criticalMisconception: "Destination registers don't 'process' data - they only store results. Processing happens in the ALU.",
            guidedFlashcardHint: "Review how RTL operations involve the ALU.",
            challengeUnlock: "Debug a complex RTL sequence",
            impact: 20,
        },
        {
            id: "rtl-2",
            topicId: "Register Transfer Language",
            type: "sequencing",
            bloomLevel: "understand",
            scenario: "⚠️ MICRO-OPERATION SEQUENCE: Arrange the RTL statements in correct execution order for loading a value from memory to accumulator.",
            component: "Memory Read Operation",
            symptom: "Instruction sequence disorder",
            correctSequence: ["MAR ← Address", "Read Signal", "MDR ← Memory[MAR]", "AC ← MDR"],
            shuffledSequence: ["AC ← MDR", "Read Signal", "MAR ← Address", "MDR ← Memory[MAR]"],
            explanation: "Memory read sequence: 1) Place address in MAR, 2) Assert read signal, 3) Data transfers to MDR, 4) Move data from MDR to accumulator.",
            criticalMisconception: "You cannot read memory without first setting up the address in MAR. The sequence is critical!",
            guidedFlashcardHint: "Focus on the role of MAR and MDR in memory operations.",
            challengeUnlock: "Write RTL for a complete instruction cycle",
            impact: 25,
        },
        {
            id: "rtl-3",
            topicId: "Register Transfer Language",
            type: "diagnostic",
            bloomLevel: "evaluate",
            scenario: "🧠 CONDITIONAL FAILURE: The statement 'If (P=1) then R1 ← R2' never executes even when P flag is set to 1.",
            component: "Control Logic",
            symptom: "Conditional transfer not triggering",
            options: [
                { id: "a", component: "P Flag Register", description: "Holds the condition flag" },
                { id: "b", component: "Control Logic", description: "Evaluates conditions and generates signals" },
                { id: "c", component: "R1 Register", description: "Destination register" },
                { id: "d", component: "Clock", description: "Provides timing signals" },
            ],
            correctOptionId: "b",
            explanation: "The Control Logic evaluates the condition P=1 and generates the transfer signal. If P is correctly set but transfer doesn't occur, the control logic isn't properly reading or responding to the flag.",
            criticalMisconception: "Flags don't directly cause transfers - Control Logic reads flags and decides whether to enable the transfer.",
            guidedFlashcardHint: "Review conditional transfers in RTL.",
            challengeUnlock: "Design a conditional branching circuit",
            impact: 20,
        },
    ],

    "Micro-Operations: Register transfer Language": [
        {
            id: "mo-1",
            topicId: "Micro-Operations: Register transfer Language",
            type: "diagnostic",
            bloomLevel: "analyze",
            scenario: "🚨 SHIFT FAILURE: The instruction R1 ← shl R1 (shift left) is producing all zeros regardless of R1's initial value.",
            component: "Shifter Unit",
            symptom: "Shift operation produces zeros",
            options: [
                { id: "a", component: "R1 Register", description: "Source and destination register" },
                { id: "b", component: "Shifter Unit", description: "Performs shift operations" },
                { id: "c", component: "Control Unit", description: "Generates shift signals" },
                { id: "d", component: "Data Bus", description: "Transfers data between units" },
            ],
            correctOptionId: "b",
            explanation: "The Shifter Unit performs shift operations. If all shifts produce zeros, the shifter is likely stuck or has a fault in its shift logic. The register and bus are working (data reaches the shifter).",
            criticalMisconception: "Shift operations use specialized hardware (shifters), not the ALU's addition circuits.",
            guidedFlashcardHint: "Review the types of micro-operations: arithmetic, logic, and shift.",
            challengeUnlock: "Implement a barrel shifter",
            impact: 20,
        },
        {
            id: "mo-2",
            topicId: "Micro-Operations: Register transfer Language",
            type: "diagnostic",
            bloomLevel: "apply",
            scenario: "⚠️ COMPLEMENT ERROR: The one's complement operation on R1 (R1=01010101) produces 01010101 instead of 10101010.",
            component: "Logic Unit",
            symptom: "Complement not inverting bits",
            options: [
                { id: "a", component: "Logic Unit", description: "Performs logic operations (AND, OR, NOT)" },
                { id: "b", component: "R1 Register", description: "Holds the operand" },
                { id: "c", component: "Arithmetic Unit", description: "Performs add/subtract" },
                { id: "d", component: "Output Buffer", description: "Holds result temporarily" },
            ],
            correctOptionId: "a",
            explanation: "One's complement (NOT operation) is performed by the Logic Unit. If bits aren't being inverted, the Logic Unit's inverter gates are faulty.",
            criticalMisconception: "Complement is a LOGIC operation, not an arithmetic operation. It uses inverter gates, not adders.",
            guidedFlashcardHint: "Review logic micro-operations vs arithmetic micro-operations.",
            challengeUnlock: "Design a 2's complement adder",
            impact: 15,
        },
    ],

    "Bus and Memory Transfer": [
        {
            id: "bm-1",
            topicId: "Bus and Memory Transfer",
            type: "diagnostic",
            bloomLevel: "analyze",
            scenario: "🚨 BUS CONFLICT: When R1 tries to send data to memory simultaneously with R2, the bus shows unpredictable garbage values.",
            component: "Bus Controller",
            symptom: "Data collision on bus",
            options: [
                { id: "a", component: "R1 Register", description: "First data source" },
                { id: "b", component: "R2 Register", description: "Second data source" },
                { id: "c", component: "Bus Controller", description: "Arbitrates bus access" },
                { id: "d", component: "Memory Unit", description: "Destination for data" },
            ],
            correctOptionId: "c",
            explanation: "The Bus Controller manages bus access and prevents multiple devices from driving the bus simultaneously. A faulty controller allows bus contention, causing garbage values.",
            criticalMisconception: "A shared bus can only have ONE driver at a time. Multiple sources = electrical conflict = garbage.",
            guidedFlashcardHint: "Review bus arbitration and three-state buffers.",
            challengeUnlock: "Design a priority-based bus arbiter",
            impact: 20,
        },
        {
            id: "bm-2",
            topicId: "Bus and Memory Transfer",
            type: "sequencing",
            bloomLevel: "understand",
            scenario: "⚠️ MEMORY WRITE FAILURE: Arrange the correct sequence for writing data from a register to memory.",
            component: "Memory Write",
            symptom: "Write sequence incorrect",
            correctSequence: ["MAR ← Address", "MBR ← Register Data", "Write Signal", "Memory[MAR] ← MBR"],
            shuffledSequence: ["Write Signal", "Memory[MAR] ← MBR", "MAR ← Address", "MBR ← Register Data"],
            explanation: "Memory write: 1) Load address into MAR, 2) Load data into MBR (Memory Buffer Register), 3) Assert write signal, 4) Data transfers to memory location.",
            criticalMisconception: "Both address AND data must be ready BEFORE the write signal. Sequence matters!",
            guidedFlashcardHint: "Compare memory read vs memory write sequences.",
            challengeUnlock: "Design a DMA controller",
            impact: 25,
        },
    ],
}

// Get scenarios for a specific topic
export function getTopicScenarios(topicId: string): ScenarioQuestion[] {
    return topicScenarios[topicId] || []
}

// Get all available topics with scenarios
export function getAvailableTopics(): string[] {
    return Object.keys(topicScenarios)
}

// Adaptive response based on confidence and correctness
export interface AdaptiveResponse {
    type: "critical-misconception" | "guided-flashcard" | "challenge-unlock" | "success" | "try-again"
    title: string
    message: string
    icon: "🚨" | "📚" | "🏆" | "✅" | "🔄"
    actionLabel?: string
    actionType?: "flashcard" | "challenge" | "next"
}

export function getAdaptiveResponse(
    isCorrect: boolean,
    confidence: ConfidenceLevel,
    question: ScenarioQuestion
): AdaptiveResponse {
    const isHighConfidence = confidence === "confident" || confidence === "certain"
    const isLowConfidence = confidence === "guess" || confidence === "maybe"

    if (!isCorrect && isHighConfidence) {
        // Wrong + High Confidence = Critical Misconception
        return {
            type: "critical-misconception",
            title: "🚨 Critical Misconception Detected",
            message: question.criticalMisconception || question.explanation,
            icon: "🚨",
            actionLabel: "Review Concept",
            actionType: "flashcard",
        }
    }

    if (!isCorrect && isLowConfidence) {
        // Wrong + Low Confidence = Guided Flashcard
        return {
            type: "guided-flashcard",
            title: "📚 Need More Practice",
            message: question.guidedFlashcardHint || "Review the related flashcards to strengthen your understanding.",
            icon: "📚",
            actionLabel: "View Flashcards",
            actionType: "flashcard",
        }
    }

    if (isCorrect && isHighConfidence) {
        // Correct + High Confidence = Challenge Unlock
        return {
            type: "challenge-unlock",
            title: "🏆 Excellent! Challenge Unlocked",
            message: question.challengeUnlock || "You've demonstrated mastery! Try a harder scenario.",
            icon: "🏆",
            actionLabel: "Take Challenge",
            actionType: "challenge",
        }
    }

    if (isCorrect && isLowConfidence) {
        // Correct but unsure - encourage confidence
        return {
            type: "success",
            title: "✅ Correct! Trust Yourself More",
            message: "You got it right! Your instincts are good - trust your knowledge more.",
            icon: "✅",
            actionLabel: "Continue",
            actionType: "next",
        }
    }

    // Default success
    return {
        type: "success",
        title: "✅ Correct!",
        message: question.explanation,
        icon: "✅",
        actionLabel: "Continue",
        actionType: "next",
    }
}
