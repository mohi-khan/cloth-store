import { Router } from "express";
import {
  createBankAccountController,
  editBankAccountController,
  getAllBankAccountsController,
  getBankAccountController,
} from "../controllers/bankAccount.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createBankAccountController);
router.get("/getAll", authenticateUser, getAllBankAccountsController);
router.get("/getById/:id", authenticateUser, getBankAccountController);
router.put("/edit/:id", authenticateUser, editBankAccountController);

export default router;
