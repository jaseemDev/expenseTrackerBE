import asyncHandler from "express-async-handler";
import Wallet from "../../models/walletSchema.js";
import transactionSchema from "../../models/transactionSchema.js";
import e from "express";

const addToWallet = asyncHandler(async (req, res) => {
  try {
    const { userId, amount, type, category, description, date } = req.body;

    // Validate required fields
    if (!userId || !amount || !type || !category || !description || !date) {
      return res.status(400).json({ message: "Please provide required data" });
    }

    // Check if wallet exists
    let wallet = await Wallet.findOne({ userId });
    let walletId = "";

    if (wallet) {
      // Update existing wallet amount
      if (type === "income") {
        wallet.amount += amount;
      } else if (type === "expense") {
        if (wallet.amount < amount) {
          return res.status(400).json({ message: "Insufficient balance" });
        } else {
          wallet.amount -= amount;
        }
      }
      await wallet.save();
      walletId = wallet._id;
    } else {
      // Create new wallet
      if (type === "income") {
        wallet = await Wallet.create({ userId, amount, transactions: [] });
      } else if (type === "expense") {
        res
          .status(400)
          .json({ message: "Expense cannot be added to an empty wallet" });
      }
      walletId = wallet._id;
    }

    // Create a new transaction
    const newTransaction = await transactionSchema.create({
      walletId: walletId,
      amount,
      type,
      category,
      description,
      date,
    });

    // Push transaction ID into the wallet's transactions array
    wallet.transactions.push(newTransaction._id);
    await wallet.save();

    res.status(200).json({
      message: "Wallet updated successfully",
      wallet,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export { addToWallet };
