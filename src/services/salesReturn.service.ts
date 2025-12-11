import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { salesReturnModel, NewSalesReturn, salesDetailsModel } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createSalesReturn = async (
  salesReturnData: Omit<NewSalesReturn, 'updatedAt' | 'updatedBy'>
) => {
  try {
    const { saleDetailsId, returnQuantity } = salesReturnData

    // 1️⃣ Fetch the sale details by ID
    const [saleDetail] = await db
      .select()
      .from(salesDetailsModel)
      .where(eq(salesDetailsModel.saleDetailsId, saleDetailsId))

    if (!saleDetail) {
      throw new Error('Sale detail not found')
    }

    // 2️⃣ Calculate updated quantity & amount
    const updatedQuantity = saleDetail.quantity - returnQuantity

    if (updatedQuantity < 0) {
      throw new Error('Return quantity cannot be greater than sold quantity')
    }

    const deductedAmount = returnQuantity * saleDetail.unitPrice
    const updatedAmount = saleDetail.amount - deductedAmount

    // 3️⃣ Update sales_details record
    await db
      .update(salesDetailsModel)
      .set({
        quantity: updatedQuantity,
        amount: updatedAmount,
        updatedAt: new Date(),
        updatedBy: salesReturnData.createdBy, // optional
      })
      .where(eq(salesDetailsModel.saleDetailsId, saleDetailsId))

    // 4️⃣ Insert into sales_return table
    const [newItem] = await db.insert(salesReturnModel).values({
      ...salesReturnData,
      createdAt: new Date(),
    })

    return newItem
  } catch (error) {
    console.error('Error in createSalesReturn:', error)
    throw error
  }
}

// Get All
export const getAllSalesReturns = async () => {
  return await db.select().from(salesReturnModel)
}

// Get By Id
export const getSalesReturnById = async (salesReturnId: number) => {
  const item = await db
    .select()
    .from(salesReturnModel)
    .where(eq(salesReturnModel.saleReturnId, salesReturnId))
    .limit(1)

  if (!item.length) {
    throw BadRequestError('SalesReturn not found')
  }

  return item[0]
}

// Update
export const editSalesReturn = async (
  salesReturnId: number,
  salesReturnData: Partial<NewSalesReturn>
) => {
  const [updatedItem] = await db
    .update(salesReturnModel)
    .set(salesReturnData)
    .where(eq(salesReturnModel.saleReturnId, salesReturnId))

  if (!updatedItem) {
    throw BadRequestError('SalesReturn not found')
  }

  return updatedItem
}
