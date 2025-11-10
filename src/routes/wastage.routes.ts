import { Router } from "express";
import {
  createStoreTransactionController,
  editStoreTransactionController,
  getAllStoreTransactionsController,
  getStoreTransactionController,
} from "../controllers/wastage.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createStoreTransactionController);
router.get("/getAll", authenticateUser, getAllStoreTransactionsController);
router.get("/getById/:id", authenticateUser, getStoreTransactionController);
router.put("/edit/:id", authenticateUser, editStoreTransactionController);

export default router;
