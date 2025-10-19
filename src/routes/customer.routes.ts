import { Router } from "express";
import {
  createCustomerController,
  editCustomerController,
  getAllCustomersController,
  getCustomerController,
} from "../controllers/customer.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create",  createCustomerController);
router.get("/getAll",  getAllCustomersController);
router.get("/getById/:id", authenticateUser, getCustomerController);
router.patch("/edit/:id",  editCustomerController);

export default router;
