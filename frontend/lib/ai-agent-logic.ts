export type TopicData = {
    concepts: Record<string, string>
    practiceChecklist: string[]
    flowSteps: string[]
    // Socratic teaching flow - guides conversation from big picture to details
    socraticFlow?: {
        purpose: string[]      // Why does this exist?
        systemLevel: string[]  // What does the whole system do?
        components: string[]   // What are the parts?
        dataFlow: string[]     // How do they interact?
    }
}

export const TOPIC_KNOWLEDGE: Record<string, TopicData> = {
    // Block Diagram of Digital Computer - with full Socratic flow
    "Block diagram of digital computer": {
        concepts: {
            "input unit": "The Input Unit receives data and instructions from external sources like keyboard, mouse, or scanner and converts them into binary form for the CPU to process.",
            "output unit": "The Output Unit takes processed data from the CPU and converts it into human-readable form through devices like monitor, printer, or speakers.",
            "cpu": "The Central Processing Unit (CPU) is the brain of the computer. It contains the Control Unit (CU) for directing operations and the Arithmetic Logic Unit (ALU) for calculations.",
            "control unit": "The Control Unit (CU) directs and coordinates all computer operations. It fetches instructions from memory, decodes them, and controls execution.",
            "alu": "The Arithmetic Logic Unit (ALU) performs all mathematical (add, subtract, multiply) and logical (AND, OR, NOT) operations.",
            "memory": "Memory stores data and instructions. Primary memory (RAM/ROM) is fast but temporary; secondary memory (HDD/SSD) is slower but permanent.",
            "bus": "Buses are pathways that transfer data between components. There are three types: Data Bus, Address Bus, and Control Bus.",
        },
        practiceChecklist: [
            "Include Input Unit",
            "Include Output Unit",
            "Include CPU with Control Unit and ALU",
            "Include Memory Unit",
            "Show data flow between components",
            "Mention the role of buses",
        ],
        flowSteps: ["Input", "Memory", "CPU (CU + ALU)", "Memory", "Output"],
        // Socratic teaching flow for this topic
        socraticFlow: {
            purpose: [
                "Before we look at the diagram, let me ask: Why do you think computers need different units/components?",
                "What problem is a computer trying to solve? What does it need to do?",
                "If you were designing a machine to process information, what basic capabilities would it need?",
            ],
            systemLevel: [
                "At the highest level, a computer takes input, processes it, and produces output. Can you think of an example?",
                "What's the general flow of data in any information processing system?",
                "How is a computer similar to a factory assembly line?",
            ],
            components: [
                "Now, what parts do you think are needed to handle input? What about processing?",
                "Where do you think data is stored while being processed?",
                "What component do you think controls all the other parts?",
            ],
            dataFlow: [
                "How do you think data moves from the keyboard to the screen?",
                "If the CPU needs an instruction from memory, how does it request it?",
                "What role do buses play in connecting all these components?",
            ],
        },
    },
    "CPU Architecture": {
        concepts: {
            alu: "The Arithmetic Logic Unit (ALU) performs mathematical (add, sub) and logical (AND, OR) operations.",
            "control unit": "The Control Unit (CU) directs the operation of the processor, telling the computer's memory, arithmetic/logic unit and input and output devices how to respond to the instructions that have been sent to the processor.",
            register: "Registers are small, high-speed storage locations inside the CPU that temporarily hold data, instructions, and addresses.",
            bus: "Buses are communication systems that transfer data between components inside a computer, or between computers.",
            clock: "The clock signal synchronizes the operations of the computer components. Faster clock speed usually involves faster processing.",
        },
        practiceChecklist: [
            "Mention ALU (Arithmetic Logic Unit)",
            "Mention Control Unit (CU)",
            "Include Registers",
            "Mention Buses (Data, Address, Control)",
            "Connect components correctly",
        ],
        flowSteps: ["Input", "Control Unit", "ALU", "Registers", "Output"],
        socraticFlow: {
            purpose: [
                "Why does a computer need a 'brain'? What tasks does it handle?",
                "What would happen if there was no central processor?",
            ],
            systemLevel: [
                "The CPU has multiple parts working together. What do you think they need to do?",
            ],
            components: [
                "If calculations need to happen, what part handles that?",
                "Who tells everyone what to do?",
            ],
            dataFlow: [
                "How does data move between the ALU and memory?",
            ],
        },
    },
    "Register Transfer Language": {
        concepts: {
            rtl: "Register Transfer Language (RTL) is a notation used to describe micro-operations and data transfer between registers.",
            "micro-operation": "A micro-operation is an elementary operation performed on data stored in registers during one clock pulse.",
            transfer: "Register transfer notation shows how data moves from one register to another, e.g., R2 ← R1 means copy contents of R1 to R2.",
        },
        practiceChecklist: [
            "Define RTL notation",
            "Explain micro-operations",
            "Show register transfer examples",
        ],
        flowSteps: ["Read Source", "Transfer Data", "Write Destination"],
    },
    "Micro-Operations": {
        concepts: {
            arithmetic: "Arithmetic micro-operations include add, subtract, increment, decrement, performed on numeric data.",
            logic: "Logic micro-operations include AND, OR, XOR, NOT, complement operations on binary data.",
            shift: "Shift micro-operations move bits left or right within a register.",
            transfer: "Transfer micro-operations move data between registers.",
        },
        practiceChecklist: [
            "List arithmetic micro-operations",
            "List logic micro-operations",
            "Explain shift operations",
        ],
        flowSteps: ["Fetch Operands", "Perform Operation", "Store Result"],
    },
    "Bus and Memory Transfer": {
        concepts: {
            bus: "A bus is a shared communication pathway connecting multiple components. Only one source can transmit at a time.",
            "data bus": "Data bus carries actual data between components. Width determines how much data can be transferred at once.",
            "address bus": "Address bus carries memory addresses to identify where data should be read or written.",
            "control bus": "Control bus carries control signals like read, write, clock, and interrupt signals.",
            "memory read": "Memory read operation: CPU places address on address bus, sets read signal, memory returns data on data bus.",
            "memory write": "Memory write operation: CPU places address and data on buses, sets write signal, memory stores the data.",
        },
        practiceChecklist: [
            "Explain bus structure",
            "Differentiate data, address, and control buses",
            "Describe memory read operation",
            "Describe memory write operation",
        ],
        flowSteps: ["Address Setup", "Control Signal", "Data Transfer", "Acknowledge"],
    },
    "Instruction Cycle": {
        concepts: {
            fetch: "The Fetch step retrieves the instruction from memory using the address in the Program Counter (PC).",
            decode: "The Decode step interprets the opcode of the instruction to determine what action to take.",
            execute: "The Execute step performs the actual operation specified by the instruction.",
            store: "The Store (or Write Back) step saves the result of the execution back to memory or a register.",
            pc: "Program Counter (PC) holds the address of the next instruction.",
            ir: "Instruction Register (IR) holds the current instruction being executed.",
        },
        practiceChecklist: [
            "Start with Fetch phase",
            "Include Decode phase",
            "Include Execute phase",
            "Mention Program Counter (PC) role",
            "Mention Instruction Register (IR)",
        ],
        flowSteps: ["Fetch", "Decode", "Execute", "Store"],
    },
    "Addressing Modes": {
        concepts: {
            immediate: "Immediate addressing: The operand is specified directly in the instruction.",
            direct: "Direct addressing: The instruction contains the memory address of the operand.",
            indirect: "Indirect addressing: The instruction points to a memory location that contains the address of the operand.",
            register: "Register addressing: The operand is in a CPU register.",
            indexed: "Indexed addressing: Uses an index register added to a base address.",
        },
        practiceChecklist: [
            "Define Immediate Addressing",
            "Define Direct Addressing",
            "Define Indirect Addressing",
            "Provide an example for each",
            "Mention impact on operand fetching",
        ],
        flowSteps: [
            "Read Instruction",
            "Decode Addressing Mode",
            "Calculate Effective Address",
            "Fetch Operand",
            "Execute",
        ],
    },
}

