const axios = require("axios");
const mongoose = require("mongoose");
const Document = require("../models/Document.model");

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

async function callGemini(prompt) {
  try {
    const res = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "";
  }
}

async function generateSummary(content) {
  return callGemini(`Summarize the following document:\n\n${content}`);
}

async function generateTags(content) {
  return callGemini(
    `Generate 5 relevant tags for the following document (comma-separated):\n\n${content}`
  );
}

// Generate embedding using Gemini Embedding model
async function generateEmbedding(text) {
  try {
    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent",
      {
        model: "models/embedding-001",
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    return res.data?.embedding?.values || [];
  } catch (err) {
    console.error("Gemini Embedding Error:", err.response?.data || err.message);
    return [];
  }
}

async function answerQuestion(question, docs) {
  const raw = await callGemini(
    `You are an expert assistant. Use the following documents and their authors (createdBy.name) as context to answer the question accurately.
Each document includes title, content, and author name.

Documents:
${JSON.stringify(docs)}

Question: "${question}"


Provide a clear, concise answer based only on the documents and authors. Return ONLY plain text, no markdown or extra labels.`
  );
  return raw.replace(/```[\s\S]*?```/g, "").trim();
}

module.exports = {
  generateSummary,
  generateTags,
  generateEmbedding,
  answerQuestion,
};
