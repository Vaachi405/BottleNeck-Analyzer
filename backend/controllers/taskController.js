import Task from "../models/Task.js";

export const createTask = async (req, res) => {
  const { name, duration, dependencies, projectId } = req.body;

  const count = await Task.countDocuments({ projectId });

  const taskId = "t" + (count + 1);

  const task = await Task.create({
    id: taskId,
    name,
    duration,
    dependencies: dependencies || [],
    projectId
  });

  res.json(task);
};

export const getTasks = async (req, res) => {
  const { projectId } = req.query;
  const tasks = await Task.find({ projectId });
  res.json(tasks);
};

export const deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
};