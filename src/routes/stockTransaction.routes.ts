import { Router } from "express";
import {
  createStockAdjustmentController,
  editStockAdjustmentController,
  getAllStockAdjustmentsController,
  getStockAdjustmentController,
} from "../controllers/stockAdjustment.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createStockAdjustmentController);
router.get("/getAll", authenticateUser, getAllStockAdjustmentsController);
router.get("/getById/:id", authenticateUser, getStockAdjustmentController);
router.put("/edit/:id", authenticateUser, editStockAdjustmentController);


export default router;
