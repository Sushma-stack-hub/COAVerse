"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, MessageSquare, BookOpen, GitGraph, Send, CheckCircle, AlertCircle, Loader2, Maximize2, Minimize2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
    evaluatePractice,
    validateFlow,
    PracticeFeedback,
    FlowValidation,
} from "@/lib/ai-agent-logic"
import { sendSocraticMessage, Message as APIMessage } from "@/lib/socratic-api"

interface AIClarificationAgentProps {
    topic: string
    color?: string
}

type Message = {
    role: "user" | "bot"
    content: string
}

export function AIClarificationAgent({ topic, color }: AIClarificationAgentProps) {
    const themeColor = color || "#8B7CFF"
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: `Welcome! I'm your Socratic tutor for ${topic}. I won't just give you answers — I'll guide you with questions to help you truly understand. What would you like to explore?` },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(true)

    // Practice State
    const [practiceInput, setPracticeInput] = useState("")
    const [practiceFeedback, setPracticeFeedback] = useState<PracticeFeedback | null>(null)

    // Diagram/Flow State
    const [flowInput, setFlowInput] = useState("")
    const [flowValidation, setFlowValidation] = useState<FlowValidation | null>(null)

    const scrollRef = useRef<HTMLDivElement>(null)

    // Reset state when topic changes
    useEffect(() => {
        setMessages([
            { role: "bot", content: `Welcome! I'm your Socratic tutor for ${topic}. I won't just give you answers — I'll guide you with questions to help you truly understand. What would you like to explore?` },
        ])
        setPracticeInput("")
        setPracticeFeedback(null)
        setFlowInput("")
        setFlowValidation(null)
    }, [topic])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userMsg: Message = { role: "user", content: input }
        setMessages((prev) => [...prev, userMsg])
        setInput("")
        setIsLoading(true)

        try {
            // Build conversation history for context
            const history: APIMessage[] = messages.map(m => ({
                role: m.role === "user" ? "user" : "tutor",
                content: m.content
            }))

            // Call backend API
            const response = await sendSocraticMessage(topic, input, history)

            const botMsg: Message = {
                role: "bot",
                content: response.response
            }
            setMessages((prev) => [...prev, botMsg])
        } catch (error) {
            console.error("Tutor error:", error)
            const errorMsg: Message = {
                role: "bot",
                content: "I'm having trouble connecting. Let me ask you: what do you already know about this topic?"
            }
            setMessages((prev) => [...prev, errorMsg])
        } finally {
            setIsLoading(false)
        }
    }

    const handlePracticeCheck = () => {
        if (!practiceInput.trim()) return
        const feedback = evaluatePractice(practiceInput, topic)
        setPracticeFeedback(feedback)
    }

    const handleFlowValidate = () => {
        if (!flowInput.trim()) return
        // Split by newlines for steps
        const steps = flowInput.split("\n").map((s) => s.trim()).filter((s) => s)
        const validation = validateFlow(steps, topic)
        setFlowValidation(validation)
    }

    return (
        <>
            {/* Floating trigger button */}
            <Button
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl p-0 z-[9999] hover:scale-110 transition-transform text-white cursor-pointer"
                size="icon"
                style={{ backgroundColor: themeColor }}
                onClick={() => setIsOpen(true)}
            >
                <Bot className="h-7 w-7" />
                <span className="sr-only">Open AI Assistant</span>
            </Button>

            {/* Fullscreen chatbot overlay */}
            {isOpen && (
                <>
                    {/* Dark overlay backdrop */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            zIndex: 9998,
                        }}
                        onClick={() => setIsOpen(false)}
                    />
                    {/* Chatbot container */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        className="bg-background"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5" style={{ color: themeColor }} />
                                <span className="font-semibold">AI Clarification Agent</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="h-8 w-8"
                                    title={isFullscreen ? "Minimize" : "Fullscreen"}
                                >
                                    {isFullscreen ? (
                                        <Minimize2 className="h-4 w-4" />
                                    ) : (
                                        <Maximize2 className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8"
                                    title="Close"
                                >
                                    <span className="text-lg">×</span>
                                </Button>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground px-6 pb-2">
                            Context: <span className="font-medium text-foreground">{topic}</span>
                        </div>

                        <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-6 pt-2">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="chat" className="gap-2">
                                        <MessageSquare className="h-4 w-4" /> Chat
                                    </TabsTrigger>
                                    <TabsTrigger value="practice" className="gap-2">
                                        <BookOpen className="h-4 w-4" /> Practice
                                    </TabsTrigger>
                                    <TabsTrigger value="diagram" className="gap-2">
                                        <GitGraph className="h-4 w-4" /> Diagram
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* CHAT TAB */}
                            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden p-0 m-0 min-h-0">
                                <ScrollArea className="flex-1 p-6 min-h-0" ref={scrollRef}>
                                    <div className="space-y-4">
                                        {messages.map((m, i) => (
                                            <div
                                                key={i}
                                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-lg px-4 py-3 ${m.role === "user"
                                                        ? "text-white"
                                                        : "bg-muted text-muted-foreground"
                                                        }`}
                                                    style={m.role === "user" ? { backgroundColor: themeColor } : undefined}
                                                >
                                                    {m.role === "bot" && (
                                                        <span className="text-xs font-medium opacity-70 block mb-1">
                                                            🎓 Tutor
                                                        </span>
                                                    )}
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {isLoading && (
                                            <div className="flex justify-start">
                                                <div className="bg-muted text-muted-foreground rounded-lg px-4 py-3 flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span className="text-sm">Thinking...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                                <div className="p-4 border-t bg-background shrink-0">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault()
                                            handleSendMessage()
                                        }}
                                        className="flex gap-2"
                                    >
                                        <Input
                                            placeholder="Type your answer or question..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            style={{ backgroundColor: themeColor }}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </TabsContent>

                            {/* PRACTICE TAB */}
                            <TabsContent value="practice" className="flex-1 flex flex-col overflow-y-auto p-6 m-0 gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Describe the topic concepts</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Write a short explanation of <strong>{topic}</strong>. The agent will check for key concepts.
                                    </p>
                                </div>
                                <Textarea
                                    className="min-h-[150px] resize-none"
                                    placeholder="Type your explanation here..."
                                    value={practiceInput}
                                    onChange={(e) => setPracticeInput(e.target.value)}
                                />
                                <Button onClick={handlePracticeCheck} className="w-full" style={{ backgroundColor: themeColor }}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Evaluate
                                </Button>

                                {practiceFeedback && (
                                    <Card className="bg-muted/50 border-none">
                                        <CardContent className="pt-6 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">Score</span>
                                                <Badge variant={practiceFeedback.score > 80 ? "default" : "secondary"}>
                                                    {practiceFeedback.score}%
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{practiceFeedback.message}</p>
                                            {practiceFeedback.missing.length > 0 && (
                                                <div className="space-y-1">
                                                    <p className="text-xs font-medium text-destructive">Missing Concepts:</p>
                                                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                                                        {practiceFeedback.missing.map((item, i) => (
                                                            <li key={i}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* DIAGRAM TAB */}
                            <TabsContent value="diagram" className="flex-1 flex flex-col overflow-y-auto p-6 m-0 gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Validate Process Flow</h3>
                                    <p className="text-xs text-muted-foreground">
                                        List the steps for <strong>{topic}</strong> in order (one per line).
                                    </p>
                                </div>
                                <Textarea
                                    className="min-h-[150px] resize-none font-mono text-sm"
                                    placeholder="Step 1...&#10;Step 2...&#10;Step 3..."
                                    value={flowInput}
                                    onChange={(e) => setFlowInput(e.target.value)}
                                />
                                <Button onClick={handleFlowValidate} className="w-full" style={{ backgroundColor: themeColor }}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Check Flow
                                </Button>

                                {flowValidation && (
                                    <Card
                                        className={`border-l-4 ${flowValidation.valid ? "border-l-[#22C55E]" : "border-l-[#EF4444]"
                                            }`}
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                {flowValidation.valid ? (
                                                    <CheckCircle className="h-5 w-5 text-[#22C55E]" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-[#EF4444]" />
                                                )}
                                                <h4 className="font-semibold">
                                                    {flowValidation.valid ? "Correct Sequence" : "Issues Found"}
                                                </h4>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{flowValidation.message}</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </>
            )}
        </>
    )
}
