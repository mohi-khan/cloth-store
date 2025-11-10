import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import { storeTransactionModel, NewStoreTransaction, itemModel } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createStoreTransaction = async (
  storeTransactionData: Omit<NewStoreTransaction, 'transactionId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newStoreTransaction] = await db.insert(storeTransactionModel).values({
      ...storeTransactionData,
      quantity: `-${storeTransactionData.quantity}`,
      createdAt: new Date(),
    })

    return newStoreTransaction
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllStoreTransactions = async () => {
  return await db
    .select({
      transactionId: storeTransactionModel.transactionId,
      itemId: storeTransactionModel.itemId,
      itemName: itemModel.itemName,
      price: storeTransactionModel.price,
      quantity: storeTransactionModel.quantity,
      transactionDate: storeTransactionModel.transactionDate,
      reference: storeTransactionModel.reference,
      referenceType: storeTransactionModel.referenceType,
      createdBy: storeTransactionModel.createdBy,
      createdAt: storeTransactionModel.createdAt,
      updatedBy: storeTransactionModel.updatedBy,
      updatedAt: storeTransactionModel.updatedAt,
    })
    .from(storeTransactionModel)
    .innerJoin(itemModel, eq(storeTransactionModel.itemId, itemModel.itemId))
}

// Get By Id
export const getStoreTransactionById = async (transactionId: number) => {
  const storeTransaction = await db
    .select()
    .from(storeTransactionModel)
    .where(eq(storeTransactionModel.transactionId, transactionId))
    .limit(1)

  if (!storeTransaction.length) {
    throw BadRequestError('Cloth storeTransaction not found')
  }

  return storeTransaction[0]
}

// Update
export const editStoreTransaction = async (
  transactionId: number,
  storeTransactionData: Partial<NewStoreTransaction>
) => {
  const [updatedStoreTransaction] = await db
    .update(storeTransactionModel)
    .set(storeTransactionData)
    .where(eq(storeTransactionModel.transactionId, transactionId))

  if (!updatedStoreTransaction) {
    throw BadRequestError('Cloth storeTransaction not found')
  }

  return updatedStoreTransaction
}