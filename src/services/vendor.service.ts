import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { vendorModel, NewVendor } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createVendor = async (
  vendorData: Omit<NewVendor, 'itemId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newItem] = await db.insert(vendorModel).values({
      ...vendorData,
      createdAt: new Date(),
    })

    return newItem
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllVendors = async () => {
  return await db.select().from(vendorModel)
}

// Get By Id
export const getVendorById = async (vendorId: number) => {
  const item = await db
    .select()
    .from(vendorModel)
    .where(eq(vendorModel.vendorId, vendorId))
    .limit(1)

  if (!item.length) {
    throw BadRequestError('Vendor not found')
  }

  return item[0]
}

// Update
export const editVendor = async (
  vendorId: number,
  vendorData: Partial<NewVendor>
) => {
  const [updatedItem] = await db
    .update(vendorModel)
    .set(vendorData)
    .where(eq(vendorModel.vendorId, vendorId))

  if (!updatedItem) {
    throw BadRequestError('Vendor not found')
  }

  return updatedItem
}
