import { Router } from "express";
import {
  createVendorController,
  editVendorController,
  getAllVendorsController,
  getVendorController,
} from "../controllers/vendor.controller";

const router = Router();

router.post("/create", createVendorController);
router.get("/getAll", getAllVendorsController);
router.get("/getById/:id", getVendorController);
router.put("/edit/:id", editVendorController);

export default router;
