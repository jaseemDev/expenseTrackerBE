import asyncHandler from "express-async-handler";
import Expense from "../../models/expenseSchema.js";
import Budget from "../../models/budgetSchema.js";

const deleteExpense = asyncHandler(async (req, res) => {
  try {
    const expenseToDelete = await Expense.findById(req.params.id);
    const budget = await Budget.findOne({ user: expenseToDelete.userId });

    if (!budget) {
      res.status(404).json({ message: "Budget not found" });
    }
    if (!expenseToDelete) {
      res.status(404).json({ message: "Expense not found" });
    }
    const amount = expenseToDelete.amount;
    const newBudget = budget.amount + amount;
    budget.amount = newBudget;
    await budget.save();

    await expenseToDelete.deleteOne();
    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export { deleteExpense };
