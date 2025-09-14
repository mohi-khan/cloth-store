import { Router } from "express"
import {
  createPurchaseController,
  getAllPurchaseController,
  getPurchaseController,
  editPurchaseController,
} from "../controllers/purchase.controller"
import { authenticateUser } from "../middlewares/auth.middleware"

const router = Router()

router.post("/create", authenticateUser, createPurchaseController)
router.get("/getAll", authenticateUser, getAllPurchaseController)
router.get("/getById/:id", authenticateUser, getPurchaseController)
router.patch("/edit/:id", authenticateUser, editPurchaseController)

export default router
