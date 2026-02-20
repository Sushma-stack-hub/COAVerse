"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react"
import { LearningProgressPanel, ActivityType } from "@/components/learning-progress-panel"

const visualizations = [
  "Instruction Cycle Flow",
  "CPU Architecture Diagram",
  "Data Path Flow",
  "Register Transfer Operations",
]

const steps: Record<string, string[]> = {
  "Instruction Cycle Flow": [
    "Fetch: Program Counter (PC) points to the next instruction in memory",
    "Fetch: Instruction is loaded from memory into Instruction Register (IR)",
    "Decode: Control Unit interprets the instruction opcode",
    "Decode: Operand addresses are calculated based on addressing mode",
    "Execute: ALU performs the required operation on the operands",
    "Execute: Result is stored in the destination register or memory",
    "Update: Program Counter is incremented to point to next instruction",
    "Cycle Complete: Ready to fetch the next instruction",
  ],
  "CPU Architecture Diagram": [
    "Initial State: All registers are initialized, PC points to first instruction",
    "Memory Access: Address bus carries memory address from MAR",
    "Data Transfer: Data bus transfers instruction/data between CPU and memory",
    "Control Signals: Control bus carries signals from Control Unit",
    "ALU Operation: Operands from registers are sent to ALU",
    "Result Storage: ALU output is stored back in register or memory",
  ],
  "Data Path Flow": [
    "Initial State: All registers are initialized, PC points to first instruction",
    "Memory Access: Address bus carries memory address from MAR",
    "Data Transfer: Data bus transfers instruction/data between CPU and memory",
    "Control Signals: Control bus carries signals from Control Unit",
    "ALU Operation: Operands from registers are sent to ALU",
    "Result Storage: ALU output is stored back in register or memory",
  ],
  "Register Transfer Operations": [
    "Source Register Selection: Control Unit activates source register",
    "Data Path Activation: Internal data bus is enabled",
    "Destination Register Loading: Target register receives data",
    "Flag Updates: Status flags are updated based on operation",
  ],
}

const explanations: Record<string, string> = {
  "Instruction Cycle Flow":
    "The instruction cycle represents the fundamental operational process of the CPU. Each instruction goes through these phases sequentially. The Fetch phase retrieves the instruction from memory, Decode interprets it, Execute performs the operation, and finally the Program Counter is updated. Understanding this cycle is crucial for analyzing CPU performance and instruction-level parallelism.",
  "CPU Architecture Diagram":
    "CPU Architecture Diagram shows the internal organization of CPU components including Control Unit, ALU, and various registers. Each component plays a specific role in instruction execution.",
  "Data Path Flow":
    "Data Path Flow illustrates how data moves between memory and CPU through address, data, and control buses. Shows the bidirectional nature of data communication.",
  "Register Transfer Operations":
    "Register Transfer Operations demonstrate how data is transferred between registers using microoperations. Each transfer is controlled by the Control Unit and synchronized with clock cycles.",
}

