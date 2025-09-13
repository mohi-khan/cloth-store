import { Router } from "express";
import {
  createExpenseController,
  editExpenseController,
  getAllExpensesController,
  getExpenseController,
} from "../controllers/expense.controller";

const router = Router();

router.post("/create", createExpenseController);
router.get("/getAll", getAllExpensesController);
router.get("/getById/:id", getExpenseController);
router.put("/edit/:id", editExpenseController);

export default router;
