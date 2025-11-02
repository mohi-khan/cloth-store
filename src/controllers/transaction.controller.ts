import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { transactionModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createTransaction,
  editTransaction,
  getAllTransactions,
  getTransactionById,
} from '../services/transaction.service'

// Schema validation
const createTransactionSchema = createInsertSchema(transactionModel).omit({
  transactionId: true,
  createdAt: true,
})

const editTransactionSchema = createTransactionSchema.partial()

export const createTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'create_transaction')
    const transactionData = createTransactionSchema.parse(req.body)
    const item = await createTransaction(transactionData)

    res.status(201).json({
      status: 'success',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_transaction')
    const items = await getAllTransactions()

    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_transaction')
    const id = Number(req.params.id)
    const item = await getTransactionById(id)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const editTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'edit_transaction')
    const id = Number(req.params.id)
    const transactionData = editTransactionSchema.parse(req.body)
    const item = await editTransaction(id, transactionData)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}
