export const topics = [
    "Block diagram of digital computer",
    "Register Transfer Language",
    "Micro-Operations: Register transfer Language",
    "Register Transfer",
    "Bus and Memory Transfer",
    "Arithmetic Micro Operations",
    "Logic Micro Operations",
    "Shift Micro Operations",
    "Arithmetic Logic Shift Unit",
    "Computer Organization and Design: Instruction Codes",
    "Computer Registers",
    "Computer Instructions",
    "Timing and Control",
    "Instruction Cycle",
    "Memory Reference Instructions",
    "Input Output and Interrupt",
    "CPU Architecture",
    "Addressing Modes",
]

export const topicContent: Record<
    string,
    {
        introduction: string
        keyPoints: string[]
        examFocus: string[]
        definitions: { term: string; definition: string }[]
    }
> = {
    "CPU Architecture": {
        introduction:
            "The Central Processing Unit (CPU) is the brain of a computer system. It performs all arithmetic and logical operations, controls the flow of data, and executes instructions. Understanding CPU architecture is fundamental to grasping how computers process information at the hardware level.",
        keyPoints: [
            "The CPU consists of the Arithmetic Logic Unit (ALU), Control Unit (CU), and Registers",
            "The ALU performs all mathematical and logical operations on data",
            "The Control Unit coordinates and controls all operations of the computer",
            "Registers provide high-speed storage locations within the CPU",
            "The CPU communicates with memory and I/O devices through buses",
        ],
        examFocus: [
            "Block diagram of CPU and its components",
            "Functions of ALU and Control Unit",
            "Types of registers and their purposes",
            "Data path and control path in CPU",
            "CPU performance factors: clock speed, instruction set",
        ],
        definitions: [
            {
                term: "ALU (Arithmetic Logic Unit)",
                definition:
                    "The component of the CPU that performs arithmetic operations (addition, subtraction) and logical operations (AND, OR, NOT).",
            },
            {
                term: "Control Unit",
                definition:
                    "The component that directs the operation of the processor by fetching instructions from memory and decoding them.",
            },
            {
                term: "Registers",
                definition:
                    "Small, high-speed storage locations within the CPU used to hold data temporarily during processing.",
            },
            {
                term: "Clock Speed",
                definition: "The frequency at which the CPU executes instructions, measured in Hz (cycles per second).",
            },
        ],
    },
    "Instruction Cycle": {
        introduction:
            "The instruction cycle is the basic operational process of a computer. It describes the sequence of steps the CPU follows to fetch, decode, and execute instructions. This cycle repeats continuously as long as the computer is running.",
        keyPoints: [
            "The instruction cycle consists of Fetch, Decode, Execute, and Store phases",
            "During Fetch, the CPU retrieves the instruction from memory using the Program Counter",
            "Decode phase interprets the instruction to determine what operation to perform",
            "Execute phase carries out the instruction using the ALU and other components",
            "The cycle time determines the speed at which instructions are processed",
        ],
        examFocus: [
            "Four phases of instruction cycle in detail",
            "Role of Program Counter (PC) and Instruction Register (IR)",
            "Timing diagrams for instruction execution",
            "Difference between machine cycle and instruction cycle",
            "Interrupt handling during instruction cycle",
        ],
        definitions: [
            {
                term: "Program Counter (PC)",
                definition: "A register that holds the memory address of the next instruction to be fetched and executed.",
            },
            {
                term: "Instruction Register (IR)",
                definition: "A register that holds the current instruction being decoded and executed.",
            },
            {
                term: "Fetch Cycle",
                definition: "The phase where the CPU retrieves an instruction from memory and loads it into the IR.",
            },
            {
                term: "Machine Cycle",
                definition: "The time required to complete one operation of accessing memory or I/O devices.",
            },
        ],
    },
    "Addressing Modes": {
        introduction:
            "Addressing modes define the way in which the operand of an instruction is specified. Different addressing modes provide flexibility in accessing data and allow efficient program execution. Understanding addressing modes is crucial for assembly language programming and computer architecture.",
        keyPoints: [
            "Immediate addressing: operand is part of the instruction itself",
            "Direct addressing: instruction contains the memory address of the operand",
            "Indirect addressing: instruction contains address of address of operand",
            "Register addressing: operand is located in a CPU register",
            "Indexed addressing: effective address is sum of register content and constant",
        ],
        examFocus: [
            "Characteristics and examples of each addressing mode",
            "Advantages and disadvantages of different modes",
            "Effective address calculation for each mode",
            "Use cases for different addressing modes",
            "Impact on instruction length and execution time",
        ],
        definitions: [
            {
                term: "Effective Address",
                definition: "The actual memory address where the operand is located, calculated based on the addressing mode.",
            },
            {
                term: "Immediate Operand",
                definition: "A constant value that is part of the instruction itself, used directly without memory access.",
            },
            {
                term: "Base Register",
                definition: "A register used in indexed or base addressing modes to hold a base address.",
            },
            {
                term: "Displacement",
                definition: "An offset value added to a base address to calculate the effective address.",
            },
        ],
    },
    "Block diagram of digital computer": {
        introduction: "The block diagram of a digital computer outlines the fundamental components and their interactions, forming the backbone of modern computing systems.",
        keyPoints: [
            "Input Unit: Accepts data and instructions from the outside world.",
            "Output Unit: specific results of data processing to the user.",
            "Memory Unit: Stores data and instructions.",
            "Central Processing Unit (CPU): Controls and processes data.",
        ],
        examFocus: [
            "Diagram and explanation of each unit.",
            "Flow of data and control signals.",
            "Function of CPU components (ALU, CU, Registers).",
        ],
        definitions: [
            { term: "Input Unit", definition: "Devices used to enter data into a computer system." },
            { term: "Output Unit", definition: "Devices used to display results to the user." },
        ],
    },
    "Register Transfer Language": {
        introduction: "Register Transfer Language (RTL) is a symbolic notation used to describe the micro-operation transfers between registers in a computer.",
        keyPoints: [
            "Registers are designated by capital letters (e.g., MAR, PC, IR).",
            "Micro-operations are elemental operations performed on data stored in registers.",
            "Transfer of information is denoted by a replacement operator (←).",
        ],
        examFocus: [
            "Syntax and semantics of RTL.",
            "Control functions and conditional transfers.",
            "Bus transfer representation in RTL.",
        ],
        definitions: [
            { term: "Micro-operation", definition: "An elementary operation performed on the information stored in one or more registers." },
            { term: "RTL", definition: "A language used to describe the internal organization of digital computers." },
        ],
    },
    "Micro-Operations: Register transfer Language": {
        introduction: "Detailed study of micro-operations involves understanding how data is manipulated and transferred within the registers using RTL.",
        keyPoints: [
            "Arithmetic micro-operations.",
            "Logic micro-operations.",
            "Shift micro-operations.",
        ],
        examFocus: [
            "Types of micro-operations.",
            "Implementation of micro-operations using logic gates.",
            "Hardware implementation of shift operations.",
        ],
        definitions: [
            { term: "Register Transfer", definition: "The transfer of binary information from one register to another." },
        ],
    },
    "Register Transfer": {
        introduction: "Register transfer operations involve moving data between registers or between memory and registers.",
        keyPoints: [
            "Direct transfer: R2 ← R1",
            "Bus transfer: Transfer via a common bus system.",
            "Memory transfer: Read and Write operations.",
        ],
        examFocus: [
            "Bus system design for register transfer.",
            "Three-state buffer usage.",
            "Memory read and write operations in RTL.",
        ],
        definitions: [
            { term: "Bus", definition: "A shared communication path that connects multiple devices in a system." },
        ],
    },
    "Bus and Memory Transfer": {
        introduction: "A common bus system is used to transfer information between registers and memory efficiently.",
        keyPoints: [
            "Control of the bus using selection lines.",
            "Memory read: Transfer from memory to a register.",
            "Memory write: Transfer from a register to memory.",
        ],
        examFocus: [
            "Construction of a bus system using multiplexers.",
            "Three-state bus buffers.",
            "RTL for memory read/write.",
        ],
        definitions: [
            { term: "Multiplexer", definition: "A combinational circuit that selects binary information from one of many input lines and directs it to a single output line." },
        ],
    },
    "Arithmetic Micro Operations": {
        introduction: "Arithmetic micro-operations perform basic arithmetic tasks on numeric data stored in registers.",
        keyPoints: [
            "Addition, Subtraction, Increment, Decrement.",
            "Arithmetic Shift.",
            "Implementation using Full Adders.",
        ],
        examFocus: [
            "Binary adder and subtractor circuits.",
            "Arithmetic circuit design.",
            "One-stage arithmetic circuit.",
        ],
        definitions: [
            { term: "Half Adder", definition: "A circuit that adds two bits." },
            { term: "Full Adder", definition: "A circuit that adds three bits." },
        ],
    },
    "Logic Micro Operations": {
        introduction: "Logic micro-operations specify binary operations for strings of bits stored in registers, useful for manipulating individual bits or portions of a word.",
        keyPoints: [
            "AND, OR, XOR, COMPLEMENT.",
            "Selective Set, Selective Complement, Selective Clear.",
            "Hardware implementation.",
        ],
        examFocus: [
            "List of logic micro-operations.",
            "Applications of logic micro-operations.",
            "One-stage logic circuit.",
        ],
        definitions: [
            { term: "XOR", definition: "Exclusive-OR operation outputs true only when inputs differ." },
        ],
    },
    "Shift Micro Operations": {
        introduction: "Shift micro-operations are used for serial transfer of data and are also used in conjunction with arithmetic, logic, and other data-processing operations.",
        keyPoints: [
            "Logical Shift (shl, shr).",
            "Circular Shift (cil, cir).",
            "Arithmetic Shift (ashl, ashr).",
        ],
        examFocus: [
            "Difference between logical, circular, and arithmetic shifts.",
            "Hardware implementation of shifters.",
            "Bidirectional shift register.",
        ],
        definitions: [
            { term: "Barrel Shifter", definition: "A digital circuit that can shift a data word by a specified number of bits in one clock cycle." },
        ],
    },
    "Arithmetic Logic Shift Unit": {
        introduction: "An Arithmetic Logic Shift Unit (ALU) is a digital circuit that performs arithmetic and logical operations.",
        keyPoints: [
            "Combines arithmetic, logic, and shift circuits.",
            "Selection variables control the operation.",
            "Central part of the CPU.",
        ],
        examFocus: [
            "Block diagram of ALU.",
            "Function table of ALU.",
            "Design of one-stage ALU.",
        ],
        definitions: [
            { term: "ALU", definition: "Arithmetic Logic Unit." },
        ],
    },
    "Computer Organization and Design: Instruction Codes": {
        introduction: "The organization of a stored-program computer is defined by its instruction codes and registers.",
        keyPoints: [
            "Stored program concept.",
            "Instruction code format (Opcode, Address).",
            "Direct vs Indirect addressing.",
        ],
        examFocus: [
            "Basic computer instruction format.",
            "Difference between direct and indirect address.",
            "Instruction set architecture.",
        ],
        definitions: [
            { term: "Opcode", definition: "Operation Code, specifies the operation to be performed." },
        ],
    },
    "Computer Registers": {
        introduction: "Computer registers are high-speed storage units used to hold data, addresses, and instructions during processing.",
        keyPoints: [
            "Accumulator (AC), Data Register (DR).",
            "Program Counter (PC), Instruction Register (IR).",
            "Memory Address Register (AR).",
        ],
        examFocus: [
            "List of basic computer registers and their function.",
            "Register size and connections.",
            "Common bus system for registers.",
        ],
        definitions: [
            { term: "Accumulator (AC)", definition: "A general-purpose register used for storing results of arithmetic/logic operations." },
        ],
    },
    "Computer Instructions": {
        introduction: "Computer instructions specify the operations that the computer provides for the user.",
        keyPoints: [
            "Memory-reference instructions.",
            "Register-reference instructions.",
            "Input-output instructions.",
        ],
        examFocus: [
            "Instruction formats.",
            "Hexadecimal code for instructions.",
            "Decoding of instructions.",
        ],
        definitions: [
            { term: "Instruction Set", definition: " The complete set of instructions that a computer can execute." },
        ],
    },
    "Timing and Control": {
        introduction: "The timing and control unit generates the signals necessary to control the operation of the computer.",
        keyPoints: [
            "Hardwired control vs Microprogrammed control.",
            "Control logic gates.",
            "Timing signals derived from a master clock.",
        ],
        examFocus: [
            "Design of control unit.",
            "Timing diagrams.",
            "Generation of control signals.",
        ],
        definitions: [
            { term: "Hardwired Control", definition: "Control unit implemented using logic gates and flip-flops." },
        ],
    },
    "Memory Reference Instructions": {
        introduction: "Memory reference instructions initiate operations that involve accessing memory for reading or writing data.",
        keyPoints: [
            "AND, ADD, LDA, STA, BUN, BSA, ISZ.",
            "Effective address calculation.",
            "Execution sequence.",
        ],
        examFocus: [
            "Explanation of each memory reference instruction.",
            "Flowchart for instruction execution.",
            "RTL description of instructions.",
        ],
        definitions: [
            { term: "STA", definition: "Store Accumulator: Stores the content of AC into memory." },
        ],
    },
    "Input Output and Interrupt": {
        introduction: "Input-output instructions handle communication with external devices, while interrupts alter the normal flow of execution.",
        keyPoints: [
            "Input-output configuration.",
            "Program interrupt cycle.",
            "Interrupt Service Routine (ISR).",
        ],
        examFocus: [
            "I/O instructions.",
            "Interrupt cycle flowchart.",
            "Difference between program interrupt and subroutine call.",
        ],
        definitions: [
            { term: "Interrupt", definition: "A signal to the CPU to suspend its current activities and attend to a significant event." },
        ],
    },
}
