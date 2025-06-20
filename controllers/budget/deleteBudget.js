import Budget from "../../models/budgetSchema.js";
import asyncHandler from "express-async-handler";
const deleteBudget = asyncHandler(async (req, res) => {
  try {
    const { userId, budgetId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!budgetId) {
      return res.status(400).json({ message: "Budget ID is required" });
    }
    // Find the budget by ID and delete it
    const deletedBudget = await Budget.findByIdAndDelete(budgetId);
    if (!deletedBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export { deleteBudget };
