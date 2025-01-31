import express from "express";
import { addExpense } from "../controllers/expense/addExpense.js";
import { getAllExpense } from "../controllers/expense/getAllExpense.js";
import { editExpense } from "../controllers/expense/editExpense.js";
const router = express.Router();

router.post("/add", addExpense);
router.get("/fetch", getAllExpense);
router.post("/edit", editExpense);

export default router;
