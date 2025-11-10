import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { storeTransactionModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createStoreTransaction,
  editStoreTransaction,
  getAllStoreTransactions,
  getStoreTransactionById,
} from '../services/wastage.service'

// Schema validation
const createStoreTransactionSchema = createInsertSchema(storeTransactionModel).omit({
  transactionId: true,
  createdAt: true,
})

const editStoreTransactionSchema = createStoreTransactionSchema.partial()

export const createStoreTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'create_storeTransaction')
    const storeTransactionData = createStoreTransactionSchema.parse(req.body)
    const storeTransaction = await createStoreTransaction(storeTransactionData)

    res.status(201).json({
      status: 'success',
      data: storeTransaction,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllStoreTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_storeTransaction')
    const storeTransactions = await getAllStoreTransactions()

    res.status(200).json(storeTransactions)
  } catch (error) {
    next(error)
  }
}

export const getStoreTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_storeTransaction')
    const id = Number(req.params.id)
    const storeTransaction = await getStoreTransactionById(id)

    res.status(200).json(storeTransaction)
  } catch (error) {
    next(error)
  }
}

export const editStoreTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_storeTransaction')
    const id = Number(req.params.id)
    const storeTransactionData = editStoreTransactionSchema.parse(req.body)
    const storeTransaction = await editStoreTransaction(id, storeTransactionData)

    res.status(200).json(storeTransaction)
  } catch (error) {
    next(error)
  }
}