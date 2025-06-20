import Budget from "../../models/budgetSchema.js";
import asyncHandler from "express-async-handler";

const getBudget = asyncHandler(async (req, res) => {
  try {
    const { userId, categoryId, startDate, endDate } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    // Find budgets for the specified user
    const budgets = await Budget.find({ user: userId });
    if (!budgets || budgets.length === 0) {
      return res.status(404).json({ message: "No budgets found for the user" });
    }

    // Filter budgets based on the specified category
    if (categoryId) {
      const filteredBudgets = budgets.filter(
        (budget) => budget.category === categoryId
      );
      if (filteredBudgets.length === 0) {
        return res
          .status(404)
          .json({ message: "No budgets found for the specified category" });
      }
      return res.status(200).json(filteredBudgets);
    }

    if (startDate && !endDate) {
      return res.status(400).json({ message: "End date is required" });
    }
    if (!startDate && endDate) {
      return res.status(400).json({ message: "Start date is required" });
    }

    // Filter budgets based on the specified date range
    if (startDate && endDate) {
      const filteredBudgets = budgets.filter((budget) => {
        const budgetDate = new Date(budget.date);
        return (
          budgetDate >= new Date(startDate) && budgetDate <= new Date(endDate)
        );
      });
      if (filteredBudgets.length === 0) {
        return res
          .status(404)
          .json({ message: "No budgets found for the specified date range" });
      }
      return res.status(200).json(filteredBudgets);
    }

    // Return the budgets as a JSON response
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export { getBudget };
