import { Router } from "express"
import { getCashReportController } from "../controllers/report.controller"
import { authenticateUser } from "../middlewares/auth.middleware"

const router = Router()

router.get("/cash-report", authenticateUser, getCashReportController);

export default router
