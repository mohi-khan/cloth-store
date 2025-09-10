import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { clothItemModel, NewClothItem } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createClothItem = async (
  clothItemData: Omit<NewClothItem, 'itemId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newItem] = await db.insert(clothItemModel).values({
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
  return await db.select().from(clothItemModel)
}

// Get By Id
export const getClothItemById = async (itemId: number) => {
  const item = await db
    .select()
    .from(clothItemModel)
    .where(eq(clothItemModel.itemId, itemId))
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
    .update(clothItemModel)
    .set(clothItemData)
    .where(eq(clothItemModel.itemId, itemId))

  if (!updatedItem) {
    throw BadRequestError('Cloth item not found')
  }

  return updatedItem
}
