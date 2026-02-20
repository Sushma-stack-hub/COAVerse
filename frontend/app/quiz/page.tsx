"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, TrendingUp } from "lucide-react"

const quizQuestions = [
  {
    id: 1,
    question: "What is the primary function of the Control Unit in a CPU?",
    options: [
      "Perform arithmetic operations",
      "Store data temporarily",
      "Coordinate and control all operations",
      "Communicate with external devices",
    ],
    correct: 2,
    difficulty: "Easy",
    topic: "CPU Architecture",
  },
  {
    id: 2,
    question: "In which phase of the instruction cycle is the instruction retrieved from memory?",
    options: ["Execute", "Fetch", "Decode", "Store"],
    correct: 1,
    difficulty: "Exam",
    topic: "Instruction Cycle",
  },
  {
    id: 3,
    question: "Which addressing mode has the operand as part of the instruction itself?",
    options: ["Direct", "Indirect", "Immediate", "Indexed"],
    correct: 2,
    difficulty: "Exam",
    topic: "Addressing Modes",
  },
  {
    id: 4,
    question: "What is the main advantage of microprogrammed control over hardwired control?",
    options: ["Faster execution speed", "Lower hardware cost", "Easier to modify and debug", "Requires less memory"],
    correct: 2,
    difficulty: "Conceptual",
    topic: "Control Unit",
  },
  {
    id: 5,
    question: "Which register holds the address of the next instruction to be executed?",
    options: ["Instruction Register (IR)", "Program Counter (PC)", "Memory Address Register (MAR)", "Accumulator (AC)"],
    correct: 1,
    difficulty: "Easy",
    topic: "Registers",
  },
]

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [quizComplete, setQuizComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiResult, setApiResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const startTime = useRef<number>(Date.now())

  useEffect(() => {
    startTime.current = Date.now()
  }, [])

  const question = quizQuestions[currentQuestion]

  const handleSubmit = () => {
    if (selectedAnswer === null) return

    setShowResult(true)
    if (selectedAnswer === question.correct) {
      setScore(score + 1)
    }
    setAnsweredQuestions([...answeredQuestions, currentQuestion])
  }

  const submitQuiz = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const timeTaken = Math.round((Date.now() - startTime.current) / 1000)
      const finalScore = selectedAnswer === question.correct ? score + 1 : score

      const payload = {
        studentId: "STU101",
        topic: "Timing and Control",
        totalQuestions: quizQuestions.length,
        correctAnswers: finalScore,
        timeTakenSeconds: timeTaken,
        attempts: 1 // Assuming 1st attempt for invalidation simplicity or we could track this locally
      }

      console.log("Submitting payload:", payload)

      const response = await fetch("http://localhost:3002/submit-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to submit quiz results")
      }

      const data = await response.json()
      setApiResult(data)
      setQuizComplete(true)
    } catch (err) {
      console.error("Quiz submission error:", err)
      setError("Failed to save results. Please try again.")
      // Still show complete screen but with error note? 
      // Or maybe allow retry? For now let's set complete so user isn't stuck.
      setQuizComplete(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      submitQuiz()
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnsweredQuestions([])
    setQuizComplete(false)
    setApiResult(null)
    setError(null)
    startTime.current = Date.now()
  }

  if (quizComplete) {
    const percentage = Math.round((score / quizQuestions.length) * 100)
    const weakAreas = quizQuestions
      .filter((q, idx) => !answeredQuestions.includes(idx) || selectedAnswer !== q.correct)
      .map((q) => q.topic)
      .filter((topic, idx, self) => self.indexOf(topic) === idx)

    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
              <CardDescription>
                {isSubmitting ? "Analyzing your performance..." : "Here's how you performed"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{percentage}%</div>
                <p className="text-muted-foreground">
                  You scored {score} out of {quizQuestions.length} questions
                </p>
              </div>

              <Progress value={percentage} className="h-3" />

              {apiResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Predicted Level</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold text-primary">{apiResult.predicted_level}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold text-primary">{apiResult.accuracy_percent}%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Avg Time</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold text-primary">{apiResult.avg_time_seconds}s</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-md bg-red-50 text-red-600 border border-red-200 text-center">
                  {error}
                </div>
              )}

              {weakAreas.length > 0 && (
                <Card className="border-2 border-yellow-500/50 bg-yellow-500/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {weakAreas.map((area, idx) => (
                        <Badge key={idx} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button onClick={handleRestart} className="flex-1">
                  Retake Quiz
                </Button>
                <Button variant="outline" onClick={handleRestart} className="flex-1 bg-transparent">
                  Try Different Topic
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">COA Quiz</h1>
            <p className="text-muted-foreground leading-relaxed">Test your knowledge of Digital Computers</p>
          </div>
          <Badge variant="outline" className="text-base px-4 py-2">
            {currentQuestion + 1} / {quizQuestions.length}
          </Badge>
        </div>

        <Progress value={((currentQuestion + 1) / quizQuestions.length) * 100} />

        <Card className="max-w-3xl mx-auto border-2">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge>{question.difficulty}</Badge>
              <Badge variant="outline">{question.topic}</Badge>
            </div>
            <CardTitle className="text-2xl leading-relaxed">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => setSelectedAnswer(Number.parseInt(value))}
              disabled={showResult}
            >
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${showResult
                        ? index === question.correct
                          ? "border-green-500 bg-green-500/10"
                          : index === selectedAnswer
                            ? "border-red-500 bg-red-500/10"
                            : "border-border"
                        : selectedAnswer === index
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer leading-relaxed">
                      {option}
                    </Label>
                    {showResult && index === question.correct && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    )}
                    {showResult && index === selectedAnswer && index !== question.correct && (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>

            {showResult && (
              <Card
                className={`border-2 ${selectedAnswer === question.correct
                    ? "border-green-500 bg-green-500/5"
                    : "border-red-500 bg-red-500/5"
                  }`}
              >
                <CardContent className="pt-6">
                  <p className="font-medium mb-1">{selectedAnswer === question.correct ? "Correct!" : "Incorrect"}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedAnswer === question.correct
                      ? "Great job! You have a good understanding of this concept."
                      : `The correct answer is: ${question.options[question.correct]}`}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              {!showResult ? (
                <Button onClick={handleSubmit} disabled={selectedAnswer === null} className="flex-1">
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex-1">
                  {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "View Results"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
