import { Router } from "express"
import {
  createSaleController,
  getAllSalesController,
  getSaleController,
  editSaleController,
} from "../controllers/sales.controllers"
import { authenticateUser } from "../middlewares/auth.middleware"

const router = Router()

router.post("/create",  createSaleController)
router.get("/getAll",  getAllSalesController)
router.get("/getById/:id", authenticateUser, getSaleController)
router.patch("/edit",  editSaleController)

export default router
