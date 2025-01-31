import asyncHandler from "express-async-handler";
import Wallet from "../../models/walletSchema.js";

const getWalletData = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ message: "Please provide user id" });
    }
    const walletData = await Wallet.find({ userId }).populate("transactions");

    if (walletData.length === 0) {
      res.status(404).json({ message: "Wallet is empty!" });
    }
    res.status(200).json(walletData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
export { getWalletData };
