import express from "express";
import { createProject, getProjects, deleteProject } from "../controllers/projectController.js";

const router = express.Router();

router.post("/", createProject);
router.get("/", getProjects);
router.delete("/:id", deleteProject);

export default router;