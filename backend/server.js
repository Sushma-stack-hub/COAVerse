import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth.js";
import tutorRoutes from "./tutor.js";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Auth routes
app.use("/auth", authRoutes);

// Tutor routes (OpenAI-powered)
app.use("/api", tutorRoutes);

/*
  Root route (for browser check)
*/
app.get("/", (req, res) => {
  res.send("Main backend is running successfully");
});

/*
  Submit quiz route
  Called when student finishes a quiz
*/
app.post("/submit-quiz", async (req, res) => {
  try {
    const {
      studentId,
      topic,
      totalQuestions,
      correctAnswers,
      timeTakenSeconds,
      attempts
    } = req.body;

    // ---- Basic validation ----
    if (
      !topic ||
      totalQuestions <= 0 ||
      correctAnswers < 0 ||
      timeTakenSeconds <= 0
    ) {
      return res.status(400).json({ error: "Invalid quiz data" });
    }

    // ---- Step 1: Calculate metrics ----
    const accuracy_percent = (correctAnswers / totalQuestions) * 100;
    const avg_time_seconds = timeTakenSeconds / totalQuestions;

    // ---- Step 2: Call ML backend ----
    const mlResponse = await axios.post(
      "http://127.0.0.1:8000/predict",
      {
        topic: topic,
        accuracy_percent: accuracy_percent,
        avg_time_seconds: avg_time_seconds,
        attempts: attempts
      }
    );

    const predicted_level = mlResponse.data.predicted_level;

    // ---- Step 3: Send response ----
    res.json({
      studentId: studentId,
      topic: topic,
      accuracy_percent: accuracy_percent,
      avg_time_seconds: avg_time_seconds,
      attempts: attempts,
      predicted_level: predicted_level
    });

  } catch (error) {
    res.status(500).json({
      error: "Failed to evaluate student level",
      details: error.message
    });
  }
});

/*
  Note: Tutor routes are handled by tutor.js at /api/tutor
*/

/*
  Start server
*/
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Main backend running at http://localhost:${PORT}`);
});
