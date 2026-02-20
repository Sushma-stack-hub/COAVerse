"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ChevronRight, Lightbulb, CheckCircle2, FlaskConical } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectExplorer } from "@/components/project-explorer"
import { topics, topicContent } from "@/lib/topic-data"

export default function LearnPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>("CPU Architecture")
  const content = topicContent[selectedTopic] || topicContent["CPU Architecture"]

  // Semantic colors matching dashboard
  const colors = [
    "#8B7CFF", // Purple
    "#38BDF8", // Blue
    "#22C55E", // Green
    "#F59E0B", // Amber
  ]

  const getTopicColor = (topicName: string) => {
    const index = topics.indexOf(topicName)
    return colors[index % colors.length]
  }

  const selectedColor = getTopicColor(selectedTopic)
  const [activeTab, setActiveTab] = useState("learn")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Learning Center</h1>
          <p className="text-muted-foreground leading-relaxed">
            Select a topic from Digital Computers to start learning
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Topic Selector */}
          <Card className="lg:col-span-1 h-fit border-2 transition-colors duration-300" style={{ borderColor: `${selectedColor}40` }}>
            <CardHeader>
              <CardTitle className="text-lg transition-colors duration-300" style={{ color: selectedColor }}>Topics</CardTitle>
              <CardDescription>Digital Computers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {topics.map((topic) => {
                const topicColor = getTopicColor(topic)
                const isSelected = selectedTopic === topic
                return (
                  <Button
                    key={topic}
                    variant="ghost"
                    className={`w-full justify-start text-left h-auto py-3 transition-all duration-300 border ${isSelected ? '' : 'border-transparent hover:bg-muted'}`}
                    style={isSelected ? {
                      backgroundColor: `${topicColor}25`, // 15% opacity
                      borderColor: `${topicColor}40`,     // 25% opacity
                    } : {}}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <div className="flex items-start gap-2 flex-1 w-full overflow-hidden">
                      <BookOpen
                        className="h-4 w-4 shrink-0 mt-1 transition-colors"
                        style={{ color: isSelected ? topicColor : 'currentColor' }}
                      />
                      <span className={`text-sm leading-snug whitespace-normal text-left ${isSelected ? 'font-medium' : ''}`}>
                        {topic}
                      </span>
                    </div>
                    {topicContent[topic] && (
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 ml-2 mt-1"
                        style={{ color: isSelected ? topicColor : 'var(--muted-foreground)' }}
                      />
                    )}
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          {/* Content Panel with Tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="learn" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList
                className="grid w-full grid-cols-2 border-2 transition-colors duration-300"
                style={{ borderColor: `${selectedColor}40` }}
              >
                <TabsTrigger
                  value="learn"
                  className="gap-2 transition-all duration-300"
                  style={activeTab === 'learn' ? {
                    color: selectedColor,
                    backgroundColor: `${selectedColor}15`
                  } : {}}
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Learn</span>
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="gap-2 transition-all duration-300"
                  style={activeTab === 'projects' ? {
                    color: selectedColor,
                    backgroundColor: `${selectedColor}15`
                  } : {}}
                >
                  <FlaskConical className="h-4 w-4" />
                  <span className="hidden sm:inline">Projects</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="learn" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Main Explanation */}
                <Card style={{ borderColor: `${selectedColor}40` }} className="border-2 transition-colors duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl transition-colors duration-300" style={{ color: selectedColor }}>{selectedTopic}</CardTitle>
                        <CardDescription className="mt-2">AI-generated personalized explanation</CardDescription>
                      </div>
                      <Badge variant="outline" className="transition-colors duration-300" style={{ borderColor: selectedColor, color: selectedColor }}>COA Chapter</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Introduction</h3>
                      <p className="text-muted-foreground leading-relaxed">{content.introduction}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <ChevronRight className="h-5 w-5" style={{ color: selectedColor }} />
                        Key Concepts
                      </h3>
                      <ul className="space-y-3">
                        {content.keyPoints.map((point, index) => (
                          <li key={index} className="flex gap-3">
                            <span
                              className="h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium shrink-0 mt-0.5 transition-colors duration-300"
                              style={{ backgroundColor: `${selectedColor}20`, color: selectedColor }}
                            >
                              {index + 1}
                            </span>
                            <span className="text-muted-foreground leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Definitions */}
                <Card style={{ borderColor: `${selectedColor}40` }} className="border-2 transition-colors duration-300">
                  <CardHeader>
                    <CardTitle>Key Definitions</CardTitle>
                    <CardDescription>Important terms and concepts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {content.definitions.map((def, index) => (
                      <div
                        key={index}
                        className="border-l-2 pl-4 py-2 transition-colors duration-300"
                        style={{ borderColor: selectedColor }}
                      >
                        <h4 className="font-semibold mb-1" style={{ color: selectedColor }}>{def.term}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{def.definition}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Exam Focus */}
                <Card
                  className="border-2 transition-colors duration-300"
                  style={{
                    borderColor: `${selectedColor}40`,
                    backgroundColor: `${selectedColor}05` // Very subtle tint
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" style={{ color: selectedColor }} />
                      <CardTitle>Exam-Focused Points</CardTitle>
                    </div>
                    <CardDescription>Important topics for examinations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {content.examFocus.map((point, index) => (
                        <li key={index} className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: selectedColor }} />
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="animate-in fade-in slide-in-from-bottom-2">
                <ProjectExplorer topic={selectedTopic} color={selectedColor} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

    </DashboardLayout>
  )
}
