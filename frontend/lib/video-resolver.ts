/**
 * Prompt-Based Video Resolution System
 * 
 * Resolves natural language user prompts to existing stored videos.
 * NEVER generates new videos - only maps to existing Cloudinary assets.
 * 
 * CRITICAL: Always returns a video - uses introductory video as fallback.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface VideoMapping {
    topic_id: string
    title: string
    video_url: string
    aliases: string[]
}

export interface VideoResolverResult {
    success: boolean
    topic_id: string
    title: string
    video_url: string
    matched_alias: string | null
    confidence: number
    is_fallback: boolean
}

// ============================================================================
// FALLBACK VIDEO (ALWAYS AVAILABLE)
// ============================================================================

const FALLBACK_VIDEO: VideoMapping = {
    topic_id: "introductory_video",
    title: "Introduction to Computer Organization & Architecture",
    video_url: "https://player.cloudinary.com/embed/?cloud_name=dsh27hhgj&public_id=introductory-video&profile=cld-default",
    aliases: [
        "introduction",
        "intro",
        "introductory",
        "coa introduction",
        "computer organization introduction",
        "getting started",
        "overview",
        "basics",
    ]
}

// ============================================================================
// CANONICAL VIDEO REGISTRY (5 TOPICS ONLY)
// ============================================================================

export const VIDEO_MAPPINGS: VideoMapping[] = [
    // Topic 1: Block Diagram of Digital Computer
    {
        topic_id: "block_diagram_digital_computer",
        title: "Block Diagram of Digital Computer",
        video_url: "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-block-diagram-digital-computer.mp4",
        aliases: [
            // Core variations
            "block diagram of digital computer",
            "block diagram of computer",
            "digital computer block diagram",
            "computer block diagram",
            "block diagram",
            // With filler words (will be normalized)
            "generate a video on block diagram of computer",
            "video on block diagram of computer",
            "explain block diagram of digital computer",
            "show block diagram of computer",
            "create video about block diagram",
            // Related terms
            "digital computer diagram",
            "computer architecture block diagram",
            "basic computer block diagram",
            "computer organization diagram",
            "cpu block diagram",
            "computer system block diagram",
            "digital computer architecture",
            "computer components diagram",
            "block diagram cpu",
        ]
    },

    // Topic 2: Register Transfer Language
    {
        topic_id: "register_transfer_language",
        title: "Register Transfer Language",
        video_url: "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-register-transfer-language.mp4",
        aliases: [
            // Core variations  
            "register transfer language",
            "rtl",
            "register transfer",
            // With filler words
            "generate video on register transfer language",
            "video on rtl",
            "explain register transfer language",
            "show rtl",
            // Related terms
            "rtl language",
            "register language",
            "transfer language",
            "register notation",
            "rtl notation",
            "register transfer notation",
            "register operations",
            "rtl micro operations",
            "register transfer operations",
            "symbolic notation registers",
        ]
    },

    // Topic 3: Micro-Operations (Register Transfer Language)
    {
        topic_id: "micro_operations_rtl",
        title: "Micro-Operations: Register Transfer Language",
        video_url: "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-micro-operations-rtl.mp4",
        aliases: [
            // Core variations
            "micro operations",
            "micro-operations",
            "microoperations",
            "micro operations rtl",
            // With filler words
            "generate video on micro operations",
            "video on micro operations rtl",
            "explain micro operations",
            // Related terms
            "rtl micro operations",
            "register transfer micro operations",
            "arithmetic micro operations",
            "logic micro operations",
            "shift micro operations",
            "types of micro operations",
            "micro ops",
            "microops",
            "alu micro operations",
            "register micro operations",
        ]
    },

    // Topic 4: Bus and Memory Transfer
    {
        topic_id: "bus_and_memory_transfer",
        title: "Bus and Memory Transfer",
        video_url: "https://res.cloudinary.com/dsh27hhgj/video/upload/coa-bus-and-memory-transfer.mp4",
        aliases: [
            // Core variations
            "bus and memory transfer",
            "bus transfer",
            "memory transfer",
            "bus system",
            // With filler words
            "generate video on bus and memory transfer",
            "video on bus transfer",
            "explain memory transfer",
            // Related terms
            "memory bus",
            "data bus",
            "address bus",
            "bus architecture",
            "memory read write",
            "bus system architecture",
            "common bus system",
            "bus organization",
            "memory operations",
            "bus structure",
            "three state bus",
        ]
    },

    // Fallback: Introductory Video
    FALLBACK_VIDEO
]

// ============================================================================
// FILLER WORDS TO REMOVE
// ============================================================================

const FILLER_WORDS = new Set([
    "generate", "create", "make", "show", "explain", "tell", "give", "play",
    "video", "videos", "about", "on", "for", "the", "a", "an", "me", "us",
    "please", "can", "you", "i", "want", "need", "would", "like", "could",
    "of", "in", "to", "with", "how", "what", "is", "are", "and", "this",
    "that", "it", "from", "by", "will", "should", "must", "do", "does",
])

// ============================================================================
// PROMPT NORMALIZATION
// ============================================================================

/**
 * Normalizes a user prompt for matching
 * - Lowercase
 * - Remove punctuation  
 * - Remove filler words
 * - Trim and collapse whitespace
 */
