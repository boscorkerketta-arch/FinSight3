import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { SpendingModel, MonthRecord } from "./src/lib/spendingModel.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize and train the model with mock data
  const model = new SpendingModel();
  const historical: MonthRecord[] = [
    { month: 1,  days_in_period: 31, total_budget: 18000, already_spent_start: 0, planned_expenses: 3000, free_balance: 15000, unplanned_actual: 2100 },
    { month: 2,  days_in_period: 28, total_budget: 15000, already_spent_start: 0, planned_expenses: 2500, free_balance: 12500, unplanned_actual: 900 },
    { month: 3,  days_in_period: 31, total_budget: 17000, already_spent_start: 0, planned_expenses: 4000, free_balance: 13000, unplanned_actual: 2800 },
    { month: 4,  days_in_period: 30, total_budget: 16000, already_spent_start: 0, planned_expenses: 2000, free_balance: 14000, unplanned_actual: 1200 },
    { month: 5,  days_in_period: 31, total_budget: 20000, already_spent_start: 0, planned_expenses: 5000, free_balance: 15000, unplanned_actual: 3200 },
    { month: 6,  days_in_period: 30, total_budget: 15000, already_spent_start: 0, planned_expenses: 1500, free_balance: 13500, unplanned_actual: 1100 },
    { month: 7,  days_in_period: 31, total_budget: 22000, already_spent_start: 0, planned_expenses: 6000, free_balance: 16000, unplanned_actual: 4100 },
    { month: 8,  days_in_period: 31, total_budget: 18000, already_spent_start: 0, planned_expenses: 3000, free_balance: 15000, unplanned_actual: 1800 },
    { month: 9,  days_in_period: 30, total_budget: 16000, already_spent_start: 0, planned_expenses: 2500, free_balance: 13500, unplanned_actual: 950 },
    { month: 10, days_in_period: 31, total_budget: 19000, already_spent_start: 0, planned_expenses: 3500, free_balance: 15500, unplanned_actual: 2600 },
  ];
  model.fit(historical);

  // API Routes
  app.post("/api/spending/predict", (req, res) => {
    try {
      const result = model.predict(req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
