import express from "express";
import { addBudget } from "../controllers/budget/addBudget.js";
import { getBudget } from "../controllers/budget/getBudget.js";
const router = express.Router();

router.post("/add", addBudget);
router.post("/getBudget", getBudget);

export default router;
