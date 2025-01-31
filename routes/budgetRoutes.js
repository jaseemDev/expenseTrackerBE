import express from "express";
import { addBudget } from "../controllers/budget/addBudget.js";
const router = express.Router();

router.post("/add", addBudget);

export default router;
