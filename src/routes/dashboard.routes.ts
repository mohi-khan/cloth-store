import express from 'express'
import { getItemSummaryController, getRemainingAmountController } from '../controllers/dashboard.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = express.Router()

router.get('/item-summary', authenticateUser, getItemSummaryController)
router.get('/remaining-amount', authenticateUser, getRemainingAmountController)

export default router
