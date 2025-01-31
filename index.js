import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import userRoutes from "./routes/userRoutes.js";
import currencyRoutes from "./routes/currencyRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Set up __dirname for ES module
const __dirname = path.resolve();

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));
}

// // Catch-all route for client-side routing
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "client", "build", "index.html"));
// });

// API Routes

app.use("/api/users", userRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/budget", budgetRoutes);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.json("backend is running");
});
app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running!");
});
