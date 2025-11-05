import { Router } from "express"
import { getCashReportController, getPartyReportController } from "../controllers/report.controller"
import { authenticateUser } from "../middlewares/auth.middleware"

const router = Router()

router.get("/cash-report", authenticateUser, getCashReportController);
router.get("/party-report",authenticateUser, getPartyReportController);
export default router
