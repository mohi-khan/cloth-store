import { Router } from "express";
import {
  createAccountHeadController,
  editAccountHeadController,
  getAllAccountHeadsController,
  getAccountHeadController,
} from "../controllers/accountHead.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createAccountHeadController);
router.get("/getAll", authenticateUser,  getAllAccountHeadsController);
router.get("/getById/:id", authenticateUser, getAccountHeadController);
router.put("/edit/:id", authenticateUser, editAccountHeadController);

export default router;