// Fallback for topics not fully populated
const GENERIC_TOPIC: TopicData = {
    concepts: {
        general: "I can help you understand this topic. Ask me about the key definitions or components.",
    },
    practiceChecklist: ["Define key terms", "Explain the main process", "Give an example"],
    flowSteps: ["Start", "Process", "End"],
}

export function getTopicData(topic: string): TopicData {
    return TOPIC_KNOWLEDGE[topic] || GENERIC_TOPIC
}

/**
 * SOCRATIC TUTOR BEHAVIOR
 * ========================
 * Core Rules:
 * - NEVER give full direct answers immediately
 * - ALWAYS begin with a guiding or probing question
 * - Break explanations into small conceptual steps
 * - Encourage reasoning before revealing information
 * - Correct misconceptions politely and immediately
 * - Only give full explanation when learner explicitly asks
 */

// Socratic response templates - organized by teaching strategy
const SOCRATIC_TEMPLATES = {
    // Initial probing - assess understanding first
    probing: [
        "Before I help with that, tell me — what do you already know about {concept}?",
        "That's a great starting point! What's your current understanding of {concept}?",
        "Let me ask you first: What do you think {concept} does in a computer system?",
        "Interesting question! Can you share what you've learned so far about {concept}?",
    ],

    // "Why" and "How" questions - encourage deeper thinking
    deepProbing: [
        "Why do you think {concept} is important in {topic}?",
        "How do you think {concept} connects to the other components we discussed?",
        "What would happen if we didn't have {concept} in the system?",
        "Can you think of a real-world analogy for {concept}?",
    ],

    // Follow-up for partial answers - guide toward completeness
    followUp: [
        "You're getting there! What else might be involved in this process?",
        "Good thinking! Now, what happens next after that step?",
        "That's part of it. Can you think about what comes before or after?",
        "Almost! Let me give you a hint: think about how data flows through the system.",
    ],

    // Confirmation + going deeper - don't stop at correct answers
    confirmation: [
        "Exactly right! Now, can you explain why this matters?",
        "Well done! How would you explain this to someone who's never heard of it?",
        "Correct! Let's go deeper — what problems does this solve?",
        "That's spot on! Can you think of an example where this applies?",
    ],

    // Gentle correction - don't shame, redirect
    correction: [
        "Not quite, but that's a common confusion! Let me guide you — {hint}",
        "I see where you're coming from, but let's think about it differently. {hint}",
        "That's an interesting thought! Actually, the way it works is a bit different. {hint}",
        "Good try! Here's a hint to point you in the right direction: {hint}",
    ],

    // Progressive hints - don't give away the answer
    hints: [
        "Think about what the name '{concept}' suggests...",
        "Consider what happens when data needs to be processed...",
        "Picture a traffic controller directing cars — what does that remind you of?",
        "What's the difference between temporary and permanent storage?",
    ],

    // Encouragement - keep learner engaged
    encouragement: [
        "Great effort! You're thinking like a computer architect now.",
        "I can see you're making connections! Keep going.",
        "That's the kind of reasoning that will help you master this.",
        "Excellent! You're asking the right questions.",
    ],
}

