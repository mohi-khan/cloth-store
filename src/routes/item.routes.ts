import { Router } from "express";
import {
  createItemController,
  editItemController,
  getAllItemsController,
  getItemController,
} from "../controllers/item.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create",  createItemController);
router.get("/getAll",  getAllItemsController);
router.get("/getById/:id", authenticateUser, getItemController);
router.put("/edit/:id", authenticateUser, editItemController);

export default router;
