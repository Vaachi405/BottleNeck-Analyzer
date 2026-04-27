import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  id: String,
  name: String,
  duration: Number,
  dependencies: [String],
  projectId: String,
  status: { type: String, default: "pending" },
  priority: { type: String, default: "medium" }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);