function getRandomTemplate(templates: string[]): string {
    return templates[Math.floor(Math.random() * templates.length)]
}

function formatResponse(template: string, concept: string, topic: string, hint?: string): string {
    return template
        .replace(/{concept}/g, concept)
        .replace(/{topic}/g, topic)
        .replace(/{hint}/g, hint || "")
}

// ============================================================================
// VIDEO REQUEST DETECTION & RESOLUTION
// ============================================================================

// Available video topics (must match video-resolver.ts)
const AVAILABLE_VIDEO_TOPICS = [
    "block_diagram_digital_computer",
    "register_transfer_language",
    "micro_operations",
    "bus_and_memory_transfer",
    "register_transfer",
    "introductory_video"
]

const VIDEO_TOPIC_NAMES: Record<string, string> = {
    "block_diagram_digital_computer": "Block Diagram of Digital Computer",
    "register_transfer_language": "Register Transfer Language",
    "micro_operations": "Micro-Operations",
    "bus_and_memory_transfer": "Bus and Memory Transfer",
    "register_transfer": "Register Transfer",
    "introductory_video": "Introduction to COA"
}

// Keywords that indicate a video request
const VIDEO_REQUEST_INDICATORS = [
    "video",
    "show me",
    "play",
    "watch",
    "generate video",
    "create video",
    "make a video",
    "video on",
    "video about",
    "video for"
]

