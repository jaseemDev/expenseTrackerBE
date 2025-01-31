import asyncHandler from "express-async-handler";
import Currency from "../../models/currencySchema.js";

const deleteCurrency = asyncHandler(async (req, res) => {
  try {
    const { currencyId } = req.body;

    // Validate input
    if (!currencyId) {
      return res.status(400).json({ message: "Currency ID is required" });
    }

    // Find the currency
    const currency = await Currency.findById(currencyId);
    if (!currency) {
      return res.status(404).json({ message: "Currency not found" });
    }

    // Delete the currency
    await currency.deleteOne();
    res.status(200).json({ message: "Currency deleted successfully" });
  } catch (error) {
    // Log the error (optional) and return a generic error message
    console.error(`Error deleting currency: ${error.message}`);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

export { deleteCurrency };
