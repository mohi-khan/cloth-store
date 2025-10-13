import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { purchaseModel, NewPurchase } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createPurchase = async (
  purchaseData: Omit<NewPurchase, 'itemId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newItem] = await db.insert(purchaseModel).values({
      ...purchaseData,
      createdAt: new Date(),
    })

    return newItem
  } catch (error) {
    throw error
  }
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