function InstructionCycleFlow({ currentStep }: { currentStep: number }) {
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      {/* Fetch Stage */}
      <g opacity={currentStep >= 0 ? 1 : 0.3}>
        <rect x="50" y="50" width="150" height="80" fill="oklch(0.68 0.14 155)" rx="8" />
        <text x="125" y="85" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="16" fontWeight="bold">
          FETCH
        </text>
        <text x="125" y="105" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="12">
          PC → MAR
        </text>
        <text x="125" y="120" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="12">
          Memory → IR
        </text>
      </g>

      {/* Arrow Fetch to Decode */}
      <g opacity={currentStep >= 1 ? 1 : 0.3}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="oklch(0.68 0.14 155)" />
          </marker>
        </defs>
        <line
          x1="200"
          y1="90"
          x2="280"
          y2="90"
          stroke="oklch(0.68 0.14 155)"
          strokeWidth="3"
          markerEnd="url(#arrowhead)"
        />
      </g>

      {/* Decode Stage */}
      <g opacity={currentStep >= 1 ? 1 : 0.3}>
        <rect x="280" y="50" width="150" height="80" fill="oklch(0.72 0.15 175)" rx="8" />
        <text x="355" y="85" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="16" fontWeight="bold">
          DECODE
        </text>
        <text x="355" y="105" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="12">
          IR → CU
        </text>
        <text x="355" y="120" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="12">
          Interpret Opcode
        </text>
      </g>

      {/* Arrow Decode to Execute */}
      <g opacity={currentStep >= 2 ? 1 : 0.3}>
        <line
          x1="430"
          y1="90"
          x2="510"
          y2="90"
          stroke="oklch(0.72 0.15 175)"
          strokeWidth="3"
          markerEnd="url(#arrowhead2)"
        />
        <defs>
          <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="oklch(0.72 0.15 175)" />
          </marker>
        </defs>
      </g>

      {/* Execute Stage */}
      <g opacity={currentStep >= 2 ? 1 : 0.3}>
        <rect x="510" y="50" width="150" height="80" fill="oklch(0.75 0.14 195)" rx="8" />
        <text x="585" y="85" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="16" fontWeight="bold">
          EXECUTE
        </text>
        <text x="585" y="105" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="12">
          ALU Operation
        </text>
        <text x="585" y="120" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="12">
          Store Result
        </text>
      </g>

      {/* Arrow back to Fetch */}
      <g opacity={currentStep >= 3 ? 1 : 0.3}>
        <path
          d="M 585 130 L 585 180 L 125 180 L 125 130"
          stroke="oklch(0.65 0.13 135)"
          strokeWidth="3"
          fill="none"
          markerEnd="url(#arrowhead3)"
        />
        <defs>
          <marker id="arrowhead3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="oklch(0.65 0.13 135)" />
          </marker>
        </defs>
        <text x="350" y="170" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="14" fontWeight="bold">
          PC + 1 (Next Instruction)
        </text>
      </g>

      {/* Memory Component */}
      <g opacity={currentStep >= 0 ? 1 : 0.3}>
        <rect
          x="50"
          y="250"
          width="200"
          height="120"
          fill="oklch(0.22 0 0)"
          stroke="oklch(0.68 0.14 155)"
          strokeWidth="2"
          rx="8"
        />
        <text x="150" y="280" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="16" fontWeight="bold">
          MEMORY
        </text>
        <rect x="70" y="295" width="160" height="25" fill="oklch(0.15 0 0)" rx="4" />
        <text x="150" y="312" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="12">
          Instructions
        </text>
        <rect x="70" y="330" width="160" height="25" fill="oklch(0.15 0 0)" rx="4" />
        <text x="150" y="347" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="12">
          Data
        </text>
      </g>

      {/* Registers Component */}
      <g opacity={currentStep >= 1 ? 1 : 0.3}>
        <rect
          x="320"
          y="250"
          width="200"
          height="120"
          fill="oklch(0.22 0 0)"
          stroke="oklch(0.72 0.15 175)"
          strokeWidth="2"
          rx="8"
        />
        <text x="420" y="280" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="16" fontWeight="bold">
          REGISTERS
        </text>
        <rect x="340" y="295" width="70" height="25" fill="oklch(0.15 0 0)" rx="4" />
        <text x="375" y="312" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="11">
          PC
        </text>
        <rect x="420" y="295" width="80" height="25" fill="oklch(0.15 0 0)" rx="4" />
        <text x="460" y="312" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="11">
          IR
        </text>
        <rect x="340" y="330" width="70" height="25" fill="oklch(0.15 0 0)" rx="4" />
        <text x="375" y="347" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="11">
          MAR
        </text>
        <rect x="420" y="330" width="80" height="25" fill="oklch(0.15 0 0)" rx="4" />
        <text x="460" y="347" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="11">
          MDR
        </text>
      </g>

      {/* ALU Component */}
      <g opacity={currentStep >= 2 ? 1 : 0.3}>
        <rect
          x="570"
          y="250"
          width="150"
          height="120"
          fill="oklch(0.22 0 0)"
          stroke="oklch(0.75 0.14 195)"
          strokeWidth="2"
          rx="8"
        />
        <text x="645" y="280" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="16" fontWeight="bold">
          ALU
        </text>
        <text x="645" y="305" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="12">
          Add
        </text>
        <text x="645" y="325" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="12">
          Subtract
        </text>
        <text x="645" y="345" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="12">
          Logical Ops
        </text>
      </g>

      {/* Control Unit */}
      <g opacity={currentStep >= 1 ? 1 : 0.3}>
        <rect
          x="280"
          y="420"
          width="240"
          height="100"
          fill="oklch(0.22 0 0)"
          stroke="oklch(0.68 0.14 155)"
          strokeWidth="3"
          rx="8"
        />
        <text x="400" y="450" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="18" fontWeight="bold">
          CONTROL UNIT
        </text>
        <text x="400" y="475" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="13">
          Generates control signals
        </text>
        <text x="400" y="495" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="13">
          Coordinates all operations
        </text>
      </g>
    </svg>
  )
}

