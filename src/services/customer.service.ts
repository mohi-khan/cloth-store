import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { customerModel, NewCustomer } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createCustomer = async (
  customerData: Omit<NewCustomer, 'itemId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newItem] = await db.insert(customerModel).values({
      ...customerData,
      createdAt: new Date(),
    })

    return newItem
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllCustomers = async () => {
  return await db.select().from(customerModel)
}

// Get By Id
export const getCustomerById = async (customerId: number) => {
  const item = await db
    .select()
    .from(customerModel)
    .where(eq(customerModel.customerId, customerId))
    .limit(1)

  if (!item.length) {
    throw BadRequestError('Customer not found')
  }

  return item[0]
}

// Update
export const editCustomer = async (
  customerId: number,
  customerData: Partial<NewCustomer>
) => {
  const [updatedItem] = await db
    .update(customerModel)
    .set(customerData)
    .where(eq(customerModel.customerId, customerId))

  if (!updatedItem) {
    throw BadRequestError('Customer not found')
  }

  return updatedItem
}
