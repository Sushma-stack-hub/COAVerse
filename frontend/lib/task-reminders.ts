// ============================================================================
// TASK REMINDER SYSTEM
// Manages reminders, notifications, and missed task detection
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface TaskReminder {
    taskId: string
    time: string // HH:MM format
    day: string // Weekday or date string
    inAppEnabled: boolean
    browserEnabled: boolean
    enabled: boolean
    lastTriggered?: number // timestamp
}

export interface MissedTask {
    taskId: string
    title: string
    scheduledDay: string
    daysMissed: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const REMINDERS_KEY = "coa_task_reminders"
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Smart default times based on task type
const SMART_DEFAULTS: Record<string, string> = {
    // Learning tasks - evening when mind is relaxed
    "Topic": "18:00",
    "Reading": "18:00",
    "Learn": "18:00",

    // Quiz/Practice - night for focused recall
    "Quiz": "20:00",
    "Practice": "20:00",
    "Flashcard": "20:00",
    "Review": "20:00",

    // Projects - afternoon for active work
    "Project": "14:00",
    "Build": "14:00",
    "Hardware": "14:00",

    // Default fallback
    "default": "19:00"
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

export function loadReminders(): Record<string, TaskReminder> {
    if (typeof window === "undefined") return {}
    try {
        const stored = localStorage.getItem(REMINDERS_KEY)
        return stored ? JSON.parse(stored) : {}
    } catch {
        return {}
    }
}

export function saveReminders(reminders: Record<string, TaskReminder>): void {
    if (typeof window === "undefined") return
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders))
}

export function getReminder(taskId: string): TaskReminder | null {
    const reminders = loadReminders()
    return reminders[taskId] || null
}

export function setReminder(reminder: TaskReminder): void {
    const reminders = loadReminders()
    reminders[reminder.taskId] = reminder
    saveReminders(reminders)
}

export function removeReminder(taskId: string): void {
    const reminders = loadReminders()
    delete reminders[taskId]
    saveReminders(reminders)
}

// ============================================================================
// SMART DEFAULTS
// ============================================================================

export function getSmartDefaultTime(taskType: string, taskTitle?: string): string {
    // Check direct type match
    if (SMART_DEFAULTS[taskType]) {
        return SMART_DEFAULTS[taskType]
    }

    // Check title keywords
    if (taskTitle) {
        const lowerTitle = taskTitle.toLowerCase()
        if (lowerTitle.includes("quiz") || lowerTitle.includes("test")) {
            return SMART_DEFAULTS["Quiz"]
        }
        if (lowerTitle.includes("project") || lowerTitle.includes("build")) {
            return SMART_DEFAULTS["Project"]
        }
        if (lowerTitle.includes("flashcard") || lowerTitle.includes("review")) {
            return SMART_DEFAULTS["Flashcard"]
        }
    }

    return SMART_DEFAULTS["default"]
}

export function getSmartDefaultLabel(taskType: string): string {
    const time = getSmartDefaultTime(taskType)
    const hour = parseInt(time.split(":")[0])

    if (hour < 12) return "Morning"
    if (hour < 17) return "Afternoon"
    if (hour < 20) return "Evening"
    return "Night"
}

// ============================================================================
// BROWSER NOTIFICATIONS
// ============================================================================

export async function requestNotificationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
        return false
    }

    if (Notification.permission === "granted") {
        return true
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission()
        return permission === "granted"
    }

    return false
}

export function sendBrowserNotification(title: string, body: string): void {
    if (typeof window === "undefined" || !("Notification" in window)) return
    if (Notification.permission !== "granted") return

    new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "coa-reminder",
        requireInteraction: true
    })
}

// ============================================================================
// MISSED TASK DETECTION
// ============================================================================

export function getCurrentWeekday(): string {
    return WEEKDAYS[new Date().getDay()]
}

export function getDayIndex(day: string): number {
    // Convert short weekday to index (Mon=1, Sun=0 but we treat Mon as start)
    const mapping: Record<string, number> = {
        "Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6
    }
    return mapping[day] ?? -1
}