function CPUArchitectureDiagram({ currentStep }: { currentStep: number }) {
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      {/* CPU Boundary */}
      <rect
        x="30"
        y="30"
        width="740"
        height="540"
        fill="none"
        stroke="oklch(0.68 0.14 155)"
        strokeWidth="3"
        strokeDasharray="10,5"
        rx="12"
      />
      <text x="400" y="60" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="24" fontWeight="bold">
        CPU ARCHITECTURE
      </text>

      {/* Control Unit */}
      <g opacity={currentStep >= 0 ? 1 : 0.3}>
        <rect x="60" y="100" width="280" height="150" fill="oklch(0.68 0.14 155)" rx="8" />
        <text x="200" y="135" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="18" fontWeight="bold">
          CONTROL UNIT
        </text>
        <text x="200" y="165" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="13">
          Instruction Decoder
        </text>
        <text x="200" y="185" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="13">
          Timing & Control Logic
        </text>
        <text x="200" y="205" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="13">
          Control Signal Generator
        </text>
        <text x="200" y="230" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="12" fontStyle="italic">
          (Manages execution flow)
        </text>
      </g>

      {/* ALU */}
      <g opacity={currentStep >= 1 ? 1 : 0.3}>
        <rect x="460" y="100" width="280" height="150" fill="oklch(0.72 0.15 175)" rx="8" />
        <text x="600" y="135" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="18" fontWeight="bold">
          ALU
        </text>
        <text x="600" y="165" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="13">
          Arithmetic Operations
        </text>
        <text x="600" y="185" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="13">
          Logical Operations
        </text>
        <text x="600" y="205" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="13">
          Status Flags
        </text>
        <text x="600" y="230" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="12" fontStyle="italic">
          (Performs computations)
        </text>
      </g>

      {/* Registers */}
      <g opacity={currentStep >= 2 ? 1 : 0.3}>
        <rect
          x="60"
          y="300"
          width="680"
          height="240"
          fill="oklch(0.22 0 0)"
          stroke="oklch(0.75 0.14 195)"
          strokeWidth="2"
          rx="8"
        />
        <text x="400" y="330" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="18" fontWeight="bold">
          REGISTERS
        </text>

        {/* Register blocks */}
        <rect x="80" y="350" width="130" height="60" fill="oklch(0.68 0.14 155)" rx="4" />
        <text x="145" y="375" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="14" fontWeight="bold">
          PC
        </text>
        <text x="145" y="395" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          Program Counter
        </text>

        <rect x="230" y="350" width="130" height="60" fill="oklch(0.68 0.14 155)" rx="4" />
        <text x="295" y="375" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="14" fontWeight="bold">
          IR
        </text>
        <text x="295" y="395" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          Instruction Register
        </text>

        <rect x="380" y="350" width="130" height="60" fill="oklch(0.68 0.14 155)" rx="4" />
        <text x="445" y="375" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="14" fontWeight="bold">
          MAR
        </text>
        <text x="445" y="395" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          Memory Address
        </text>

        <rect x="530" y="350" width="130" height="60" fill="oklch(0.68 0.14 155)" rx="4" />
        <text x="595" y="375" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="14" fontWeight="bold">
          MDR
        </text>
        <text x="595" y="395" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          Memory Data
        </text>

        <rect x="80" y="430" width="130" height="60" fill="oklch(0.72 0.15 175)" rx="4" />
        <text x="145" y="455" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="14" fontWeight="bold">
          ACC
        </text>
        <text x="145" y="475" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          Accumulator
        </text>

        <rect x="230" y="430" width="280" height="60" fill="oklch(0.72 0.15 175)" rx="4" />
        <text x="370" y="455" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="14" fontWeight="bold">
          R0 - R15
        </text>
        <text x="370" y="475" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          General Purpose Registers
        </text>

        <rect x="530" y="430" width="130" height="60" fill="oklch(0.72 0.15 175)" rx="4" />
        <text x="595" y="455" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="14" fontWeight="bold">
          SR
        </text>
        <text x="595" y="475" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          Status Register
        </text>
      </g>

      {/* Buses */}
      <g opacity={currentStep >= 3 ? 1 : 0.3}>
        <line x1="200" y1="260" x2="200" y2="290" stroke="oklch(0.65 0.13 135)" strokeWidth="4" />
        <line x1="400" y1="260" x2="400" y2="290" stroke="oklch(0.65 0.13 135)" strokeWidth="4" />
        <line x1="600" y1="260" x2="600" y2="290" stroke="oklch(0.65 0.13 135)" strokeWidth="4" />
        <text x="400" y="280" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="14" fontWeight="bold">
          Internal Data Bus
        </text>
      </g>
    </svg>
  )
}

