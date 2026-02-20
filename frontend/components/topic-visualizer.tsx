"use client"

import { useState, useEffect } from "react"
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

function InstructionCycleFlow({ currentStep }: { currentStep: number }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    // Token positions for each step
    const tokenPositions = [
        { x: 130, y: 115 },   // Step 0: At FETCH
        { x: 300, y: 115 },   // Step 1: At DECODE
        { x: 470, y: 115 },   // Step 2: At EXECUTE
        { x: 640, y: 115 },   // Step 3: At UPDATE
    ]
    const tokenPos = tokenPositions[currentStep] || tokenPositions[0]

    // Handle mouse movement for parallax effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height
        setMousePos({ x: x * 6, y: y * 6 })
    }

    return (
        <div
            className="w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
            style={{
                perspective: '1200px',
                perspectiveOrigin: '50% 50%'
            }}
        >
            <svg
                viewBox="0 0 800 620"
                className="w-full h-full"
                style={{
                    overflow: 'visible',
                    transform: `rotateX(${-mousePos.y * 0.4}deg) rotateY(${mousePos.x * 0.4}deg)`,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.15s ease-out'
                }}
            >
                {/* SVG Filters and Definitions */}
                <defs>
                    {/* Glow filters */}
                    <filter id="glow-active" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="shadow-depth" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="4" dy="6" stdDeviation="4" floodOpacity="0.4" />
                    </filter>

                    {/* Arrow markers with different colors */}
                    <marker id="arrow-green" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="oklch(0.68 0.14 155)" />
                    </marker>
                    <marker id="arrow-cyan" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="oklch(0.72 0.15 175)" />
                    </marker>
                    <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="oklch(0.75 0.14 195)" />
                    </marker>
                    <marker id="arrow-gold" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="oklch(0.75 0.18 60)" />
                    </marker>
                </defs>

                {/* ========== SYSTEM BACKPLANE ========== */}
                <rect
                    x="20" y="20"
                    width="760" height="580"
                    fill="oklch(0.12 0 0)"
                    stroke="oklch(0.3 0 0)"
                    strokeWidth="2"
                    rx="16"
                    style={{ filter: 'url(#shadow-depth)' }}
                />
                <text x="400" y="50" textAnchor="middle" fill="oklch(0.5 0 0)" fontSize="14" fontWeight="bold">
                    CPU SYSTEM BUS
                </text>

                {/* ========== DATA FLOW ARROWS WITH PULSES ========== */}

                {/* PC → MAR Arrow (inside Registers) */}
                <g opacity={currentStep === 0 ? 1 : 0.4}>
                    <path
                        d="M 375 337 L 375 355 L 375 347"
                        stroke="oklch(0.68 0.14 155)"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrow-green)"
                    />
                    {currentStep === 0 && (
                        <circle r="4" fill="oklch(0.8 0.2 60)">
                            <animateMotion dur="0.8s" repeatCount="indefinite" path="M 375 295 L 375 347" />
                        </circle>
                    )}
                </g>

                {/* MAR → Memory Arrow */}
                <g opacity={currentStep === 0 ? 1 : 0.3}>
                    <path
                        d="M 340 347 L 260 347 L 260 310"
                        stroke="oklch(0.68 0.14 155)"
                        strokeWidth="3"
                        fill="none"
                        markerEnd="url(#arrow-green)"
                        strokeDasharray={currentStep === 0 ? "6 3" : "none"}
                        style={{ animation: currentStep === 0 ? 'flowLeft 1s linear infinite' : 'none' }}
                    />
                    {currentStep === 0 && (
                        <circle r="5" fill="oklch(0.8 0.2 60)" style={{ filter: 'drop-shadow(0 0 4px oklch(0.8 0.2 60))' }}>
                            <animateMotion dur="1s" repeatCount="indefinite" path="M 340 347 L 260 347 L 260 310" />
                        </circle>
                    )}
                    <text x="280" y="365" textAnchor="middle" fill="oklch(0.6 0 0)" fontSize="10">Address</text>
                </g>

                {/* Memory → IR Arrow */}
                <g opacity={currentStep === 0 ? 1 : 0.3}>
                    <path
                        d="M 260 290 L 260 245 L 460 245 L 460 295"
                        stroke="oklch(0.68 0.14 155)"
                        strokeWidth="3"
                        fill="none"
                        markerEnd="url(#arrow-green)"
                        strokeDasharray={currentStep === 0 ? "6 3" : "none"}
                        style={{ animation: currentStep === 0 ? 'flowRight 1.5s linear infinite' : 'none' }}
                    />
                    {currentStep === 0 && (
                        <circle r="5" fill="oklch(0.8 0.2 60)" style={{ filter: 'drop-shadow(0 0 4px oklch(0.8 0.2 60))' }}>
                            <animateMotion dur="1.5s" repeatCount="indefinite" path="M 260 290 L 260 245 L 460 245 L 460 295" />
                        </circle>
                    )}
                    <text x="360" y="238" textAnchor="middle" fill="oklch(0.6 0 0)" fontSize="10">Instruction Data</text>
                </g>

                {/* IR → Control Unit Arrow */}
                <g opacity={currentStep === 1 ? 1 : 0.3}>
                    <path
                        d="M 460 355 L 460 400 L 420 400 L 420 430"
                        stroke="oklch(0.72 0.15 175)"
                        strokeWidth="3"
                        fill="none"
                        markerEnd="url(#arrow-cyan)"
                        strokeDasharray={currentStep === 1 ? "6 3" : "none"}
                        style={{ animation: currentStep === 1 ? 'flowDown 1s linear infinite' : 'none' }}
                    />
                    {currentStep === 1 && (
                        <circle r="5" fill="oklch(0.75 0.18 60)" style={{ filter: 'drop-shadow(0 0 6px oklch(0.75 0.18 60))' }}>
                            <animateMotion dur="1s" repeatCount="indefinite" path="M 460 355 L 460 400 L 420 400 L 420 430" />
                        </circle>
                    )}
                    <text x="480" y="390" textAnchor="start" fill="oklch(0.6 0 0)" fontSize="10">Opcode</text>
                </g>

                {/* Control Unit → ALU Arrow */}
                <g opacity={currentStep >= 1 && currentStep <= 2 ? 1 : 0.3}>
                    <path
                        d="M 520 470 L 580 470 L 580 380 L 600 380"
                        stroke="oklch(0.72 0.15 175)"
                        strokeWidth="3"
                        fill="none"
                        markerEnd="url(#arrow-cyan)"
                        strokeDasharray={currentStep === 1 || currentStep === 2 ? "6 3" : "none"}
                        style={{ animation: currentStep === 1 || currentStep === 2 ? 'flowRight 1.2s linear infinite' : 'none' }}
                    />
                    {(currentStep === 1 || currentStep === 2) && (
                        <circle r="4" fill="oklch(0.72 0.15 175)" style={{ filter: 'drop-shadow(0 0 4px oklch(0.72 0.15 175))' }}>
                            <animateMotion dur="1.2s" repeatCount="indefinite" path="M 520 470 L 580 470 L 580 380 L 600 380" />
                        </circle>
                    )}
                    <text x="555" y="420" textAnchor="middle" fill="oklch(0.6 0 0)" fontSize="10">Control</text>
                </g>

                {/* Registers → ALU Arrow (Operands) */}
                <g opacity={currentStep === 2 ? 1 : 0.3}>
                    <path
                        d="M 520 310 L 560 310 L 560 320 L 600 320"
                        stroke="oklch(0.75 0.14 195)"
                        strokeWidth="3"
                        fill="none"
                        markerEnd="url(#arrow-blue)"
                        strokeDasharray={currentStep === 2 ? "6 3" : "none"}
                        style={{ animation: currentStep === 2 ? 'flowRight 0.8s linear infinite' : 'none' }}
                    />
                    {currentStep === 2 && (
                        <>
                            <circle r="5" fill="oklch(0.8 0.2 60)" style={{ filter: 'drop-shadow(0 0 6px oklch(0.8 0.2 60))' }}>
                                <animateMotion dur="0.8s" repeatCount="indefinite" path="M 520 310 L 560 310 L 560 320 L 600 320" />
                            </circle>
                            <text x="540" y="300" textAnchor="middle" fill="oklch(0.75 0.18 60)" fontSize="10" fontWeight="bold">R1</text>
                        </>
                    )}
                </g>

                {/* Registers → ALU Arrow (Second operand) */}
                <g opacity={currentStep === 2 ? 1 : 0.3}>
                    <path
                        d="M 520 340 L 560 340 L 560 350 L 600 350"
                        stroke="oklch(0.75 0.14 195)"
                        strokeWidth="3"
                        fill="none"
                        markerEnd="url(#arrow-blue)"
                        strokeDasharray={currentStep === 2 ? "6 3" : "none"}
                        style={{ animation: currentStep === 2 ? 'flowRight 0.9s linear infinite' : 'none' }}
                    />
                    {currentStep === 2 && (
                        <>
                            <circle r="5" fill="oklch(0.8 0.2 60)" style={{ filter: 'drop-shadow(0 0 6px oklch(0.8 0.2 60))' }}>
                                <animateMotion dur="0.9s" repeatCount="indefinite" path="M 520 340 L 560 340 L 560 350 L 600 350" />
                            </circle>
                            <text x="540" y="330" textAnchor="middle" fill="oklch(0.75 0.18 60)" fontSize="10" fontWeight="bold">R2</text>
                        </>
                    )}
                </g>

                {/* ALU → Registers Arrow (Result) */}
                <g opacity={currentStep === 2 ? 1 : 0.3}>
                    <path
                        d="M 600 380 L 550 380 L 550 355 L 520 355"
                        stroke="oklch(0.75 0.14 195)"
                        strokeWidth="3"
                        fill="none"
                        markerEnd="url(#arrow-blue)"
                        strokeDasharray={currentStep === 2 ? "6 3" : "none"}
                        style={{ animation: currentStep === 2 ? 'flowLeft 1s linear infinite' : 'none' }}
                    />
                    {currentStep === 2 && (
                        <circle r="5" fill="oklch(0.85 0.2 140)" style={{ filter: 'drop-shadow(0 0 6px oklch(0.85 0.2 140))' }}>
                            <animateMotion dur="1s" repeatCount="indefinite" begin="0.5s" path="M 600 380 L 550 380 L 550 355 L 520 355" />
                        </circle>
                    )}
                    <text x="555" y="395" textAnchor="middle" fill="oklch(0.85 0.2 140)" fontSize="10" fontWeight="bold">Result</text>
                </g>

                {/* PC Update Arrow */}
                <g opacity={currentStep === 3 ? 1 : 0.3}>
                    <path
                        d="M 375 295 L 375 220 L 200 220 L 200 295 L 340 295"
                        stroke="oklch(0.65 0.13 135)"
                        strokeWidth="3"
                        fill="none"
                        markerEnd="url(#arrow-gold)"
                        strokeDasharray={currentStep === 3 ? "8 4" : "none"}
                        style={{ animation: currentStep === 3 ? 'flowLoop 2s linear infinite' : 'none' }}
                    />
                    {currentStep === 3 && (
                        <circle r="6" fill="oklch(0.75 0.18 60)" style={{ filter: 'drop-shadow(0 0 8px oklch(0.75 0.18 60))' }}>
                            <animateMotion dur="2s" repeatCount="indefinite" path="M 375 295 L 375 220 L 200 220 L 200 295 L 340 295" />
                        </circle>
                    )}
                    <text x="280" y="210" textAnchor="middle" fill="oklch(0.75 0.18 60)" fontSize="12" fontWeight="bold">PC + 1</text>
                </g>

                {/* ========== STAGE INDICATORS (TOP ROW) ========== */}

                {/* FETCH Stage Box */}
                <g style={{
                    filter: currentStep === 0 ? 'url(#glow-active) url(#shadow-depth)' : 'url(#shadow-depth)',
                    transform: currentStep === 0 ? 'translate(0, -4px)' : 'translate(0, 0)',
                    opacity: currentStep === 0 ? 1 : 0.6,
                    transition: 'all 0.4s ease'
                }}>
                    <rect x="60" y="70" width="140" height="70" fill="oklch(0.68 0.14 155)" rx="10" />
                    <text x="130" y="100" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="18" fontWeight="bold">FETCH</text>
                    <text x="130" y="125" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">PC → MAR → Mem → IR</text>
                </g>

                {/* DECODE Stage Box */}
                <g style={{
                    filter: currentStep === 1 ? 'url(#glow-active) url(#shadow-depth)' : 'url(#shadow-depth)',
                    transform: currentStep === 1 ? 'translate(0, -4px)' : 'translate(0, 0)',
                    opacity: currentStep === 1 ? 1 : 0.6,
                    transition: 'all 0.4s ease'
                }}>
                    <rect x="230" y="70" width="140" height="70" fill="oklch(0.72 0.15 175)" rx="10" />
                    <text x="300" y="100" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="18" fontWeight="bold">DECODE</text>
                    <text x="300" y="125" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">IR → Control Unit</text>
                </g>

                {/* EXECUTE Stage Box */}
                <g style={{
                    filter: currentStep === 2 ? 'url(#glow-active) url(#shadow-depth)' : 'url(#shadow-depth)',
                    transform: currentStep === 2 ? 'translate(0, -4px)' : 'translate(0, 0)',
                    opacity: currentStep === 2 ? 1 : 0.6,
                    transition: 'all 0.4s ease'
                }}>
                    <rect x="400" y="70" width="140" height="70" fill="oklch(0.75 0.14 195)" rx="10" />
                    <text x="470" y="100" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="18" fontWeight="bold">EXECUTE</text>
                    <text x="470" y="125" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">Regs ↔ ALU</text>
                </g>

                {/* UPDATE/LOOP Stage Box */}
                <g style={{
                    filter: currentStep === 3 ? 'url(#glow-active) url(#shadow-depth)' : 'url(#shadow-depth)',
                    transform: currentStep === 3 ? 'translate(0, -4px)' : 'translate(0, 0)',
                    opacity: currentStep === 3 ? 1 : 0.6,
                    transition: 'all 0.4s ease'
                }}>
                    <rect x="570" y="70" width="140" height="70" fill="oklch(0.65 0.13 135)" rx="10" />
                    <text x="640" y="100" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="18" fontWeight="bold">UPDATE</text>
                    <text x="640" y="125" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="11">PC ← PC + 1</text>
                </g>

                {/* Stage Flow Arrows */}
                <g opacity={0.6}>
                    <line x1="200" y1="105" x2="225" y2="105" stroke="oklch(0.5 0 0)" strokeWidth="2" markerEnd="url(#arrow-green)" />
                    <line x1="370" y1="105" x2="395" y2="105" stroke="oklch(0.5 0 0)" strokeWidth="2" markerEnd="url(#arrow-cyan)" />
                    <line x1="540" y1="105" x2="565" y2="105" stroke="oklch(0.5 0 0)" strokeWidth="2" markerEnd="url(#arrow-blue)" />
                </g>

                {/* Current instruction token following stages */}
                <g style={{
                    transform: `translate(${currentStep === 0 ? 130 : currentStep === 1 ? 300 : currentStep === 2 ? 470 : 640
                        }px, 155px)`,
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <rect x="-50" y="-14" width="100" height="28" fill="oklch(0.75 0.18 60)" rx="14"
                        style={{ filter: 'drop-shadow(0 0 10px oklch(0.75 0.18 60))' }} />
                    <text x="0" y="6" textAnchor="middle" fill="oklch(0.11 0 0)" fontSize="12" fontWeight="bold" fontFamily="monospace">
                        ADD R1, R2
                    </text>
                </g>

                {/* ========== MEMORY COMPONENT ========== */}
                <g style={{
                    filter: currentStep === 0 ? 'url(#glow-active) url(#shadow-depth)' : 'url(#shadow-depth)',
                    transform: currentStep === 0 ? 'translate(-2px, -2px)' : 'translate(0, 0)',
                    opacity: currentStep === 0 ? 1 : 0.5,
                    transition: 'all 0.4s ease'
                }}>
                    <rect x="60" y="260" width="180" height="130" fill="oklch(0.18 0 0)" stroke="oklch(0.68 0.14 155)" strokeWidth={currentStep === 0 ? 3 : 2} rx="10" />
                    <text x="150" y="285" textAnchor="middle" fill="oklch(0.9 0 0)" fontSize="15" fontWeight="bold">MEMORY</text>
                    <rect x="80" y="300" width="140" height="22" fill="oklch(0.12 0 0)" rx="4" stroke="oklch(0.4 0 0)" />
                    <text x="150" y="316" textAnchor="middle" fill="oklch(0.7 0 0)" fontSize="11">0x1000: ADD R1, R2</text>
                    <rect x="80" y="330" width="140" height="22" fill="oklch(0.12 0 0)" rx="4" stroke="oklch(0.4 0 0)" />
                    <text x="150" y="346" textAnchor="middle" fill="oklch(0.5 0 0)" fontSize="11">0x1004: SUB R3, R4</text>
                    <rect x="80" y="360" width="140" height="22" fill="oklch(0.12 0 0)" rx="4" stroke="oklch(0.4 0 0)" />
                    <text x="150" y="376" textAnchor="middle" fill="oklch(0.5 0 0)" fontSize="11">0x1008: ...</text>
                </g>

                {/* ========== REGISTERS COMPONENT ========== */}
                <g style={{
                    filter: currentStep === 1 || currentStep === 2 ? 'url(#glow-active) url(#shadow-depth)' : 'url(#shadow-depth)',
                    transform: currentStep === 1 || currentStep === 2 ? 'translate(2px, -2px)' : 'translate(0, 0)',
                    opacity: currentStep >= 1 && currentStep <= 2 ? 1 : 0.5,
                    transition: 'all 0.4s ease'
                }}>
                    <rect x="280" y="260" width="240" height="130" fill="oklch(0.18 0 0)" stroke="oklch(0.72 0.15 175)" strokeWidth={(currentStep === 1 || currentStep === 2) ? 3 : 2} rx="10" />
                    <text x="400" y="285" textAnchor="middle" fill="oklch(0.9 0 0)" fontSize="15" fontWeight="bold">REGISTERS</text>

                    {/* PC */}
                    <rect x="295" y="300" width="55" height="35" fill={currentStep === 0 || currentStep === 3 ? "oklch(0.68 0.14 155)" : "oklch(0.15 0 0)"} rx="4" />
                    <text x="322" y="315" textAnchor="middle" fill={currentStep === 0 || currentStep === 3 ? "oklch(0.11 0 0)" : "oklch(0.7 0 0)"} fontSize="10" fontWeight="bold">PC</text>
                    <text x="322" y="328" textAnchor="middle" fill={currentStep === 0 || currentStep === 3 ? "oklch(0.11 0 0)" : "oklch(0.5 0 0)"} fontSize="9">0x1000</text>

                    {/* MAR */}
                    <rect x="358" y="300" width="55" height="35" fill={currentStep === 0 ? "oklch(0.68 0.14 155)" : "oklch(0.15 0 0)"} rx="4" />
                    <text x="385" y="315" textAnchor="middle" fill={currentStep === 0 ? "oklch(0.11 0 0)" : "oklch(0.7 0 0)"} fontSize="10" fontWeight="bold">MAR</text>
                    <text x="385" y="328" textAnchor="middle" fill={currentStep === 0 ? "oklch(0.11 0 0)" : "oklch(0.5 0 0)"} fontSize="9">0x1000</text>

                    {/* IR */}
                    <rect x="421" y="300" width="85" height="35" fill={currentStep === 0 || currentStep === 1 ? "oklch(0.72 0.15 175)" : "oklch(0.15 0 0)"} rx="4" />
                    <text x="463" y="315" textAnchor="middle" fill={currentStep === 0 || currentStep === 1 ? "oklch(0.11 0 0)" : "oklch(0.7 0 0)"} fontSize="10" fontWeight="bold">IR</text>
                    <text x="463" y="328" textAnchor="middle" fill={currentStep === 0 || currentStep === 1 ? "oklch(0.11 0 0)" : "oklch(0.5 0 0)"} fontSize="8">ADD R1, R2</text>

                    {/* R1 */}
                    <rect x="295" y="345" width="55" height="35" fill={currentStep === 2 ? "oklch(0.75 0.14 195)" : "oklch(0.15 0 0)"} rx="4" />
                    <text x="322" y="360" textAnchor="middle" fill={currentStep === 2 ? "oklch(0.11 0 0)" : "oklch(0.7 0 0)"} fontSize="10" fontWeight="bold">R1</text>
                    <text x="322" y="373" textAnchor="middle" fill={currentStep === 2 ? "oklch(0.11 0 0)" : "oklch(0.5 0 0)"} fontSize="9">5</text>

                    {/* R2 */}
                    <rect x="358" y="345" width="55" height="35" fill={currentStep === 2 ? "oklch(0.75 0.14 195)" : "oklch(0.15 0 0)"} rx="4" />
                    <text x="385" y="360" textAnchor="middle" fill={currentStep === 2 ? "oklch(0.11 0 0)" : "oklch(0.7 0 0)"} fontSize="10" fontWeight="bold">R2</text>
                    <text x="385" y="373" textAnchor="middle" fill={currentStep === 2 ? "oklch(0.11 0 0)" : "oklch(0.5 0 0)"} fontSize="9">3</text>

                    {/* R3 (Result) */}
                    <rect x="421" y="345" width="85" height="35" fill={currentStep === 2 ? "oklch(0.85 0.15 140)" : "oklch(0.15 0 0)"} rx="4" />
                    <text x="463" y="360" textAnchor="middle" fill={currentStep === 2 ? "oklch(0.11 0 0)" : "oklch(0.7 0 0)"} fontSize="10" fontWeight="bold">R3</text>
                    <text x="463" y="373" textAnchor="middle" fill={currentStep === 2 ? "oklch(0.11 0 0)" : "oklch(0.5 0 0)"} fontSize="9">{currentStep >= 2 ? "8" : "0"}</text>
                </g>

                {/* ========== ALU COMPONENT ========== */}
                <g style={{
                    filter: currentStep === 2 ? 'url(#glow-active) url(#shadow-depth)' : 'url(#shadow-depth)',
                    transform: currentStep === 2 ? 'translate(2px, -4px)' : 'translate(0, 0)',
                    opacity: currentStep === 2 ? 1 : 0.5,
                    transition: 'all 0.4s ease'
                }}>
                    {/* ALU Trapezoid shape */}
                    <path d="M 600 290 L 740 310 L 740 390 L 600 410 Z" fill="oklch(0.18 0 0)" stroke="oklch(0.75 0.14 195)" strokeWidth={currentStep === 2 ? 3 : 2} />
                    <text x="670" y="335" textAnchor="middle" fill="oklch(0.9 0 0)" fontSize="18" fontWeight="bold">ALU</text>
                    <text x="670" y="360" textAnchor="middle" fill="oklch(0.6 0 0)" fontSize="12">{currentStep === 2 ? "5 + 3 = 8" : "Idle"}</text>
                    <text x="670" y="385" textAnchor="middle" fill="oklch(0.5 0 0)" fontSize="10">{currentStep === 2 ? "ADD" : "—"}</text>
                </g>

                {/* ========== CONTROL UNIT ========== */}
                <g style={{
                    filter: currentStep >= 1 && currentStep <= 2 ? 'url(#glow-active) url(#shadow-depth)' : 'url(#shadow-depth)',
                    transform: currentStep >= 1 && currentStep <= 2 ? 'translate(0, 2px)' : 'translate(0, 0)',
                    opacity: currentStep >= 1 && currentStep <= 2 ? 1 : 0.5,
                    transition: 'all 0.4s ease'
                }}>
                    <rect x="280" y="430" width="240" height="90" fill="oklch(0.18 0 0)" stroke="oklch(0.68 0.14 155)" strokeWidth={(currentStep >= 1 && currentStep <= 2) ? 3 : 2} rx="10" />
                    <text x="400" y="460" textAnchor="middle" fill="oklch(0.9 0 0)" fontSize="16" fontWeight="bold">CONTROL UNIT</text>
                    <text x="400" y="485" textAnchor="middle" fill="oklch(0.6 0 0)" fontSize="11">
                        {currentStep === 0 ? "Fetching instruction..." :
                            currentStep === 1 ? "Decoding ADD opcode..." :
                                currentStep === 2 ? "Executing ALU operation..." :
                                    "Incrementing PC..."}
                    </text>
                    <text x="400" y="505" textAnchor="middle" fill="oklch(0.5 0 0)" fontSize="10">Generating control signals</text>
                </g>

                {/* CSS Animations and Styles */}
                <style>{`
                @keyframes flowRight {
                    from { stroke-dashoffset: 24; }
                    to { stroke-dashoffset: 0; }
                }
                @keyframes flowLeft {
                    from { stroke-dashoffset: -24; }
                    to { stroke-dashoffset: 0; }
                }
                @keyframes flowDown {
                    from { stroke-dashoffset: 24; }
                    to { stroke-dashoffset: 0; }
                }
                @keyframes flowLoop {
                    from { stroke-dashoffset: 48; }
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
            </svg>
        </div>
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

interface TopicVisualizerProps {
    topic: string
    color?: string
}

export function TopicVisualizer({ topic, color }: TopicVisualizerProps) {
    // Logic to select visualization based on topic could be added here
    // For now we allow user to select from the list as before
    const [selectedViz, setSelectedViz] = useState("Instruction Cycle Flow")
    const [currentStep, setCurrentStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isAudioEnabled, setIsAudioEnabled] = useState(false)
    const [showLearningPanel, setShowLearningPanel] = useState(false)
    const themeColor = color || "hsl(var(--primary))"

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

    // Auto-play timer
    useEffect(() => {
        if (!isPlaying) return

        const timer = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev >= currentMaxStep - 1) {
                    // Loop back to start
                    return 0
                }
                return prev + 1
            })
        }, 2000) // 2 seconds per step

        return () => clearInterval(timer)
    }, [isPlaying, currentMaxStep])

    // Trigger Learning Panel on Completion
    useEffect(() => {
        if (currentStep === currentMaxStep - 1) {
            const timer = setTimeout(() => setShowLearningPanel(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [currentStep, currentMaxStep])

    // Enhanced contextual explanations for each step
    const getDetailedExplanation = () => {
        if (selectedViz === "Instruction Cycle Flow") {
            const explanations = [
                {
                    title: "FETCH Stage",
                    description: "The CPU reads the instruction from memory. The Program Counter (PC) holds the address of the next instruction. This address is copied to the Memory Address Register (MAR), and the instruction is fetched into the Instruction Register (IR).",
                    activeComponents: ["PC", "MAR", "Memory", "IR"]
                },
                {
                    title: "DECODE Stage",
                    description: "The Control Unit analyzes the instruction in the IR. It identifies the operation code (opcode) and determines what operation to perform. Operand addresses are calculated based on the addressing mode.",
                    activeComponents: ["IR", "Control Unit", "Registers"]
                },
                {
                    title: "EXECUTE Stage",
                    description: "The ALU performs the required operation (ADD R1, R2). Operands are fetched from registers R1 and R2, the addition is performed, and the result is stored in the destination register.",
                    activeComponents: ["ALU", "Registers", "Control Unit"]
                },
                {
                    title: "UPDATE Stage",
                    description: "The Program Counter is incremented (PC + 1) to point to the next instruction in memory. The cycle is complete and ready to fetch the next instruction.",
                    activeComponents: ["PC"]
                }
            ]
            return explanations[currentStep] || explanations[0]
        }
        return { title: "Step " + (currentStep + 1), description: steps[selectedViz]?.[currentStep] || "", activeComponents: [] }
    }

    const currentExplanation = getDetailedExplanation()

    return (
        <div className="space-y-6">
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
                        style={{
                            backgroundColor: selectedViz === viz ? themeColor : undefined,
                            color: selectedViz === viz ? "#ffffff" : undefined,
                            borderColor: selectedViz === viz ? themeColor : undefined,
                            boxShadow: selectedViz === viz ? `0 0 15px ${themeColor}60` : undefined
                        }}
                    >
                        {viz}
                    </Button>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Visualization Canvas */}
                <Card className="lg:col-span-2 overflow-hidden border-t-4 transition-shadow hover:shadow-xl"
                    style={{
                        borderTopColor: themeColor,
                        boxShadow: `0 0 40px -20px ${themeColor}40`
                    }}>
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
                                            <Volume2 className="h-4 w-4 text-primary" style={{ color: themeColor }} /> :
                                            <VolumeX className="h-4 w-4 text-muted-foreground" />
                                        }
                                    </Button>
                                )}
                                <Badge
                                    className="px-3 py-1 shadow-sm"
                                    style={{
                                        backgroundColor: themeColor,
                                        color: '#ffffff',
                                        border: `1px solid ${themeColor}`
                                    }}
                                >
                                    Interactive Diagram
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="aspect-video rounded-lg flex items-center justify-center p-4 border-2 overflow-hidden relative transition-colors duration-500"
                            style={{
                                borderColor: `${themeColor}60`,
                                backgroundColor: `${themeColor}05`,
                                boxShadow: `inset 0 0 20px ${themeColor}10`
                            }}>
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{ backgroundImage: `radial-gradient(circle at center, ${themeColor}20 1px, transparent 1px)`, backgroundSize: '20px 20px' }}>
                            </div>

                            {selectedViz === "Instruction Cycle Flow" && <InstructionCycleFlow currentStep={currentStep} />}
                            {selectedViz === "CPU Architecture Diagram" && <CPUArchitectureDiagram currentStep={currentStep} />}
                            {selectedViz === "Data Path Flow" && <DataPathFlow currentStep={currentStep} />}
                            {selectedViz === "Register Transfer Operations" && <RegisterTransferOps currentStep={currentStep} />}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-3">
                            <Button variant="outline" size="icon" onClick={handleReset} disabled={currentStep === 0}
                                className="hover:bg-muted/50 transition-colors">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentStep === 0}
                                className="hover:bg-muted/50 transition-colors">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button size="icon" onClick={() => setIsPlaying(!isPlaying)}
                                style={{
                                    backgroundColor: themeColor,
                                    borderColor: themeColor,
                                    color: '#ffffff',
                                    boxShadow: `0 0 10px ${themeColor}40`
                                }}
                                className="hover:brightness-110 transition-all active:scale-95">
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleNext}
                                disabled={currentStep === currentMaxStep - 1}
                                className="hover:bg-muted/50 transition-colors"
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
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentStep ? "w-8" : "w-2"}`}
                                    style={{
                                        backgroundColor: index <= currentStep ? themeColor : 'currentColor',
                                        opacity: index <= currentStep ? 1 : 0.2
                                    }}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Info Panel */}
                <div className="space-y-6">
                    {/* Dynamic Step Explanation - NEW */}
                    <Card
                        className="border-t-4 transition-all hover:shadow-lg"
                        style={{
                            borderTopColor: themeColor,
                            boxShadow: `0 0 30px -15px ${themeColor}60`,
                            background: `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 95%, ${themeColor}10 100%)`
                        }}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full animate-pulse"
                                    style={{ backgroundColor: themeColor }}
                                />
                                <CardTitle className="text-lg" style={{ color: themeColor }}>
                                    {currentExplanation.title}
                                </CardTitle>
                            </div>
                            <Badge
                                variant="secondary"
                                className="w-fit"
                                style={{
                                    backgroundColor: `${themeColor}20`,
                                    color: themeColor,
                                    borderColor: themeColor
                                }}
                            >
                                Step {currentStep + 1} of {currentMaxStep}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm leading-relaxed text-foreground">
                                {currentExplanation.description}
                            </p>

                            {currentExplanation.activeComponents && currentExplanation.activeComponents.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Active Components
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {currentExplanation.activeComponents.map((component: string) => (
                                            <Badge
                                                key={component}
                                                variant="outline"
                                                className="text-xs transition-all hover:scale-105"
                                                style={{
                                                    borderColor: themeColor,
                                                    color: themeColor,
                                                    boxShadow: `0 0 8px ${themeColor}40`
                                                }}
                                            >
                                                {component}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card
                        className="border-t-4 transition-all hover:shadow-lg"
                        style={{
                            borderTopColor: themeColor,
                            boxShadow: `0 0 30px -15px ${themeColor}30`
                        }}
                    >
                        <CardHeader>
                            <CardTitle style={{ color: themeColor }}>About This Diagram</CardTitle>
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

                    <Card
                        className="border-t-4 transition-all hover:shadow-lg"
                        style={{
                            borderTopColor: themeColor,
                            boxShadow: `0 0 30px -15px ${themeColor}30`
                        }}
                    >
                        <CardHeader>
                            <CardTitle style={{ color: themeColor }}>Key Components</CardTitle>
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

            <LearningProgressPanel
                activityType="visualizer"
                topic={selectedViz}
                isOpen={showLearningPanel}
                onClose={() => setShowLearningPanel(false)}
            />
        </div>
    )
}
