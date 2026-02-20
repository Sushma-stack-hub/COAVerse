"use client"

// ============================================================================
// SMART NOTES PANEL - Refined UI
// Right-side expandable drawer with glassmorphism styling
// Voice-assisted notes with real-time transcription + manual input
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import {
    Mic,
    MicOff,
    Square,
    Download,
    Trash2,
    X,
    Edit3,
    AlertCircle,
    Sparkles,
    Plus,
    Type,
    Check,
    BookOpen,
    Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import {
    Note,
    processTranscription,
    createNotesFromBullets,
    createNote,
    exportNotesAsTxt
} from '@/lib/notes-utils'

// ============================================================================
// TYPES
// ============================================================================

export interface SmartNotesPanelProps {
    topic: string
    learningMode?: 'video' | 'visualization' | 'simulation' | 'general'
    videoTimestamp?: number
    onNotesUpdate?: (notes: Note[]) => void
    defaultCollapsed?: boolean
    accentColor?: string
}

// ============================================================================
// RECORDING INDICATOR
// ============================================================================

function RecordingIndicator() {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-medium">Recording...</span>
        </div>
    )
}

// ============================================================================
// AUTO-SAVE INDICATOR
// ============================================================================

function AutoSaveIndicator({ saved }: { saved: boolean }) {
    return (
        <div className={`flex items-center gap-1.5 text-xs transition-opacity duration-300 ${saved ? 'opacity-100' : 'opacity-0'}`}>
            <Check className="w-3 h-3 text-green-400" />
            <span className="text-green-400">Saved ✓</span>
        </div>
    )
}

// ============================================================================
// EDITABLE NOTE ITEM
// ============================================================================

interface NoteItemProps {
    note: Note
    onEdit: (id: string, content: string) => void
    onDelete: (id: string) => void
}

function NoteItem({ note, onEdit, onDelete }: NoteItemProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(note.content)

    const handleSave = () => {
        onEdit(note.id, editContent)
        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSave()
        }
        if (e.key === 'Escape') {
            setEditContent(note.content)
            setIsEditing(false)
        }
    }

    return (
        <div className="group relative p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-200">
            {isEditing ? (
                <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-black/30 border border-purple-500/50 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    rows={3}
                    autoFocus
                />
            ) : (
                <p className="text-sm text-gray-200 leading-relaxed pr-12">
                    {note.content}
                </p>
            )}

            {/* Actions */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                    title="Edit note"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => onDelete(note.id)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/30 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete note"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Timestamp */}
            {note.timestamp && (
                <div className="mt-2 text-xs text-gray-500">
                    @ {new Date(note.timestamp).toLocaleTimeString()}
                </div>
            )}
        </div>
    )
}

// ============================================================================
// NOTES TEXTAREA
// ============================================================================

interface NotesTextareaProps {
    onAddNote: (text: string) => void
    onSaved: () => void
}

