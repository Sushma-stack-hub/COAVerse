// ============================================================================
// NOTES UTILITIES
// Processing utilities for Smart Notes feature
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface Note {
    id: string
    topic: string
    timestamp: number | null
    learningMode: 'video' | 'visualization' | 'simulation' | 'general'
    content: string
    createdAt: string
}

export interface NotesExportConfig {
    topic: string
    notes: Note[]
    includeMetadata?: boolean
}

// ============================================================================
// FILLER WORDS TO REMOVE
// ============================================================================

const FILLER_WORDS = [
    'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually',
    'so', 'well', 'i mean', 'sort of', 'kind of', 'literally', 'honestly',
    'right', 'okay', 'alright', 'yeah', 'yep', 'nope', 'hmm', 'hm'
]

// ============================================================================
// TEXT CLEANING
// ============================================================================

/**
 * Remove filler words from transcribed text
 */
export function cleanTranscription(text: string): string {
    if (!text) return ''

    let cleaned = text.toLowerCase()

    // Remove filler words (case insensitive, word boundaries)
    FILLER_WORDS.forEach(filler => {
        const regex = new RegExp(`\\b${filler}\\b`, 'gi')
        cleaned = cleaned.replace(regex, '')
    })

    // Clean up extra whitespace
    cleaned = cleaned
        .replace(/\s+/g, ' ')        // Multiple spaces to single
        .replace(/\s+,/g, ',')       // Space before comma
        .replace(/\s+\./g, '.')      // Space before period
        .replace(/^\s+|\s+$/g, '')   // Trim

    // Capitalize first letter of sentences
    cleaned = cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (match, prefix, letter) => {
        return prefix + letter.toUpperCase()
    })

    // Ensure first character is capitalized
    if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    }

    return cleaned
}

// ============================================================================
// BULLET POINT FORMATTING
// ============================================================================

/**
 * Convert cleaned text to bullet point notes
 * Splits on sentences and creates bullet points
 */
export function formatAsBulletPoints(text: string): string[] {
    if (!text) return []

    // Split by sentence-ending punctuation
    const sentences = text
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 0)

    // If no sentence breaks, split by commas or treat as single point
    if (sentences.length === 1 && sentences[0].length > 100) {
        // Long text without sentence breaks - try splitting by commas
        const parts = sentences[0]
            .split(/,\s*/)
            .map(s => s.trim())
            .filter(s => s.length > 5)

        if (parts.length > 1) {
            return parts.map(p => {
                // Capitalize first letter
                return p.charAt(0).toUpperCase() + p.slice(1)
            })
        }
    }

    return sentences
}

/**
 * Process raw transcription into formatted bullet points
 */
export function processTranscription(rawText: string): string[] {
    const cleaned = cleanTranscription(rawText)
    return formatAsBulletPoints(cleaned)
}

// ============================================================================
// NOTE CREATION
// ============================================================================

/**
 * Create a new note with metadata
 */
export function createNote(
    content: string,
    topic: string,
    learningMode: Note['learningMode'] = 'general',
    timestamp: number | null = null
): Note {
    return {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        topic,
        timestamp,
        learningMode,
        content,
        createdAt: new Date().toISOString()
    }
}

/**
 * Create multiple notes from bullet points
 */
export function createNotesFromBullets(
    bullets: string[],
    topic: string,
    learningMode: Note['learningMode'] = 'general',
    timestamp: number | null = null
): Note[] {
    return bullets.map(content => createNote(content, topic, learningMode, timestamp))
}

// ============================================================================
// EXPORT FUNCTIONALITY
// ============================================================================

/**
 * Format notes for export as text
 */
export function formatNotesForExport(config: NotesExportConfig): string {
    const { topic, notes, includeMetadata = true } = config

    const lines: string[] = []

    // Header
    lines.push(`## Study Notes - ${topic}`)
    lines.push(`Generated: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`)
    lines.push('')

    // Notes content
    notes.forEach(note => {
        lines.push(`• ${note.content}`)
    })

    // Metadata footer
    if (includeMetadata && notes.length > 0) {
        lines.push('')
        lines.push('---')

        const modes = [...new Set(notes.map(n => n.learningMode))]
        lines.push(`Learning Mode: ${modes.join(', ')}`)
        lines.push(`Total Notes: ${notes.length}`)
    }

    return lines.join('\n')
}

/**
 * Export notes as a downloadable .txt file
 */
export function exportNotesAsTxt(config: NotesExportConfig): void {
    const content = formatNotesForExport(config)

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `notes-${config.topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
}

// ============================================================================
// JSON STORAGE FORMAT (Backend-ready)
// ============================================================================

/**
 * Convert notes to backend-ready JSON format
 */
export function notesToJSON(notes: Note[]): string {
    return JSON.stringify(notes, null, 2)
}

/**
 * Parse notes from JSON
 */
export function notesFromJSON(json: string): Note[] {
    try {
        return JSON.parse(json) as Note[]
    } catch {
        return []
    }
}
