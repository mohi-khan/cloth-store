import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import { wastageModel, NewWastage, itemModel, storeTransactionModel } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createWastage = async (
  wastageData: Omit<NewWastage, 'wastageId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const result = await db.transaction(async (tx) => {
      // 1️⃣ Validate itemId
      console.log("🚀 ~ createWastage ~ wastageData:", wastageData)
      if (!wastageData.itemId) {
        throw new Error('itemId is required')
      }

      // 2️⃣ Fetch item data
      const [itemData] = await tx
        .select()
        .from(itemModel)
        .where(eq(itemModel.itemId, wastageData.itemId))

      if (!itemData) {
        throw new Error('Item record not found')
      }

      const quantity = wastageData.quantity ?? 0
      const avgPrice = itemData.avgPrice ?? 0
      const sellPrice = itemData.sellPrice ?? 0
      const netPrice = quantity * sellPrice

      // 3️⃣ Insert into wastage table
      const [newWastage] = await tx
        .insert(wastageModel)
        .values({
          itemId: wastageData.itemId,
          quantity: quantity,
          avgPrice: avgPrice,
          sellPrice: sellPrice,
          netPrice: netPrice,
          wastageDate: wastageData.wastageDate,
          notes: wastageData.notes ?? null,
          createdBy: wastageData.createdBy,
          createdAt: new Date(),
        })
        .execute() // ✅ So you can get inserted record

      // 4️⃣ Insert into store_transaction table
      await tx.insert(storeTransactionModel).values({
        itemId: wastageData.itemId,
        quantity: `-${quantity}`,
        price: avgPrice,
        transactionDate: wastageData.wastageDate,
        referenceType: 'wastage',
        createdBy: wastageData.createdBy,
        createdAt: new Date(),
      })
      return newWastage
    })

    return result
  } catch (error) {
    console.error('Error creating wastage:', error)
    throw error
  }
}
// Get All
export const getAllWastages = async () => {
  return await db
    .select({
      wastageId: wastageModel.wastageId,
      itemId: wastageModel.itemId,
      itemName: itemModel.itemName,
      quantity: wastageModel.quantity,
      wastageDate: wastageModel.wastageDate,
      avgPrice: wastageModel.avgPrice,
      sellPrice: wastageModel.sellPrice,
      netPrice: wastageModel.netPrice,
      createdBy: wastageModel.createdBy,
      notes: wastageModel.notes,
      createdAt: wastageModel.createdAt,
      updatedBy: wastageModel.updatedBy,
      updatedAt: wastageModel.updatedAt,
    })
    .from(wastageModel)
    .innerJoin(itemModel, eq(wastageModel.itemId, itemModel.itemId))
}

// Get By Id
export const getWastageById = async (wastageId: number) => {
  const wastage = await db
    .select()
    .from(wastageModel)
    .where(eq(wastageModel.wastageId, wastageId))
    .limit(1)

  if (!wastage.length) {
    throw BadRequestError('Cloth wastage not found')
  }

  return wastage[0]
}

// Update
export const editWastage = async (
  wastageId: number,
  wastageData: Partial<NewWastage>
) => {
  const [updatedWastage] = await db
    .update(wastageModel)
    .set(wastageData)
    .where(eq(wastageModel.wastageId, wastageId))

  if (!updatedWastage) {
    throw BadRequestError('Cloth wastage not found')
  }

  return updatedWastage
}
