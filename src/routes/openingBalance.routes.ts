import { Router } from "express";
import {
  createOpeningBalanceController,
  editOpeningBalanceController,
  getAllOpeningBalancesController,
  getOpeningBalanceController,
} from "../controllers/openingBalance.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createOpeningBalanceController);
router.get("/getAll", authenticateUser, getAllOpeningBalancesController);
router.get("/getById/:id", authenticateUser, getOpeningBalanceController);
router.patch("/edit/:id", authenticateUser, editOpeningBalanceController);

export default router;
