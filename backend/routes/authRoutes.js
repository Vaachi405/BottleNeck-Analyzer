import express from "express";
import User from "../models/User.js";

const router = express.Router();

// signup
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const exists = await User.findOne({ email });

  if (exists) return res.status(400).json("User exists");

  const user = new User({ email, password });
  await user.save();

  res.json("Signup success");
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });

  if (!user) return res.status(400).json("Invalid");

  res.json(user);
});

export default router;