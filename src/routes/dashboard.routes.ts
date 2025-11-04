import express from 'express'
import { getCashInHandController, getItemSummaryController, getRemainingAmountController } from '../controllers/dashboard.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = express.Router()

router.get('/item-summary', authenticateUser, getItemSummaryController)
router.get('/remaining-amount', authenticateUser, getRemainingAmountController)
router.get('/cash-in-hand', authenticateUser, getCashInHandController)

export default router
