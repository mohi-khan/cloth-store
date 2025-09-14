import { Request, Response, NextFunction } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createSale,
  editSale,
  getAllSales,
  getSaleById,
} from '../services/sales.service'

// Controllers
export const createSaleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_sale')
    const { salesMaster, salesDetails } = req.body
    const result = await createSale(salesMaster, salesDetails)

    res.status(201).json({ status: 'success', data: result })
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
    requirePermission(req, 'view_sale')
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
    const saleId = Number(req.params.id)
    const result = await getSaleById(saleId)
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
    requirePermission(req, 'edit_sale')
    const saleId = Number(req.params.id)
    const { salesMaster, salesDetails } = req.body
    const result = await editSale(saleId, salesMaster, salesDetails)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
