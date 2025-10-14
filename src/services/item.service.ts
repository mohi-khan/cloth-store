import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { itemModel, NewItem } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createItem = async (
  itemData: Omit<NewItem, 'itemId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newItem] = await db.insert(itemModel).values({
      ...itemData,
      createdAt: new Date(),
    })

    return newItem
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllItems = async () => {
  return await db.select().from(itemModel)
}

// Get By Id
export const getItemById = async (itemId: number) => {
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
export const editItem = async (
  itemId: number,
  itemData: Partial<NewItem>
) => {
  const [updatedItem] = await db
    .update(itemModel)
    .set(itemData)
    .where(eq(itemModel.itemId, itemId))

  if (!updatedItem) {
    throw BadRequestError('Cloth item not found')
  }

  return updatedItem
}
