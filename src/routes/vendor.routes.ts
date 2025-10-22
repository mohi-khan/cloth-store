import { Router } from "express";
import {
  createVendorController,
  editVendorController,
  getAllVendorsController,
  getVendorController,
} from "../controllers/vendor.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createVendorController);
router.get("/getAll", authenticateUser, getAllVendorsController);
router.get("/getById/:id", authenticateUser, getVendorController);
router.patch("/edit/:id", authenticateUser, editVendorController);

export default router;
