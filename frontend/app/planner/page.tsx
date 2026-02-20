"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { backendApi, type PlannerEvent } from "@/lib/backend-api"
import {
    reorderTasks,
    getLearnerSignals,
    computeReadinessMetrics,
    getSuggestedTasks,
    type AdaptiveTask,
    type ReadinessMetrics
} from "@/lib/adaptive-planner"
import {
    Calendar, Clock, BookOpen, Brain, Layers, Sparkles, Lightbulb,
    AlertTriangle, CheckCircle, Edit3, X, GripVertical, Bell, BellRing,
    CalendarClock, RefreshCw
} from "lucide-react"
import {
    loadReminders, saveReminders, setReminder, removeReminder,
    getSmartDefaultTime, getSmartDefaultLabel,
    requestNotificationPermission, getMissedTasks, getNextReminder,
    checkDueReminders, getCurrentWeekday, getDayIndex,
    type TaskReminder, type MissedTask, type NextReminderInfo
} from "@/lib/task-reminders"

// ============================================================================
// TYPES
// ============================================================================

type PlannerMode = "ai-suggested" | "plan-my-week"
type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"

interface WeekPlan {
    [day: string]: string[] // day -> task IDs
}

interface TaskReasons {
    [taskId: string]: {
        aiReason?: string
        userReason?: string
    }
}

interface ScheduleFeedback {
    type: "warning" | "tip" | "success"
    message: string
}

