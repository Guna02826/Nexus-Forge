const express = require("express");
const mongoose = require("mongoose");
const Document = require("../models/Document.model");
const { protect } = require("../middleware/Auth.middleware");
const Activity = require("../models/Activity.model");

const {
  generateSummary,
  generateTags,
  generateEmbedding,
  answerQuestion,
} = require("../services/Gemini.service");

const router = express.Router();

// Create
router.post("/", protect, async (req, res) => {
  try {
    const { title, content } = req.body;

    const summary = await generateSummary(content);
    const tagsText = await generateTags(content);
    const tags = tagsText ? tagsText.split(",").map((t) => t.trim()) : [];
    const embedding = await generateEmbedding(content);

    const doc = await Document.create({
      title,
      content,
      summary,
      tags,
      embedding,
      createdBy: req.user._id,
    });

    await Activity.create({
      action: "create",
      docId: doc._id,
      userId: req.user._id,
    });
    res.json(doc);
  } catch (err) {
    console.error("Doc creation error:", err);
    res.status(400).json({ message: err.message });
  }
});

// Read all (admin: all docs, user: own docs)
router.get("/", protect, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const docs = await Document.find(query).populate("createdBy", "name email");
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Search
router.get("/search", protect, async (req, res) => {
  try {
    const { q } = req.query;
    const docs = await Document.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
    }).lean();

    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Read one
router.get("/:id", protect, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (
      doc.createdBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    )
      return res.status(403).json({ message: "Not authorized" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update
router.put("/:id", protect, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // Check authorization
    if (
      doc.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, content } = req.body;

    const summary = await generateSummary(content);
    const tagsText = await generateTags(content);
    const tags = tagsText ? tagsText.split(",").map((t) => t.trim()) : [];
    const embedding = await generateEmbedding(content);

    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        summary,
        tags,
        embedding,
        $inc: { __v: 1 },
      },
      { new: true }
    );
    await Activity.create({
      action: "update",
      docId: updatedDoc._id,
      userId: req.user._id,
    });
    res.json(updatedDoc);
  } catch (err) {
    console.error("Document update error:", err);
    res.status(400).json({ message: err.message });
  }
});

// Delete
router.delete("/:id", protect, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    if (
      doc.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    )
      return res.status(403).json({ message: "Not authorized" });

    await doc.deleteOne();
    await Activity.create({
      action: "delete",
      docId: doc._id,
      userId: req.user._id,
    });
    res.json({ message: "Document removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Embedding-based Semantic Search
router.post("/semantic-search", protect, async (req, res) => {
  try {
    const { query } = req.body;
    const queryEmbedding = await generateEmbedding(query);

    const results = await Document.aggregate([
      {
        $vectorSearch: {
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 20,
          limit: 5,
          index: "embedding_index",
        },
      },
      {
        $project: {
          title: 1,
          summary: 1,
          tags: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },

      {
        $match: {
          score: { $gte: 0.75 },
        },
      },
    ]);

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Answer Question
router.post("/qa", protect, async (req, res) => {
  try {
    const { question } = req.body;
    const docs = await Document.find()
      .populate("createdBy", "name") // ✅ populate author name
      .lean();

    const answer = await answerQuestion(question, docs);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Re-summarize doc
router.post("/:id/summarize", protect, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    doc.summary = await generateSummary(doc.content);
    await doc.save();

    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Re-generate tags
router.post("/:id/tags", protect, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const tagsText = await generateTags(doc.content);
    doc.tags = tagsText ? tagsText.split(",").map((t) => t.trim()) : [];
    await doc.save();

    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Activity Feed - recent actions
router.get("/activity/feed", protect, async (req, res) => {
  try {
    const user = req.user;

    let query = {};

    if (user.role !== "admin") {
      // Non-admin users see only their own activities
      query.userId = user._id;
    }
    // Admin users see all activities (no filter)

    const feed = await Activity.find(query)
      .populate("userId", "name email")
      .populate("docId", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(feed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