function NotesTextarea({ onAddNote, onSaved }: NotesTextareaProps) {
    const [text, setText] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const handleSubmit = () => {
        if (text.trim()) {
            onAddNote(text.trim())
            setText('')
            setIsSaving(true)
            setTimeout(() => {
                setIsSaving(false)
                onSaved()
            }, 500)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="space-y-3">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your understanding in your own words…"
                className="w-full min-h-[120px] bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 placeholder:text-gray-500 transition-all"
            />
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                    Ctrl/⌘ + Enter to save
                </span>
                <Button
                    onClick={handleSubmit}
                    disabled={!text.trim() || isSaving}
                    size="sm"
                    className="gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <Check className="w-4 h-4" />
                            Saved
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Note
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

// ============================================================================
// TRIGGER BUTTON (Collapsed State)
// ============================================================================

interface TriggerButtonProps {
    onClick: () => void
    notesCount: number
    accentColor: string
}

function TriggerButton({ onClick, notesCount, accentColor }: TriggerButtonProps) {
    return (
        <button
            onClick={onClick}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center gap-3 pl-4 pr-3 py-4 rounded-l-2xl transition-all duration-300 hover:pr-6 group"
            style={{
                background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
                borderLeft: `2px solid ${accentColor}40`,
                borderTop: `2px solid ${accentColor}40`,
                borderBottom: `2px solid ${accentColor}40`,
                boxShadow: `0 0 20px ${accentColor}20, inset 0 0 20px ${accentColor}05`
            }}
            title="Open Notes"
        >
            <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
            <span
                className="text-sm font-medium [writing-mode:vertical-lr] rotate-180"
                style={{ color: accentColor }}
            >
                My Notes
            </span>
            {notesCount > 0 && (
                <span
                    className="absolute -top-1 -left-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: accentColor }}
                >
                    {notesCount > 9 ? '9+' : notesCount}
                </span>
            )}
        </button>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SmartNotesPanel({
    topic,
    learningMode = 'general',
    videoTimestamp,
    onNotesUpdate,
    defaultCollapsed = true,
    accentColor = '#A855F7' // Default purple
}: SmartNotesPanelProps) {
    const [isOpen, setIsOpen] = useState(!defaultCollapsed)
    const [notes, setNotes] = useState<Note[]>([])
    const [pendingTranscript, setPendingTranscript] = useState('')
    const [showSaved, setShowSaved] = useState(false)

    const {
        isListening,
        isSupported,
        transcript,
        interimTranscript,
        error,
        startListening,
        stopListening,
        resetTranscript
    } = useVoiceRecognition()

    // Track transcript changes
    useEffect(() => {
        if (transcript && transcript !== pendingTranscript) {
            setPendingTranscript(transcript)
        }
    }, [transcript, pendingTranscript])

    // Process transcript when recording stops
    useEffect(() => {
        if (!isListening && pendingTranscript) {
            const bullets = processTranscription(pendingTranscript)

            if (bullets.length > 0) {
                const newNotes = createNotesFromBullets(
                    bullets,
                    topic,
                    learningMode,
                    videoTimestamp ?? null
                )

                setNotes(prev => {
                    const updated = [...prev, ...newNotes]
                    onNotesUpdate?.(updated)
                    return updated
                })

                // Show saved indicator
                setShowSaved(true)
                setTimeout(() => setShowSaved(false), 2000)
            }

            setPendingTranscript('')
            resetTranscript()
        }
    }, [isListening, pendingTranscript, topic, learningMode, videoTimestamp, onNotesUpdate, resetTranscript])

    const handleStartRecording = useCallback(() => {
        resetTranscript()
        startListening()
    }, [resetTranscript, startListening])

    const handleStopRecording = useCallback(() => {
        stopListening()
    }, [stopListening])

    const handleManualNote = useCallback((text: string) => {
        const newNote = createNote(text, topic, learningMode, videoTimestamp ?? null)
        setNotes(prev => {
            const updated = [...prev, newNote]
            onNotesUpdate?.(updated)
            return updated
        })
    }, [topic, learningMode, videoTimestamp, onNotesUpdate])

    const handleSaved = useCallback(() => {
        setShowSaved(true)
        setTimeout(() => setShowSaved(false), 2000)
    }, [])

    const handleExport = useCallback(() => {
        if (notes.length === 0) return
        exportNotesAsTxt({ topic, notes, includeMetadata: true })
    }, [notes, topic])

    const handleClear = useCallback(() => {
        setNotes([])
        onNotesUpdate?.([])
    }, [onNotesUpdate])

    const handleEditNote = useCallback((id: string, content: string) => {
        setNotes(prev => {
            const updated = prev.map(note =>
                note.id === id ? { ...note, content } : note
            )
            onNotesUpdate?.(updated)
            return updated
        })
        setShowSaved(true)
        setTimeout(() => setShowSaved(false), 2000)
    }, [onNotesUpdate])

    const handleDeleteNote = useCallback((id: string) => {
        setNotes(prev => {
            const updated = prev.filter(note => note.id !== id)
            onNotesUpdate?.(updated)
            return updated
        })
    }, [onNotesUpdate])

    // Collapsed state - show trigger button
    if (!isOpen) {
        return (
            <TriggerButton
                onClick={() => setIsOpen(true)}
                notesCount={notes.length}
                accentColor={accentColor}
            />
        )
    }

    // Expanded drawer
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <div
                className="fixed right-0 top-0 bottom-0 w-[380px] max-w-[90vw] z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
                style={{
                    background: 'linear-gradient(180deg, rgba(15, 15, 25, 0.95) 0%, rgba(10, 10, 20, 0.98) 100%)',
                    borderLeft: `2px solid ${accentColor}30`,
                    boxShadow: `0 0 40px ${accentColor}15, -10px 0 30px rgba(0,0,0,0.5)`,
                    borderRadius: '20px 0 0 20px'
                }}
            >
                {/* Neon glow effect */}
                <div
                    className="absolute inset-0 pointer-events-none rounded-l-[20px]"
                    style={{
                        background: `radial-gradient(ellipse at left center, ${accentColor}08 0%, transparent 50%)`,
                    }}
                />

                {/* Header */}
                <div
                    className="relative flex items-center justify-between px-6 py-5 border-b"
                    style={{ borderColor: `${accentColor}20` }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2 rounded-xl"
                            style={{ backgroundColor: `${accentColor}20` }}
                        >
                            <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">My Notes</h2>
                            <p className="text-xs text-gray-400 mt-0.5">for this topic</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <AutoSaveIndicator saved={showSaved} />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Topic Badge */}
                <div
                    className="px-6 py-3 text-sm border-b"
                    style={{ borderColor: `${accentColor}10` }}
                >
                    <span className="text-gray-400">Studying: </span>
                    <span style={{ color: accentColor }}>{topic}</span>
                </div>

                {/* Notes Textarea */}
                <div className="px-6 py-4 border-b" style={{ borderColor: `${accentColor}10` }}>
                    <NotesTextarea onAddNote={handleManualNote} onSaved={handleSaved} />
                </div>

                {/* Voice & Actions */}
                <div className="px-6 py-4 space-y-3 border-b" style={{ borderColor: `${accentColor}10` }}>
                    {/* Recording Status */}
                    {isListening && <RecordingIndicator />}

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Interim Transcript */}
                    {interimTranscript && (
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-xs text-gray-400 italic">{interimTranscript}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        {!isListening ? (
                            <Button
                                onClick={handleStartRecording}
                                disabled={!isSupported}
                                variant="ghost"
                                size="sm"
                                className="gap-2 h-10 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 disabled:opacity-50"
                            >
                                <Mic className="w-4 h-4" />
                                Voice Note
                            </Button>
                        ) : (
                            <Button
                                onClick={handleStopRecording}
                                variant="ghost"
                                size="sm"
                                className="gap-2 h-10 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                            >
                                <Square className="w-4 h-4" />
                                Stop
                            </Button>
                        )}

                        <Button
                            onClick={handleExport}
                            disabled={notes.length === 0}
                            variant="ghost"
                            size="sm"
                            className="gap-2 h-10 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {notes.length === 0 ? (
                        <div className="text-center py-12">
                            <div
                                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: `${accentColor}10` }}
                            >
                                <MicOff className="w-8 h-8" style={{ color: accentColor, opacity: 0.5 }} />
                            </div>
                            <p className="text-sm text-gray-400">No notes yet</p>
                            <p className="text-xs text-gray-500 mt-1">Write or speak to add notes</p>
                        </div>
                    ) : (
                        notes.map(note => (
                            <NoteItem
                                key={note.id}
                                note={note}
                                onEdit={handleEditNote}
                                onDelete={handleDeleteNote}
                            />
                        ))
                    )}
                </div>

                {/* Footer */}
                <div
                    className="px-6 py-4 border-t flex items-center justify-between"
                    style={{ borderColor: `${accentColor}20` }}
                >
                    <span className="text-xs text-gray-500">
                        {notes.length} note{notes.length !== 1 ? 's' : ''} • {learningMode}
                    </span>
                    {notes.length > 0 && (
                        <Button
                            onClick={handleClear}
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/10"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear All
                        </Button>
                    )}
                </div>
            </div>
        </>
    )
}