function DataPathFlow({ currentStep }: { currentStep: number }) {
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      <text x="400" y="40" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="22" fontWeight="bold">
        DATA PATH IN CPU
      </text>

      {/* Memory */}
      <g opacity={currentStep >= 0 ? 1 : 0.3}>
        <rect
          x="50"
          y="80"
          width="180"
          height="440"
          fill="oklch(0.22 0 0)"
          stroke="oklch(0.68 0.14 155)"
          strokeWidth="2"
          rx="8"
        />
        <text x="140" y="110" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="16" fontWeight="bold">
          MAIN MEMORY
        </text>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <g key={i}>
            <rect
              x="70"
              y={140 + i * 45}
              width="140"
              height="35"
              fill="oklch(0.15 0 0)"
              stroke="oklch(0.68 0.14 155)"
              rx="4"
            />
            <text x="140" y={162 + i * 45} textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="12">
              {`Address ${i * 100}`}
            </text>
          </g>
        ))}
      </g>

      {/* Address Bus */}
      <g opacity={currentStep >= 1 ? 1 : 0.3}>
        <line
          x1="230"
          y1="200"
          x2="320"
          y2="200"
          stroke="oklch(0.68 0.14 155)"
          strokeWidth="3"
          markerEnd="url(#addr-arrow)"
        />
        <text x="275" y="190" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="12" fontWeight="bold">
          Address Bus
        </text>
        <defs>
          <marker id="addr-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="oklch(0.68 0.14 155)" />
          </marker>
        </defs>
      </g>

      {/* Data Bus */}
      <g opacity={currentStep >= 2 ? 1 : 0.3}>
        <line x1="230" y1="280" x2="320" y2="280" stroke="oklch(0.72 0.15 175)" strokeWidth="3" />
        <line
          x1="320"
          y1="280"
          x2="230"
          y2="280"
          stroke="oklch(0.72 0.15 175)"
          strokeWidth="3"
          markerEnd="url(#data-arrow)"
        />
        <text x="275" y="270" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="12" fontWeight="bold">
          Data Bus (Bidirectional)
        </text>
        <defs>
          <marker id="data-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="oklch(0.72 0.15 175)" />
          </marker>
        </defs>
      </g>

      {/* Control Bus */}
      <g opacity={currentStep >= 3 ? 1 : 0.3}>
        <line
          x1="230"
          y1="360"
          x2="320"
          y2="360"
          stroke="oklch(0.75 0.14 195)"
          strokeWidth="3"
          markerEnd="url(#ctrl-arrow)"
        />
        <text x="275" y="350" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="12" fontWeight="bold">
          Control Bus
        </text>
        <defs>
          <marker id="ctrl-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="oklch(0.75 0.14 195)" />
          </marker>
        </defs>
      </g>

      {/* CPU Box */}
      <g opacity={currentStep >= 0 ? 1 : 0.3}>
        <rect
          x="320"
          y="80"
          width="430"
          height="440"
          fill="none"
          stroke="oklch(0.68 0.14 155)"
          strokeWidth="3"
          strokeDasharray="8,4"
          rx="10"
        />
        <text x="535" y="110" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="18" fontWeight="bold">
          CPU
        </text>

        {/* MAR */}
        <rect x="350" y="150" width="100" height="60" fill="oklch(0.68 0.14 155)" rx="6" />
        <text x="400" y="175" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="14" fontWeight="bold">
          MAR
        </text>
        <text x="400" y="195" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          Address
        </text>

        {/* MDR */}
        <rect x="350" y="250" width="100" height="60" fill="oklch(0.72 0.15 175)" rx="6" />
        <text x="400" y="275" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="14" fontWeight="bold">
          MDR
        </text>
        <text x="400" y="295" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          Data Buffer
        </text>

        {/* ALU */}
        <rect x="500" y="200" width="120" height="100" fill="oklch(0.75 0.14 195)" rx="6" />
        <text x="560" y="235" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="16" fontWeight="bold">
          ALU
        </text>
        <text x="560" y="255" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="12">
          Arithmetic
        </text>
        <text x="560" y="275" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="12">
          Logic Ops
        </text>

        {/* Registers */}
        <rect
          x="350"
          y="360"
          width="370"
          height="130"
          fill="oklch(0.22 0 0)"
          stroke="oklch(0.65 0.13 135)"
          strokeWidth="2"
          rx="6"
        />
        <text x="535" y="385" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="14" fontWeight="bold">
          REGISTER FILE
        </text>
        <rect x="370" y="400" width="80" height="35" fill="oklch(0.68 0.14 155)" rx="4" />
        <text x="410" y="422" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          R0-R3
        </text>
        <rect x="465" y="400" width="80" height="35" fill="oklch(0.68 0.14 155)" rx="4" />
        <text x="505" y="422" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          R4-R7
        </text>
        <rect x="560" y="400" width="80" height="35" fill="oklch(0.68 0.14 155)" rx="4" />
        <text x="600" y="422" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          R8-R11
        </text>
        <rect x="370" y="445" width="80" height="35" fill="oklch(0.68 0.14 155)" rx="4" />
        <text x="410" y="467" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          ACC
        </text>
        <rect x="465" y="445" width="175" height="35" fill="oklch(0.68 0.14 155)" rx="4" />
        <text x="552" y="467" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          PC, SP, IR
        </text>

        {/* Internal connections */}
        <line x1="450" y1="280" x2="500" y2="250" stroke="oklch(0.65 0.13 135)" strokeWidth="2" />
        <line x1="560" y1="300" x2="535" y2="360" stroke="oklch(0.65 0.13 135)" strokeWidth="2" />
      </g>
    </svg>
  )
}