export function getMissedTasks(
    weekPlan: Record<string, string[]>,
    tasks: Array<{ id: string; title: string; status: string }>
): MissedTask[] {
    const today = getCurrentWeekday()
    const todayIndex = getDayIndex(today)
    const missed: MissedTask[] = []

    const taskMap = new Map(tasks.map(t => [t.id, t]))

    for (const [day, taskIds] of Object.entries(weekPlan)) {
        const dayIndex = getDayIndex(day)

        // Only check days before today
        if (dayIndex >= 0 && dayIndex < todayIndex) {
            for (const taskId of taskIds) {
                const task = taskMap.get(taskId)
                // Task exists and is still pending
                if (task && task.status !== "Done") {
                    missed.push({
                        taskId,
                        title: task.title,
                        scheduledDay: day,
                        daysMissed: todayIndex - dayIndex
                    })
                }
            }
        }
    }

    return missed
}

// ============================================================================
// NEXT REMINDER CALCULATION
// ============================================================================

export interface NextReminderInfo {
    taskId: string
    taskTitle: string
    time: string
    day: string
    isToday: boolean
    displayTime: string // Formatted for display
}

export function getNextReminder(
    reminders: Record<string, TaskReminder>,
    tasks: Array<{ id: string; title: string }>
): NextReminderInfo | null {
    const taskMap = new Map(tasks.map(t => [t.id, t]))
    const today = getCurrentWeekday()
    const todayIndex = getDayIndex(today)
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    let earliest: { reminder: TaskReminder; dayOffset: number; minutes: number } | null = null

    for (const reminder of Object.values(reminders)) {
        if (!reminder.enabled) continue

        const task = taskMap.get(reminder.taskId)
        if (!task) continue

        const reminderDayIndex = getDayIndex(reminder.day)
        if (reminderDayIndex < 0) continue

        // Calculate day offset (days until reminder)
        let dayOffset = reminderDayIndex - todayIndex
        if (dayOffset < 0) dayOffset += 7 // Wrap to next week

        const [hours, mins] = reminder.time.split(":").map(Number)
        const reminderMinutes = hours * 60 + mins

        // If today but time has passed, skip or treat as next week
        if (dayOffset === 0 && reminderMinutes <= currentMinutes) {
            dayOffset = 7
        }

        // Compare to find earliest
        if (!earliest ||
            dayOffset < earliest.dayOffset ||
            (dayOffset === earliest.dayOffset && reminderMinutes < earliest.minutes)) {
            earliest = { reminder, dayOffset, minutes: reminderMinutes }
        }
    }

    if (!earliest) return null

    const task = taskMap.get(earliest.reminder.taskId)
    if (!task) return null

    // Format display time
    const [hours, mins] = earliest.reminder.time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    const displayTime = `${displayHour}:${mins.toString().padStart(2, "0")} ${period}`

    return {
        taskId: earliest.reminder.taskId,
        taskTitle: task.title,
        time: earliest.reminder.time,
        day: earliest.reminder.day,
        isToday: earliest.dayOffset === 0,
        displayTime
    }
}

// ============================================================================
// REMINDER CHECKER (for in-app notifications)
// ============================================================================

export function checkDueReminders(
    reminders: Record<string, TaskReminder>,
    tasks: Array<{ id: string; title: string }>,
    onTrigger: (taskId: string, title: string) => void
): void {
    const taskMap = new Map(tasks.map(t => [t.id, t]))
    const today = getCurrentWeekday()
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const currentTimestamp = now.getTime()

    for (const reminder of Object.values(reminders)) {
        if (!reminder.enabled) continue
        if (reminder.day !== today) continue
        if (reminder.time !== currentTime) continue

        // Avoid retriggering within same minute
        if (reminder.lastTriggered && currentTimestamp - reminder.lastTriggered < 60000) {
            continue
        }

        const task = taskMap.get(reminder.taskId)
        if (!task) continue

        // Trigger notification
        if (reminder.inAppEnabled) {
            onTrigger(reminder.taskId, task.title)
        }

        if (reminder.browserEnabled) {
            sendBrowserNotification(
                "Study Reminder",
                `Time to work on: ${task.title}`
            )
        }

        // Update last triggered
        reminder.lastTriggered = currentTimestamp
        setReminder(reminder)
    }
}
