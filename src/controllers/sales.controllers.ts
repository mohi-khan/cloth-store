import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { requirePermission } from "../services/utils/jwt.utils"
import { createSale, editSale, getAllSales, getSaleById } from "../services/sales.service"

// Validation Schemas
const saleDetailSchema = z.object({
    itemId: z.number(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    createdBy: z.number(),
  })
  
  const saleMasterSchema = z.object({
    paymentType: z.enum(["cash", "credit", "bank"]),
    bankAccountId: z.number().optional(),
    customerId: z.number(),
    saleDate: z.date(), // ISO date
    totalAmount: z.number(),
    createdBy: z.number(),
  })
  
  const createSaleSchema = z.object({
    salesMaster: saleMasterSchema,
    salesDetails: z.array(saleDetailSchema).min(1),
  })
  
  const editSaleSchema = z.object({
    salesMaster: saleMasterSchema.partial(),
    salesDetails: z.array(saleDetailSchema).optional(),
  })

// Controllers
export const createSaleController = async (req: Request, res: Response, next: NextFunction) => {
    try {
      requirePermission(req, "create_sale")
      const { salesMaster, salesDetails } = createSaleSchema.parse(req.body)
      const result = await createSale(salesMaster, salesDetails)
  
      res.status(201).json({ status: "success", data: result })
    } catch (error) {
      next(error)
    }
  }

export const getAllSalesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requirePermission(req, "view_sale")
    const result = await getAllSales()
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const getSaleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requirePermission(req, "view_sale")
    const saleId = Number(req.params.id)
    const result = await getSaleById(saleId)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const editSaleController = async (req: Request, res: Response, next: NextFunction) => {
    try {
      requirePermission(req, "edit_sale")
      const saleId = Number(req.params.id)
      const { salesMaster, salesDetails } = editSaleSchema.parse(req.body)
      const result = await editSale(saleId, salesMaster, salesDetails)
  
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
