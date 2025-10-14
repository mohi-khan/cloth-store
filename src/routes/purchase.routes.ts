import { Router } from "express"
import {
  createPurchaseController,
  getAllPurchasesController,
  getPurchaseController,
  editPurchaseController,
} from "../controllers/purchase.controller"
import { authenticateUser } from "../middlewares/auth.middleware"

const router = Router()

router.post("/create",  createPurchaseController)
router.get("/getAll",  getAllPurchasesController)
router.get("/getById/:id", authenticateUser, getPurchaseController)
router.patch("/edit/:id", authenticateUser, editPurchaseController)

export default router
