import { Request, Response, NextFunction } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import { z } from 'zod'
import {
  createSale,
  deleteSale,
  editSale,
  getAllSales,
  getAllSalesMaster,
  getSaleById,
  getSalesDetailsBySalesMasterId,
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
    requirePermission(req, 'create_sales')
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
    requirePermission(req, 'view_sales')
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
    requirePermission(req, 'view_sales')
    const saleMasterId = Number(req.params.id)
    const result = await getSaleById(saleMasterId)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const getSalesDetailsBySalesMasterIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_sales')
    const id = Number(req.params.id)
    const details = await getSalesDetailsBySalesMasterId(id)

    res.status(200).json(details)
  } catch (error) {
    next(error)
  }
}

export const getAllSalesMasterController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_sales')
    const data = await getAllSalesMaster()
    res.status(200).json(data)
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
    requirePermission(req, 'edit_sales')

    const { salesMaster, saleDetails } = req.body

    if (!salesMaster?.saleMasterId) {
      res.status(400).json({ message: 'saleMasterId is required' })
    }

    // ✅ Convert master date fields using the same Zod function
    const formattedMaster = {
      ...salesMaster,
      saleDate: dateStringToDate.parse(salesMaster.saleDate),
      updatedAt: new Date(),
    }

    // ✅ Convert detail date fields (if any)
    const formattedDetails = Array.isArray(saleDetails)
      ? saleDetails.map((d) => ({
          ...d,
          createdAt: d.createdAt
            ? dateStringToDate.parse(d.createdAt)
            : undefined,
          updatedAt: d.updatedAt
            ? dateStringToDate.parse(d.updatedAt)
            : undefined,
        }))
      : []

    const result = await editSale(
      formattedMaster.saleMasterId,
      formattedMaster,
      formattedDetails
    )

    res.status(200).json({
      status: 'success',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteSaleController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'view_sales')
    const saleMasterId = Number(req.params.saleMasterId)
    const saleDetailsId = Number(req.params.saleDetailsId)
    const userId = Number(req.params.userId) // Usually comes from auth middleware

    if (!saleMasterId || isNaN(saleMasterId)) {
      res.status(400).json({ error: 'Invalid saleMasterId ID' })
    }

    if (!saleDetailsId || isNaN(saleDetailsId)) {
      res.status(400).json({ error: 'Invalid saleDetailsId ID' })
    }

    if (!userId) {
      res.status(400).json({ error: 'Missing user ID' })
    }

    const result = await deleteSale(saleMasterId, saleDetailsId, userId)
    res.status(200).json(result)
  } catch (error: any) {
    console.error('Error deleting sorting:', error)
    res.status(500).json({ error: error.message || 'Failed to delete sorting' })
  }
}