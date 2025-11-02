import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  transactionModel,
  NewTransaction,
  bankAccountModel,
  customerModel,
  vendorModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createTransaction = async (
  transactionData: Omit<NewTransaction, 'itemId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newItem] = await db.insert(transactionModel).values({
      ...transactionData,
      createdAt: new Date(),
    })

    return newItem
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllTransactions = async () => {
  return await db
    .select({
      transactionId: transactionModel.transactionId,
      transactionType: transactionModel.transactionType,
      isCash: transactionModel.isCash,
      bankId: transactionModel.bankId,
      customerId: transactionModel.customerId,
      vendorId: transactionModel.vendorId,
      transactionDate: transactionModel.transactionDate,
      amount: transactionModel.amount,
      createdBy: transactionModel.createdBy,
      createdAt: transactionModel.createdAt,
      updatedBy: transactionModel.updatedBy,
      updatedAt: transactionModel.updatedAt,
      bankName: bankAccountModel.bankName,
      bankAccount: bankAccountModel.accountNumber,
      bankAccountName: bankAccountModel.accountName,
      customerName: customerModel.name,
      vendorName: vendorModel.name,
    })
    .from(transactionModel)
    .leftJoin(
      bankAccountModel,
      eq(transactionModel.bankId, bankAccountModel.bankAccountId)
    )
    .leftJoin(
      customerModel,
      eq(transactionModel.customerId, customerModel.customerId)
    )
    .leftJoin(vendorModel, eq(transactionModel.vendorId, vendorModel.vendorId))
}

// Get By Id
export const getTransactionById = async (transactionId: number) => {
  const item = await db
    .select()
    .from(transactionModel)
    .where(eq(transactionModel.transactionId, transactionId))
    .limit(1)

  if (!item.length) {
    throw BadRequestError('Transaction not found')
  }

  return item[0]
}

// Update
export const editTransaction = async (
  transactionId: number,
  transactionData: Partial<NewTransaction>
) => {
  const [updatedItem] = await db
    .update(transactionModel)
    .set(transactionData)
    .where(eq(transactionModel.transactionId, transactionId))

  if (!updatedItem) {
    throw BadRequestError('Transaction not found')
  }

  return updatedItem
}
