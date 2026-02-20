// ============================================================================
// HARDWARE SIMULATION SCHEMA
// Type definitions for hardware-inspired project simulations
// ============================================================================

// Component Types
export type HardwareComponentType =
    | "register"
    | "alu"
    | "memory"
    | "bus"
    | "control-unit"
    | "mux"
    | "decoder"

// Position on canvas
export interface Position {
    x: number
    y: number
}

// Connection port on a component
export interface ConnectionPort {
    id: string
    side: "top" | "bottom" | "left" | "right"
    type: "input" | "output" | "bidirectional"
    label?: string
}

// Hardware component placed on canvas
export interface HardwareComponent {
    id: string
    type: HardwareComponentType
    label: string
    position: Position
    size: { width: number; height: number }
    ports: ConnectionPort[]
    state: ComponentState
    locked?: boolean  // Cannot be moved if locked
}

// Component-specific states
export interface RegisterState {
    value: number
    bitWidth: number
    loading: boolean
}

export interface ALUState {
    operation: "ADD" | "SUB" | "AND" | "OR" | "NOT" | "PASS" | null
    inputA: number
    inputB: number
    output: number
    carryOut: boolean
    zeroFlag: boolean
}

export interface MemoryState {
    data: number[]
    addressBus: number
    dataBus: number
    readEnable: boolean
    writeEnable: boolean
}

export interface BusState {
    value: number
    owner: string | null  // Component ID that's driving the bus
    active: boolean
}

export interface ControlUnitState {
    signals: Record<string, boolean>
    currentMicroOp: string | null
}

export type ComponentState =
    | RegisterState
    | ALUState
    | MemoryState
    | BusState
    | ControlUnitState
    | Record<string, unknown>

// Data path connection between components
export interface DataPath {
    id: string
    fromComponent: string
    fromPort: string
    toComponent: string
    toPort: string
    active: boolean
    dataValue?: number
    animating?: boolean
}

// Control signal definition
export interface ControlSignal {
    id: string
    name: string
    shortName: string
    description: string
    active: boolean
    group?: string  // e.g., "register", "memory", "alu"
}

// Simulation state
export interface SimulationState {
    components: HardwareComponent[]
    dataPaths: DataPath[]
    controlSignals: ControlSignal[]
    clockCycle: number
    busOwner: string | null
    isRunning: boolean
    animationQueue: DataFlowAnimation[]
}

// Animation for data flow visualization
export interface DataFlowAnimation {
    id: string
    pathId: string
    value: number
    progress: number  // 0 to 1
    color?: string
}

// Stage definition for hardware projects
export interface HardwareStage {
    id: string
    title: string
    instructions: string
    detailedDescription?: string

    // What the learner must do
    task: StageTask

    // Validation rules
    validation: StageValidation[]

    // Hints for this stage
    hints: StageHint[]

    // Success message
    successMessage: string

    // Components available in this stage
    availableComponents?: HardwareComponentType[]

    // Pre-placed components (locked)
    preplacedComponents?: HardwareComponent[]

    // Required control signals to toggle
    requiredSignals?: string[]

    estimatedMinutes?: number
}

// Task types for stages
export type StageTask =
    | { type: "place-component"; componentType: HardwareComponentType; targetZone?: { x: number; y: number; radius: number } }
    | { type: "connect-path"; from: string; to: string }
    | { type: "toggle-signal"; signalId: string; targetState: boolean }
    | { type: "execute-clock" }
    | { type: "observe-value"; componentId: string; expectedValue: number }
    | { type: "set-bus-owner"; componentId: string }
    | { type: "multiple"; tasks: StageTask[] }

// Validation for stages
export interface StageValidation {
    id: string
    type: "component-placed" | "path-connected" | "signal-active" | "value-correct" | "custom"
    message: string
    check: (state: SimulationState) => boolean
}

// Hints
export interface StageHint {
    id: string
    text: string
    revealCondition: "on-request" | "on-error" | "after-attempts"
    attemptsRequired?: number
}

// Complete hardware project schema
export interface HardwareProject {
    id: string
    title: string
    category: "hardware-inspired"
    difficulty: "beginner" | "intermediate" | "advanced"
    estimatedMinutes: number

    introduction: {
        problemStatement: string
        engineeringContext: string
        prerequisites: string[]
    }

    objective: string

    constraints: {
        id: string
        description: string
        enforced: boolean
    }[]

    stages: HardwareStage[]

    reflection: {
        whatWasBuilt: string
        conceptsReinforced: string[]
        realWorldApplications: string[]
    }

    // Initial simulation state
    initialState: Partial<SimulationState>

    // Available control signals for this project
    controlSignals: ControlSignal[]

    relatedTopics: string[]
    tags: string[]
}

// Project progress tracking
export interface HardwareProjectProgress {
    projectId: string
    currentStageIndex: number
    stageStates: Map<string, HardwareStageState>
    startedAt: Date
    completedAt?: Date
}

export interface HardwareStageState {
    status: "locked" | "active" | "completed"
    attempts: number
    hintsRevealed: string[]
    timeSpent: number
    errors: string[]
}

// Validation result
export interface HardwareValidationResult {
    passed: boolean
    errors: {
        type: string
        message: string
        details?: string
        hint?: string
    }[]
    score?: number
}

