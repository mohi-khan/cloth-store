import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { stockAdjustmentModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createStockAdjustment,
  editStockAdjustment,
  getAllStockAdjustments,
  getStockAdjustmentById,
} from '../services/stockAdjustment.serivce'

// Schema validation
const createStockAdjustmentSchema = createInsertSchema(stockAdjustmentModel).omit({
  adjustmentId: true,
  createdAt: true,
})

const editStockAdjustmentSchema = createStockAdjustmentSchema.partial()

export const createStockAdjustmentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_stockAdjustment')
    const stockAdjustmentData = createStockAdjustmentSchema.parse(req.body)
    const stockAdjustment = await createStockAdjustment(stockAdjustmentData)

    res.status(201).json({
      status: 'success',
      data: stockAdjustment,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllStockAdjustmentsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_stockAdjustment')
    const stockAdjustments = await getAllStockAdjustments()

    res.status(200).json(stockAdjustments)
  } catch (error) {
    next(error)
  }
}

export const getStockAdjustmentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_stockAdjustment')
    const id = Number(req.params.id)
    const stockAdjustment = await getStockAdjustmentById(id)

    res.status(200).json(stockAdjustment)
  } catch (error) {
    next(error)
  }
}

export const editStockAdjustmentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_stockAdjustment')
    const id = Number(req.params.id)
    const stockAdjustmentData = editStockAdjustmentSchema.parse(req.body)
    const stockAdjustment = await editStockAdjustment(id, stockAdjustmentData)

    res.status(200).json(stockAdjustment)
  } catch (error) {
    next(error)
  }
}