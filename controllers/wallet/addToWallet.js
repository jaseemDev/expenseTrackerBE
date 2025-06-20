import asyncHandler from "express-async-handler";
import Wallet from "../../models/walletSchema.js";
import transactionSchema from "../../models/transactionSchema.js";

const addToWallet = asyncHandler(async (req, res) => {
  try {
    const { userId, amount, type, category, description, date } = req.body;

    // Validate required fields
    if (
      !userId ||
      amount === undefined ||
      amount === null ||
      !type ||
      !category ||
      !description ||
      !date
    ) {
      return res.status(400).json({ message: "Please provide required data" });
    }

    // Validate amount is a number and positive
    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a valid positive number" });
    }

    // Check if wallet exists
    let wallet = await Wallet.findOne({ userId });
    let walletId = "";

    if (wallet) {
      console.log(typeof wallet.amount);

      // Update existing wallet amount
      if (type === "income") {
        wallet.amount += amount;
      } else if (type === "expense") {
        if (wallet.amount < amount) {
          return res.status(400).json({ message: "Insufficient balance" });
        } else {
          wallet.amount -= amount;
        }
      } else {
        return res
          .status(400)
          .json({ message: "Type must be either 'income' or 'expense'" });
      }
      await wallet.save();
      walletId = wallet._id;
    } else {
      // Create new wallet
      if (type === "income") {
        wallet = await Wallet.create({ userId, amount, transactions: [] });
        walletId = wallet._id;
      } else if (type === "expense") {
        return res
          .status(400)
          .json({ message: "Expense cannot be added to an empty wallet" });
      } else {
        return res
          .status(400)
          .json({ message: "Type must be either 'income' or 'expense'" });
      }
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
