import { and, eq, gte, lte } from 'drizzle-orm'
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

      const item = await tx.query.itemModel.findFirst({
        where: eq(itemModel.itemId, purchase.itemId),
      })

      if (!item) {
        throw new Error(`Purchase with ID ${purchaseId} not found`)
      }

      // const itemData = await db
      //   .select()
      //   .from(itemModel)
      //   .where(eq(itemModel.itemId, purchase.itemId))
      //   .limit(1)

      // if (!itemData.length) {
      //   throw BadRequestError('Sorting not found')
      // }

      // 2️⃣ Mark purchase as sorted
      await tx
        .update(purchaseModel)
        .set({ isSorted: true, updatedAt: new Date() })
        .where(eq(purchaseModel.purchaseId, purchaseId))

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

        // Insert corresponding transaction (-quantity) for the purchased item
        await tx.insert(storeTransactionModel).values({
          itemId: purchase.itemId,
          quantity: String(`-${sortingData.totalQuantity}`),
          price: item.avgPrice || 0, 
          transactionDate: sortingData.sortingDate,
          reference: String(purchase.purchaseId),
          referenceType: 'purchase',
          createdBy: purchase.createdBy,
          createdAt: new Date(),
        })

        // Insert corresponding transaction (+quantity)
        await tx.insert(storeTransactionModel).values({
          itemId: sortingData.itemId,
          quantity: String(`+${sortingData.totalQuantity}`),
          price: item.avgPrice || 0,
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
  // Get current and previous year
  const currentYear = new Date().getFullYear()
  const previousYear = currentYear - 1

  // Define start and end dates (Jan 1 of previous year → Dec 31 of current year)
  const startDate = new Date(`${previousYear}-01-01T00:00:00.000Z`)
  const endDate = new Date(`${currentYear}-12-31T23:59:59.999Z`)

  // Fetch only records created within this range
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
    )
    .where(
      and(
        gte(sortingModel.createdAt, startDate),
        lte(sortingModel.createdAt, endDate)
      )
    )
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
    throw BadRequestError('No sorting data provided')
  }

  // const itemData = await db
  //   .select()
  //   .from(itemModel)
  //   .where(eq(itemModel.itemId, sortingDataArray[0].itemId!))
  //   .limit(1)

  // if (!itemData.length) {
  //   throw BadRequestError('Sorting not found')
  // }

  const trx = await db.transaction(async (tx) => {
    interface ProcessedRecord {
      action: 'updated' | 'created';
      sortingId: number;
      [key: string]: any; // for additional fields from sorting model
    }
    
    const processedRecords: ProcessedRecord[] = [];

    for (const sortingData of sortingDataArray) {
      const { sortingId, ...fields } = sortingData

      if (!sortingData.itemId) {
        throw new Error('Item ID is required')
      }

      const item = await tx.query.itemModel.findFirst({
        where: eq(itemModel.itemId, sortingData.itemId),
      })

      if (!item) {
        throw new Error(`sorting with ID ${sortingData.itemId} not found`)
      }

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

        processedRecords.push({ ...updatedItem, sortingId, action: 'updated' })
      } else {
        // --- Insert new record ---
        const requiredFields = [
          'itemId',
          'totalQuantity',
          'vendorId',
          'paymentType',
          'sortingDate',
          'createdBy',
          'purchaseId',
        ] as const

        for (const field of requiredFields) {
          if (fields[field] == null) {
            throw BadRequestError(`Missing required field: ${field}`)
          }
        }

        // Insert new sorting record
        const [newSorting] = await tx
          .insert(sortingModel)
          .values({
            ...(fields as typeof sortingModel.$inferInsert),
            createdAt: new Date(),
            updatedAt: new Date(),
          } satisfies typeof sortingModel.$inferInsert)
          .execute()

        processedRecords.push({ ...newSorting, sortingId: newSorting.insertId, action: 'created' })

        // Insert corresponding store transaction
        await tx.insert(storeTransactionModel).values({
          itemId: fields.itemId!,
          quantity: `+${fields.totalQuantity}`,
          price: item.avgPrice || 0,
          transactionDate: fields.sortingDate!,
          // reference: String(newSorting.sortingId ?? ''),
          referenceType: 'sorting',
          createdBy: fields.createdBy!,
          createdAt: new Date(),
        } satisfies typeof storeTransactionModel.$inferInsert)
      }
    }

    return processedRecords
  })

  return trx
}

export const deleteSortingService = async (id: number, userId: number) => {
  return await db.transaction(async (tx) => {
    // 1️⃣ Fetch sorting record
    const [sortingData] = await tx
      .select()
      .from(sortingModel)
      .where(eq(sortingModel.sortingId, id))

    if (!sortingData) {
      throw new Error('Sorting record not found')
    }

    const [itemData] = await tx
      .select()
      .from(itemModel)
      .where(eq(itemModel.itemId, id))

    if (!itemData) {
      throw new Error('item record not found')
    }

    // 2️⃣ Insert negative entry into store_transaction
    await tx.insert(storeTransactionModel).values({
      itemId: sortingData.itemId,
      quantity: String(`-${sortingData.totalQuantity}`),
      price: itemData.avgPrice || 0,
      transactionDate: sortingData.sortingDate,
      reference: String(sortingData.sortingId),
      referenceType: 'sorting',
      createdBy: userId,
      createdAt: new Date(),
    })

    // 3️⃣ Delete sorting record
    await tx.delete(sortingModel).where(eq(sortingModel.sortingId, id))

    return {
      success: true,
      message: `Sorting ID ${id} deleted successfully.`,
    }
  })
}
