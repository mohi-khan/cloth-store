import { Router } from "express";
import {
  createSalesReturnController,
  editSalesReturnController,
  getAllSalesReturnsController,
  getSalesReturnController,
} from "../controllers/salesReturn.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createSalesReturnController);
router.get("/getAll", authenticateUser, getAllSalesReturnsController);
router.get("/getById/:id", authenticateUser, getSalesReturnController);
router.patch("/edit/:id", authenticateUser, editSalesReturnController);

export default router;
