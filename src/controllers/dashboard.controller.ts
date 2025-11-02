import { Request, Response } from 'express'
import { getItemSummaryService, getRemainingAmountService } from '../services/dashboard.service'

export const getItemSummaryController = async (req: Request, res: Response) => {
  try {
    const data = await getItemSummaryService()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching item summary:', error)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
}

export const getRemainingAmountController = async (req: Request, res: Response) => {
  try {
    const data = await getRemainingAmountService()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching item summary:', error)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
}
