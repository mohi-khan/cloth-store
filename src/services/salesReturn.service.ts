import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  salesReturnModel,
  NewSalesReturn,
  salesDetailsModel,
  storeTransactionModel,
  salesTransactionModel,
  salesMasterModel,
  itemModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createSalesReturn = async (
  salesReturnData: Omit<NewSalesReturn, 'updatedAt' | 'updatedBy'>
) => {
  const { saleDetailsId, returnQuantity } = salesReturnData

  return await db.transaction(async (tx) => {
    try {
      // 1️⃣ Fetch the sale details
      const [saleDetail] = await tx
        .select()
        .from(salesDetailsModel)
        .where(eq(salesDetailsModel.saleDetailsId, saleDetailsId))

      if (!saleDetail) throw new Error('Sale detail not found')

      // 2️⃣ Calculate updated quantity & amount
      const updatedQuantity = saleDetail.quantity - returnQuantity
      if (updatedQuantity < 0)
        throw new Error('Return quantity cannot exceed sold quantity')

      const returnAmount = returnQuantity * saleDetail.unitPrice
      const updatedAmount = saleDetail.amount - returnAmount

      // 3️⃣ Update sales_details
      await tx
        .update(salesDetailsModel)
        .set({
          quantity: updatedQuantity,
          amount: updatedAmount,
          updatedAt: new Date(),
          updatedBy: salesReturnData.createdBy,
        })
        .where(eq(salesDetailsModel.saleDetailsId, saleDetailsId))

      // 4️⃣ Insert Sales Return record
      const [newReturn] = await tx.insert(salesReturnModel).values({
        ...salesReturnData,
        createdAt: new Date(),
      })

      // 5️⃣ Fetch Sales Master (needed for date, customer, createdBy)
      const [salesMaster] = await tx
        .select()
        .from(salesMasterModel)
        .where(eq(salesMasterModel.saleMasterId, saleDetail.saleMasterId))

      if (!salesMaster) throw new Error('Related sales master record not found')

      // 6️⃣ Fetch Item (needed for avgPrice)
      const [itemData] = await tx
        .select()
        .from(itemModel)
        .where(eq(itemModel.itemId, saleDetail.itemId))

      if (!itemData) throw new Error('Item not found for transaction')

      // 7️⃣ Insert store transaction (Inventory + Return)
      await tx.insert(storeTransactionModel).values({
        itemId: saleDetail.itemId,
        quantity: `+${returnQuantity}`,
        price: Number(itemData.avgPrice),
        transactionDate: salesMaster.saleDate,
        reference: String(saleDetail.saleMasterId),
        referenceType: 'sales return',
        createdBy: salesMaster.createdBy,
        createdAt: new Date(),
      })

      // 8️⃣ Insert sales transaction (Financial)
      await tx.insert(salesTransactionModel).values({
        saleMasterId: saleDetail.saleMasterId,
        customerId: salesMaster.customerId,
        amount: `-${returnAmount}`,
        transactionDate: salesMaster.saleDate,
        referenceType: 'sales', // ✅ MUST MATCH ENUM
        createdBy: salesMaster.createdBy,
        createdAt: new Date(),
      })

      return newReturn
    } catch (error) {
      console.error('Sales Return transaction FAILED:', error)
      throw error
    }
  })
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
