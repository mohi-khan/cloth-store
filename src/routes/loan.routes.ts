import { Router } from "express";
import {
  createLoanController,
  editLoanController,
  getAllLoansController,
  getLoanController,
} from "../controllers/loan.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createLoanController);
router.get("/getAll", authenticateUser, getAllLoansController);
router.get("/getById/:id", authenticateUser, getLoanController);
router.put("/edit/:id", authenticateUser, editLoanController);

export default router;