// Topic matching keywords
const TOPIC_KEYWORDS: Record<string, string[]> = {
    "block_diagram_digital_computer": ["block diagram", "digital computer", "computer diagram", "cpu diagram", "computer architecture diagram", "block"],
    "register_transfer_language": ["register transfer language", "rtl", "register transfer notation"],
    "micro_operations": ["micro operations", "micro-operations", "arithmetic operations", "logic operations", "shift operations"],
    "bus_and_memory_transfer": ["bus", "memory transfer", "data bus", "address bus", "control bus", "memory operations"],
    "register_transfer": ["register transfer", "register", "data transfer"],
    "introductory_video": ["introduction", "intro", "overview", "basics", "getting started"]
}

function isVideoRequest(query: string): boolean {
    const normalized = query.toLowerCase()
    return VIDEO_REQUEST_INDICATORS.some(indicator => normalized.includes(indicator))
}

function matchVideoTopic(query: string): { topic: string; confidence: "high" | "medium" | "low"; reason: string } | null {
    const normalized = query.toLowerCase()

    // Check each topic's keywords
    for (const [topicId, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        for (const keyword of keywords) {
            if (normalized.includes(keyword)) {
                const confidence = keyword.length > 10 ? "high" : "medium"
                return {
                    topic: VIDEO_TOPIC_NAMES[topicId] || topicId,
                    confidence,
                    reason: `Matched keyword "${keyword}" in user query`
                }
            }
        }
    }

    return null
}

export function resolveVideoRequest(query: string): string {
    const match = matchVideoTopic(query)

    if (match) {
        return JSON.stringify({
            type: "VIDEO_MATCH",
            topic: match.topic,
            confidence: match.confidence,
            reason: match.reason
        }, null, 2)
    }

    return JSON.stringify({
        type: "NO_VIDEO_FOUND",
        suggested_topics: Object.values(VIDEO_TOPIC_NAMES)
    }, null, 2)
}

// ============================================================================
// MAIN QUERY EVALUATOR
// ============================================================================


export function evaluateQuery(query: string, topic: string): string {
    const data = getTopicData(topic)
    const normalizedQuery = query.toLowerCase().trim()
    const hasSocraticFlow = data.socraticFlow !== undefined

    // 0. VIDEO REQUEST CHECK - Return JSON for video requests
    if (isVideoRequest(normalizedQuery)) {
        return resolveVideoRequest(query)
    }

    // 1. Check if user EXPLICITLY wants explanation
    const wantsExplanation =
        normalizedQuery.includes("i don't know") ||
        normalizedQuery.includes("i dont know") ||
        normalizedQuery.includes("please explain") ||
        normalizedQuery.includes("just tell me") ||
        normalizedQuery.includes("explain it") ||
        normalizedQuery.includes("tell me the answer") ||
        normalizedQuery.includes("give the answer") ||
        normalizedQuery.includes("i don't understand") ||
        normalizedQuery.includes("i dont understand") ||
        normalizedQuery.includes("give me the answer")

    if (wantsExplanation) {
        // Find the most relevant concept to explain
        for (const [key, explanation] of Object.entries(data.concepts)) {
            if (normalizedQuery.includes(key.toLowerCase()) || normalizedQuery.length < 30) {
                return `Alright, here's the explanation:\n\n${explanation}\n\nDoes that make sense? What part would you like to explore further?`
            }
        }
        // Generic explanation
        const concepts = Object.entries(data.concepts)
        if (concepts.length > 0) {
            const [_, explanation] = concepts[0]
            return `Sure, let me explain:\n\n${explanation}\n\nWhat do you think about this?`
        }
    }

    // 2. Acknowledgments (okay, yes, sure, got it) → Continue with next question
    const acknowledgments = ["okay", "ok", "yes", "sure", "got it", "alright", "fine", "cool", "right", "yep", "yeah", "hmm", "i see"]
    if (acknowledgments.some(ack => normalizedQuery === ack || normalizedQuery === ack + ".")) {
        if (hasSocraticFlow) {
            const nextQuestions = [
                ...data.socraticFlow!.systemLevel,
                ...data.socraticFlow!.components,
                ...data.socraticFlow!.dataFlow,
            ]
            const question = getRandomTemplate(nextQuestions)
            return `Good! Let's continue.\n\n${question}`
        }
        return `Great! So, what do you think is the most important concept in ${topic}?`
    }

    // 3. First greeting ONLY (hi, hello, hey) - but NOT "start" or short responses
    const greetings = ["hi", "hello", "hey", "hii", "hiii"]
    if (greetings.includes(normalizedQuery)) {
        if (hasSocraticFlow) {
            const purposeQ = getRandomTemplate(data.socraticFlow!.purpose)
            return `Hey! 👋 Ready to learn about "${topic}"?\n\nLet's start with a question: ${purposeQ}`
        }
        return `Hey there! 👋 I'm here to help you understand ${topic}.\n\nWhat do you already know about it?`
    }

    // 4. "How do I start" / "Where do I begin" type questions
    if (normalizedQuery.includes("start") || normalizedQuery.includes("begin") || normalizedQuery.includes("where do i")) {
        if (hasSocraticFlow) {
            const purposeQ = getRandomTemplate(data.socraticFlow!.purpose)
            return `Great question! Let's start from the basics.\n\n${purposeQ}`
        }
        return `Let's start simple: What do you think ${topic} is about?`
    }

    // 5. Questions about "what is" or "explain" without explicit request → Probe first
    if (normalizedQuery.startsWith("what is") || normalizedQuery.startsWith("what are") || normalizedQuery.startsWith("explain") || normalizedQuery.startsWith("tell me about") || normalizedQuery.startsWith("define")) {
        // Check for concept match
        for (const [key, _] of Object.entries(data.concepts)) {
            if (normalizedQuery.includes(key.toLowerCase())) {
                if (hasSocraticFlow) {
                    const flowQuestions = [...data.socraticFlow!.components, ...data.socraticFlow!.purpose]
                    const question = getRandomTemplate(flowQuestions)
                    return `Before I explain ${key}, let me ask:\n\n${question}`
                }
                return `Before I explain ${key}, what's your initial guess about what it does?`
            }
        }
        // General "what is" question
        if (hasSocraticFlow) {
            const question = getRandomTemplate(data.socraticFlow!.purpose)
            return `Good question! But first:\n\n${question}`
        }
        return `Interesting! What do you think the answer might be?`
    }

    // 6. "How" questions → Turn back with Socratic question
    if (normalizedQuery.startsWith("how")) {
        if (hasSocraticFlow) {
            const template = getRandomTemplate([...data.socraticFlow!.systemLevel, ...data.socraticFlow!.dataFlow])
            return `That's a great "how" question! Let me help you reason through it:\n\n${template}`
        }
        return `Good question! What's your initial thought on how this might work?`
    }

    // 7. "Why" questions → Encourage reasoning
    if (normalizedQuery.startsWith("why")) {
        if (hasSocraticFlow) {
            const template = getRandomTemplate([...data.socraticFlow!.purpose, ...data.socraticFlow!.systemLevel])
            return `Excellent "why" question! Let's think about it:\n\n${template}`
        }
        return `Great question! Why do YOU think this might be the case?`
    }

    // 8. Direct concept mention → Engage conversationally
    for (const [key, _] of Object.entries(data.concepts)) {
        if (normalizedQuery.includes(key.toLowerCase())) {
            if (hasSocraticFlow) {
                const template = getRandomTemplate([...data.socraticFlow!.components, ...data.socraticFlow!.dataFlow])
                return `Ah, ${key}! That's a key concept.\n\n${template}`
            }
            return `You mentioned ${key}. What do you understand about it so far?`
        }
    }

    // 9. User attempting an answer → Confirm or guide
    const attemptIndicators = ["i think", "maybe", "probably", "it's", "it is", "because", "i believe", "my guess", "i would say", "it seems like", "it does", "they do"]
    const isAttempt = attemptIndicators.some(ind => normalizedQuery.includes(ind))

    if (isAttempt) {
        const matchedConcept = Object.keys(data.concepts).find(
            key => normalizedQuery.includes(key.toLowerCase())
        )

        if (matchedConcept) {
            if (hasSocraticFlow && data.socraticFlow!.dataFlow.length > 0) {
                const deeperQ = getRandomTemplate(data.socraticFlow!.dataFlow)
                return `Yes! You're getting it. ${matchedConcept} is definitely relevant.\n\nNow, ${deeperQ}`
            }
            return `Good thinking! You're on the right track with ${matchedConcept}. Can you expand on that?`
        } else {
            if (hasSocraticFlow) {
                const hint = getRandomTemplate(data.socraticFlow!.components)
                return `I see where you're going! Let me give you a nudge:\n\n${hint}`
            }
            return `Interesting perspective! Can you tell me more about your reasoning?`
        }
    }

    // 10. Questions with "?" → Engage naturally
    if (normalizedQuery.includes("?")) {
        if (hasSocraticFlow) {
            const template = getRandomTemplate([...data.socraticFlow!.systemLevel, ...data.socraticFlow!.dataFlow])
            return `Good question! Let me turn that around:\n\n${template}`
        }
        return `That's a thoughtful question. What do you think the answer might be?`
    }

    // 11. Fallback → Keep conversation going naturally
    if (hasSocraticFlow) {
        const questions = [...data.socraticFlow!.purpose, ...data.socraticFlow!.systemLevel, ...data.socraticFlow!.components]
        const question = getRandomTemplate(questions)
        return `Interesting! Here's something to think about:\n\n${question}`
    }

    return `I'm here to help you understand ${topic}. What specific aspect would you like to explore?`
}

export type PracticeFeedback = {
    score: number
    missing: string[]
    message: string
}

export function evaluatePractice(input: string, topic: string): PracticeFeedback {
    const data = getTopicData(topic)
    const normalizedInput = input.toLowerCase()
    const missing: string[] = []
    let matches = 0

    for (const item of data.practiceChecklist) {
        // strict check? simplified for this task: check if key words from checklist exist in input
        // We'll strip common words and check for the "core" phrase. 
        // Actually, let's just use the full string match for simplicity or a slightly smarter "includes" check
        // Ideally we would extract keywords from the checklist item.
        // For this rule-based system, let's assume the checklist item text itself (or parts of it) should be loosely present.

        // Simple heuristic: check if at least one significant word from the checklist item is in the input
        // This is "loose" validation.
        const keywords = item.toLowerCase().replace(/mention|include|define|role|phase/g, "").trim().split(" ")
        const found = keywords.some(k => k.length > 3 && normalizedInput.includes(k)) // >3 char words

        if (found || normalizedInput.includes(item.toLowerCase())) {
            matches++
        } else {
            missing.push(item)
        }
    }

    const score = Math.round((matches / data.practiceChecklist.length) * 100)

    let message = "Good effort!"
    if (score === 100) message = "Perfect! You covered all the key points."
    else if (score > 60) message = "Great job, but you missed a few details."
    else message = "Keep trying. Make sure to cover the checklist items."

    return { score, missing, message }
}

export type FlowValidation = {
    valid: boolean
    message: string
}

export function validateFlow(userSteps: string[], topic: string): FlowValidation {
    const data = getTopicData(topic)
    const correctOrder = data.flowSteps

    // Check lengths
    if (userSteps.length === 0) return { valid: false, message: "Please add some steps." }

    // Check for "out of order" or "missing"
    // We will look for subsequence match.
    // This is simple string matching.

    let correctIndex = 0
    for (const step of userSteps) {
        // match step to the closest correct step forward
        // find index of this step in correctOrder starting from correctIndex
        const matchedIndex = correctOrder.findIndex((s, i) => i >= correctIndex && s.toLowerCase() === step.toLowerCase())

        if (matchedIndex !== -1) {
            correctIndex = matchedIndex
        } else {
            // If strict checking:
            // return { valid: false, message: `Step '${step}' seems incorrect or out of order.`}
        }
    }

    // Simpler validation for this task: 
    // "Does the user input contain the steps in the approximate right order?"

    const userString = userSteps.join(",").toLowerCase()
    const missing = correctOrder.filter(s => !userString.includes(s.toLowerCase()))

    if (missing.length > 0) {
        return { valid: false, message: `Missing steps: ${missing.join(", ")}` }
    }

    // Check order roughly (by index of appearance)
    let lastIdx = -1
    for (const step of correctOrder) {
        const idx = userSteps.findIndex(u => u.toLowerCase().includes(step.toLowerCase()))
        if (idx !== -1) {
            if (idx < lastIdx) {
                return { valid: false, message: `Step '${step}' appears out of order.` }
            }
            lastIdx = idx
        }
    }

    return { valid: true, message: "Flow looks correct!" }
}
