import { Router } from "express"
import { getCashReportController, getLoanReportController, getPartyReportController, getStockLedgerController } from "../controllers/report.controller"
import { authenticateUser } from "../middlewares/auth.middleware"

const router = Router()

router.get("/cash-report", authenticateUser, getCashReportController);
router.get("/party-report",authenticateUser, getPartyReportController);
router.get("/stock-ledger",authenticateUser, getStockLedgerController);
router.get("/loan-report",authenticateUser, getLoanReportController);
export default router
