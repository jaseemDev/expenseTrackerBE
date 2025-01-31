import asyncHandler from "express-async-handler";
import Transaction from "../../models/transactionSchema.js";
import Wallet from "../../models/walletSchema.js";

const deleteWalletTransaction = asyncHandler(async (req, res) => {
  try {
    const { transactionId, walletId } = req.body;

    // Find the wallet and transaction
    const currentWallet = await Wallet.findById(walletId);
    const walletTransaction = await Transaction.findById(transactionId);

    if (!walletTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (!currentWallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Adjust the wallet amount
    if (walletTransaction.type === "income") {
      currentWallet.amount -= walletTransaction.amount;
    } else if (walletTransaction.type === "expense") {
      currentWallet.amount += walletTransaction.amount;
    }

    // Remove the transaction ID from the wallet's transactions array
    currentWallet.transactions = currentWallet.transactions.filter(
      (id) => id.toString() !== transactionId
    );

    // Save the updated wallet
    if (currentWallet.amount < 0) {
      return res
        .status(400)
        .json({
          message: "This is not allowed. Wallet amount cannot be negative.",
        });
    } else {
      await currentWallet.save();
    }

    // Delete the transaction
    await walletTransaction.deleteOne();

    res.status(200).json({
      message: "Transaction deleted and wallet updated successfully",
      wallet: currentWallet,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export { deleteWalletTransaction };
