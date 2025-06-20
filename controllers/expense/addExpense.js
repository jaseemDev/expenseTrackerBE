import Expense from "../../models/expenseSchema.js";
import asyncHandler from "express-async-handler";
import Budget from "../../models/budgetSchema.js";
import mongoose from "mongoose";
import Category from "../../models/categoriesSchema.js";

const addExpense = asyncHandler(async (req, res) => {
  let {
    userId,
    amount,
    date,
    category,
    description,
    isRecurring,
    recurringInterval,
  } = req.body;

  console.log(req.body);

  // Validate required fields
  if (
    !userId ||
    amount === undefined ||
    amount === null ||
    !date ||
    !category
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided" });
  }

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "User not found" });
  }
  // Validate categoryId format
  if (!mongoose.Types.ObjectId.isValid(category)) {
    return res.status(400).json({ message: "Invalid category" });
  }

  const existingCategory = await Category.findById(category);
  if (!existingCategory) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Convert and validate amount
  amount = typeof amount === "string" ? Number(amount) : amount;
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a valid positive number" });
  }

  // Validate date
  const expenseDate = new Date(date);
  if (isNaN(expenseDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  // Optional: Prevent future dates
  if (expenseDate > new Date()) {
    return res
      .status(400)
      .json({ message: "Expense date cannot be in the future" });
  }

  // Validate recurring logic
  if (isRecurring && !recurringInterval) {
    return res.status(400).json({
      message: "Recurring interval is required when expense is recurring",
    });
  }

  if (
    recurringInterval &&
    !["daily", "weekly", "monthly", "yearly"].includes(recurringInterval)
  ) {
    return res.status(400).json({
      message:
        "Invalid recurring interval. Must be: daily, weekly, monthly, or yearly",
    });
  }

  // Sanitize description
  description = description?.trim() || "";

  // Start database transaction for data consistency
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the user has a budget
    const budget = await Budget.findOne({ user: userId })
      .select("_id user amount")
      .session(session);
    if (!budget) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Budget not found. Please set your budget first",
      });
    }

    // Check if budget is sufficient
    const newBudgetAmount = budget.amount - amount;
    if (newBudgetAmount < 0) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Insufficient budget. Available: ${budget.amount}, Required: ${amount}`,
      });
    }

    // Create the expense
    const expense = new Expense({
      userId,
      amount,
      date: expenseDate,
      category: existingCategory._id,
      description,
      isRecurring: isRecurring || false,
      recurringInterval: isRecurring ? recurringInterval : null,
    });

    const savedExpense = await expense.save({ session });

    // Update budget - only update the amount field
    await Budget.updateOne(
      { _id: budget._id },
      { $set: { amount: newBudgetAmount } },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();

    res.status(201).json({
      data: savedExpense,
      message: "New expense added and budget updated successfully",
      remainingBudget: newBudgetAmount,
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    console.error("Add expense error:", error);
    res.status(500).json({
      message: "Failed to add expense",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  } finally {
    session.endSession();
  }
});
export { addExpense };
