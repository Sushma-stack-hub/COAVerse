export interface Project {
    id: string
    title: string
    category: "Conceptual" | "Software" | "Hardware-inspired"
    concept: string
    outcome: string
}

export interface PracticeResult {
    missingSteps: string[]
    missingComponents: string[]
    incorrectSequence: boolean
    score: number
}

export interface Flashcard {
    id: string
    question: string
    answer: string
    state: "New" | "Seen" | "Weak" | "Strong"
    difficulty: "Easy" | "Medium" | "Hard"
}

export interface PlannerEvent {
    id: string
    title: string
    type: "Topic" | "Quiz" | "Flashcard"
    status: "Pending" | "Done"
    dueDate: string // YYYY-MM-DD
}

// Mock Data Store (In-memory for session)
const PROJECTS: Record<string, Project[]> = {
    "CPU Architecture": [
        {
            id: "p1",
            title: "Design a 4-bit ALU",
            category: "Conceptual",
            concept: "ALU Operations & Logic Gates",
            outcome: "Understand how arithmetic and logic operations are implemented digitally.",
        },
        {
            id: "p2",
            title: "CPU Simulator in Python",
            category: "Software",
            concept: "Fetch-Decode-Execute Cycle",
            outcome: "Visualize the instruction cycle programmatically.",
        },
        {
            id: "p3",
            title: "Breadboard Simple CPU",
            category: "Hardware-inspired",
            concept: "Data Path & Control Signals",
            outcome: "Physical realization of register transfers and bus systems.",
        },
        {
            id: "p4",
            title: "Cache Memory Simulator",
            category: "Software",
            concept: "Cache Mapping Techniques",
            outcome: "Implement Direct Mapped, Associative, and Set Associative cache logic.",
        },
        {
            id: "p5",
            title: "Pipeline Hazard Visualizer",
            category: "Conceptual",
            concept: "Instruction Pipelining & Hazards",
            outcome: "Analyze data and control hazards in a 5-stage MIPS pipeline.",
        },
        {
            id: "p6",
            title: "Traffic Light Controller (8085)",
            category: "Hardware-inspired",
            concept: "Assembly Language & I/O",
            outcome: "Write an assembly program to control a real-time traffic system simulation.",
        },
    ],
}

const FLASHCARDS: Record<string, Flashcard[]> = {
    "CPU Architecture": [
        { id: "f1", question: "What does ALU stand for?", answer: "Arithmetic Logic Unit", state: "New", difficulty: "Easy" },
        { id: "f2", question: "What is the function of the Program Counter?", answer: "Holds the address of the next instruction", state: "New", difficulty: "Medium" },
        { id: "f3", question: "Define 'Bus' in computer architecture.", answer: "A communication system that transfers data between components.", state: "New", difficulty: "Easy" },
    ],
}

const PLANNER_DATA: PlannerEvent[] = [
    { id: "e1", title: "Complete CPU Architecture", type: "Topic", status: "Pending", dueDate: "2025-12-16" },
    { id: "e2", title: "Instruction Cycle Quiz", type: "Quiz", status: "Pending", dueDate: "2025-12-17" },
    { id: "e3", title: "Review Flashcards: Registers", type: "Flashcard", status: "Pending", dueDate: "2025-12-18" },
]

// API Methods
export const backendApi = {
    fetchTopicProjects: async (topicId: string): Promise<Project[]> => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        // Return specific or generic projects
        return PROJECTS[topicId] || PROJECTS["CPU Architecture"]
    },

    submitPracticeReview: async (topicId: string, input: string): Promise<PracticeResult> => {
        await new Promise((resolve) => setTimeout(resolve, 800))
        // Deterministic rule-based eval
        const missingSteps = []
        const missingComponents = []
        let incorrectSequence = false

        if (!input.toLowerCase().includes("fetch")) missingSteps.push("Fetch Phase")
        if (!input.toLowerCase().includes("decode")) missingSteps.push("Decode Phase")
        if (!input.toLowerCase().includes("alu")) missingComponents.push("ALU")
        if (!input.toLowerCase().includes("register")) missingComponents.push("Registers")

        // Simple sequence check
        const fetchIdx = input.toLowerCase().indexOf("fetch")
        const execIdx = input.toLowerCase().indexOf("execute")
        if (fetchIdx > -1 && execIdx > -1 && fetchIdx > execIdx) {
            incorrectSequence = true
        }

        return {
            missingSteps,
            missingComponents,
            incorrectSequence,
            score: Math.max(0, 100 - (missingSteps.length * 20 + missingComponents.length * 15 + (incorrectSequence ? 30 : 0))),
        }
    },

    fetchTopicFlashcards: async (topicId: string): Promise<Flashcard[]> => {
        await new Promise((resolve) => setTimeout(resolve, 400))
        return FLASHCARDS[topicId] || FLASHCARDS["CPU Architecture"]
    },

    updateFlashcardMastery: async (cardId: string, state: "Weak" | "Strong"): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        console.log(`[BACKEND] Updated Flashcard ${cardId} to ${state}`)
    },

    fetchPlannerData: async (): Promise<PlannerEvent[]> => {
        await new Promise((resolve) => setTimeout(resolve, 600))
        return PLANNER_DATA
    },
}
