import { Router } from "express";
import {
  createTransactionController,
  editTransactionController,
  getAllTransactionsController,
  getTransactionController,
} from "../controllers/transaction.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createTransactionController);
router.get("/getAll", authenticateUser, getAllTransactionsController);
router.get("/getById/:id", authenticateUser, getTransactionController);
router.patch("/edit/:createdAt", authenticateUser, editTransactionController);

export default router;
