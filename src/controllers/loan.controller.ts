import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { loanModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createLoan,
  editLoan,
  getAllLoans,
  getLoanById,
} from '../services/loan.service'

// Schema validation
const createLoanSchema = createInsertSchema(loanModel).omit({
  loanId: true,
  createdAt: true,
})

const editLoanSchema = createLoanSchema.partial()

export const createLoanController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'create_loan')
    const loanData = createLoanSchema.parse(req.body)
    const loan = await createLoan(loanData)

    res.status(201).json({
      status: 'success',
      data: loan,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllLoansController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_loan')
    const loans = await getAllLoans()

    res.status(200).json(loans)
  } catch (error) {
    next(error)
  }
}

export const getLoanController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_loan')
    const id = Number(req.params.id)
    const loan = await getLoanById(id)

    res.status(200).json(loan)
  } catch (error) {
    next(error)
  }
}

export const editLoanController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_loan')
    const id = Number(req.params.id)
    const loanData = editLoanSchema.parse(req.body)
    const loan = await editLoan(id, loanData)

    res.status(200).json(loan)
  } catch (error) {
    next(error)
  }
}