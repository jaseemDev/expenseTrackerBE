import asyncHandler from "express-async-handler";
import Wallet from "../../models/walletSchema.js";
import Transaction from "../../models/transactionSchema.js";

const updateTransaction = asyncHandler(async (req, res) => {
  try {
    const { transactionId, walletId, newAmount } = req.body;

    // Validate input
    if (!transactionId || !walletId || !newAmount) {
      return res.status(400).json({
        message: "Transaction ID, Wallet ID, and new amount are required.",
      });
    }

    // Find the wallet and transaction
    const currentWallet = await Wallet.findById(walletId);
    const walletTransaction = await Transaction.findById(transactionId);

    if (!walletTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (!currentWallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    if (
      walletTransaction.type === "expense" &&
      currentWallet.amount + walletTransaction.amount < newAmount
    ) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Calculate the difference in the transaction amount
    const previousAmount = walletTransaction.amount;
    const amountDifference =
      walletTransaction.type === "income"
        ? newAmount - previousAmount // Credit: Adjust positively
        : previousAmount - newAmount; // Debit: Adjust negatively

    // Update the wallet's balance
    currentWallet.amount += amountDifference;

    // Update the transaction's amount
    walletTransaction.amount = newAmount;

    // Save both documents
    await walletTransaction.save();
    await currentWallet.save();

    res.status(200).json({
      message: "Transaction updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export { updateTransaction };
