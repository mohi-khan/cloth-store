import { and, eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  transactionModel,
  NewTransaction,
  bankAccountModel,
  customerModel,
  vendorModel,
  salesTransactionModel,
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

    // await db.insert(salesTransactionModel).values({
    //   saleMasterId: null,
    //   customerId: transactionData.customerId,
    //   amount: String(
    //     `${transactionData.isCash === true ? '-' : '+'}${transactionData.amount}`
    //   ),
    //   transactionDate: new Date(),
    //   referenceType: 'transaction',
    //   createdBy: transactionData.createdBy,
    //   createdAt: new Date(),
    // })

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
  createdAt: string,
  transactionsData: Partial<NewTransaction>[]
) => {
  console.log("🚀 ~ editTransaction ~ transactionsData:", transactionsData)
  const createdAtDate = new Date(createdAt);
  const results = [];

  for (const transactionData of transactionsData) {
    if (!transactionData.transactionId) {
      throw BadRequestError("transactionId is required for each transaction");
    }

    const updated = await db
      .update(transactionModel)
      .set(transactionData)
      .where(
        and(
          eq(transactionModel.createdAt, createdAtDate),
          eq(transactionModel.transactionId, transactionData.transactionId)
        )
      )
      .execute();

    if (updated.length > 0) {
      results.push(...updated);
    }
  }

  if (results.length === 0) {
    throw BadRequestError("No transactions found for the given createdAt timestamp");
  }

  return results;
};