function RegisterTransferOps({ currentStep }: { currentStep: number }) {
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      <text x="400" y="40" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="22" fontWeight="bold">
        REGISTER TRANSFER OPERATIONS
      </text>

      {/* Source Register */}
      <g opacity={currentStep >= 0 ? 1 : 0.3}>
        <rect x="100" y="120" width="200" height="100" fill="oklch(0.68 0.14 155)" rx="8" />
        <text x="200" y="155" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="18" fontWeight="bold">
          SOURCE (R1)
        </text>
        <text x="200" y="185" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="24" fontWeight="bold">
          0x42A5
        </text>
        <text x="200" y="205" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          16-bit data
        </text>
      </g>

      {/* Transfer Arrow */}
      <g opacity={currentStep >= 1 ? 1 : 0.3}>
        <line
          x1="300"
          y1="170"
          x2="500"
          y2="170"
          stroke="oklch(0.72 0.15 175)"
          strokeWidth="5"
          markerEnd="url(#transfer-arrow)"
        />
        <defs>
          <marker id="transfer-arrow" markerWidth="15" markerHeight="15" refX="12" refY="4.5" orient="auto">
            <polygon points="0 0, 15 4.5, 0 9" fill="oklch(0.72 0.15 175)" />
          </marker>
        </defs>
        <text x="400" y="160" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="14" fontWeight="bold">
          R2 ← R1
        </text>
        <rect
          x="350"
          y="185"
          width="100"
          height="30"
          fill="oklch(0.22 0 0)"
          stroke="oklch(0.72 0.15 175)"
          strokeWidth="2"
          rx="4"
        />
        <text x="400" y="205" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="11">
          Data Bus
        </text>
      </g>

      {/* Destination Register */}
      <g opacity={currentStep >= 1 ? 1 : 0.3}>
        <rect x="500" y="120" width="200" height="100" fill="oklch(0.75 0.14 195)" rx="8" />
        <text x="600" y="155" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="18" fontWeight="bold">
          DEST (R2)
        </text>
        <text x="600" y="185" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="24" fontWeight="bold">
          {currentStep >= 1 ? "0x42A5" : "0x0000"}
        </text>
        <text x="600" y="205" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          After transfer
        </text>
      </g>

      {/* Operation Types */}
      <g opacity={currentStep >= 2 ? 1 : 0.3}>
        <rect
          x="100"
          y="280"
          width="600"
          height="260"
          fill="oklch(0.22 0 0)"
          stroke="oklch(0.68 0.14 155)"
          strokeWidth="2"
          rx="8"
        />
        <text x="400" y="310" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="16" fontWeight="bold">
          COMMON REGISTER TRANSFER OPERATIONS
        </text>

        {/* Example 1 */}
        <rect x="130" y="330" width="250" height="60" fill="oklch(0.68 0.14 155)" rx="6" />
        <text x="255" y="355" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="13" fontWeight="bold">
          MAR ← PC
        </text>
        <text x="255" y="375" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          Load memory address from
        </text>

        {/* Example 2 */}
        <rect x="420" y="330" width="250" height="60" fill="oklch(0.72 0.15 175)" rx="6" />
        <text x="545" y="355" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="13" fontWeight="bold">
          IR ← MDR
        </text>
        <text x="545" y="375" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          Load instruction from memory
        </text>

        {/* Example 3 */}
        <rect x="130" y="410" width="250" height="60" fill="oklch(0.75 0.14 195)" rx="6" />
        <text x="255" y="435" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="13" fontWeight="bold">
          ACC ← R1 + R2
        </text>
        <text x="255" y="455" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          Add and store in accumulator
        </text>

        {/* Example 4 */}
        <rect x="420" y="410" width="250" height="60" fill="oklch(0.65 0.13 135)" rx="6" />
        <text x="545" y="435" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="13" fontWeight="bold">
          PC ← PC + 1
        </text>
        <text x="545" y="455" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">
          Increment program counter
        </text>

        {/* Timing diagram */}
        <text x="400" y="500" textAnchor="middle" fill="oklch(0.98 0 0)" fontSize="12" fontWeight="bold">
          Timing: Each transfer takes 1 clock cycle
        </text>
      </g>
    </svg>
  )
}

