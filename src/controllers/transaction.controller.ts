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
import { z } from 'zod'

const dateStringToDate = z.preprocess(
  (arg) =>
    typeof arg === 'string' || arg instanceof Date ? new Date(arg) : undefined,
  z.date()
)

// Schema validation
const createTransactionSchema = createInsertSchema(transactionModel)
  .omit({
    transactionId: true,
    createdAt: true,
  })
  .extend({
    transactionDate: dateStringToDate,
  })

const editTransactionSchema = createInsertSchema(transactionModel).partial().extend({
  transactionDate: dateStringToDate,
  createdAt: dateStringToDate,
})

export const createTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_transaction')
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
    requirePermission(req, 'view_transaction')
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
    const createdAtParam = req.params.createdAt
    if (!createdAtParam) throw new Error('createdAt parameter is required')

    const transactionsData = editTransactionSchema.array().parse(req.body)
    const updatedTransactions = await editTransaction(
      createdAtParam,
      transactionsData
    )

    res.status(200).json({
      message: 'Transactions updated successfully',
      data: updatedTransactions,
    })
  } catch (error) {
    next(error)
  }
}
