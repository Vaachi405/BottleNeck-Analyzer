import Project from "../models/Project.js";
import Task from "../models/Task.js";

// -----------------------------
// CREATE PROJECT
// -----------------------------
export const createProject = async (req, res) => {
  try {
    const { name, priority, userId } = req.body;

    if (!name || !priority || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const project = await Project.create({
      name: name.trim(),
      priority,
      userId
    });

    res.status(201).json(project);

  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ message: "Failed to create project" });
  }
};

// -----------------------------
// GET PROJECTS
// -----------------------------
export const getProjects = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const projects = await Project.find({ userId })
      .sort({ createdAt: -1 });

    res.json(projects);

  } catch (err) {
    console.error("Get Projects Error:", err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

// -----------------------------
// DELETE PROJECT + CASCADE TASKS
// -----------------------------
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    // check if project exists
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // delete project
    await Project.findByIdAndDelete(projectId);

    // 🔥 delete all related tasks
    await Task.deleteMany({ projectId });

    res.json({ message: "Project and tasks deleted successfully" });

  } catch (err) {
    console.error("Delete Project Error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};