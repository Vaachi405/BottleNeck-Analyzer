import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: String,
  priority: String,
  userId: String
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);