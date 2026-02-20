import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load env first
dotenv.config();

const router = express.Router();

// ---- Groq client (OpenAI-compatible) ----
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

// ---- Socratic system prompt ----
const SYSTEM_PROMPT = `
You are a Socratic tutor for Computer Organization and Architecture.

Rules:
- Do NOT give the final answer immediately.
- Ask one guiding question first.
- If the student says "I don't understand" or "explain", then explain clearly.
- Keep responses short, simple, and focused.
`;

router.post("/tutor", async (req, res) => {
    const { message, topic } = req.body;

    try {
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Topic: ${topic}\nStudent: ${message}`
                }
            ],
            temperature: 0.4,
            max_tokens: 300
        });

        res.json({
            reply: completion.choices[0].message.content
        });

    } catch (err) {
        console.error("Groq error:", err);
        res.status(500).json({ error: "Groq tutor failed" });
    }
});

export default router;
