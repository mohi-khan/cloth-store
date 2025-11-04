import { Request, Response } from 'express'
import { getCashInHand, getItemSummary, getRemainingAmount } from '../services/dashboard.service'

export const getItemSummaryController = async (req: Request, res: Response) => {
  try {
    const data = await getItemSummary()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching item summary:', error)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
}

export const getRemainingAmountController = async (req: Request, res: Response) => {
  try {
    const data = await getRemainingAmount()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching item summary:', error)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
}

export const getCashInHandController = async (req: Request, res: Response) => {
  try {
    const data = await getCashInHand()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching item summary:', error)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
}
