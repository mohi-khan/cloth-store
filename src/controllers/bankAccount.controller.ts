import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { bankAccountModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createBankAccount,
  editBankAccount,
  getAllBankAccounts,
  getBankAccountById,
} from '../services/bankAccount.service'

// Schema validation
const createBankAccountSchema = createInsertSchema(bankAccountModel).omit({
  bankAccountId: true,
  createdAt: true,
})

const editBankAccountSchema = createBankAccountSchema.partial()

export const createBankAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_bank_account')
    const bankAccountData = createBankAccountSchema.parse(req.body)
    const item = await createBankAccount(bankAccountData)

    res.status(201).json({
      status: 'success',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllBankAccountsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_bank_account')
    const items = await getAllBankAccounts()

    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getBankAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_bank_account')
    const id = Number(req.params.id)
    const item = await getBankAccountById(id)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const editBankAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_bank_account')
    const id = Number(req.params.id)
    const bankAccountData = editBankAccountSchema.parse(req.body)
    const item = await editBankAccount(id, bankAccountData)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}
