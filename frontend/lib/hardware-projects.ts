// ============================================================================
// EXAMPLE HARDWARE PROJECT: CPU DATA PATH
// Full project schema for "Build the CPU Data Path" simulation
// ============================================================================

import type { HardwareProject, HardwareComponent, ControlSignal } from "./hardware-schema"
import { createComponent } from "./hardware-schema"

// Pre-defined control signals for this project
const CPU_CONTROL_SIGNALS: ControlSignal[] = [
    {
        id: "reg-load",
        name: "Register Load",
        shortName: "REG_LD",
        description: "Enable loading data into the register",
        active: false,
        group: "register",
    },
    {
        id: "reg-enable",
        name: "Register Enable",
        shortName: "REG_EN",
        description: "Enable register output to bus",
        active: false,
        group: "register",
    },
    {
        id: "alu-enable",
        name: "ALU Enable",
        shortName: "ALU_EN",
        description: "Enable ALU operation",
        active: false,
        group: "alu",
    },
    {
        id: "mem-read",
        name: "Memory Read",
        shortName: "MEM_RD",
        description: "Read data from memory",
        active: false,
        group: "memory",
    },
    {
        id: "mem-write",
        name: "Memory Write",
        shortName: "MEM_WR",
        description: "Write data to memory",
        active: false,
        group: "memory",
    },
    {
        id: "bus-enable",
        name: "Bus Enable",
        shortName: "BUS_EN",
        description: "Enable data transfer on bus",
        active: false,
        group: "bus",
    },
]

// Pre-placed components for stage layout
const STAGE_1_COMPONENTS: HardwareComponent[] = []

const STAGE_3_COMPONENTS: HardwareComponent[] = [
    createComponent("register", { x: 100, y: 100 }, "reg-a"),
    createComponent("alu", { x: 250, y: 100 }, "alu-main"),
]

