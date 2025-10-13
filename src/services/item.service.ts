import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { itemModel, NewClothItem } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createClothItem = async (
  clothItemData: Omit<NewClothItem, 'itemId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newItem] = await db.insert(itemModel).values({
      ...clothItemData,
      createdAt: new Date(),
    })

    return newItem
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllClothItems = async () => {
  return await db.select().from(itemModel)
}

// Get By Id
export const getClothItemById = async (itemId: number) => {
  const item = await db
    .select()
    .from(itemModel)
    .where(eq(itemModel.itemId, itemId))
    .limit(1)

  if (!item.length) {
    throw BadRequestError('Cloth item not found')
  }

  return item[0]
}

// Update
export const editClothItem = async (
  itemId: number,
  clothItemData: Partial<NewClothItem>
) => {
  const [updatedItem] = await db
    .update(itemModel)
    .set(clothItemData)
    .where(eq(itemModel.itemId, itemId))

  if (!updatedItem) {
    throw BadRequestError('Cloth item not found')
  }

  return updatedItem
}
