import { Router } from "express";
import {
  createItemController,
  editItemController,
  getAllItemsController,
  getItemController,
} from "../controllers/item.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createItemController);
router.get("/getAll", authenticateUser, getAllItemsController);
router.get("/getById/:id", authenticateUser, getItemController);
router.put("/edit/:id", authenticateUser, editItemController);

export default router;
