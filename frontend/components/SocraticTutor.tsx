"use client"

// ============================================================================
// SOCRATIC TUTOR COMPONENT
// AI-powered guided questioning for COA topics
// ============================================================================

import { useState, useRef, useEffect } from "react"
import { GraduationCap, Send, Loader2, X, Lightbulb, HelpCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { sendSocraticMessage, Message } from "@/lib/socratic-api"

// ============================================================================
// TYPES
// ============================================================================

interface SocraticTutorProps {
    topic: string
    color?: string
}

type MessageType = "question" | "correction" | "confirmation" | "explanation" | "default"

interface ChatMessage extends Message {
    type?: MessageType
}

// ============================================================================
// HELPER: Detect message type from content
// ============================================================================

function detectMessageType(content: string): MessageType {
    const lowerContent = content.toLowerCase()

    if (lowerContent.includes("?") && (
        lowerContent.includes("what") ||
        lowerContent.includes("why") ||
        lowerContent.includes("how") ||
        lowerContent.includes("can you")
    )) {
        return "question"
    }

    if (
        lowerContent.includes("not quite") ||
        lowerContent.includes("actually") ||
        lowerContent.includes("misconception") ||
        lowerContent.includes("let me clarify")
    ) {
        return "correction"
    }

    if (
        lowerContent.includes("correct") ||
        lowerContent.includes("exactly") ||
        lowerContent.includes("well done") ||
        lowerContent.includes("great")
    ) {
        return "confirmation"
    }

    if (
        lowerContent.includes("let me explain") ||
        lowerContent.includes("here's how") ||
        lowerContent.includes("the process is")
    ) {
        return "explanation"
    }

    return "default"
}

// ============================================================================
// MESSAGE BUBBLE COMPONENT
// ============================================================================

function MessageBubble({ message, themeColor }: { message: ChatMessage; themeColor: string }) {
    const isUser = message.role === "user"
    const type = message.type || "default"

    const typeIcon = {
        question: <HelpCircle className="h-3 w-3" />,
        correction: <AlertTriangle className="h-3 w-3" />,
        confirmation: <CheckCircle2 className="h-3 w-3" />,
        explanation: <Lightbulb className="h-3 w-3" />,
        default: null
    }

    const typeColor = {
        question: "text-cyan-400",
        correction: "text-amber-400",
        confirmation: "text-green-400",
        explanation: "text-purple-400",
        default: ""
    }

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${isUser
                        ? "text-white rounded-br-md"
                        : "bg-muted/80 text-foreground rounded-bl-md"
                    }`}
                style={isUser ? { backgroundColor: themeColor } : undefined}
            >
                {!isUser && type !== "default" && (
                    <div className={`flex items-center gap-1.5 mb-1.5 text-xs font-medium ${typeColor[type]}`}>
                        {typeIcon[type]}
                        <span className="capitalize">{type}</span>
                    </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
        </div>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SocraticTutor({ topic, color }: SocraticTutorProps) {
    const themeColor = color || "#8B7CFF"
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "tutor",
            content: `Welcome! I'm your Socratic tutor for "${topic}". I won't just give you answers — instead, I'll guide you with questions to help you truly understand. What would you like to explore?`,
            type: "default"
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const scrollRef = useRef<HTMLDivElement>(null)

    // Reset when topic changes
    useEffect(() => {
        setMessages([
            {
                role: "tutor",
                content: `Welcome! I'm your Socratic tutor for "${topic}". I won't just give you answers — instead, I'll guide you with questions to help you truly understand. What would you like to explore?`,
                type: "default"
            }
        ])
    }, [topic])

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: ChatMessage = { role: "user", content: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await sendSocraticMessage(
                topic,
                input,
                messages.filter(m => m.role === "user" || m.role === "tutor")
            )

            const tutorMessage: ChatMessage = {
                role: "tutor",
                content: response.response,
                type: detectMessageType(response.response)
            }

            setMessages(prev => [...prev, tutorMessage])
        } catch (error) {
            console.error("Error sending message:", error)
            setMessages(prev => [...prev, {
                role: "tutor",
                content: "I'm having trouble connecting. Let's try again — what were you asking about?",
                type: "default"
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg p-0 z-50 hover:scale-110 transition-transform text-white"
                    size="icon"
                    style={{ backgroundColor: "#22C55E" }}
                >
                    <GraduationCap className="h-7 w-7" />
                    <span className="sr-only">Open Socratic Tutor</span>
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[400px] sm:w-[480px] flex flex-col p-0">
                <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-green-500/10 to-transparent">
                    <SheetTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-green-500" />
                        Socratic Tutor
                    </SheetTitle>
                    <SheetDescription>
                        Learning through guided questioning • <span className="font-medium text-foreground">{topic}</span>
                    </SheetDescription>
                </SheetHeader>

                {/* Chat Messages */}
                <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((msg, i) => (
                            <MessageBubble key={i} message={msg} themeColor={themeColor} />
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted/80 rounded-2xl rounded-bl-md px-4 py-3">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Quick Actions */}
                <div className="px-6 py-2 border-t bg-muted/30">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs shrink-0"
                            onClick={() => setInput("I don't know")}
                        >
                            I don't know
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs shrink-0"
                            onClick={() => setInput("Please explain")}
                        >
                            Please explain
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs shrink-0"
                            onClick={() => setInput("Can you give me a hint?")}
                        >
                            Give me a hint
                        </Button>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSend()
                        }}
                        className="flex gap-2"
                    >
                        <Input
                            placeholder="Type your answer or question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            style={{ backgroundColor: "#22C55E" }}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    )
}
