const mongoose = require("mongoose");

const docSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String],
    embedding: { type: [Number], default: [] },
    summary: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

docSchema.index({ embedding: "vector" });

module.exports = mongoose.model("Document", docSchema);
