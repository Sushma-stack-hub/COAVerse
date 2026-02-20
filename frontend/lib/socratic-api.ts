// ============================================================================
// SOCRATIC TUTOR API CLIENT
// Communicates with backend for guided questioning responses
// ============================================================================

const API_BASE = "http://localhost:3002";

export interface Message {
    role: "user" | "tutor";
    content: string;
}

export interface TutorResponse {
    response: string;
    success: boolean;
    fallback?: boolean;
}

/**
 * Send a message to the Socratic tutor and get a guided response
 */
export async function sendSocraticMessage(
    topic: string,
    message: string,
    conversationHistory: Message[]
): Promise<TutorResponse> {
    try {
        const response = await fetch(`${API_BASE}/api/tutor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                topic,
                message
            })
        });

        if (!response.ok) {
            throw new Error("Failed to get tutor response");
        }

        const data = await response.json();

        // Handle both "reply" and "response" field names
        return {
            response: data.reply || data.response || "Try rephrasing your question.",
            success: true,
            fallback: false
        };
    } catch (error) {
        console.error("Socratic tutor error:", error);

        // Fallback response if backend is unavailable
        return {
            response: "I'm here to help you learn! Let's start with a question: What do you already understand about this topic?",
            success: false,
            fallback: true
        };
    }
}
