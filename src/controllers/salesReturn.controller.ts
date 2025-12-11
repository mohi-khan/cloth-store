import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { salesReturnModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createSalesReturn,
  editSalesReturn,
  getAllSalesReturns,
  getSalesReturnById,
} from '../services/salesReturn.service'

// Schema validation
const createSalesReturnSchema = createInsertSchema(salesReturnModel).omit({
  saleReturnId: true,
  createdAt: true,
})

const editSalesReturnSchema = createSalesReturnSchema.partial()

export const createSalesReturnController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'create_bank_account')
    const salesReturnData = createSalesReturnSchema.parse(req.body)
    const item = await createSalesReturn(salesReturnData)

    res.status(201).json({
      status: 'success',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllSalesReturnsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_bank_account')
    const items = await getAllSalesReturns()

    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getSalesReturnController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_bank_account')
    const id = Number(req.params.id)
    const item = await getSalesReturnById(id)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const editSalesReturnController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'edit_bank_account')
    const id = Number(req.params.id)
    const salesReturnData = editSalesReturnSchema.parse(req.body)
    const item = await editSalesReturn(id, salesReturnData)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}
