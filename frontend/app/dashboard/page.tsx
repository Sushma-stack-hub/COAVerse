"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ArrowRight, BookOpen } from "lucide-react"

// 1. TOPICS LISTING SECTION - Local Data
const topics = [
  {
    id: "block-diagram",
    name: "Block diagram of digital computer",
    description: "Basic components and architecture of a digital computer system."
  },
  {
    id: "rtl",
    name: "Register Transfer Language",
    description: "Symbolic notation used to describe micro-operation transfers."
  },
  {
    id: "micro-ops-rtl",
    name: "Micro-Operations: Register transfer Language",
    description: "Detailed study of micro-operations using RTL."
  },
  {
    id: "register-transfer",
    name: "Register Transfer",
    description: "Transfer of information from one register to another."
  },
  {
    id: "bus-memory",
    name: "Bus and Memory Transfer",
    description: "Common bus system and memory transfer operations."
  },
  {
    id: "arithmetic-micro",
    name: "Arithmetic Micro Operations",
    description: "Addition, subtraction, increment, and other arithmetic ops."
  },
  {
    id: "logic-micro",
    name: "Logic Micro Operations",
    description: "Logic operations on bits stored in registers."
  },
  {
    id: "shift-micro",
    name: "Shift Micro Operations",
    description: "Logical, circular, and arithmetic shift operations."
  },
  {
    id: "alu-shift",
    name: "Arithmetic Logic Shift Unit",
    description: "Design of ALU and shift unit."
  },
  {
    id: "instruction-codes",
    name: "Computer Organization and Design: Instruction Codes",
    description: "Stored program organization and instruction codes."
  },
  {
    id: "computer-registers",
    name: "Computer Registers",
    description: "List of basic computer registers and their functions."
  },
  {
    id: "computer-instructions",
    name: "Computer Instructions",
    description: "Basic computer instruction formats and types."
  },
  {
    id: "timing-control",
    name: "Timing and Control",
    description: "Control unit timing signals and sequence generation."
  },
  {
    id: "instruction-cycle",
    name: "Instruction Cycle",
    description: "Phases of instruction execution: Fetch, Decode, Execute."
  },
  {
    id: "memory-reference",
    name: "Memory Reference Instructions",
    description: "Instructions that access memory operands."
  },
  {
    id: "io-interrupt",
    name: "Input Output and Interrupt",
    description: "I/O configuration, program interrupt, and ISR."
  },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-10 max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-[#8B7CFF]">Digital Computers Learning Dashboard</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Select a topic to access specialized learning tools, visualizations, and assessments.
          </p>
        </div>

        {/* List of Topics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => {
            // Cycle through 4 semantic colors: Purple, Blue, Green, Amber
            const colors = [
              "#8B7CFF", // Purple
              "#EC4899", // Pink
              "#38BDF8", // Blue
              "#06B6D4", // Cyan
              "#22C55E", // Green
              "#10B981", // Emerald
              "#F59E0B", // Amber
              "#F43F5E", // Rose
            ]
            // Shift by 3 to match the new topic mapping
            const colorHex = colors[(index + 3) % colors.length]

            return (
              <Link href={`/topics/${encodeURIComponent(topic.name)}`} key={topic.id}>
                <Card
                  className="cursor-pointer transition-all duration-300 hover:scale-[1.02] border-2 h-full flex flex-col group/card backdrop-blur-sm"
                  style={{
                    backgroundColor: `${colorHex}25`, // ~15% opacity for better visibility
                    borderColor: `${colorHex}40`, // Keep border at ~25%
                  }}
                >
                  {/* Override Card className to include hover effects via dynamic classes or style */}
                  <div
                    className="absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
                    style={{
                      boxShadow: `0 0 20px -5px ${colorHex}40`,
                      borderColor: colorHex
                    }}
                  />

                  {/* Re-apply border via style to the main card for the tinted effect */}
                  <div className="absolute inset-0 rounded-xl border-2 pointer-events-none transition-colors duration-300"
                    style={{ borderColor: `${colorHex}20` }} />

                  {/* Wrapper to ensure content stacks above backgrounds */}
                  <div className="relative z-10 flex flex-col h-full">
                    <CardHeader>
                      <CardTitle
                        className="text-lg leading-snug transition-colors text-foreground"
                      >
                        {topic.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {topic.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0">
                      <Button
                        variant="ghost"
                        className="w-full group border transition-all hover:brightness-125"
                        style={{
                          backgroundColor: `${colorHex}25`,
                          borderColor: `${colorHex}40`,
                        }}
                      >
                        <BookOpen
                          className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100"
                          style={{ color: colorHex }}
                        />
                        <span>Open Topic</span>
                        <ArrowRight
                          className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                          style={{ color: colorHex }}
                        />
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
