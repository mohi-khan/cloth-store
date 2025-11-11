import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import {
  stockAdjustmentModel,
  NewStockAdjustment,
  storeTransactionModel,
  itemModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createStockAdjustment = async (
  stockAdjustmentData: Omit<
    NewStockAdjustment,
    'adjustmentId' | 'updatedAt' | 'updatedBy'
  >
) => {
  try {
    const [newStockAdjustment] = await db.insert(stockAdjustmentModel).values({
      ...stockAdjustmentData,
      createdAt: new Date(),
    })

    return newStockAdjustment
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllStockAdjustments = async () => {
  return await db
    .select({
      adjustmentId: stockAdjustmentModel.adjustmentId,
      prevItemId: stockAdjustmentModel.prevItemId,
      prevItemName: itemModel.itemName,
      newItemId: stockAdjustmentModel.newItemId,
      newItemName: itemModel.itemName,
      quantity: stockAdjustmentModel.quantity,
      createdBy: stockAdjustmentModel.createdBy,
      createdAt: stockAdjustmentModel.createdAt,
      updatedBy: stockAdjustmentModel.updatedBy,
      updatedAt: stockAdjustmentModel.updatedAt,
    })
    .from(stockAdjustmentModel)
    .innerJoin(itemModel, eq(stockAdjustmentModel.newItemId, itemModel.itemId))
    .innerJoin(itemModel, eq(stockAdjustmentModel.prevItemId, itemModel.itemId))
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
