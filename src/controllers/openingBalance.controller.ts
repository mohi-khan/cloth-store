import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { openingBalanceModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createOpeningBalance,
  editOpeningBalance,
  getAllOpeningBalances,
  getOpeningBalanceById,
} from '../services/openingBalance.service'

// Schema validation
const createOpeningBalanceSchema = createInsertSchema(openingBalanceModel).omit({
  openingBalanceId: true,
  createdAt: true,
})

const editOpeningBalanceSchema = createOpeningBalanceSchema.partial()

export const createOpeningBalanceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'create_openingBalance')
    const openingBalanceData = createOpeningBalanceSchema.parse(req.body)
    const item = await createOpeningBalance(openingBalanceData)

    res.status(201).json({
      status: 'success',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllOpeningBalancesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_openingBalance')
    const items = await getAllOpeningBalances()

    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getOpeningBalanceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_openingBalance')
    const id = Number(req.params.id)
    const item = await getOpeningBalanceById(id)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const editOpeningBalanceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'edit_openingBalance')
    const id = Number(req.params.id)
    const openingBalanceData = editOpeningBalanceSchema.parse(req.body)
    const item = await editOpeningBalance(id, openingBalanceData)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}
