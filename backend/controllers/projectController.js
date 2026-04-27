import Project from "../models/Project.js";

export const createProject = async (req, res) => {
  const { name, priority, userId } = req.body;
  const project = await Project.create({ name, priority, userId });
  res.json(project);
};

export const getProjects = async (req, res) => {
  const { userId } = req.query;
  const projects = await Project.find({ userId }).sort({ createdAt: -1 });
  res.json(projects);
};

export const deleteProject = async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
};