import express from "express";
import { getAllCategories } from "../controllers/category/getAllCategories.js";
import { addCategory } from "../controllers/category/addCategory.js";
import { deleteCategory } from "../controllers/category/deleteCategory.js";
const router = express.Router();

router.get("/categories", getAllCategories);
router.post("/add", addCategory);
router.delete("/delete", deleteCategory);

export default router;
