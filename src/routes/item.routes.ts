import { Router } from "express";
import {
  createClothItemController,
  editClothItemController,
  getAllClothItemsController,
  getClothItemController,
} from "../controllers/item.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createClothItemController);
router.get("/getAll", authenticateUser, getAllClothItemsController);
router.get("/getById/:id", authenticateUser, getClothItemController);
router.put("/edit/:id", authenticateUser, editClothItemController);

export default router;