export function normalizePrompt(prompt: string): string {
    let normalized = prompt.toLowerCase().trim()

    // Remove punctuation except hyphens (for micro-operations)
    normalized = normalized.replace(/[^\w\s-]/g, " ")

    // Split into words and remove fillers
    const words = normalized.split(/\s+/).filter(word =>
        word.length > 0 && !FILLER_WORDS.has(word)
    )

    // Rejoin and collapse whitespace
    return words.join(" ").trim()
}

// ============================================================================
// FUZZY MATCHING
// ============================================================================

/**
 * Calculates similarity score between two strings (0-1)
 * Uses word-based overlap for robust matching
 */
export function calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0
    if (str1.length === 0 || str2.length === 0) return 0.0

    // Check for exact substring containment
    if (str1.includes(str2)) return 0.9
    if (str2.includes(str1)) return 0.85

    // Word-based overlap scoring
    const words1 = str1.split(/\s+/)
    const words2 = new Set(str2.split(/\s+/))

    let matchCount = 0
    let partialMatchCount = 0

    for (const word of words1) {
        if (words2.has(word)) {
            matchCount++
        } else {
            // Check for partial word matches
            for (const w2 of words2) {
                if (word.length >= 3 && w2.length >= 3) {
                    if (word.includes(w2) || w2.includes(word)) {
                        partialMatchCount += 0.5
                        break
                    }
                }
            }
        }
    }

    const totalWords = Math.max(words1.length, words2.size)
    return (matchCount + partialMatchCount) / totalWords
}

// ============================================================================
// VIDEO RESOLVER (MAIN API)
// ============================================================================

/**
 * Minimum confidence threshold for a match
 */
const MIN_CONFIDENCE = 0.25

/**
 * Resolves a user prompt to an existing stored video.
 * 
 * CRITICAL BEHAVIOR:
 * - NEVER throws errors
 * - NEVER returns null
 * - ALWAYS returns a valid video (fallback to introductory if no match)
 * - Same prompt = same video every time (deterministic)
 */
export function resolveVideoFromPrompt(prompt: string): VideoResolverResult {
    // Handle empty/invalid input - return fallback
    if (!prompt || prompt.trim().length === 0) {
        return createFallbackResult()
    }

    const normalizedPrompt = normalizePrompt(prompt)

    // If normalization removes everything, return fallback
    if (normalizedPrompt.length === 0) {
        return createFallbackResult()
    }

    let bestMatch: VideoMapping | null = null
    let bestAlias: string | null = null
    let bestScore = 0

    // Find the best matching video (exclude fallback from initial search)
    const mainTopics = VIDEO_MAPPINGS.filter(m => m.topic_id !== "introductory_video")

    for (const mapping of mainTopics) {
        for (const alias of mapping.aliases) {
            const normalizedAlias = normalizePrompt(alias)
            const score = calculateSimilarity(normalizedPrompt, normalizedAlias)

            if (score > bestScore) {
                bestScore = score
                bestMatch = mapping
                bestAlias = alias
            }
        }
    }

    // Check if we have a good enough match
    if (bestMatch && bestScore >= MIN_CONFIDENCE) {
        return {
            success: true,
            topic_id: bestMatch.topic_id,
            title: bestMatch.title,
            video_url: bestMatch.video_url,
            matched_alias: bestAlias,
            confidence: bestScore,
            is_fallback: false
        }
    }

    // No match found - ALWAYS return introductory video (never error)
    return createFallbackResult()
}

/**
 * Creates a fallback result with the introductory video
 */
function createFallbackResult(): VideoResolverResult {
    return {
        success: true, // Still success - we have a video to show
        topic_id: FALLBACK_VIDEO.topic_id,
        title: FALLBACK_VIDEO.title,
        video_url: FALLBACK_VIDEO.video_url,
        matched_alias: null,
        confidence: 0,
        is_fallback: true
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets all available topics for display (excludes fallback)
 */
export function getAvailableTopics(): { topic_id: string; title: string }[] {
    return VIDEO_MAPPINGS
        .filter(m => m.topic_id !== "introductory_video")
        .map(m => ({
            topic_id: m.topic_id,
            title: m.title
        }))
}

/**
 * Gets video by exact topic ID
 * Returns fallback if not found
 */
export function getVideoByTopicId(topicId: string): VideoMapping {
    const found = VIDEO_MAPPINGS.find(m => m.topic_id === topicId)
    return found || FALLBACK_VIDEO
}

/**
 * Gets the fallback/introductory video
 */
export function getFallbackVideo(): VideoMapping {
    return FALLBACK_VIDEO
}
