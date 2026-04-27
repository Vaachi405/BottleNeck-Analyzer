import Task from "../models/Task.js";

// -----------------------------
// CREATE TASK
// -----------------------------
export const createTask = async (req, res) => {
  try {
    const { name, duration, dependencies, projectId } = req.body;

    if (!name || !duration || !projectId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const task = await Task.create({
      name,
      duration: Number(duration),
      dependencies: dependencies || [],
      projectId,
      status: "pending",
      priority: "medium"
    });

    res.status(201).json(task);

  } catch (err) {
    console.error("Create Task Error:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
};

// -----------------------------
// GET TASKS (BY PROJECT)
// -----------------------------
export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID required" });
    }

    const tasks = await Task.find({ projectId });

    res.json(tasks);

  } catch (err) {
    console.error("Get Tasks Error:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// -----------------------------
// DELETE TASK
// -----------------------------
export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });

  } catch (err) {
    console.error("Delete Task Error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};