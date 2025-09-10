import { Router } from "express";
import {
  createCustomerController,
  editCustomerController,
  getAllCustomersController,
  getCustomerController,
} from "../controllers/customer.controller";

const router = Router();

router.post("/create", createCustomerController);
router.get("/getAll", getAllCustomersController);
router.get("/getById/:id", getCustomerController);
router.put("/edit/:id", editCustomerController);

export default router;