// Custom user-created task
interface CustomTask {
    id: string
    title: string
    note?: string
    createdAt: number
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const WEEK_PLAN_KEY = "coa_week_plan"
const TASK_REASONS_KEY = "coa_task_reasons"
const CUSTOM_TASKS_KEY = "coa_custom_tasks"

function loadWeekPlan(): WeekPlan {
    if (typeof window === "undefined") return {}
    try {
        const stored = localStorage.getItem(WEEK_PLAN_KEY)
        return stored ? JSON.parse(stored) : {}
    } catch { return {} }
}

function saveWeekPlan(plan: WeekPlan): void {
    if (typeof window === "undefined") return
    localStorage.setItem(WEEK_PLAN_KEY, JSON.stringify(plan))
}

function loadTaskReasons(): TaskReasons {
    if (typeof window === "undefined") return {}
    try {
        const stored = localStorage.getItem(TASK_REASONS_KEY)
        return stored ? JSON.parse(stored) : {}
    } catch { return {} }
}

function saveTaskReasons(reasons: TaskReasons): void {
    if (typeof window === "undefined") return
    localStorage.setItem(TASK_REASONS_KEY, JSON.stringify(reasons))
}

function loadCustomTasks(): CustomTask[] {
    if (typeof window === "undefined") return []
    try {
        const stored = localStorage.getItem(CUSTOM_TASKS_KEY)
        return stored ? JSON.parse(stored) : []
    } catch { return [] }
}

function saveCustomTasks(tasks: CustomTask[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(CUSTOM_TASKS_KEY, JSON.stringify(tasks))
}

// ============================================================================
// AI FEEDBACK ON SCHEDULE
// ============================================================================

function analyzeSchedule(weekPlan: WeekPlan, tasks: AdaptiveTask[]): ScheduleFeedback[] {
    const feedback: ScheduleFeedback[] = []
    const taskMap = new Map(tasks.map(t => [t.id, t]))

    // Check for overload (more than 3 tasks per day)
    for (const [day, taskIds] of Object.entries(weekPlan)) {
        if (taskIds.length > 3) {
            feedback.push({
                type: "warning",
                message: `${day} has ${taskIds.length} tasks — consider spreading them out`
            })
        }
    }

    // Check for prerequisite order (conceptual before hardware)
    const orderedDays: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    let hardwareDay = -1
    let conceptualAfterHardware = false

    for (let i = 0; i < orderedDays.length; i++) {
        const dayTasks = weekPlan[orderedDays[i]] || []
        for (const taskId of dayTasks) {
            const task = taskMap.get(taskId)
            if (task?.category === "hardware" && hardwareDay === -1) {
                hardwareDay = i
            }
            if (task?.category === "conceptual" && hardwareDay !== -1 && i > hardwareDay) {
                conceptualAfterHardware = true
            }
        }
    }

    if (conceptualAfterHardware) {
        feedback.push({
            type: "tip",
            message: "Consider completing conceptual tasks before hardware projects"
        })
    }

    // Check spacing (no quiz right after quiz)
    for (const day of orderedDays) {
        const dayTasks = weekPlan[day] || []
        let quizCount = 0
        for (const taskId of dayTasks) {
            const task = taskMap.get(taskId)
            if (task?.type === "Quiz") quizCount++
        }
        if (quizCount >= 2) {
            feedback.push({
                type: "tip",
                message: `Multiple quizzes on ${day} — consider spacing for better retention`
            })
        }
    }

    // Positive feedback
    const totalPlanned = Object.values(weekPlan).flat().length
    if (totalPlanned >= 3 && feedback.length === 0) {
        feedback.push({
            type: "success",
            message: "Great planning! Your schedule looks balanced"
        })
    }

    return feedback
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PlannerPage() {
    const [events, setEvents] = useState<PlannerEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [mode, setMode] = useState<PlannerMode>("ai-suggested")
    const [weekPlan, setWeekPlan] = useState<WeekPlan>({})
    const [taskReasons, setTaskReasons] = useState<TaskReasons>({})
    const [editingReason, setEditingReason] = useState<string | null>(null)
    const [reasonInput, setReasonInput] = useState("")
    const [draggedTask, setDraggedTask] = useState<string | null>(null)
    const [customTasks, setCustomTasks] = useState<CustomTask[]>([])
    const [newTaskInput, setNewTaskInput] = useState("")
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
    const [noteInput, setNoteInput] = useState("")

    // Reminder system state
    const [reminders, setReminders] = useState<Record<string, TaskReminder>>({})
    const [reminderPopupTaskId, setReminderPopupTaskId] = useState<string | null>(null)
    const [reminderTime, setReminderTime] = useState("19:00")
    const [reminderInApp, setReminderInApp] = useState(true)
    const [reminderBrowser, setReminderBrowser] = useState(false)
    const [inAppNotification, setInAppNotification] = useState<{ taskId: string, title: string } | null>(null)
    const [aiLabelAnimated, setAiLabelAnimated] = useState(true)

    const weekdays: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    useEffect(() => {
        const fetchPlanner = async () => {
            setLoading(true)
            try {
                const data = await backendApi.fetchPlannerData()
                setEvents(data)
            } catch (error) {
                console.error("Failed to fetch planner data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPlanner()
        setWeekPlan(loadWeekPlan())
        setTaskReasons(loadTaskReasons())
        setCustomTasks(loadCustomTasks())
    }, [])

    // Convert custom tasks to AdaptiveTask format
    const customAdaptiveTasks: AdaptiveTask[] = useMemo(() => {
        return customTasks.map(ct => ({
            id: ct.id,
            title: ct.title,
            type: "Topic" as const,
            status: "Pending" as const,
            dueDate: new Date().toISOString().split("T")[0],
            priority: 45,
            adaptiveHint: ct.note,
            isSuggested: false,
            category: "conceptual" as const,
            isCustom: true,
        }))
    }, [customTasks])

    // Compute adaptive tasks with reordering and hints
    const adaptiveTasks = useMemo(() => {
        const signals = getLearnerSignals()
        const suggested = getSuggestedTasks(signals)
        const reordered = reorderTasks(events, signals)
        // Include custom tasks
        return [...suggested, ...customAdaptiveTasks, ...reordered]
    }, [events, customAdaptiveTasks])

    // Update task reasons with AI hints
    useEffect(() => {
        const newReasons = { ...taskReasons }
        for (const task of adaptiveTasks) {
            if (task.adaptiveHint && !newReasons[task.id]?.aiReason) {
                newReasons[task.id] = {
                    ...newReasons[task.id],
                    aiReason: task.adaptiveHint
                }
            }
        }
        setTaskReasons(newReasons)
    }, [adaptiveTasks])

    // Compute readiness metrics
    const readiness = useMemo(() => {
        const signals = getLearnerSignals()
        return computeReadinessMetrics(signals)
    }, [])

    // Schedule feedback
    const scheduleFeedback = useMemo(() => {
        if (mode !== "plan-my-week") return []
        return analyzeSchedule(weekPlan, adaptiveTasks)
    }, [mode, weekPlan, adaptiveTasks])

    // Get unassigned tasks (not in any day)
    const unassignedTasks = useMemo(() => {
        const assignedIds = new Set(Object.values(weekPlan).flat())
        return adaptiveTasks.filter(t => !assignedIds.has(t.id))
    }, [adaptiveTasks, weekPlan])

    // Load reminders from storage
    useEffect(() => {
        setReminders(loadReminders())
        // Disable AI label animation after initial render
        const timer = setTimeout(() => setAiLabelAnimated(false), 2000)
        return () => clearTimeout(timer)
    }, [])

    // Check for due reminders every minute
    useEffect(() => {
        const checkReminders = () => {
            checkDueReminders(
                reminders,
                adaptiveTasks.map(t => ({ id: t.id, title: t.title })),
                (taskId, title) => {
                    setInAppNotification({ taskId, title })
                    // Auto-dismiss after 10 seconds
                    setTimeout(() => setInAppNotification(null), 10000)
                }
            )
        }

        checkReminders() // Check immediately
        const interval = setInterval(checkReminders, 60000) // Check every minute
        return () => clearInterval(interval)
    }, [reminders, adaptiveTasks])

    // Compute next reminder info
    const nextReminder = useMemo((): NextReminderInfo | null => {
        return getNextReminder(
            reminders,
            adaptiveTasks.map(t => ({ id: t.id, title: t.title }))
        )
    }, [reminders, adaptiveTasks])

    // Detect missed tasks
    const missedTasks = useMemo((): MissedTask[] => {
        return getMissedTasks(
            weekPlan,
            adaptiveTasks.map(t => ({ id: t.id, title: t.title, status: t.status }))
        )
    }, [weekPlan, adaptiveTasks])

    // Get current weekday for today emphasis
    const todayWeekday = useMemo(() => getCurrentWeekday(), [])

    // Get upcoming reminders (next 3) with status
    const upcomingReminders = useMemo(() => {
        const taskMap = new Map(adaptiveTasks.map(t => [t.id, t]))
        const today = todayWeekday
        const todayIndex = getDayIndex(today)
        const now = new Date()
        const currentMinutes = now.getHours() * 60 + now.getMinutes()

        const reminderList: Array<{
            taskId: string
            title: string
            time: string
            day: string
            displayTime: string
            status: 'upcoming' | 'missed'
            dayOffset: number
        }> = []

        for (const reminder of Object.values(reminders)) {
            if (!reminder.enabled) continue

            const task = taskMap.get(reminder.taskId)
            if (!task) continue

            const reminderDayIndex = getDayIndex(reminder.day)
            if (reminderDayIndex < 0) continue

            // Calculate day offset
            let dayOffset = reminderDayIndex - todayIndex
            const [hours, mins] = reminder.time.split(":").map(Number)
            const reminderMinutes = hours * 60 + mins

            // Determine status
            let status: 'upcoming' | 'missed' = 'upcoming'
            if (dayOffset < 0 || (dayOffset === 0 && reminderMinutes < currentMinutes)) {
                status = 'missed'
                if (dayOffset < 0) dayOffset += 7
            }

            // Format display time
            const period = hours >= 12 ? "PM" : "AM"
            const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
            const displayTime = `${displayHour}:${mins.toString().padStart(2, "0")} ${period}`

            reminderList.push({
                taskId: reminder.taskId,
                title: task.title,
                time: reminder.time,
                day: reminder.day,
                displayTime,
                status,
                dayOffset
            })
        }

        // Sort by day offset and time, show missed first then upcoming
        return reminderList
            .sort((a, b) => {
                if (a.status !== b.status) return a.status === 'missed' ? -1 : 1
                if (a.dayOffset !== b.dayOffset) return a.dayOffset - b.dayOffset
                return a.time.localeCompare(b.time)
            })
            .slice(0, 3)
    }, [reminders, adaptiveTasks, todayWeekday])

    const themeColor = "#3B82F6"

    const getIcon = (type: PlannerEvent["type"], isSuggested?: boolean) => {
        if (isSuggested) return <Sparkles className="h-4 w-4" />
        switch (type) {
            case "Topic": return <BookOpen className="h-4 w-4" />
            case "Quiz": return <Brain className="h-4 w-4" />
            case "Flashcard": return <Layers className="h-4 w-4" />
        }
    }

    const getReadinessColor = (value: number) => {
        if (value >= 75) return "#22C55E"
        if (value >= 50) return "#F59E0B"
        return "#EF4444"
    }

    // Drag handlers
    const handleDragStart = (taskId: string) => {
        setDraggedTask(taskId)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDropOnDay = (day: Weekday) => {
        if (!draggedTask) return

        // Remove from other days
        const newPlan = { ...weekPlan }
        for (const d of weekdays) {
            newPlan[d] = (newPlan[d] || []).filter(id => id !== draggedTask)
        }

        // Add to target day
        newPlan[day] = [...(newPlan[day] || []), draggedTask]

        setWeekPlan(newPlan)
        saveWeekPlan(newPlan)
        setDraggedTask(null)
    }

    const handleDropOnUnassigned = () => {
        if (!draggedTask) return

        // Remove from all days
        const newPlan = { ...weekPlan }
        for (const d of weekdays) {
            newPlan[d] = (newPlan[d] || []).filter(id => id !== draggedTask)
        }

        setWeekPlan(newPlan)
        saveWeekPlan(newPlan)
        setDraggedTask(null)
    }

    const handleSaveReason = (taskId: string) => {
        const newReasons = {
            ...taskReasons,
            [taskId]: {
                ...taskReasons[taskId],
                userReason: reasonInput
            }
        }
        setTaskReasons(newReasons)
        saveTaskReasons(newReasons)
        setEditingReason(null)
        setReasonInput("")
    }

    // Custom task handlers
    const handleAddCustomTask = () => {
        const title = newTaskInput.trim()
        if (!title) return

        const newTask: CustomTask = {
            id: `custom-${Date.now()}`,
            title,
            createdAt: Date.now()
        }

        const updated = [...customTasks, newTask]
        setCustomTasks(updated)
        saveCustomTasks(updated)
        setNewTaskInput("")
    }

    const handleSaveNote = (taskId: string) => {
        const updated = customTasks.map(t =>
            t.id === taskId ? { ...t, note: noteInput } : t
        )
        setCustomTasks(updated)
        saveCustomTasks(updated)
        setExpandedTaskId(null)
        setNoteInput("")
    }

    const handleDeleteCustomTask = (taskId: string) => {
        const updated = customTasks.filter(t => t.id !== taskId)
        setCustomTasks(updated)
        saveCustomTasks(updated)
        // Also remove from week plan
        const newPlan = { ...weekPlan }
        for (const d of weekdays) {
            newPlan[d] = (newPlan[d] || []).filter(id => id !== taskId)
        }
        setWeekPlan(newPlan)
        saveWeekPlan(newPlan)
    }

    // Reminder handlers
    const handleOpenReminderPopup = (taskId: string, taskType: string) => {
        const existing = reminders[taskId]
        if (existing) {
            setReminderTime(existing.time)
            setReminderInApp(existing.inAppEnabled)
            setReminderBrowser(existing.browserEnabled)
        } else {
            setReminderTime(getSmartDefaultTime(taskType))
            setReminderInApp(true)
            setReminderBrowser(false)
        }
        setReminderPopupTaskId(taskId)
    }

    const handleSaveReminder = async () => {
        if (!reminderPopupTaskId) return

        // Request browser permission if needed
        if (reminderBrowser) {
            const granted = await requestNotificationPermission()
            if (!granted) {
                setReminderBrowser(false)
            }
        }

        // Find which day the task is scheduled
        let scheduledDay = todayWeekday
        for (const [day, taskIds] of Object.entries(weekPlan)) {
            if (taskIds.includes(reminderPopupTaskId)) {
                scheduledDay = day
                break
            }
        }

        const reminder: TaskReminder = {
            taskId: reminderPopupTaskId,
            time: reminderTime,
            day: scheduledDay,
            inAppEnabled: reminderInApp,
            browserEnabled: reminderBrowser,
            enabled: true
        }

        setReminder(reminder)
        setReminders(prev => ({ ...prev, [reminderPopupTaskId]: reminder }))
        setReminderPopupTaskId(null)
    }

    const handleRemoveReminder = (taskId: string) => {
        removeReminder(taskId)
        setReminders(prev => {
            const updated = { ...prev }
            delete updated[taskId]
            return updated
        })
    }

    const handleRescheduleTask = (taskId: string, fromDay: string) => {
        // Move task from past day to today
        const newPlan = { ...weekPlan }
        newPlan[fromDay] = (newPlan[fromDay] || []).filter(id => id !== taskId)
        newPlan[todayWeekday] = [...(newPlan[todayWeekday] || []), taskId]
        setWeekPlan(newPlan)
        saveWeekPlan(newPlan)
    }

    const renderTaskCard = (task: AdaptiveTask, compact = false) => {
        const hasReminder = !!reminders[task.id]?.enabled
        const isMissed = missedTasks.some(m => m.taskId === task.id)

        return (
            <div
                key={task.id}
                draggable={mode === "plan-my-week"}
                onDragStart={() => handleDragStart(task.id)}
                className={`flex flex-col p-3 rounded-lg border bg-card hover:bg-muted/5 transition-all duration-300 ${mode === "plan-my-week" ? "cursor-grab active:cursor-grabbing" : ""
                    }`}
                style={{
                    borderColor: isMissed ? "#EF444450" : task.isSuggested ? "#8B5CF650" : `${themeColor}50`,
                    borderLeftWidth: '3px',
                    borderLeftColor: isMissed ? "#EF4444" : task.isSuggested ? "#8B5CF6" : themeColor,
                    opacity: draggedTask === task.id ? 0.5 : 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    position: 'relative'
                }}
            >
                <div className="flex items-center gap-3">
                    {mode === "plan-my-week" && (
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div
                        className={`${compact ? "h-7 w-7" : "h-9 w-9"} rounded-full flex items-center justify-center flex-shrink-0`}
                        style={{
                            backgroundColor: isMissed ? "#EF444415" : task.isSuggested ? "#8B5CF615" : `${themeColor}15`,
                            color: isMissed ? "#EF4444" : task.isSuggested ? "#8B5CF6" : themeColor,
                        }}
                    >
                        {getIcon(task.type, task.isSuggested)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${compact ? "text-xs" : "text-sm"} truncate`}>{task.title}</h4>
                            {task.isSuggested && (
                                <span
                                    className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex-shrink-0 flex items-center gap-1"
                                    style={{
                                        animation: aiLabelAnimated ? 'sparkle 1.5s ease-in-out' : 'none'
                                    }}
                                >
                                    <Sparkles className="h-2.5 w-2.5" />
                                    AI
                                </span>
                            )}
                        </div>
                        {!compact && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {task.dueDate}
                                {task.isSuggested && (
                                    <span className="text-purple-400/70 text-[10px]">Based on your progress</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Status badge with enhanced styling */}
                    <span
                        className={`px-2 py-0.5 rounded-full ${compact ? "text-[9px]" : "text-[10px]"} font-medium border flex-shrink-0 flex items-center gap-1`}
                        style={
                            task.status === "Done" ?
                                { backgroundColor: '#22C55E15', color: '#22C55E', borderColor: '#22C55E30' } :
                                isMissed ?
                                    { backgroundColor: '#EF444415', color: '#EF4444', borderColor: '#EF444430' } :
                                    { backgroundColor: `${themeColor}15`, color: themeColor, borderColor: `${themeColor}30` }
                        }
                    >
                        {task.status === "Done" && <CheckCircle className="h-2.5 w-2.5" />}
                        {isMissed && <AlertTriangle className="h-2.5 w-2.5" />}
                        {isMissed ? "Missed" : task.status}
                    </span>

                    {/* Bell icon for reminders */}
                    {!compact && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleOpenReminderPopup(task.id, task.type)
                            }}
                            className={`p-1.5 rounded-full transition-all ${hasReminder ? "bg-amber-500/20 text-amber-400" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                            title={hasReminder ? `Reminder set: ${reminders[task.id].time}` : "Set reminder"}
                        >
                            {hasReminder ? (
                                <BellRing className="h-4 w-4" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                            ) : (
                                <Bell className="h-4 w-4" />
                            )}
                        </button>
                    )}
                </div>

                {/* Reasons section - only in non-compact mode */}
                {!compact && (taskReasons[task.id]?.aiReason || taskReasons[task.id]?.userReason) && (
                    <div className="mt-2 space-y-1 pl-12">
                        {taskReasons[task.id]?.aiReason && (
                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <Lightbulb className="h-3 w-3 mt-0.5 text-amber-500/70 flex-shrink-0" />
                                <span className="italic">{taskReasons[task.id].aiReason}</span>
                            </div>
                        )}
                        {taskReasons[task.id]?.userReason && (
                            <div className="flex items-start gap-1.5 text-xs text-blue-400">
                                <Edit3 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{taskReasons[task.id].userReason}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Edit reason button */}
                {!compact && mode === "plan-my-week" && editingReason === task.id ? (
                    <div className="mt-2 flex gap-2 pl-12">
                        <Input
                            value={reasonInput}
                            onChange={(e) => setReasonInput(e.target.value)}
                            placeholder="Add your reason..."
                            className="h-7 text-xs"
                        />
                        <Button size="sm" className="h-7 px-2" onClick={() => handleSaveReason(task.id)}>
                            Save
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditingReason(null)}>
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ) : !compact && mode === "plan-my-week" && (
                    <button
                        onClick={() => {
                            setEditingReason(task.id)
                            setReasonInput(taskReasons[task.id]?.userReason || "")
                        }}
                        className="mt-2 text-xs text-muted-foreground hover:text-blue-400 pl-12 text-left"
                    >
                        + Add your reason
                    </button>
                )}
            </div>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Learning Planner</h1>
                        <p className="text-muted-foreground">Your personalized study schedule based on your progress.</p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                        <button
                            onClick={() => setMode("ai-suggested")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === "ai-suggested"
                                ? "bg-background shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Sparkles className="h-4 w-4" />
                            AI Suggested
                        </button>
                        <button
                            onClick={() => setMode("plan-my-week")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === "plan-my-week"
                                ? "bg-background shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Calendar className="h-4 w-4" />
                            Plan My Week
                        </button>
                    </div>
                </div>

                {/* Next Reminder Strip */}
                {nextReminder && (
                    <div
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg border"
                        style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderColor: 'rgba(245, 158, 11, 0.3)'
                        }}
                    >
                        <BellRing className="h-4 w-4 text-amber-400" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                        <span className="text-sm">
                            <span className="text-muted-foreground">Next reminder:</span>{' '}
                            <span className="font-medium">{nextReminder.taskTitle}</span>
                            <span className="text-muted-foreground"> — </span>
                            <span className="text-amber-400 font-medium">
                                {nextReminder.isToday ? "Today" : nextReminder.day} at {nextReminder.displayTime}
                            </span>
                        </span>
                    </div>
                )}

                {/* Missed Tasks Banners */}
                {missedTasks.length > 0 && (
                    <div className="space-y-2">
                        {missedTasks.slice(0, 3).map(missed => (
                            <div
                                key={missed.taskId}
                                className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border"
                                style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                    borderColor: 'rgba(239, 68, 68, 0.25)'
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <span className="text-sm">
                                        <span className="text-muted-foreground">You missed</span>{' '}
                                        <span className="font-medium">{missed.title}</span>
                                        <span className="text-muted-foreground"> on {missed.scheduledDay}</span>
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs border-red-400/30 text-red-400 hover:bg-red-500/10"
                                    onClick={() => handleRescheduleTask(missed.taskId, missed.scheduledDay)}
                                >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Reschedule to Today
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reminder Popup Modal */}
                {reminderPopupTaskId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setReminderPopupTaskId(null)}>
                        <div
                            className="bg-card border rounded-xl p-5 w-full max-w-sm shadow-xl"
                            onClick={e => e.stopPropagation()}
                            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Bell className="h-5 w-5 text-amber-400" />
                                <h3 className="text-lg font-semibold">Set Reminder</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-muted-foreground mb-1 block">Reminder Time</label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="time"
                                            value={reminderTime}
                                            onChange={e => setReminderTime(e.target.value)}
                                            className="flex-1"
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            Suggested: {getSmartDefaultLabel(adaptiveTasks.find(t => t.id === reminderPopupTaskId)?.type || "Topic")}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={reminderInApp}
                                            onChange={e => setReminderInApp(e.target.checked)}
                                            className="w-4 h-4 rounded border-muted-foreground"
                                        />
                                        <span className="text-sm">In-app notification</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={reminderBrowser}
                                            onChange={e => setReminderBrowser(e.target.checked)}
                                            className="w-4 h-4 rounded border-muted-foreground"
                                        />
                                        <span className="text-sm">Browser notification</span>
                                    </label>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button onClick={handleSaveReminder} className="flex-1">
                                        Save Reminder
                                    </Button>
                                    {reminders[reminderPopupTaskId] && (
                                        <Button
                                            variant="outline"
                                            className="border-red-400/30 text-red-400 hover:bg-red-500/10"
                                            onClick={() => {
                                                handleRemoveReminder(reminderPopupTaskId)
                                                setReminderPopupTaskId(null)
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                    <Button variant="ghost" onClick={() => setReminderPopupTaskId(null)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* In-App Notification Toast */}
                {inAppNotification && (
                    <div
                        className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg"
                        style={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'rgba(245, 158, 11, 0.4)',
                            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)',
                            animation: 'slideIn 0.3s ease-out'
                        }}
                    >
                        <BellRing className="h-5 w-5 text-amber-400" />
                        <div>
                            <p className="text-sm font-medium">Study Reminder</p>
                            <p className="text-xs text-muted-foreground">{inAppNotification.title}</p>
                        </div>
                        <button
                            onClick={() => setInAppNotification(null)}
                            className="ml-2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* CSS Keyframes */}
                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                    @keyframes sparkle {
                        0% { transform: scale(1); filter: brightness(1); }
                        50% { transform: scale(1.1); filter: brightness(1.3); }
                        100% { transform: scale(1); filter: brightness(1); }
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}</style>

                {/* AI Feedback on user schedule */}
                {mode === "plan-my-week" && scheduleFeedback.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {scheduleFeedback.map((fb, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${fb.type === "warning" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                                    fb.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/30" :
                                        "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                    }`}
                            >
                                {fb.type === "warning" ? <AlertTriangle className="h-3 w-3" /> :
                                    fb.type === "success" ? <CheckCircle className="h-3 w-3" /> :
                                        <Lightbulb className="h-3 w-3" />}
                                {fb.message}
                            </div>
                        ))}
                    </div>
                )}

                {/* AI Suggested Mode */}
                {mode === "ai-suggested" && (
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2 border-2" style={{ borderTop: `4px solid ${themeColor}`, borderRight: `1px solid ${themeColor}40`, borderLeft: `1px solid ${themeColor}40`, borderBottom: `1px solid ${themeColor}40`, boxShadow: `0 0 30px -15px ${themeColor}30` }}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" style={{ color: themeColor }} />
                                        Up Next
                                    </CardTitle>
                                    <Badge variant="outline">{new Date().toLocaleDateString()}</Badge>
                                </div>
                                <CardDescription>AI-optimized task order based on your progress</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
                                ) : (
                                    adaptiveTasks.map(task => renderTaskCard(task))
                                )}
                            </CardContent>
                        </Card>

                        {/* Readiness sidebar */}
                        <div className="space-y-6">
                            <Card className="border-2" style={{ borderColor: `${themeColor}50`, backgroundColor: `${themeColor}05` }}>
                                <CardHeader>
                                    <CardTitle className="text-lg" style={{ color: themeColor }}>Progress Intelligence</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Your planner adapts based on quiz performance and project progress.
                                    </p>

                                    <div className="space-y-3">
                                        {[
                                            { label: "Conceptual Readiness", value: readiness.conceptualReadiness },
                                            { label: "Hardware Stability", value: readiness.hardwareBuildStability },
                                            { label: "Execution Confidence", value: readiness.executionConfidence }
                                        ].map(metric => (
                                            <div key={metric.label}>
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="text-muted-foreground">{metric.label}</span>
                                                    <span className="font-semibold" style={{ color: getReadinessColor(metric.value) }}>
                                                        {metric.value}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${metric.value}%`, backgroundColor: getReadinessColor(metric.value) }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-2 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Overall Status</span>
                                            <Badge
                                                variant="outline"
                                                className="font-semibold"
                                                style={{
                                                    borderColor: readiness.overallReadiness === "Strong" ? "#22C55E" :
                                                        readiness.overallReadiness === "Building" ? "#F59E0B" : "#EF4444",
                                                    color: readiness.overallReadiness === "Strong" ? "#22C55E" :
                                                        readiness.overallReadiness === "Building" ? "#F59E0B" : "#EF4444",
                                                }}
                                            >
                                                {readiness.overallReadiness}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Plan My Week Mode */}
                {mode === "plan-my-week" && (
                    <div className="space-y-4">
                        {/* Unassigned tasks */}
                        <Card
                            className="border-2 border-dashed"
                            onDragOver={handleDragOver}
                            onDrop={handleDropOnUnassigned}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    Unassigned Tasks
                                    <Badge variant="secondary" className="ml-2">{unassignedTasks.length}</Badge>
                                </CardTitle>
                                <CardDescription>Drag tasks to assign them to days</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Custom Task Input */}
                                <div className="flex gap-2">
                                    <Input
                                        value={newTaskInput}
                                        onChange={(e) => setNewTaskInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddCustomTask()}
                                        placeholder="What do you want to study?"
                                        className="flex-1"
                                    />
                                    <Button onClick={handleAddCustomTask} disabled={!newTaskInput.trim()}>
                                        Add
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {unassignedTasks.map(task => (
                                        <div
                                            key={task.id}
                                            draggable
                                            onDragStart={() => handleDragStart(task.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors group"
                                            style={{
                                                borderColor: task.isCustom ? "#22C55E40" : task.isSuggested ? "#8B5CF640" : `${themeColor}40`,
                                                opacity: draggedTask === task.id ? 0.5 : 1
                                            }}
                                        >
                                            <GripVertical className="h-3 w-3 text-muted-foreground" />
                                            {task.isCustom ? (
                                                <Edit3 className="h-4 w-4 text-green-500" />
                                            ) : (
                                                getIcon(task.type, task.isSuggested)
                                            )}
                                            <span className="text-sm">{task.title}</span>
                                            {task.isCustom && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteCustomTask(task.id)
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 ml-1 text-muted-foreground hover:text-red-400 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {unassignedTasks.length === 0 && (
                                        <p className="text-sm text-muted-foreground">All tasks assigned! 🎉</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upcoming Reminders Section */}
                        <div
                            className="rounded-lg border p-4"
                            style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.06)',
                                borderColor: 'rgba(245, 158, 11, 0.25)'
                            }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Bell className="h-4 w-4 text-amber-400" />
                                <h3 className="font-semibold text-sm">Upcoming Reminders</h3>
                                {upcomingReminders.length > 0 && (
                                    <Badge variant="outline" className="text-[10px] h-5 border-amber-400/40 text-amber-400">
                                        {upcomingReminders.length}
                                    </Badge>
                                )}
                            </div>

                            {upcomingReminders.length === 0 ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                    <span>No upcoming reminders. You're all caught up!</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {upcomingReminders.map(reminder => (
                                        <div
                                            key={reminder.taskId}
                                            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
                                            style={{
                                                backgroundColor: reminder.status === 'missed'
                                                    ? 'rgba(239, 68, 68, 0.08)'
                                                    : 'rgba(255, 255, 255, 0.03)',
                                                borderColor: reminder.status === 'missed'
                                                    ? 'rgba(239, 68, 68, 0.25)'
                                                    : 'rgba(255, 255, 255, 0.1)'
                                            }}
                                            onClick={() => {
                                                // Scroll to and highlight the task in the week grid
                                                const day = reminder.day
                                                if (day && weekPlan[day]?.includes(reminder.taskId)) {
                                                    setMode("plan-my-week")
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        backgroundColor: reminder.status === 'missed'
                                                            ? 'rgba(239, 68, 68, 0.15)'
                                                            : 'rgba(245, 158, 11, 0.15)'
                                                    }}
                                                >
                                                    {reminder.status === 'missed' ? (
                                                        <AlertTriangle className="h-4 w-4 text-red-400" />
                                                    ) : (
                                                        <BellRing className="h-4 w-4 text-amber-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{reminder.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {reminder.day === todayWeekday ? "Today" : reminder.day} at {reminder.displayTime}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] h-5"
                                                    style={reminder.status === 'missed' ? {
                                                        borderColor: 'rgba(239, 68, 68, 0.4)',
                                                        color: '#EF4444',
                                                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                                    } : {
                                                        borderColor: 'rgba(34, 197, 94, 0.4)',
                                                        color: '#22C55E',
                                                        backgroundColor: 'rgba(34, 197, 94, 0.1)'
                                                    }}
                                                >
                                                    {reminder.status === 'missed' ? 'Missed' : 'Upcoming'}
                                                </Badge>

                                                {reminder.status === 'missed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 px-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            // Update reminder to today
                                                            const updated = { ...reminders[reminder.taskId], day: todayWeekday }
                                                            setReminder(updated)
                                                            setReminders(prev => ({ ...prev, [reminder.taskId]: updated }))
                                                        }}
                                                    >
                                                        <RefreshCw className="h-3 w-3 mr-1" />
                                                        Reschedule
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Week grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {weekdays.map(day => {
                                const dayTasks = (weekPlan[day] || [])
                                    .map(id => adaptiveTasks.find(t => t.id === id))
                                    .filter((t): t is AdaptiveTask => t !== undefined)

                                const isToday = day === todayWeekday

                                return (
                                    <div
                                        key={day}
                                        className={`rounded-lg p-2 min-h-[180px] transition-all ${draggedTask
                                            ? "border-2 border-dashed border-blue-500/50 bg-blue-500/5"
                                            : isToday
                                                ? "border-2 border-solid"
                                                : "border-2 border-dashed border-muted"
                                            }`}
                                        style={isToday ? {
                                            borderColor: themeColor,
                                            backgroundColor: `${themeColor}08`,
                                            boxShadow: `0 0 20px ${themeColor}20, 0 4px 12px rgba(0,0,0,0.1)`,
                                            transform: 'translateY(-2px)'
                                        } : {
                                            borderColor: 'rgba(139, 92, 246, 0.4)',
                                            backgroundColor: 'rgba(139, 92, 246, 0.03)'
                                        }}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDropOnDay(day)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3
                                                className={`font-semibold text-sm ${isToday ? "text-blue-400" : ""}`}
                                            >
                                                {day}
                                                {isToday && <span className="ml-1 text-[10px] text-blue-400/70">(Today)</span>}
                                            </h3>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] h-5"
                                                style={isToday ? { borderColor: themeColor, color: themeColor } : undefined}
                                            >
                                                {dayTasks.length}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            {dayTasks.map(task => renderTaskCard(task, true))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
