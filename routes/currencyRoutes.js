import express from "express";
import { addCurrency } from "../controllers/currency/addCurrency.js";
import { listAllCurrencies } from "../controllers/currency/listAllCurrencies.js";
import { deleteCurrency } from "../controllers/currency/deleteCurrency.js";
import { validateToken } from "../middlewares/validateToken.js";
const router = express.Router();

router.post("/add", validateToken, addCurrency);
router.get("/currencies", validateToken, listAllCurrencies);
router.delete("/delete", validateToken, deleteCurrency);

export default router;
