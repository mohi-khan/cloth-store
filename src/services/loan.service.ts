import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import {
  loanModel,
  NewLoan,
  storeTransactionModel,
  transactionModel,
  vendorModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createLoan = async (
  loanData: Omit<NewLoan, 'loanId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newLoan] = await db.insert(loanModel).values({
      ...loanData,
      createdAt: new Date(),
    })

    await db.insert(transactionModel).values({
      transactionType: 'received',
      isCash: true,
      vendorId: loanData.vendorId,
      transactionDate: new Date(),
      amount: loanData.loanAmountReceivable,
      createdBy: loanData.createdBy,
      createdAt: new Date(),
    })

    return newLoan
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllLoans = async () => {
  return await db
    .select({
      loanId: loanModel.loanId,
      vendorId: loanModel.vendorId,
      vendorName: vendorModel.name,
      uniqueName: loanModel.uniqueName,
      loanDate: loanModel.loanDate,
      loanAmountReceivable: loanModel.loanAmountReceivable,
      loanAmountPayable: loanModel.loanAmountPayable,
      remarks: loanModel.remarks,
      createdBy: loanModel.createdBy,
      createdAt: loanModel.createdAt,
      updatedBy: loanModel.updatedBy,
      updatedAt: loanModel.updatedAt,
    })
    .from(loanModel)
    .innerJoin(vendorModel, eq(loanModel.vendorId, vendorModel.vendorId))
}

// Get By Id
export const getLoanById = async (loanId: number) => {
  const loan = await db
    .select()
    .from(loanModel)
    .where(eq(loanModel.loanId, loanId))
    .limit(1)

  if (!loan.length) {
    throw BadRequestError('Cloth loan not found')
  }

  return loan[0]
}

// Update
export const editLoan = async (loanId: number, loanData: Partial<NewLoan>) => {
  const [updatedLoan] = await db
    .update(loanModel)
    .set(loanData)
    .where(eq(loanModel.loanId, loanId))

  if (!updatedLoan) {
    throw BadRequestError('Cloth loan not found')
  }

  return updatedLoan
}
