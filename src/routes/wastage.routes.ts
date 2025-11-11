import { Router } from "express";
import {
  createWastageController,
  editWastageController,
  getAllWastagesController,
  getWastageController,
} from "../controllers/wastage.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createWastageController);
router.get("/getAll", authenticateUser, getAllWastagesController);
router.get("/getById/:id", authenticateUser, getWastageController);
router.put("/edit/:id", authenticateUser, editWastageController);

export default router;
