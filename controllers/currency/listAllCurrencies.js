import asyncHandler from "express-async-handler";
import Currency from "../../models/currencySchema.js";

const listAllCurrencies = asyncHandler(async (req, res) => {
  try {
    const currencies = await Currency.find({});
    if (currencies.length === 0) {
      return res.status(404).json({ message: "No currencies found" });
    }
    res.status(200).json({
      data: currencies,
      message: "Currencies fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export { listAllCurrencies };
