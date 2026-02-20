// ============================================================================
// PROJECT DEFINITIONS
// Complete schema definitions for example engineering projects
// ============================================================================

import type { ProjectSchema } from "./project-schema"

// =============================================================================
// PROJECT 1: Design a 4-bit ALU (Conceptual)
// =============================================================================

export const fourBitALUProject: ProjectSchema = {
    id: "design-4bit-alu",
    title: "Design a 4-bit ALU",
    category: "conceptual",
    difficulty: "intermediate",
    estimatedMinutes: 25,

    introduction: {
        problemStatement:
            "An Arithmetic Logic Unit (ALU) is the computational heart of every processor. Your challenge is to design a 4-bit ALU that can perform multiple arithmetic and logical operations on binary inputs.",
        engineeringContext:
            "In real CPU design, ALUs are built using combinational logic circuits. Intel's first commercial processor, the 4004, had a 4-bit ALU similar to what you'll design. Understanding ALU design is fundamental to computer architecture.",
        prerequisites: ["Binary arithmetic", "Logic gates (AND, OR, XOR, NOT)", "Truth tables"],
    },

    objective:
        "Design and validate a 4-bit ALU capable of performing at least 2 operations (ADD, SUB, AND, OR) with correct truth table outputs.",

    constraints: [
        {
            id: "min-operations",
            description: "ALU must support at least 2 operations",
            errorMessage: "Your ALU must support at least 2 operations. Please select more operations.",
            validate: (input) => Array.isArray(input) && input.length >= 2,
        },
        {
            id: "valid-operations",
            description: "Only valid ALU operations allowed",
            errorMessage: "Invalid operation selected. Use only ADD, SUB, AND, OR.",
            validate: (input) => {
                if (!Array.isArray(input)) return true
                const valid = ["add", "sub", "and", "or"]
                return input.every(op => valid.includes(String(op).toLowerCase()))
            },
        },
    ],

    stages: [
        // Stage 1: Select Operations
        {
            id: "select-operations",
            title: "Select ALU Operations",
            instructions: "Choose which operations your ALU will support. A typical ALU supports both arithmetic (ADD, SUB) and logical (AND, OR) operations.",
            detailedDescription: "Select at least 2 operations from the available options. Consider what operations are most fundamental for computation.",
            type: "selection",
            inputComponent: {
                type: "selection",
                options: [
                    { id: "add", label: "ADD", description: "Binary addition of two 4-bit numbers" },
                    { id: "sub", label: "SUB", description: "Binary subtraction using 2's complement" },
                    { id: "and", label: "AND", description: "Bitwise AND operation" },
                    { id: "or", label: "OR", description: "Bitwise OR operation" },
                ],
                minSelections: 2,
                maxSelections: 4,
                layout: "toggles",
            },
            validation: [
                {
                    id: "has-arithmetic",
                    type: "custom",
                    message: "Consider including at least one arithmetic operation (ADD or SUB) for a complete ALU.",
                    validate: (input) => {
                        if (!Array.isArray(input)) return false
                        return input.some(op => ["add", "sub"].includes(String(op).toLowerCase()))
                    },
                },
            ],
            hints: [
                { id: "hint-1", text: "ADD and SUB are essential for mathematical computations.", revealCondition: "on-request" },
                { id: "hint-2", text: "AND and OR are used for bit manipulation and masking.", revealCondition: "after-attempts", attemptsRequired: 2 },
            ],
            successMessage: "Operations selected! Now let's define the truth tables.",
            estimatedMinutes: 3,
        },

        // Stage 2: Define Truth Tables for AND operation
        {
            id: "truth-table-and",
            title: "AND Operation Truth Table",
            instructions: "Complete the truth table for the AND operation. For each combination of inputs A and B, enter the output (A AND B).",
            detailedDescription: "The AND operation returns 1 only when BOTH inputs are 1. Complete all rows.",
            type: "truth-table",
            inputComponent: {
                type: "truth-table",
                inputColumns: ["A", "B"],
                outputColumns: ["A AND B"],
                rows: 4,
                correctValues: {
                    "A AND B": [false, false, false, true], // 0&0=0, 0&1=0, 1&0=0, 1&1=1
                },
            },
            validation: [
                {
                    id: "all-rows-filled",
                    type: "required",
                    message: "Please fill in all rows of the truth table.",
                    validate: (input) => {
                        if (!input || typeof input !== "object") return false
                        const table = input as Record<string, boolean[]>
                        return table["A AND B"]?.length === 4
                    },
                },
            ],
            hints: [
                { id: "hint-and-1", text: "AND returns true only when both inputs are true (1).", revealCondition: "on-request" },
                { id: "hint-and-2", text: "Row pattern: 00→0, 01→0, 10→0, 11→1", revealCondition: "on-error" },
            ],
            successMessage: "Correct! The AND truth table is complete.",
            estimatedMinutes: 4,
        },

        // Stage 3: Define Truth Table for ADD operation
        {
            id: "truth-table-add",
            title: "Binary Addition Truth Table",
            instructions: "Complete the truth table for single-bit binary addition. Include both the Sum and Carry outputs.",
            detailedDescription: "For two input bits A and B, determine the Sum and Carry output for each combination.",
            type: "truth-table",
            inputComponent: {
                type: "truth-table",
                inputColumns: ["A", "B"],
                outputColumns: ["Sum", "Carry"],
                rows: 4,
                correctValues: {
                    "Sum": [false, true, true, false],   // 0+0=0, 0+1=1, 1+0=1, 1+1=0 (with carry)
                    "Carry": [false, false, false, true], // Only 1+1 produces carry
                },
            },
            validation: [
                {
                    id: "sum-carry-relationship",
                    type: "custom",
                    message: "Check row 4 (1+1): Sum should be 0 with Carry 1.",
                    validate: (input) => {
                        if (!input || typeof input !== "object") return false
                        const table = input as Record<string, boolean[]>
                        // 1+1 should give Sum=0, Carry=1
                        return table["Sum"]?.[3] === false && table["Carry"]?.[3] === true
                    },
                },
            ],
            hints: [
                { id: "hint-add-1", text: "In binary: 0+0=0, 0+1=1, 1+0=1, 1+1=10 (which is 0 with carry 1).", revealCondition: "on-request" },
                { id: "hint-add-2", text: "Sum is the XOR of inputs, Carry is the AND of inputs.", revealCondition: "after-attempts", attemptsRequired: 2 },
            ],
            successMessage: "Binary addition truth table is correct!",
            estimatedMinutes: 5,
        },

        // Stage 4: Write Logic Expressions
        {
            id: "logic-expressions",
            title: "Derive Logic Expressions",
            instructions: "Write the boolean logic expressions for the Sum and Carry outputs using AND, OR, XOR, and NOT operations.",
            detailedDescription: "Based on your truth tables, derive the minimal logic expressions. Use standard notation: AND (·), OR (+), XOR (⊕), NOT (').",
            type: "code",
            inputComponent: {
                type: "code",
                language: "logic",
                template: "# Write your logic expressions below:\n# Sum = ...\n# Carry = ...\n\nSum = \nCarry = ",
                expectedPatterns: [
                    "sum\\s*=\\s*.*xor|⊕",
                    "carry\\s*=\\s*.*and|·|\\*",
                ],
            },
            validation: [
                {
                    id: "has-sum-expression",
                    type: "pattern",
                    message: "Please provide an expression for Sum.",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return /sum\s*=/i.test(input) && input.split("Sum")[1]?.trim().length > 2
                    },
                },
                {
                    id: "has-carry-expression",
                    type: "pattern",
                    message: "Please provide an expression for Carry.",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return /carry\s*=/i.test(input) && input.split("Carry")[1]?.trim().length > 2
                    },
                },
            ],
            hints: [
                { id: "hint-logic-1", text: "Sum can be expressed using XOR: A ⊕ B", revealCondition: "on-request" },
                { id: "hint-logic-2", text: "Carry is simply: A · B (A AND B)", revealCondition: "on-request" },
            ],
            successMessage: "Logic expressions are correct! Your ALU design is taking shape.",
            estimatedMinutes: 6,
        },

        // Stage 5: Final Summary
        {
            id: "final-summary",
            title: "ALU Design Summary",
            instructions: "Review your ALU design and explain how the selected operations work together to create a functional arithmetic logic unit.",
            detailedDescription: "In your own words, summarize what your ALU can do and how you would select between different operations.",
            type: "text",
            inputComponent: {
                type: "text",
                placeholder: "Describe your ALU design, including how operation selection works...",
                requiredKeywords: ["operation", "select", "output"],
                minLength: 50,
                maxLength: 500,
            },
            validation: [
                {
                    id: "mentions-operations",
                    type: "pattern",
                    message: "Please mention the operations your ALU supports.",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        const text = input.toLowerCase()
                        return text.includes("add") || text.includes("and") || text.includes("or") || text.includes("sub")
                    },
                },
            ],
            hints: [
                { id: "hint-summary-1", text: "Consider how a control signal (opcode) would select between ADD, SUB, AND, OR.", revealCondition: "on-request" },
            ],
            successMessage: "Excellent summary! You've completed the 4-bit ALU design project.",
            estimatedMinutes: 5,
        },
    ],

    reflection: {
        whatWasBuilt: "A 4-bit Arithmetic Logic Unit (ALU) capable of performing arithmetic and logical operations on binary inputs.",
        conceptsReinforced: [
            "Boolean algebra and logic gates",
            "Truth tables for combinational logic",
            "Binary arithmetic (addition with carry)",
            "ALU operation selection",
        ],
        realWorldApplications: [
            "Every modern CPU contains ALUs for computation",
            "GPUs have thousands of simplified ALUs for parallel processing",
            "FPGAs use configurable ALU blocks for custom logic",
        ],
    },

    relatedTopics: ["ALU Operations & Logic Gates", "Arithmetic Logic Shift Unit", "Arithmetic Micro Operations"],
    tags: ["alu", "logic-gates", "truth-tables", "binary-arithmetic", "conceptual"],
}

