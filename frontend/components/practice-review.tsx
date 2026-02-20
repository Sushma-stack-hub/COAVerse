"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { backendApi, type PracticeResult } from "@/lib/backend-api"
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react"

interface PracticeReviewProps {
    topic: string
    color?: string
}

export function PracticeReview({ topic, color }: PracticeReviewProps) {
    const [input, setInput] = useState("")
    const [result, setResult] = useState<PracticeResult | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!input.trim()) return

        setIsSubmitting(true)
        try {
            const evaluation = await backendApi.submitPracticeReview(topic, input)
            setResult(evaluation)
        } catch (error) {
            console.error("Evaluation failed", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        setInput("")
        setResult(null)
    }

    const primaryColor = color || "hsl(var(--primary))"

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Input Section */}
            <Card className="h-full border-2" style={{ borderColor: color ? `${color}60` : undefined }}>
                <CardHeader>
                    <CardTitle style={{ color: color }}>Practice Log</CardTitle>
                    <CardDescription>
                        Describe the steps, components, or logic flow for: <span className="font-semibold" style={{ color: color || "hsl(var(--primary))" }}>{topic}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="e.g., First, the Program Counter sends the address to memory..."
                        className="min-h-[300px] resize-none text-base"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={!!result || isSubmitting}
                        style={{ borderColor: color ? `${color}40` : undefined }}
                    />
                    {!result ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !input.trim()}
                            className="w-full"
                            style={{
                                backgroundColor: color || undefined,
                                color: color ? '#ffffff' : undefined
                            }}
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isSubmitting ? "Analyzing..." : "Submit for Review"}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="w-full"
                            style={{ borderColor: color, color: color }}
                        >
                            Start New Practice
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Feedback Section */}
            <div className="space-y-6">
                {!result ? (
                    <Card className="h-full bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center h-full text-center p-12 text-muted-foreground">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <ArrowRight className="h-6 w-6" />
                            </div>
                            <p>Enter your explanation on the left to receive immediate, rule-based feedback on missing concepts or sequencing errors.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="h-full border-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Evaluation Results</CardTitle>
                                <div className={`text-2xl font-bold ${result.score >= 80 ? '!text-[#22C55E]' : '!text-[#F59E0B]'}`}>
                                    {result.score}%
                                </div>
                            </div>
                            <CardDescription>Automated checklist review</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Positives if high score */}
                            {result.score === 100 && (
                                <Alert className="border-[#22C55E]/50 bg-[#22C55E]/10 text-[#22C55E]">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertTitle>Excellent!</AlertTitle>
                                    <AlertDescription>Your explanation covers all key components and steps.</AlertDescription>
                                </Alert>
                            )}

                            {/* Missing Steps */}
                            {result.missingSteps.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-[#EF4444]">
                                        <AlertTriangle className="h-4 w-4" /> Missing Steps
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                        {result.missingSteps.map((step, i) => (
                                            <li key={i}>{step}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Missing Components */}
                            {result.missingComponents.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-[#F59E0B]">
                                        <AlertTriangle className="h-4 w-4" /> Key Components Omitted
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                        {result.missingComponents.map((comp, i) => (
                                            <li key={i}>{comp}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Sequence Errors */}
                            {result.incorrectSequence && (
                                <Alert variant="destructive" className="border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Sequence Error Detected</AlertTitle>
                                    <AlertDescription>
                                        Review the order of operations. Ensure fetch happens before execution.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
