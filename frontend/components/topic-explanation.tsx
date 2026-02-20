import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, CheckCircle2, Lightbulb } from "lucide-react"
import { topicContent } from "@/lib/topic-data"

interface TopicExplanationProps {
    topic: string
    color?: string
}

export function TopicExplanation({ topic, color }: TopicExplanationProps) {
    const content = topicContent[topic] || topicContent["CPU Architecture"]
    const themeColor = color || "hsl(var(--primary))"

    // Debugging: Check if color is passing
    console.log("TopicExplanation Rendered:", { topic, color, themeColor })

    return (
        <div className="space-y-8">
            {/* Main Explanation */}
            <Card className="overflow-hidden border-t-8 transition-all duration-300 hover:shadow-2xl"
                style={{
                    borderTopColor: themeColor,
                    boxShadow: `0 0 60px -20px ${themeColor}50`
                }}>
                <CardHeader className="pb-8 pt-8" style={{ background: `linear-gradient(to bottom, ${themeColor}25, transparent)` }}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                            <CardTitle className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"
                                style={{ textShadow: `0 0 40px ${themeColor}50` }}>
                                {topic}
                            </CardTitle>
                            <CardDescription className="text-lg text-muted-foreground/90">AI-generated personalized explanation</CardDescription>
                        </div>
                        <Badge className="px-4 py-1.5 text-sm font-semibold border-2 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
                            style={{
                                borderColor: themeColor,
                                color: '#ffffff', // Always white text
                                backgroundColor: themeColor // Solid color
                            }}>
                            COA Chapter
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-10 pt-4">
                    <div className="p-6 rounded-2xl border backdrop-blur-sm"
                        style={{ backgroundColor: `${themeColor}05`, borderColor: `${themeColor}10` }}>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ color: themeColor }}>
                            Introduction
                        </h3>
                        <p className="text-foreground/90 leading-loose text-lg font-light">{content.introduction}</p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                            <ChevronRight className="h-8 w-8" style={{ filter: `drop-shadow(0 0 8px ${themeColor})` }} />
                            Key Concepts
                        </h3>
                        <ul className="grid gap-5">
                            {content.keyPoints.map((point, index) => (
                                <li key={index}
                                    className="flex gap-5 p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                                    style={{
                                        borderLeftWidth: '6px',
                                        borderLeftColor: themeColor,
                                        backgroundColor: `linear-gradient(to right, ${themeColor}15, transparent)`, // This is invalid CSS syntax for backgroundColor, fixing below
                                        background: `linear-gradient(to right, ${themeColor}15, transparent)`,
                                        borderColor: `${themeColor}25`
                                    }}
                                >
                                    <span
                                        className="h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 shadow-lg"
                                        style={{
                                            backgroundColor: themeColor,
                                            color: '#ffffff',
                                            boxShadow: `0 0 20px ${themeColor}60`
                                        }}
                                    >
                                        {index + 1}
                                    </span>
                                    <span className="text-lg text-foreground/90 leading-relaxed font-medium">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Key Definitions */}
            <Card className="border-2" style={{ borderColor: `${themeColor}30`, boxShadow: `0 0 40px -10px ${themeColor}20` }}>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-2xl" style={{ color: themeColor }}>
                        Key Definitions
                    </CardTitle>
                    <CardDescription>Important terms and concepts</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-5 pt-4">
                    {content.definitions.map((def, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-2xl border transition-colors hover:bg-muted/10"
                            style={{
                                borderLeftWidth: '6px',
                                borderLeftColor: themeColor,
                                backgroundColor: `${themeColor}08`,
                                borderColor: `${themeColor}20`
                            }}
                        >
                            <h4 className="font-bold mb-3 text-lg" style={{ color: themeColor }}>{def.term}</h4>
                            <p className="text-base text-muted-foreground leading-relaxed">{def.definition}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Exam Focus */}
            <Card
                className="border-2 shadow-xl relative overflow-hidden"
                style={{
                    borderColor: `${themeColor}50`,
                    background: `linear-gradient(135deg, ${themeColor}15 0%, transparent 100%)`
                }}
            >
                <div className="absolute -top-20 -right-20 w-64 h-64 opacity-20 blur-3xl rounded-full pointer-events-none" style={{ backgroundColor: themeColor }}></div>
                <CardHeader>
                    <div className="flex items-center gap-5">
                        <div className="p-4 rounded-xl shadow-inner ring-1 ring-inset"
                            style={{ backgroundColor: `${themeColor}20`, ringColor: `${themeColor}40` }}>
                            <Lightbulb className="h-8 w-8" style={{ color: themeColor, filter: `drop-shadow(0 0 5px ${themeColor})` }} />
                        </div>
                        <div>
                            <CardTitle className="text-2xl" style={{ color: themeColor }}>Exam-Focused Points</CardTitle>
                            <CardDescription>Critical topics for examinations</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <ul className="grid gap-4">
                        {content.examFocus.map((point, index) => (
                            <li key={index} className="flex items-start gap-4 p-5 rounded-xl border backdrop-blur-md"
                                style={{
                                    backgroundColor: `${themeColor}10`,
                                    borderColor: `${themeColor}20`
                                }}>
                                <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" style={{ color: themeColor }} />
                                <span className="leading-relaxed text-foreground/90 font-medium text-lg">{point}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