// =============================================================================
// PROJECT 2: CPU Simulator in Python (Software)
// =============================================================================

export const cpuSimulatorProject: ProjectSchema = {
    id: "cpu-simulator-python",
    title: "CPU Simulator in Python",
    category: "software",
    difficulty: "advanced",
    estimatedMinutes: 35,

    introduction: {
        problemStatement:
            "Every instruction your computer executes goes through a precise cycle: Fetch, Decode, Execute. Your challenge is to build a Python simulator that implements this instruction cycle for a simple CPU architecture.",
        engineeringContext:
            "CPU simulators are essential tools for computer architecture courses and chip design. Engineers at companies like Intel and ARM use simulators to test new processor designs before manufacturing. This project gives you hands-on experience with the instruction cycle.",
        prerequisites: ["Python basics", "Binary number representation", "Understanding of CPU registers and memory"],
    },

    objective:
        "Implement a working CPU simulator in Python that can fetch instructions from memory, decode opcodes, and execute simple operations like LOAD, STORE, ADD, and HALT.",

    constraints: [
        {
            id: "no-skip-phases",
            description: "Each phase must be implemented before proceeding",
            errorMessage: "You cannot skip phases. Complete the current phase first.",
            validate: () => true, // Enforced by stage locking
        },
        {
            id: "python-syntax",
            description: "Code must be valid Python",
            errorMessage: "Your code contains Python syntax errors.",
            validate: (input) => {
                if (typeof input !== "string") return true
                // Basic Python syntax check
                return !input.includes("def ") || input.includes(":")
            },
        },
    ],

    stages: [
        // Stage 1: Define Instruction Format
        {
            id: "instruction-format",
            title: "Define Instruction Format",
            instructions: "Define the instruction format for your CPU. Each instruction has an opcode (operation code) and an operand (data or address).",
            detailedDescription: "In this simple CPU, instructions are 8 bits: 4 bits for opcode, 4 bits for operand. Define the opcodes for LOAD, STORE, ADD, SUB, and HALT.",
            type: "code",
            inputComponent: {
                type: "code",
                language: "python",
                template: `# CPU Instruction Format
# 8-bit instruction: [OPCODE: 4 bits][OPERAND: 4 bits]

# Define opcodes as constants
OPCODE_LOAD  = 0x0   # Load value from memory to accumulator
OPCODE_STORE = 0x1   # Store accumulator to memory
OPCODE_ADD   = 0x2   # Add memory value to accumulator
OPCODE_SUB   = 0x3   # Subtract memory value from accumulator
OPCODE_HALT  = 0xF   # Stop execution

# Helper functions
def get_opcode(instruction):
    """Extract opcode (upper 4 bits) from instruction"""
    # YOUR CODE HERE
    pass

def get_operand(instruction):
    """Extract operand (lower 4 bits) from instruction"""
    # YOUR CODE HERE
    pass
`,
                expectedPatterns: [
                    ">>\\s*4",  // Right shift for opcode extraction
                    "&\\s*0x[0-9a-fA-F]+|&\\s*15|&\\s*0b",  // Bitwise AND for operand
                ],
            },
            validation: [
                {
                    id: "has-opcode-extraction",
                    type: "pattern",
                    message: "Implement get_opcode() using bit shifting (>> 4).",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return input.includes(">> 4") || input.includes(">>4")
                    },
                },
                {
                    id: "has-operand-extraction",
                    type: "pattern",
                    message: "Implement get_operand() using bitwise AND.",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return input.includes("& 0x") || input.includes("& 0b") || input.includes("& 15")
                    },
                },
            ],
            hints: [
                { id: "hint-format-1", text: "To get upper 4 bits: instruction >> 4", revealCondition: "on-request" },
                { id: "hint-format-2", text: "To get lower 4 bits: instruction & 0xF (or & 15 or & 0b1111)", revealCondition: "on-request" },
            ],
            successMessage: "Instruction format defined! Now let's implement the Fetch phase.",
            estimatedMinutes: 5,
        },

        // Stage 2: Implement Fetch Phase
        {
            id: "fetch-phase",
            title: "Implement Fetch Phase",
            instructions: "Implement the fetch() function that retrieves the next instruction from memory using the Program Counter (PC).",
            detailedDescription: "The Fetch phase reads the instruction at the memory address pointed to by the PC, then increments the PC to point to the next instruction.",
            type: "code",
            inputComponent: {
                type: "code",
                language: "python",
                template: `# CPU State
memory = [0x00] * 16   # 16 bytes of memory
PC = 0                  # Program Counter
IR = 0                  # Instruction Register
ACC = 0                 # Accumulator

def fetch():
    """
    Fetch phase:
    1. Read instruction from memory at address PC
    2. Store in Instruction Register (IR)
    3. Increment PC
    """
    global PC, IR
    # YOUR CODE HERE
    pass
`,
                expectedPatterns: [
                    "memory\\[.*PC.*\\]",  // Access memory at PC
                    "PC.*\\+.*1|PC\\s*\\+=",  // Increment PC
                    "IR\\s*=",  // Store in IR
                ],
            },
            validation: [
                {
                    id: "reads-memory-at-pc",
                    type: "pattern",
                    message: "Read the instruction from memory using memory[PC].",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return /memory\s*\[\s*PC\s*\]/.test(input)
                    },
                },
                {
                    id: "increments-pc",
                    type: "pattern",
                    message: "Increment the PC after fetching.",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return /PC\s*\+=\s*1|PC\s*=\s*PC\s*\+\s*1/.test(input)
                    },
                },
                {
                    id: "stores-in-ir",
                    type: "pattern",
                    message: "Store the fetched instruction in IR.",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return /IR\s*=/.test(input)
                    },
                },
            ],
            hints: [
                { id: "hint-fetch-1", text: "First, read: IR = memory[PC]", revealCondition: "on-request" },
                { id: "hint-fetch-2", text: "Then, increment: PC += 1", revealCondition: "on-request" },
            ],
            successMessage: "Fetch phase implemented! Moving to Decode.",
            estimatedMinutes: 7,
        },

        // Stage 3: Implement Decode Phase
        {
            id: "decode-phase",
            title: "Implement Decode Phase",
            instructions: "Implement the decode() function that extracts the opcode and operand from the instruction register.",
            detailedDescription: "The Decode phase parses the instruction in IR to determine what operation to perform and on what data.",
            type: "code",
            inputComponent: {
                type: "code",
                language: "python",
                template: `def decode():
    """
    Decode phase:
    1. Extract opcode from IR (upper 4 bits)
    2. Extract operand from IR (lower 4 bits)
    3. Return both for the execute phase
    """
    global IR
    # YOUR CODE HERE
    opcode = 
    operand = 
    return opcode, operand
`,
                expectedPatterns: [
                    "IR\\s*>>",  // Extract opcode
                    "IR\\s*&",   // Extract operand
                ],
            },
            validation: [
                {
                    id: "extracts-opcode",
                    type: "pattern",
                    message: "Extract opcode using right shift (IR >> 4).",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return /opcode\s*=\s*.*IR\s*>>\s*4/.test(input) || /IR\s*>>\s*4/.test(input)
                    },
                },
                {
                    id: "extracts-operand",
                    type: "pattern",
                    message: "Extract operand using bitwise AND (IR & 0xF).",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return /operand\s*=\s*.*IR\s*&/.test(input) || /IR\s*&/.test(input)
                    },
                },
            ],
            hints: [
                { id: "hint-decode-1", text: "opcode = IR >> 4 (shift right to get upper bits)", revealCondition: "on-request" },
                { id: "hint-decode-2", text: "operand = IR & 0xF (mask to keep lower bits)", revealCondition: "on-request" },
            ],
            successMessage: "Decode phase complete! Now for the Execute phase.",
            estimatedMinutes: 6,
        },

        // Stage 4: Implement Execute Phase
        {
            id: "execute-phase",
            title: "Implement Execute Phase",
            instructions: "Implement the execute() function that performs the operation based on the decoded opcode and operand.",
            detailedDescription: "The Execute phase uses a switch/if-else structure to perform LOAD, STORE, ADD, SUB, or HALT based on the opcode.",
            type: "code",
            inputComponent: {
                type: "code",
                language: "python",
                template: `def execute(opcode, operand):
    """
    Execute phase:
    Perform the operation based on opcode
    - LOAD (0x0): ACC = memory[operand]
    - STORE (0x1): memory[operand] = ACC
    - ADD (0x2): ACC = ACC + memory[operand]
    - SUB (0x3): ACC = ACC - memory[operand]  
    - HALT (0xF): Stop execution
    """
    global ACC, memory
    running = True
    
    # YOUR CODE HERE
    
    return running
`,
                expectedPatterns: [
                    "if.*opcode",  // Conditional on opcode
                    "LOAD|0x0|== 0",  // LOAD case
                    "HALT|0xF|== 15",  // HALT case
                ],
            },
            validation: [
                {
                    id: "handles-load",
                    type: "pattern",
                    message: "Implement the LOAD operation (read from memory to ACC).",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return /ACC\s*=\s*memory/.test(input)
                    },
                },
                {
                    id: "handles-halt",
                    type: "pattern",
                    message: "Implement the HALT operation (set running = False).",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return /running\s*=\s*False/.test(input)
                    },
                },
                {
                    id: "has-conditionals",
                    type: "pattern",
                    message: "Use if/elif to check the opcode.",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return input.includes("if") && (input.includes("elif") || input.includes("else"))
                    },
                },
            ],
            hints: [
                { id: "hint-exec-1", text: "Use if opcode == 0x0: for LOAD, elif opcode == 0x1: for STORE, etc.", revealCondition: "on-request" },
                { id: "hint-exec-2", text: "For HALT, set running = False and return it.", revealCondition: "on-request" },
            ],
            successMessage: "Execute phase implemented! Let's put it all together.",
            estimatedMinutes: 10,
        },

        // Stage 5: Integration - Full CPU Cycle
        {
            id: "full-cycle",
            title: "Complete CPU Cycle",
            instructions: "Combine all phases into a main run loop that executes the full Fetch-Decode-Execute cycle until HALT.",
            detailedDescription: "Write the main execution loop that repeatedly calls fetch(), decode(), and execute() until the program halts.",
            type: "code",
            inputComponent: {
                type: "code",
                language: "python",
                template: `def run():
    """
    Main CPU execution loop.
    Repeat Fetch -> Decode -> Execute until HALT.
    """
    global PC
    PC = 0  # Reset program counter
    running = True
    
    while running:
        # YOUR CODE: Call fetch, decode, execute in order
        pass
    
    print("CPU halted. ACC =", ACC)

# Test program: Load value 5, Add 3, Store result, Halt
# Memory layout:
# 0: LOAD 4    (0x04) - Load from address 4
# 1: ADD 5     (0x25) - Add value at address 5
# 2: STORE 6   (0x16) - Store to address 6
# 3: HALT      (0xF0) - Stop
# 4: 5         - Data
# 5: 3         - Data
# 6: 0         - Result will be stored here

memory = [0x04, 0x25, 0x16, 0xF0, 5, 3, 0] + [0] * 9
`,
                expectedPatterns: [
                    "fetch\\(\\)",
                    "decode\\(\\)",
                    "execute\\(",
                ],
            },
            validation: [
                {
                    id: "calls-all-phases",
                    type: "custom",
                    message: "The run loop must call fetch(), decode(), and execute().",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        return input.includes("fetch()") && input.includes("decode(") && input.includes("execute(")
                    },
                },
                {
                    id: "correct-order",
                    type: "custom",
                    message: "Phases must be in order: fetch, then decode, then execute.",
                    validate: (input) => {
                        if (typeof input !== "string") return false
                        const fetchIdx = input.indexOf("fetch()")
                        const decodeIdx = input.indexOf("decode(")
                        const executeIdx = input.indexOf("execute(")
                        return fetchIdx < decodeIdx && decodeIdx < executeIdx
                    },
                },
            ],
            hints: [
                { id: "hint-cycle-1", text: "Order: fetch() → decode() → execute(opcode, operand)", revealCondition: "on-request" },
                { id: "hint-cycle-2", text: "Store decode's return in variables: opcode, operand = decode()", revealCondition: "on-request" },
            ],
            successMessage: "CPU Simulator complete! You've built a working fetch-decode-execute cycle.",
            estimatedMinutes: 7,
        },
    ],

    reflection: {
        whatWasBuilt: "A Python-based CPU simulator implementing the complete Fetch-Decode-Execute instruction cycle with support for LOAD, STORE, ADD, SUB, and HALT operations.",
        conceptsReinforced: [
            "Instruction cycle (Fetch-Decode-Execute)",
            "Program Counter and Instruction Register",
            "Opcode encoding and decoding",
            "Bitwise operations in Python",
            "Memory addressing",
        ],
        realWorldApplications: [
            "Emulators (like game console emulators) use this pattern",
            "Virtual machines (JVM, Python interpreter) implement similar cycles",
            "Hardware description languages model CPU behavior this way",
        ],
    },

    relatedTopics: ["Instruction Cycle", "Fetch-Decode-Execute Cycle", "Computer Registers", "Timing and Control"],
    tags: ["cpu-simulator", "python", "instruction-cycle", "fetch-decode-execute", "software"],
}

// =============================================================================
// PROJECTS REGISTRY
// =============================================================================

export const ALL_PROJECTS: ProjectSchema[] = [
    fourBitALUProject,
    cpuSimulatorProject,
]

// Map by ID for quick lookup
export const PROJECTS_BY_ID = new Map<string, ProjectSchema>(
    ALL_PROJECTS.map(p => [p.id, p])
)

// Get projects by category
export function getProjectsByCategory(category: ProjectSchema["category"]): ProjectSchema[] {
    return ALL_PROJECTS.filter(p => p.category === category)
}

// Get projects for a topic
export function getProjectsForTopic(topicName: string): ProjectSchema[] {
    return ALL_PROJECTS.filter(p =>
        p.relatedTopics.some(t => t.toLowerCase().includes(topicName.toLowerCase()))
    )
}