export const cpuDataPathProject: HardwareProject = {
    id: "cpu-data-path",
    title: "Build the CPU Data Path",
    category: "hardware-inspired",
    difficulty: "intermediate",
    estimatedMinutes: 20,

    introduction: {
        problemStatement:
            "In a real CPU, data flows from memory through registers to the ALU and back. This orchestrated movement is controlled by precise timing signals. Your task is to build this path and observe how control signals orchestrate the flow.",
        engineeringContext:
            "The CPU data path is the highway system of a processor. Understanding how data moves between components is fundamental to computer architecture. Every instruction you write in code eventually becomes signals flowing through paths like the one you'll build.",
        prerequisites: [
            "Understanding of CPU registers",
            "Basic knowledge of ALU operations",
            "Familiarity with control signals",
        ],
    },

    objective:
        "Build a functional CPU data path by placing components, connecting them via the bus, configuring control signals, and executing a data transfer operation.",

    constraints: [
        {
            id: "single-bus-driver",
            description: "Only one component can drive the bus at a time",
            enforced: true,
        },
        {
            id: "clock-required",
            description: "Data transfers only occur on clock cycles",
            enforced: true,
        },
        {
            id: "sequential-stages",
            description: "Complete each stage before proceeding",
            enforced: true,
        },
    ],

    stages: [
        // Stage 1: Place Register
        {
            id: "place-register",
            title: "Place a Register",
            instructions: "Select and place a Register component on the 3D canvas. Registers are 8-bit storage elements that hold data temporarily.",
            detailedDescription: "Click on the canvas to place a register. Position it on the left side of the workspace for a logical data flow layout.",
            task: { type: "place-component", componentType: "register" },
            validation: [
                {
                    id: "has-register",
                    type: "component-placed",
                    message: "Place a Register component on the canvas",
                    check: (state) => (state.components || []).some(c => c.type === "register"),
                },
            ],
            hints: [
                { id: "hint-1", text: "Registers store intermediate values during computation.", revealCondition: "on-request" },
                { id: "hint-2", text: "Click anywhere on the 3D canvas to place the component.", revealCondition: "after-attempts", attemptsRequired: 2 },
            ],
            successMessage: "Register placed! This will store our data value.",
            availableComponents: ["register"],
            estimatedMinutes: 2,
        },

        // Stage 2: Place ALU
        {
            id: "place-alu",
            title: "Add the ALU",
            instructions: "Place an ALU (Arithmetic Logic Unit) component. The ALU performs mathematical and logical operations on data.",
            detailedDescription: "Position the ALU to the right of the register. Data will flow from the register into the ALU for processing.",
            task: { type: "place-component", componentType: "alu" },
            validation: [
                {
                    id: "has-alu",
                    type: "component-placed",
                    message: "Place an ALU component on the canvas",
                    check: (state) => (state.components || []).some(c => c.type === "alu"),
                },
            ],
            hints: [
                { id: "hint-1", text: "The ALU is the computational heart of the CPU.", revealCondition: "on-request" },
            ],
            successMessage: "ALU added! Now we have computation capability.",
            availableComponents: ["alu"],
            estimatedMinutes: 2,
        },

        // Stage 3: Place Memory
        {
            id: "place-memory",
            title: "Add Memory",
            instructions: "Place a Memory block. Memory stores program data that the CPU reads and writes during execution.",
            task: { type: "place-component", componentType: "memory" },
            validation: [
                {
                    id: "has-memory",
                    type: "component-placed",
                    message: "Place a Memory component on the canvas",
                    check: (state) => (state.components || []).some(c => c.type === "memory"),
                },
            ],
            hints: [
                { id: "hint-1", text: "Memory holds the data that programs operate on.", revealCondition: "on-request" },
            ],
            successMessage: "Memory added! The data path is taking shape.",
            availableComponents: ["memory"],
            estimatedMinutes: 2,
        },

        // Stage 4: Place Bus
        {
            id: "place-bus",
            title: "Connect with a Bus",
            instructions: "Place a Bus to connect all components. The bus is a shared communication channel that transfers data between components.",
            detailedDescription: "The bus allows any component to send data to any other component, but only one can 'drive' the bus at a time.",
            task: { type: "place-component", componentType: "bus" },
            validation: [
                {
                    id: "has-bus",
                    type: "component-placed",
                    message: "Place a Bus component to connect the system",
                    check: (state) => (state.components || []).some(c => c.type === "bus"),
                },
            ],
            hints: [
                { id: "hint-1", text: "A bus is like a highway - only one car (data source) can use a lane at a time.", revealCondition: "on-request" },
            ],
            successMessage: "Bus connected! All components can now communicate.",
            availableComponents: ["bus"],
            estimatedMinutes: 2,
        },

        // Stage 5: Configure Control Signals
        {
            id: "configure-signals",
            title: "Set Control Signals",
            instructions: "Configure the control signals for a LOAD operation: Enable memory read (MEM_RD) and register load (REG_LD).",
            detailedDescription: "Control signals determine what each component does during a clock cycle. For loading data from memory to a register, we need to read from memory and load into the register.",
            task: {
                type: "multiple",
                tasks: [
                    { type: "toggle-signal", signalId: "mem-read", targetState: true },
                    { type: "toggle-signal", signalId: "reg-load", targetState: true },
                ],
            },
            validation: [
                {
                    id: "mem-read-on",
                    type: "signal-active",
                    message: "Enable the MEM_RD (Memory Read) signal",
                    check: (state) => (state.controlSignals || []).some(s => s.id === "mem-read" && s.active),
                },
                {
                    id: "reg-load-on",
                    type: "signal-active",
                    message: "Enable the REG_LD (Register Load) signal",
                    check: (state) => (state.controlSignals || []).some(s => s.id === "reg-load" && s.active),
                },
            ],
            hints: [
                { id: "hint-1", text: "MEM_RD tells memory to output its data. REG_LD tells the register to capture incoming data.", revealCondition: "on-request" },
                { id: "hint-2", text: "Toggle the switches in the Control Signals panel on the right.", revealCondition: "on-error" },
            ],
            successMessage: "Control signals configured! Ready for clock execution.",
            requiredSignals: ["mem-read", "reg-load"],
            estimatedMinutes: 3,
        },

        // Stage 6: Execute Clock Cycle
        {
            id: "execute-clock",
            title: "Trigger Clock Cycle",
            instructions: "Press the CLOCK button to execute a clock cycle. Watch the data flow from memory through the bus into the register.",
            detailedDescription: "On the rising edge of the clock, all enabled operations execute simultaneously. The memory outputs its data, and the register captures it.",
            task: { type: "execute-clock" },
            validation: [
                {
                    id: "clock-triggered",
                    type: "custom",
                    message: "Trigger at least one clock cycle",
                    check: (state) => (state.clockCycle || 0) >= 1,
                },
            ],
            hints: [
                { id: "hint-1", text: "The CLOCK button is in the header bar at the top.", revealCondition: "on-request" },
            ],
            successMessage: "Clock executed! Data has been transferred successfully.",
            estimatedMinutes: 2,
        },

        // Stage 7: Reflection
        {
            id: "reflection",
            title: "Final Reflection",
            instructions: "You've built a complete CPU data path! Review the system you created and understand how the components work together.",
            detailedDescription: "Every instruction your computer executes involves data paths like this. The control unit generates signals, memory provides data, registers hold intermediate values, and the ALU performs computations.",
            task: { type: "observe-value", componentId: "any", expectedValue: 0 },
            validation: [
                {
                    id: "acknowledged",
                    type: "custom",
                    message: "Review the system and proceed",
                    check: () => true, // Always passes
                },
            ],
            hints: [],
            successMessage: "Congratulations! You've mastered the CPU data path.",
            estimatedMinutes: 2,
        },
    ],

    reflection: {
        whatWasBuilt:
            "A functional CPU data path with Register, ALU, Memory, and Bus components connected via control signals that orchestrate data flow on clock cycles.",
        conceptsReinforced: [
            "CPU data path architecture",
            "Role of control signals in timing",
            "Bus-based communication",
            "Register transfer operations",
            "Clock-synchronized execution",
        ],
        realWorldApplications: [
            "Every CPU uses data paths for instruction execution",
            "Understanding data flow helps optimize software performance",
            "Hardware designers use these concepts to build processors",
        ],
    },

    initialState: {
        components: [],
        dataPaths: [],
        clockCycle: 0,
        busOwner: null,
        isRunning: false,
        animationQueue: [],
    },

    controlSignals: CPU_CONTROL_SIGNALS,

    relatedTopics: [
        "Register Transfer",
        "Bus and Memory Transfer",
        "Arithmetic Logic Shift Unit",
        "Timing and Control",
    ],

    tags: ["cpu", "data-path", "registers", "alu", "bus", "control-signals", "3d-simulation"],
}

// Export all hardware projects
export const HARDWARE_PROJECTS: HardwareProject[] = [
    cpuDataPathProject,
]

// Map by ID
export const HARDWARE_PROJECTS_BY_ID = new Map<string, HardwareProject>(
    HARDWARE_PROJECTS.map(p => [p.id, p])
)
