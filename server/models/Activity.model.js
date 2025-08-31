const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    action: { type: String, enum: ["create", "update", "delete"], required: true },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
