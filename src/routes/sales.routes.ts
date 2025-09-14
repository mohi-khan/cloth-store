import { Router } from "express"
import {
  createSaleController,
  getAllSalesController,
  getSaleController,
  editSaleController,
} from "../controllers/sales.controllers"
import { authenticateUser } from "../middlewares/auth.middleware"

const router = Router()

router.post("/create", authenticateUser, createSaleController)
router.get("/getAll", authenticateUser, getAllSalesController)
router.get("/getById/:id", authenticateUser, getSaleController)
router.patch("/edit/:id", authenticateUser, editSaleController)

export default router
