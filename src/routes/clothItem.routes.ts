import { Router } from "express";
import {
  createClothItemController,
  editClothItemController,
  getAllClothItemsController,
  getClothItemController,
} from "../controllers/clothItem.controller";

const router = Router();

router.post("/create", createClothItemController);
router.get("/getAll", getAllClothItemsController);
router.get("/getById/:id", getClothItemController);
router.put("/edit/:id", editClothItemController);

export default router;
