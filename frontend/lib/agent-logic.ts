export interface AgentResponse {
    text: string
    action?: "review_practice" | "suggest_flashcard"
}

export interface TopicContext {
    topicId: string
    topicName: string
    keyConcepts: string[]
}

const TOPIC_KNOWLEDGE: Record<string, {
    keywords: Record<string, string>
    practiceChecklist: {
        required: string[]
        sequence?: string[] // simplified sequence check (a must come before b)
    }
}> = {
    "CPU Architecture": {
        keywords: {
            "alu": "The ALU (Arithmetic Logic Unit) handles all math and logic. Think of it as the calculator inside the CPU.",
            "control unit": "The Control Unit directs traffic. It tells other parts what to do but doesn't process data itself.",
            "register": "Registers are super-fast, tiny storage spots for immediate data usage.",
            "bus": "Buses are the highways for data to travel between components.",
            "clock": "The clock sets the pace for the CPU. Faster clock = potentially more instructions per second."
        },
        practiceChecklist: {
            required: ["ALU", "Control Unit", "Registers", "Buses"],
        }
    },
    "Instruction Cycle": {
        keywords: {
            "fetch": "Fetch gets the instruction from Memory into the CPU.",
            "decode": "Decode figures out what the instruction means.",
            "execute": "Execute actually runs the instruction (using ALU, etc.).",
            "program counter": "PC tells the CPU *where* to look for the next instruction.",
            "ir": "IR (Instruction Register) holds the *current* instruction showing what to do now."
        },
        practiceChecklist: {
            required: ["Fetch", "Decode", "Execute", "Program Counter", "IR"],
            sequence: ["Fetch", "Decode", "Execute"]
        }
    },
    // Default fallback for other topics
    "default": {
        keywords: {
            "explain": "I can explain the key concepts of this topic. What specific part are you stuck on?",
            "help": "I'm here to clarify doubts. Ask me about the definitions or the flow of this topic."
        },
        practiceChecklist: {
            required: ["Concept"],
        }
    }
}

export function getAgentResponse(message: string, context: TopicContext): AgentResponse {
    const lowerMsg = message.toLowerCase()
    const topicData = TOPIC_KNOWLEDGE[context.topicName] || TOPIC_KNOWLEDGE["default"]

    // 1. Check for Practice/Check request
    if (lowerMsg.includes("check") || lowerMsg.includes("review") || lowerMsg.includes("verify") || lowerMsg.length > 50) {
        if (lowerMsg.length > 20) {
            return evaluatePractice(message, context.topicName)
        } else {
            return { text: "Sure! Please paste your practice notes or explanation here, and I'll check if you've covered the key steps." }
        }
    }

    // 2. Keyword Matching
    for (const [key, explanation] of Object.entries(topicData.keywords)) {
        if (lowerMsg.includes(key)) {
            return { text: explanation }
        }
    }

    // 3. General Fallbacks
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
        return { text: `Hello! I'm ready to help you with ${context.topicName}. Ask me about any concept!` }
    }

    return { text: "I'm not sure about that specific detail yet. Try asking about the key concepts listed in the Learn tab, or paste your understanding for me to check!" }
}

function evaluatePractice(input: string, topicName: string): AgentResponse {
    const data = TOPIC_KNOWLEDGE[topicName] || TOPIC_KNOWLEDGE["default"]
    const lowerInput = input.toLowerCase()

    const missing = data.practiceChecklist.required.filter(req => !lowerInput.includes(req.toLowerCase()))

    let sequenceError = false
    if (data.practiceChecklist.sequence) {
        let lastIdx = -1
        for (const step of data.practiceChecklist.sequence) {
            const idx = lowerInput.indexOf(step.toLowerCase())
            if (idx === -1) continue // Missing step handled above
            if (idx < lastIdx) {
                sequenceError = true
                break
            }
            lastIdx = idx
        }
    }

    let response = "Here's my feedback on your notes:\n\n"

    if (missing.length === 0 && !sequenceError) {
        return { text: "Great job! You've covered all the key components in the corect logical order. Your understanding seems solid." }
    }

    if (missing.length > 0) {
        response += `• It looks like you missed discussing: **${missing.join(", ")}**.\n`
    }

    if (sequenceError) {
        response += `• The order of operations seems mixed up. Remember the standard flow (e.g., ${data.practiceChecklist.sequence?.join(" -> ")}).\n`
    }

    return {
        text: response,
        action: "review_practice"
    }
}
