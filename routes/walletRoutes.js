import express from "express";
import { getWalletData } from "../controllers/wallet/getWalletData.js";
import { addToWallet } from "../controllers/wallet/addToWallet.js";
import { deleteWalletTransaction } from "../controllers/wallet/deleteWalletTransaction.js";
import { updateTransaction } from "../controllers/wallet/updateTransaction.js";
const router = express.Router();

router.post("/getWallet", getWalletData);
router.post("/add", addToWallet);
router.delete("/delete", deleteWalletTransaction);
router.post("/update", updateTransaction);

export default router;