export default function VisualizerPage() {
  const [selectedViz, setSelectedViz] = useState("Instruction Cycle Flow")
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [showLearningPanel, setShowLearningPanel] = useState(false)

  const maxSteps: Record<string, number> = {
    "Instruction Cycle Flow": 4,
    "CPU Architecture Diagram": 4,
    "Data Path Flow": 4,
    "Register Transfer Operations": 3,
  }

  const currentMaxStep = maxSteps[selectedViz] || 4

  const handleNext = () => {
    if (currentStep < currentMaxStep - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    window.speechSynthesis.cancel()
  }

  // Audio Narration Logic
  useEffect(() => {
    if (!isAudioEnabled || selectedViz !== "Instruction Cycle Flow") {
      window.speechSynthesis.cancel();
      return;
    }

    const audioMapping = [
      "The Program Counter sends the address to memory, and the instruction is loaded into the Instruction Register.",
      "The control unit interprets the instruction to determine what action needs to be taken.",
      "The Arithmetic Logic Unit or functional unit performs the operation specified by the instruction.",
      "Results are stored back in memory or registers, and the Program Counter is incremented for the next instruction."
    ];

    const text = audioMapping[currentStep];

    if (text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      window.speechSynthesis.cancel();
    }
  }, [currentStep, isAudioEnabled, selectedViz]);

  // Trigger Learning Panel on Completion
  useEffect(() => {
    if (currentStep === maxSteps[selectedViz] - 1) {
      console.log("Triggering Learning Panel (Timer started)...")
      const timer = setTimeout(() => {
        console.log("Showing Learning Panel NOW")
        setShowLearningPanel(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, selectedViz, maxSteps])

  return (
    <DashboardLayout>
      <div className="fixed top-20 right-4 z-[9999]">
        <button
          onClick={() => {
            console.log("Manual Trigger Clicked");
            setShowLearningPanel(true);
          }}
          className="bg-red-500 text-white p-2 rounded"
        >
          DEBUG: Show Panel
        </button>
      </div>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">AI Visualizer</h1>
          <p className="text-muted-foreground leading-relaxed">Interactive flow diagrams for COA concepts</p>
        </div>

        {/* Visualization Selector */}
        <div className="flex flex-wrap gap-2">
          {visualizations.map((viz) => (
            <Button
              key={viz}
              variant={selectedViz === viz ? "default" : "outline"}
              onClick={() => {
                setSelectedViz(viz)
                setCurrentStep(0)
                setIsPlaying(false)
              }}
            >
              {viz}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Visualization Canvas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedViz}</CardTitle>
                  <CardDescription>
                    Step {currentStep + 1} of {currentMaxStep}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {selectedViz === "Instruction Cycle Flow" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                      title={isAudioEnabled ? "Disable Audio Explanation" : "Enable Audio Explanation"}
                    >
                      {isAudioEnabled ?
                        <Volume2 className="h-4 w-4 text-primary" /> :
                        <VolumeX className="h-4 w-4 text-muted-foreground" />
                      }
                    </Button>
                  )}
                  <Badge variant="outline">Interactive Diagram</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video bg-card rounded-lg flex items-center justify-center p-4 border-2 border-border overflow-hidden">
                {selectedViz === "Instruction Cycle Flow" && <InstructionCycleFlow currentStep={currentStep} />}
                {selectedViz === "CPU Architecture Diagram" && <CPUArchitectureDiagram currentStep={currentStep} />}
                {selectedViz === "Data Path Flow" && <DataPathFlow currentStep={currentStep} />}
                {selectedViz === "Register Transfer Operations" && <RegisterTransferOps currentStep={currentStep} />}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="icon" onClick={handleReset} disabled={currentStep === 0}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentStep === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentStep === currentMaxStep - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Indicators */}
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: currentMaxStep }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all ${index === currentStep
                      ? "w-8 bg-primary"
                      : index < currentStep
                        ? "w-2 bg-primary/50"
                        : "w-2 bg-muted-foreground/20"
                      }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Diagram</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedViz === "Instruction Cycle Flow" &&
                    "Shows the complete instruction execution cycle with fetch, decode, and execute phases. Colors indicate different stages and data flow paths through CPU components."}
                  {selectedViz === "CPU Architecture Diagram" &&
                    "Displays the internal organization of CPU components including Control Unit, ALU, and various registers. Each component plays a specific role in instruction execution."}
                  {selectedViz === "Data Path Flow" &&
                    "Illustrates how data moves between memory and CPU through address, data, and control buses. Shows the bidirectional nature of data communication."}
                  {selectedViz === "Register Transfer Operations" &&
                    "Demonstrates how data is transferred between registers using microoperations. Each transfer is controlled by the Control Unit and synchronized with clock cycles."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {selectedViz === "Instruction Cycle Flow" && (
                    <>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded bg-[oklch(0.68_0.14_155)] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">Fetch Stage</div>
                          <div className="text-muted-foreground text-xs">Retrieves instruction from memory</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded bg-[oklch(0.72_0.15_175)] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">Decode Stage</div>
                          <div className="text-muted-foreground text-xs">Interprets instruction opcode</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded bg-[oklch(0.75_0.14_195)] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">Execute Stage</div>
                          <div className="text-muted-foreground text-xs">Performs ALU operation</div>
                        </div>
                      </div>
                    </>
                  )}
                  {selectedViz === "CPU Architecture Diagram" && (
                    <>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded bg-[oklch(0.68_0.14_155)] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">Control Unit</div>
                          <div className="text-muted-foreground text-xs">Manages execution flow</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded bg-[oklch(0.72_0.15_175)] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">ALU</div>
                          <div className="text-muted-foreground text-xs">Arithmetic & logic operations</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded bg-[oklch(0.75_0.14_195)] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">Registers</div>
                          <div className="text-muted-foreground text-xs">Fast storage locations</div>
                        </div>
                      </div>
                    </>
                  )}
                  {(selectedViz === "Data Path Flow" || selectedViz === "Register Transfer Operations") && (
                    <>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded bg-[oklch(0.68_0.14_155)] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">Address Path</div>
                          <div className="text-muted-foreground text-xs">Memory address routing</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded bg-[oklch(0.72_0.15_175)] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">Data Path</div>
                          <div className="text-muted-foreground text-xs">Bidirectional data flow</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded bg-[oklch(0.75_0.14_195)] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">Control Signals</div>
                          <div className="text-muted-foreground text-xs">Timing & coordination</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
