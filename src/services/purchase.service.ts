import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { purchaseModel, NewPurchase, storeTransactionModel } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createPurchase = async (
  purchaseData: Omit<typeof purchaseModel.$inferInsert, 'purchaseId' | 'updatedAt' | 'updatedBy'>
) => {
  const trx = await db.transaction(async (tx) => {
    try {
      // 1️⃣ Insert into purchase table
      const [newPurchase] = await tx
        .insert(purchaseModel)
        .values({
          ...purchaseData,
          createdAt: new Date(),
        })
        .$returningId(); // returns inserted id (purchaseId)

      // 2️⃣ Insert related record into store_transaction table
      await tx.insert(storeTransactionModel).values({
        itemId: purchaseData.itemId,
        quantity: String(purchaseData.totalQuantity),
        transactionDate: purchaseData.purchaseDate,
        reference: String(newPurchase.purchaseId ?? ''), // store purchase id reference
        referenceType: 'purchase',
        createdBy: purchaseData.createdBy,
        createdAt: new Date(),
      });

      // 3️⃣ Return both or just purchase data
      return newPurchase
    } catch (error) {
      throw error
    }
  });

  return trx;
}

// Get All
export const getAllPurchases = async () => {
  return await db.select().from(purchaseModel)
}

// Get By Id
export const getPurchaseById = async (purchaseId: number) => {
  const item = await db
    .select()
    .from(purchaseModel)
    .where(eq(purchaseModel.purchaseId, purchaseId))
    .limit(1)

  if (!item.length) {
    throw BadRequestError('Purchase not found')
  }

  return item[0]
}

// Update
export const editPurchase = async (
  purchaseId: number,
  purchaseData: Partial<NewPurchase>
) => {
  const [updatedItem] = await db
    .update(purchaseModel)
    .set(purchaseData)
    .where(eq(purchaseModel.purchaseId, purchaseId))

  if (!updatedItem) {
    throw BadRequestError('Purchase not found')
  }

  return updatedItem
}