// Analytics events
export type SimulationEvent =
    | { type: "stage_started"; projectId: string; stageId: string; timestamp: number }
    | { type: "component_placed"; componentType: HardwareComponentType; position: Position; timestamp: number }
    | { type: "component_removed"; componentId: string; timestamp: number }
    | { type: "path_connected"; fromComponent: string; toComponent: string; timestamp: number }
    | { type: "signal_toggled"; signalId: string; newState: boolean; timestamp: number }
    | { type: "clock_triggered"; cycleNumber: number; timestamp: number }
    | { type: "stage_validated"; stageId: string; passed: boolean; errors: string[]; timestamp: number }
    | { type: "error_triggered"; stageId: string; errorType: string; message: string; timestamp: number }
    | { type: "hint_revealed"; stageId: string; hintId: string; timestamp: number }
    | { type: "project_completed"; projectId: string; totalTime: number; totalAttempts: number; timestamp: number }

// Component palette item
export interface PaletteItem {
    type: HardwareComponentType
    label: string
    icon: string
    description: string
    defaultSize: { width: number; height: number }
    defaultPorts: ConnectionPort[]
    color: string
}

// Default component definitions
export const COMPONENT_DEFINITIONS: Record<HardwareComponentType, PaletteItem> = {
    register: {
        type: "register",
        label: "Register",
        icon: "📦",
        description: "8-bit data storage register",
        defaultSize: { width: 120, height: 80 },
        defaultPorts: [
            { id: "in", side: "left", type: "input", label: "D" },
            { id: "out", side: "right", type: "output", label: "Q" },
            { id: "load", side: "bottom", type: "input", label: "LD" },
        ],
        color: "#C084FC",
    },
    alu: {
        type: "alu",
        label: "ALU",
        icon: "⚙️",
        description: "Arithmetic Logic Unit",
        defaultSize: { width: 140, height: 100 },
        defaultPorts: [
            { id: "a", side: "left", type: "input", label: "A" },
            { id: "b", side: "left", type: "input", label: "B" },
            { id: "out", side: "right", type: "output", label: "Out" },
            { id: "op", side: "top", type: "input", label: "Op" },
        ],
        color: "#22D3EE",
    },
    memory: {
        type: "memory",
        label: "Memory",
        icon: "🗄️",
        description: "RAM storage block",
        defaultSize: { width: 120, height: 100 },
        defaultPorts: [
            { id: "addr", side: "left", type: "input", label: "Addr" },
            { id: "data", side: "right", type: "bidirectional", label: "Data" },
            { id: "read", side: "bottom", type: "input", label: "RD" },
            { id: "write", side: "bottom", type: "input", label: "WR" },
        ],
        color: "#34D399",
    },
    bus: {
        type: "bus",
        label: "Bus",
        icon: "═══",
        description: "Data highway connecting components",
        defaultSize: { width: 300, height: 20 },
        defaultPorts: [
            { id: "tap1", side: "top", type: "bidirectional" },
            { id: "tap2", side: "top", type: "bidirectional" },
            { id: "tap3", side: "top", type: "bidirectional" },
        ],
        color: "#F59E0B",
    },
    "control-unit": {
        type: "control-unit",
        label: "Control Unit",
        icon: "🎛️",
        description: "Generates control signals",
        defaultSize: { width: 140, height: 80 },
        defaultPorts: [
            { id: "clk", side: "left", type: "input", label: "CLK" },
            { id: "signals", side: "right", type: "output", label: "Ctrl" },
        ],
        color: "#F472B6",
    },
    mux: {
        type: "mux",
        label: "Multiplexer",
        icon: "⋮",
        description: "Selects one of multiple inputs",
        defaultSize: { width: 80, height: 100 },
        defaultPorts: [
            { id: "in0", side: "left", type: "input", label: "0" },
            { id: "in1", side: "left", type: "input", label: "1" },
            { id: "sel", side: "bottom", type: "input", label: "S" },
            { id: "out", side: "right", type: "output", label: "Y" },
        ],
        color: "#A78BFA",
    },
    decoder: {
        type: "decoder",
        label: "Decoder",
        icon: "⋯",
        description: "Converts binary to one-hot",
        defaultSize: { width: 80, height: 100 },
        defaultPorts: [
            { id: "in", side: "left", type: "input", label: "In" },
            { id: "out0", side: "right", type: "output", label: "0" },
            { id: "out1", side: "right", type: "output", label: "1" },
            { id: "out2", side: "right", type: "output", label: "2" },
            { id: "out3", side: "right", type: "output", label: "3" },
        ],
        color: "#FB923C",
    },
}

// Helper to create a new component instance
export function createComponent(
    type: HardwareComponentType,
    position: Position,
    id?: string
): HardwareComponent {
    const def = COMPONENT_DEFINITIONS[type]
    return {
        id: id || `${type}-${Date.now()}`,
        type,
        label: def.label,
        position,
        size: { ...def.defaultSize },
        ports: def.defaultPorts.map(p => ({ ...p })),
        state: getDefaultState(type),
    }
}

// Get default state for component type
function getDefaultState(type: HardwareComponentType): ComponentState {
    switch (type) {
        case "register":
            return { value: 0, bitWidth: 8, loading: false } as RegisterState
        case "alu":
            return { operation: null, inputA: 0, inputB: 0, output: 0, carryOut: false, zeroFlag: false } as ALUState
        case "memory":
            return { data: new Array(16).fill(0), addressBus: 0, dataBus: 0, readEnable: false, writeEnable: false } as MemoryState
        case "bus":
            return { value: 0, owner: null, active: false } as BusState
        case "control-unit":
            return { signals: {}, currentMicroOp: null } as ControlUnitState
        default:
            return {}
    }
}
