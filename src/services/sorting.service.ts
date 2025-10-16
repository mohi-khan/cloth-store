import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  sortingModel,
  NewSorting,
  storeTransactionModel,
  itemModel,
  vendorModel,
  bankAccountModel,
  purchaseModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createSorting = async (
  purchaseId: number,
  sortingDataArray: Omit<
    typeof sortingModel.$inferInsert,
    'sortingId' | 'updatedAt' | 'updatedBy'
  >[]
) => {
  const trx = await db.transaction(async (tx) => {
    try {
      // 1️⃣ Get purchase record
      const purchase = await tx.query.purchaseModel.findFirst({
        where: eq(purchaseModel.purchaseId, purchaseId),
      })

      if (!purchase) {
        throw new Error(`Purchase with ID ${purchaseId} not found`)
      }

      // 2️⃣ Mark purchase as sorted
      await tx
        .update(purchaseModel)
        .set({ isSorted: true, updatedAt: new Date() })
        .where(eq(purchaseModel.purchaseId, purchaseId))

      // 3️⃣ Create a negative transaction for the purchase (since it’s now sorted)
      await tx.insert(storeTransactionModel).values({
        itemId: purchase.itemId,
        quantity: String(`-${purchase.totalQuantity}`),
        transactionDate: purchase.purchaseDate,
        reference: String(purchase.purchaseId),
        referenceType: 'purchase',
        createdBy: purchase.createdBy,
        createdAt: new Date(),
      })

      // 4️⃣ Loop over sorting data (each item)
      for (const sortingData of sortingDataArray) {
        // Insert into sortingModel
        const [newSorting] = await tx
          .insert(sortingModel)
          .values({
            ...sortingData,
            createdAt: new Date(),
          })
          .$returningId()

        // Insert corresponding transaction (+quantity)
        await tx.insert(storeTransactionModel).values({
          itemId: sortingData.itemId,
          quantity: String(`+${sortingData.totalQuantity}`),
          transactionDate: sortingData.sortingDate,
          reference: String(newSorting.sortingId ?? ''),
          referenceType: 'sorting',
          createdBy: sortingData.createdBy,
          createdAt: new Date(),
        })
      }

      return { message: 'Sorting created successfully' }
    } catch (error) {
      console.error('Sorting transaction failed:', error)
      throw error
    }
  })

  return trx
}

// Get All
export const getAllSortings = async () => {
  const sortings = await db
    .select({
      sortingId: sortingModel.sortingId,
      itemId: sortingModel.itemId,
      totalQuantity: sortingModel.totalQuantity,
      notes: sortingModel.notes,
      vendorId: sortingModel.vendorId,
      paymentType: sortingModel.paymentType,
      bankAccountId: sortingModel.bankAccountId,
      sortingDate: sortingModel.sortingDate,
      createdBy: sortingModel.createdBy,
      createdAt: sortingModel.createdAt,
      updatedBy: sortingModel.updatedBy,
      updatedAt: sortingModel.updatedAt,
      purchaseId: sortingModel.purchaseId,
      // extra fields from joins
      itemName: itemModel.itemName,
      vendorName: vendorModel.name,
      bankName: bankAccountModel.bankName,
      branch: bankAccountModel.branch,
      accountNumber: bankAccountModel.accountNumber,
    })
    .from(sortingModel)
    .innerJoin(itemModel, eq(sortingModel.itemId, itemModel.itemId))
    .innerJoin(vendorModel, eq(sortingModel.vendorId, vendorModel.vendorId))
    .leftJoin(
      bankAccountModel,
      eq(sortingModel.bankAccountId, bankAccountModel.bankAccountId)
    ) // bankAccount can be null
    .execute()

  return sortings
}

// Get By Id
export const getSortingById = async (sortingId: number) => {
  const item = await db
    .select()
    .from(sortingModel)
    .where(eq(sortingModel.sortingId, sortingId))
    .limit(1)

  if (!item.length) {
    throw BadRequestError('Sorting not found')
  }

  return item[0]
}

// Update
export const editSorting = async (
  sortingDataArray: (Partial<typeof sortingModel.$inferInsert> & {
    sortingId?: number
  })[]
) => {
  if (!Array.isArray(sortingDataArray) || sortingDataArray.length === 0) {
    throw BadRequestError("No sorting data provided")
  }

  const trx = await db.transaction(async (tx) => {
    const processedRecords = []

    for (const sortingData of sortingDataArray) {
      const { sortingId, ...fields } = sortingData

      if (sortingId) {
        // --- Update existing record ---
        const [updatedItem] = await tx
          .update(sortingModel)
          .set({
            ...fields,
            updatedAt: new Date(),
          })
          .where(eq(sortingModel.sortingId, sortingId))
          .execute()

        if (!updatedItem) {
          throw BadRequestError(`Sorting record with ID ${sortingId} not found`)
        }

        processedRecords.push({ ...updatedItem, action: "updated" })
      } else {
        // --- Insert new record ---
        // Required fields for insert
        const requiredFields = [
          "itemId",
          "totalQuantity",
          "vendorId",
          "paymentType",
          "sortingDate",
          "createdBy",
          "purchaseId",
        ] as const

        for (const field of requiredFields) {
          if (fields[field] == null) {
            throw BadRequestError(`Missing required field: ${field}`)
          }
        }

        const [newItem] = await tx
          .insert(sortingModel)
          .values({
            ...(fields as typeof sortingModel.$inferInsert),
            createdAt: new Date(),
            updatedAt: new Date(),
          } satisfies typeof sortingModel.$inferInsert)
          .execute()

        processedRecords.push({ ...newItem, action: "created" })
      }
    }

    return processedRecords
  })

  return trx
}


