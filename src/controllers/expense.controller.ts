import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { expenseModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import { z } from 'zod'
import {
  createExpense,
  editExpense,
  getAllExpenses,
  getExpenseById,
} from '../services/expense.service'

const dateStringToDate = z.preprocess(
  (arg) =>
    typeof arg === 'string' || arg instanceof Date ? new Date(arg) : undefined,
  z.date()
)

const createExpenseSchema = createInsertSchema(expenseModel).omit({
  expenseId: true,
  createdAt: true,
}).extend({
  expenseDate: dateStringToDate,
})

const editExpenseSchema = createExpenseSchema.partial()

export const createExpenseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'create_expense')
    const expenseData = createExpenseSchema.parse(req.body)
    const item = await createExpense(expenseData)

    res.status(201).json({
      status: 'success',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllExpensesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_expense')
    const items = await getAllExpenses()

    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getExpenseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_expense')
    const id = Number(req.params.id)
    const item = await getExpenseById(id)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const editExpenseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_expense')
    const id = Number(req.params.id)
    const expenseData = editExpenseSchema.parse(req.body)
    const item = await editExpense(id, expenseData)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}
