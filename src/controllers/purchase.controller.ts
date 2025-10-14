import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { purchaseModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import { z } from 'zod'
import {
  createPurchase,
  editPurchase,
  getAllPurchases,
  getPurchaseById,
} from '../services/purchase.service'

const dateStringToDate = z.preprocess(
  (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : undefined),
  z.date()
);

// Schema validation
const createPurchaseSchema = createInsertSchema(purchaseModel).omit({
  purchaseId: true,
  createdAt: true,
}).extend({
  purchaseDate: dateStringToDate,
})

const editPurchaseSchema = createPurchaseSchema.partial()

export const createPurchaseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'create_purchase')
    const purchaseData = createPurchaseSchema.parse(req.body)
    const item = await createPurchase(purchaseData)

    res.status(201).json({
      status: 'success',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllPurchasesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_purchase')
    const items = await getAllPurchases()

    res.status(200).json(items)
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
    const id = Number(req.params.id)
    const item = await getPurchaseById(id)

    res.status(200).json(item)
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
    const id = Number(req.params.id)
    const purchaseData = editPurchaseSchema.parse(req.body)
    const item = await editPurchase(id, purchaseData)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}
