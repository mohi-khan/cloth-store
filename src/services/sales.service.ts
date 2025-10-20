import { eq, inArray } from 'drizzle-orm'
import { db } from '../config/database'
import {
  salesMasterModel,
  salesDetailsModel,
  storeTransactionModel,
  customerModel,
  bankAccountModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create Sale (Master + Details)
export const createSale = async (data: {
  salesMaster: Omit<
    typeof salesMasterModel.$inferInsert,
    'saleMasterId' | 'updatedAt' | 'updatedBy' | 'createdAt'
  >
  saleDetails: Array<
    Omit<
      typeof salesDetailsModel.$inferInsert,
      'saleDetailsId' | 'saleMasterId' | 'createdAt' | 'updatedAt' | 'updatedBy'
    >
  >
}) => {
  const trx = await db.transaction(async (tx) => {
    try {
      const { salesMaster, saleDetails } = data

      // 1️⃣ Insert into sales_master
      const [newSaleMaster] = await tx
        .insert(salesMasterModel)
        .values({
          ...salesMaster,
          createdAt: new Date(),
        })
        .$returningId()

      const saleMasterId = newSaleMaster.saleMasterId

      // 2️⃣ Insert each sale detail
      for (const item of saleDetails) {
        await tx.insert(salesDetailsModel).values({
          saleMasterId,
          itemId: item.itemId,
          quantity: item.quantity,
          amount: item.amount,
          unitPrice: item.unitPrice,
          createdBy: salesMaster.createdBy,
          createdAt: new Date(),
        })

        // 3️⃣ Store transaction (negative quantity)
        await tx.insert(storeTransactionModel).values({
          itemId: item.itemId,
          quantity: String(`-${item.quantity}`),
          transactionDate: salesMaster.saleDate,
          reference: String(saleMasterId),
          referenceType: 'sales',
          createdBy: salesMaster.createdBy,
          createdAt: new Date(),
        })
      }

      // ✅ Return inserted master ID
      return { saleMasterId }
    } catch (error) {
      console.error('Error creating sale:', error)
      throw error
    }
  })

  return trx
}

// Get Sale by ID (with details)
export const getSaleById = async (saleMasterId: number) => {
  const master = await db
    .select()
    .from(salesMasterModel)
    .where(eq(salesMasterModel.saleMasterId, saleMasterId))
    .limit(1)

  if (!master.length) throw BadRequestError('Sale not found')

  const details = await db
    .select()
    .from(salesDetailsModel)
    .where(eq(salesDetailsModel.saleMasterId, saleMasterId))

  return { ...master[0], details }
}

// Get All Sales (with details)
export const getAllSales = async () => {
  // 1️⃣ Fetch master records with customer name
  const masters = await db
    .select({
      saleMasterId: salesMasterModel.saleMasterId,
      customerId: salesMasterModel.customerId,
      paymentType: salesMasterModel.paymentType,
      bankAccountId: salesMasterModel.bankAccountId,
      bankName: bankAccountModel.bankName,
      branch: bankAccountModel.branch,
      accountNumber: bankAccountModel.accountNumber,
      saleDate: salesMasterModel.saleDate,
      totalAmount: salesMasterModel.totalAmount,
      totalQuantity: salesMasterModel.totalQuantity,
      notes: salesMasterModel.notes,
      discountAmount: salesMasterModel.discountAmount,
      createdBy: salesMasterModel.createdBy,
      customerName: customerModel.name,
    })
    .from(salesMasterModel)
    .innerJoin(
      customerModel,
      eq(salesMasterModel.customerId, customerModel.customerId)
    ).
    innerJoin(
      bankAccountModel,
      eq(salesMasterModel.bankAccountId, bankAccountModel.bankAccountId)
    )

  if (masters.length === 0) return []

  // 2️⃣ Fetch all sale details in one query
  const saleIds = masters.map((m) => m.saleMasterId)

  const details = await db
    .select({
      saleDetailsId: salesDetailsModel.saleDetailsId,
      saleMasterId: salesDetailsModel.saleMasterId,
      itemId: salesDetailsModel.itemId,
      quantity: salesDetailsModel.quantity,
      unitPrice: salesDetailsModel.unitPrice,
      amount: salesDetailsModel.amount,
      createdBy: salesDetailsModel.createdBy,
    })
    .from(salesDetailsModel)
    .where(inArray(salesDetailsModel.saleMasterId, saleIds))

  // 3️⃣ Group details under each master
  const grouped = masters.map((m) => ({
    salesMaster: {
      saleMasterId: m.saleMasterId,
      customerId: m.customerId,
      customerName: m.customerName, // ✅ Added customer name
      paymentType: m.paymentType,
      bankAccountId: m.bankAccountId,
      bankName: m.bankName,
      branch: m.branch,
      accountNumber: m.accountNumber,
      saleDate: m.saleDate,
      totalAmount: m.totalAmount,
      totalQuantity: m.totalQuantity,
      notes: m.notes,
      discountAmount: m.discountAmount,
      createdBy: m.createdBy,
    },
    saleDetails: details
      .filter((d) => d.saleMasterId === m.saleMasterId)
      .map((d) => ({
        itemId: d.itemId,
        quantity: d.quantity,
        unitPrice: d.unitPrice,
        amount: d.amount,
        createdBy: d.createdBy,
      })),
  }))

  return grouped
}

// Update Sale (Master + Details)
export const editSale = async (
  saleMasterId: number,
  masterData: Partial<typeof salesMasterModel.$inferInsert>,
  detailsData?: Omit<
    typeof salesDetailsModel.$inferInsert,
    'saleItemId' | 'saleMasterId'
  >[]
) => {
  return await db.transaction(async (tx) => {
    // Update master
    await tx
      .update(salesMasterModel)
      .set({ ...masterData, updatedAt: new Date() })
      .where(eq(salesMasterModel.saleMasterId, saleMasterId))

    if (detailsData) {
      // Clear old details
      await tx
        .delete(salesDetailsModel)
        .where(eq(salesDetailsModel.saleMasterId, saleMasterId))

      // Insert new details
      await tx.insert(salesDetailsModel).values(
        detailsData.map((d) => ({
          ...d,
          saleMasterId,
          createdAt: new Date(),
        }))
      )
    }

    return await getSaleById(saleMasterId)
  })
}
