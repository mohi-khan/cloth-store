import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  stockAdjustmentModel,
  NewStockAdjustment,
  storeTransactionModel,
  itemModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'
import { alias } from 'drizzle-orm/mysql-core'

// Create
export const createStockAdjustment = async (
  stockAdjustmentData: Omit<
    NewStockAdjustment,
    'adjustmentId' | 'updatedAt' | 'updatedBy'
  >
) => {
  try {
    const result = await db.transaction(async (tx) => {
      // 1️⃣ Insert new stock adjustment
      const [newStockAdjustment] = await tx
        .insert(stockAdjustmentModel)
        .values({
          ...stockAdjustmentData,
          createdAt: new Date(),
        })
        .execute()

      // 2️⃣ Validate IDs
      if (!stockAdjustmentData.prevItemId || !stockAdjustmentData.newItemId) {
        throw new Error('Both prevItemId and newItemId are required')
      }

      // 3️⃣ Fetch both items
      const [prevItem] = await tx
        .select()
        .from(itemModel)
        .where(eq(itemModel.itemId, stockAdjustmentData.prevItemId))
        .limit(1)

      const [newItem] = await tx
        .select()
        .from(itemModel)
        .where(eq(itemModel.itemId, stockAdjustmentData.newItemId))
        .limit(1)

      if (!prevItem) throw new Error('Previous item not found')
      if (!newItem) throw new Error('New item not found')

      const prevAvgPrice = prevItem.avgPrice ?? 0
      const newAvgPrice = newItem.avgPrice ?? 0

      // 4️⃣ Insert negative store transaction for previous item
      await tx.insert(storeTransactionModel).values({
        itemId: stockAdjustmentData.prevItemId,
        quantity: `-${stockAdjustmentData.quantity}`,
        transactionDate: new Date(),
        referenceType: 'adjustment',
        price: prevAvgPrice,
        createdBy: stockAdjustmentData.createdBy,
        createdAt: new Date(),
      })

      // 5️⃣ Insert positive store transaction for new item
      await tx.insert(storeTransactionModel).values({
        itemId: stockAdjustmentData.newItemId,
        quantity: `+${stockAdjustmentData.quantity}`,
        transactionDate: new Date(),
        referenceType: 'adjustment',
        price: newAvgPrice,
        createdBy: stockAdjustmentData.createdBy,
        createdAt: new Date(),
      })

      return newStockAdjustment
    })

    return result
  } catch (error) {
    console.error('Error creating stock adjustment:', error)
    throw error
  }
}

// Get All
const prevItem = alias(itemModel, 'prev_item')
const newItem = alias(itemModel, 'new_item')

export const getAllStockAdjustments = async () => {
  return await db
    .select({
      adjustmentId: stockAdjustmentModel.adjustmentId,
      prevItemId: stockAdjustmentModel.prevItemId,
      prevItemName: prevItem.itemName,
      newItemId: stockAdjustmentModel.newItemId,
      newItemName: newItem.itemName,
      quantity: stockAdjustmentModel.quantity,
      createdBy: stockAdjustmentModel.createdBy,
      createdAt: stockAdjustmentModel.createdAt,
      updatedBy: stockAdjustmentModel.updatedBy,
      updatedAt: stockAdjustmentModel.updatedAt,
    })
    .from(stockAdjustmentModel)
    .leftJoin(prevItem, eq(stockAdjustmentModel.prevItemId, prevItem.itemId))
    .leftJoin(newItem, eq(stockAdjustmentModel.newItemId, newItem.itemId))
}

// Get By Id
export const getStockAdjustmentById = async (adjustmentId: number) => {
  const stockAdjustment = await db
    .select()
    .from(stockAdjustmentModel)
    .where(eq(stockAdjustmentModel.adjustmentId, adjustmentId))
    .limit(1)

  if (!stockAdjustment.length) {
    throw BadRequestError('Cloth stockAdjustment not found')
  }

  return stockAdjustment[0]
}

// Update
export const editStockAdjustment = async (
  adjustmentId: number,
  stockAdjustmentData: Partial<NewStockAdjustment>
) => {
  const [updatedStockAdjustment] = await db
    .update(stockAdjustmentModel)
    .set(stockAdjustmentData)
    .where(eq(stockAdjustmentModel.adjustmentId, adjustmentId))

  if (!updatedStockAdjustment) {
    throw BadRequestError('Cloth stockAdjustment not found')
  }

  return updatedStockAdjustment
}
