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
    )
    .innerJoin(
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
  detailsData?: Array<
    Partial<typeof salesDetailsModel.$inferInsert> & { saleDetailsId?: number }
  >
) => {
  return await db.transaction(async (tx) => {
    // ✅ 1️⃣ Update salesMaster only (never insert new)
    await tx
      .update(salesMasterModel)
      .set({ ...masterData, updatedAt: new Date() })
      .where(eq(salesMasterModel.saleMasterId, saleMasterId))

    // ✅ 2️⃣ Handle saleDetails intelligently
    if (detailsData && detailsData.length > 0) {
      // Get existing saleDetails IDs for this saleMaster
      const existingDetails = await tx
        .select({ saleDetailsId: salesDetailsModel.saleDetailsId })
        .from(salesDetailsModel)
        .where(eq(salesDetailsModel.saleMasterId, saleMasterId))

      const existingIds = existingDetails.map((d) => d.saleDetailsId)

      // Separate update vs insert lists
      const toUpdate = detailsData.filter((d) => d.saleDetailsId)
      const toInsert = detailsData.filter((d) => !d.saleDetailsId)

      // 🧩 Update existing records
      for (const detail of toUpdate) {
        await tx
          .update(salesDetailsModel)
          .set({
            itemId: detail.itemId,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            amount: detail.amount,
            updatedAt: new Date(),
            updatedBy: masterData.updatedBy,
          })
          .where(eq(salesDetailsModel.saleDetailsId, detail.saleDetailsId!))
      }

      // 🧩 Insert new records
      if (toInsert.length > 0) {
        if (!masterData.updatedBy) throw new Error('updatedBy is required')
        await tx.insert(salesDetailsModel).values(
          toInsert.map((d) => ({
            saleMasterId,
            itemId: d.itemId!,
            quantity: d.quantity!,
            unitPrice: d.unitPrice!,
            amount: d.amount!,
            createdAt: new Date(),
            createdBy: masterData.updatedBy!,
          }))
        )
      }

      // 🧩 Delete old details that are not in the request anymore
      const requestIds = toUpdate
        .map((d) => d.saleDetailsId)
        .filter((id): id is number => !!id)

      if (existingIds.length > 0) {
        const toDelete = existingIds.filter((id) => !requestIds.includes(id))
        if (toDelete.length > 0) {
          await tx
            .delete(salesDetailsModel)
            .where(inArray(salesDetailsModel.saleDetailsId, toDelete))
        }
      }
    }

    // ✅ 3️⃣ Return updated sale with all joined data
    return await getSaleById(saleMasterId)
  })
}
