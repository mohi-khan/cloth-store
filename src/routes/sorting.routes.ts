import { Router } from "express"
import {
  createSortingController,
  getAllSortingsController,
  getSortingController,
  editSortingController,
} from "../controllers/sorting.controller"
import { authenticateUser } from "../middlewares/auth.middleware"

const router = Router()

router.post("/create/:purchaseId",  createSortingController)
router.get("/getAll",  getAllSortingsController)
router.get("/getById/:id", authenticateUser, getSortingController)
router.patch("/edit/:id",  editSortingController)

export default router
