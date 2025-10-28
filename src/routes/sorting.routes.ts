import { Router } from "express"
import {
  createSortingController,
  getAllSortingsController,
  getSortingController,
  editSortingController,
  deleteSortingController,
} from "../controllers/sorting.controller"
import { authenticateUser } from "../middlewares/auth.middleware"

const router = Router()

router.post("/create/:purchaseId", authenticateUser, createSortingController)
router.get("/getAll", authenticateUser, getAllSortingsController)
router.get("/getById/:id", authenticateUser, getSortingController)
router.patch("/edit/:id", authenticateUser, editSortingController)
router.delete('/delete/:id/:userId', authenticateUser, deleteSortingController)

export default router
