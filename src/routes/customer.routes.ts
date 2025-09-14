import { Router } from "express";
import {
  createCustomerController,
  editCustomerController,
  getAllCustomersController,
  getCustomerController,
} from "../controllers/customer.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createCustomerController);
router.get("/getAll", authenticateUser, getAllCustomersController);
router.get("/getById/:id", authenticateUser, getCustomerController);
router.put("/edit/:id", authenticateUser, editCustomerController);

export default router;
