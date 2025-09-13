import { Router } from "express"
import {
  createSaleController,
  getAllSalesController,
  getSaleController,
  editSaleController,
} from "../controllers/sales.controllers"

const router = Router()

router.post("/create", createSaleController)
router.get("/getAll", getAllSalesController)
router.get("/getById/:id", getSaleController)
router.patch("/edit/:id", editSaleController)

export default router
