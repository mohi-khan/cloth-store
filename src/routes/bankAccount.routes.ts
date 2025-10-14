import { Router } from "express";
import {
  createBankAccountController,
  editBankAccountController,
  getAllBankAccountsController,
  getBankAccountController,
} from "../controllers/bankAccount.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create",  createBankAccountController);
router.get("/getAll",  getAllBankAccountsController);
router.get("/getById/:id", authenticateUser, getBankAccountController);
router.patch("/edit/:id",  editBankAccountController);

export default router;
