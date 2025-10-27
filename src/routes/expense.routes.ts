import { Router } from "express";
import {
  createExpenseController,
  editExpenseController,
  getAllExpensesController,
  getExpenseController,
} from "../controllers/expense.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createExpenseController);
router.get("/getAll", authenticateUser,  getAllExpensesController);
router.get("/getById/:id", authenticateUser, getExpenseController);
router.put("/edit/:id", authenticateUser, editExpenseController);

export default router;
