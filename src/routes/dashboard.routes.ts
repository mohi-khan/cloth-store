import express from 'express'
import { getItemSummaryController } from '../controllers/dashboard.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = express.Router()

router.get('/item-summary', authenticateUser, getItemSummaryController)

export default router
