import asyncHandler from "express-async-handler";
import Expense from "../../models/expenseSchema.js";
import Budget from "../../models/budgetSchema.js";

const editExpense = asyncHandler(async (req, res) => {
  try {
    const {
      expenseId,
      userId,
      amount,
      date,
      category,
      description,
      isRecurring,
      recurringInterval,
    } = req.body;
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    console.log(expense);
    if (expense.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unknown user" });
    }
    expense.amount = amount;
    expense.date = date;
    expense.category = category;
    expense.description = description;
    expense.isRecurring = isRecurring;
    expense.recurringInterval = recurringInterval;
    await expense.save();
    const budget = await Budget.findOne({ user: userId });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    const newBudget = budget.amount - expense.amount;
    budget.amount = newBudget;
    await budget.save();

    res.status(200).json({ message: "Expense & budget updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export { editExpense };
