import { Router } from "express";
import {
  createBankAccountController,
  editBankAccountController,
  getAllBankAccountsController,
  getBankAccountController,
} from "../controllers/bankAccount.controller";

const router = Router();

router.post("/create", createBankAccountController);
router.get("/getAll", getAllBankAccountsController);
router.get("/getById/:id", getBankAccountController);
router.put("/edit/:id", editBankAccountController);

export default router;
