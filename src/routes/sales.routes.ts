import { Router } from "express"
import {
  createSaleController,
  getAllSalesController,
  getSaleController,
  editSaleController,
  deleteSaleController,
} from "../controllers/sales.controllers"
import { authenticateUser } from "../middlewares/auth.middleware"

const router = Router()

router.post("/create", authenticateUser, createSaleController)
router.get("/getAll", authenticateUser, getAllSalesController)
router.get("/getById/:id", authenticateUser, getSaleController)
router.patch("/edit", authenticateUser, editSaleController)
router.delete('/delete/:saleMasterId/:saleDetailsId/:userId', authenticateUser, deleteSaleController)

export default router
