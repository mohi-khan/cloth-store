import { Request, Response, NextFunction } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import { z } from 'zod'
import {
  createSale,
  editSale,
  getAllSales,
  getSaleById,
} from '../services/sales.service'
import { createInsertSchema } from 'drizzle-zod'
import { salesDetailsModel, salesMasterModel } from '../schemas'

const dateStringToDate = z.preprocess(
  (arg) =>
    typeof arg === 'string' || arg instanceof Date ? new Date(arg) : undefined,
  z.date()
)

export const createSalesMasterSchema = createInsertSchema(salesMasterModel)
  .omit({
    saleMasterId: true,
    createdAt: true,
    updatedAt: true,
    updatedBy: true,
  })
  .extend({
    saleDate: dateStringToDate,
  })

// 🧩 Schema for sales_details table
export const createSalesDetailsSchema = createInsertSchema(
  salesDetailsModel
).omit({
  saleDetailsId: true,
  saleMasterId: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
})

// 🧩 Combined schema for full sales data
export const createSaleSchema = z.object({
  salesMaster: createSalesMasterSchema,
  saleDetails: z.array(createSalesDetailsSchema),
})
// Controllers
export const createSaleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'create_sale')
    const salesData = createSaleSchema.parse(req.body)
    const result = await createSale(salesData)

    res.status(201).json({
      status: 'success',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllSalesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_sale')
    const result = await getAllSales()
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const getSaleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_sale')
    const saleMasterId = Number(req.params.id)
    const result = await getSaleById(saleMasterId)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const editSaleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'edit_sale')
    const saleMasterId = Number(req.params.id)
    const { salesMaster, salesDetails } = req.body
    const result = await editSale(saleMasterId, salesMaster, salesDetails)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
