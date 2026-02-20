// ============================================================================
// USE VOICE RECOGNITION HOOK
// Custom hook for Web Speech API integration
// Provides speech-to-text functionality with start/stop controls
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface VoiceRecognitionState {
    isListening: boolean
    isSupported: boolean
    transcript: string
    interimTranscript: string
    error: string | null
}

export interface VoiceRecognitionHook extends VoiceRecognitionState {
    startListening: () => void
    stopListening: () => void
    resetTranscript: () => void
}

// ============================================================================
// SPEECH RECOGNITION TYPE DECLARATIONS
// ============================================================================

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList
    resultIndex: number
}

interface SpeechRecognitionResultList {
    length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
    isFinal: boolean
    length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
}

interface SpeechRecognitionErrorEvent {
    error: string
    message?: string
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    start(): void
    stop(): void
    abort(): void
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    onstart: (() => void) | null
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition
        webkitSpeechRecognition: new () => SpeechRecognition
    }
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useVoiceRecognition(): VoiceRecognitionHook {
    const [isListening, setIsListening] = useState(false)
    const [isSupported, setIsSupported] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [interimTranscript, setInterimTranscript] = useState('')
    const [error, setError] = useState<string | null>(null)

    const recognitionRef = useRef<SpeechRecognition | null>(null)

    // Check browser support on mount
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (SpeechRecognition) {
            setIsSupported(true)

            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'en-US'

            recognition.onstart = () => {
                setIsListening(true)
                setError(null)
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = ''
                let interim = ''

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i]
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript + ' '
                    } else {
                        interim += result[0].transcript
                    }
                }

                if (finalTranscript) {
                    setTranscript(prev => prev + finalTranscript)
                }
                setInterimTranscript(interim)
            }

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                // Log as warning, not error (these are often expected conditions)
                console.warn('Speech recognition event:', event.error)

                switch (event.error) {
                    case 'not-allowed':
                        setError('Microphone access denied. Please allow microphone permissions.')
                        break
                    case 'no-speech':
                        // Don't show error for no-speech, just silently stop
                        setError(null)
                        break
                    case 'network':
                        setError('Voice notes require internet. Please use text input instead.')
                        break
                    case 'audio-capture':
                        setError('No microphone found. Please connect a microphone.')
                        break
                    case 'aborted':
                        // User stopped - not an error
                        setError(null)
                        break
                    case 'service-not-allowed':
                        setError('Speech service unavailable. Please use text input.')
                        break
                    default:
                        // For unknown errors, don't show alarming messages
                        setError(null)
                }

                setIsListening(false)
            }

            recognitionRef.current = recognition
        } else {
            setIsSupported(false)
            setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort()
            }
        }
    }, [])

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setError(null)
            setInterimTranscript('')

            try {
                recognitionRef.current.start()
            } catch (err) {
                // Recognition might already be running
                console.warn('Recognition start error:', err)
            }
        }
    }, [isListening])

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop()
            setInterimTranscript('')
        }
    }, [isListening])

    const resetTranscript = useCallback(() => {
        setTranscript('')
        setInterimTranscript('')
    }, [])

    return {
        isListening,
        isSupported,
        transcript,
        interimTranscript,
        error,
        startListening,
        stopListening,
        resetTranscript
    }
}
