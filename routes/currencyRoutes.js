import express from "express";
import { addCurrency } from "../controllers/currency/addCurrency.js";
import { listAllCurrencies } from "../controllers/currency/listAllCurrencies.js";
import { deleteCurrency } from "../controllers/currency/deleteCurrency.js";
const router = express.Router();

router.post("/add", addCurrency);
router.get("/currencies", listAllCurrencies);
router.delete("/delete", deleteCurrency);

export default router;
