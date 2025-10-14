import { Router } from "express";
import {
  createVendorController,
  editVendorController,
  getAllVendorsController,
  getVendorController,
} from "../controllers/vendor.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", createVendorController);
router.get("/getAll", getAllVendorsController);
router.get("/getById/:id", authenticateUser, getVendorController);
router.patch("/edit/:id", editVendorController);

export default router;
