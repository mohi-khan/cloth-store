import { Router } from "express"
import {
  createSaleController,
  getAllSalesController,
  getSaleController,
  editSaleController,
  deleteSaleController,
  getSalesDetailsBySalesMasterIdController,
  getAllSalesMasterController,
} from "../controllers/sales.controllers"
import { authenticateUser } from "../middlewares/auth.middleware"

const router = Router()

router.post("/create", authenticateUser, createSaleController)
router.get("/getAll", authenticateUser, getAllSalesController)
router.get("/getAllSalesMaster", authenticateUser, getAllSalesMasterController)
router.get("/getById/:id", authenticateUser, getSaleController)
router.get("/geSalesDetailstBySalesMasterId/:id", authenticateUser, getSalesDetailsBySalesMasterIdController)
router.patch("/edit", authenticateUser, editSaleController)
router.delete('/delete/:saleMasterId/:saleDetailsId/:userId', authenticateUser, deleteSaleController)

export default router
