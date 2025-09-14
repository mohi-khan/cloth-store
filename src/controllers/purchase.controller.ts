import { Request, Response, NextFunction } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createPurchase,
  editPurchase,
  getAllPurchase,
  getPurchaseById,
} from '../services/purchase.service'

// Controllers
export const createPurchaseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_purchase')
    const { purchasesMaster, purchasesDetails } = req.body
    const result = await createPurchase(purchasesMaster, purchasesDetails)

    res.status(201).json({ status: 'success', data: result })
  } catch (error) {
    next(error)
  }
}

export const getAllPurchaseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_purchase')
    const result = await getAllPurchase()
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const getPurchaseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_purchase')
    const purchaseId = Number(req.params.id)
    const result = await getPurchaseById(purchaseId)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const editPurchaseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_purchase')
    const purchaseId = Number(req.params.id)
    const { purchasesMaster, purchasesDetails } = req.body
    const result = await editPurchase(purchaseId, purchasesMaster, purchasesDetails)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
