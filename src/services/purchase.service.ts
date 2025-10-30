import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { purchaseModel, NewPurchase, storeTransactionModel, itemModel, vendorModel, bankAccountModel } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createPurchase = async (
  purchaseData: Omit<typeof purchaseModel.$inferInsert, 'purchaseId' | 'updatedAt' | 'updatedBy'>
) => {
  const trx = await db.transaction(async (tx) => {
    try {
      // 1️⃣ Insert into purchase table
      const [newPurchase] = await tx
        .insert(purchaseModel)
        .values({
          ...purchaseData,
          createdAt: new Date(),
        })
        .$returningId(); // returns inserted id (purchaseId)

        const itemData = await tx.query.itemModel.findFirst({
          where: eq(itemModel.itemId, purchaseData.itemId),
        })

        if (!itemData) {
          throw new Error(`Item with ID ${purchaseData.itemId} not found`)
        }

      // 2️⃣ Insert related record into store_transaction table
      await tx.insert(storeTransactionModel).values({
        itemId: purchaseData.itemId,
        quantity: String(`+${purchaseData.totalQuantity}`),
        transactionDate: purchaseData.purchaseDate,
        reference: String(newPurchase.purchaseId ?? ''),
        referenceType: 'purchase',
        price: itemData.sellPriece,
        createdBy: purchaseData.createdBy,
        createdAt: new Date(),
      });

      // 3️⃣ Return both or just purchase data
      return newPurchase
    } catch (error) {
      throw error
    }
  });

  return trx;
}

// Get All
export const getAllPurchases = async () => {
  const purchases = await db
    .select({
      purchaseId: purchaseModel.purchaseId,
      itemId: purchaseModel.itemId,
      totalQuantity: purchaseModel.totalQuantity,
      notes: purchaseModel.notes,
      vendorId: purchaseModel.vendorId,
      paymentType: purchaseModel.paymentType,
      bankAccountId: purchaseModel.bankAccountId,
      purchaseDate: purchaseModel.purchaseDate,
      totalAmount: purchaseModel.totalAmount,
      isSorted: purchaseModel.isSorted,
      createdBy: purchaseModel.createdBy,
      createdAt: purchaseModel.createdAt,
      updatedBy: purchaseModel.updatedBy,
      updatedAt: purchaseModel.updatedAt,
      // extra fields from joins
      itemName: itemModel.itemName,
      vendorName: vendorModel.name,
      bankName: bankAccountModel.bankName,
      branch: bankAccountModel.branch,
      accountNumber: bankAccountModel.accountNumber,
    })
    .from(purchaseModel)
    .innerJoin(itemModel, eq(purchaseModel.itemId, itemModel.itemId))
    .innerJoin(vendorModel, eq(purchaseModel.vendorId, vendorModel.vendorId))
    .leftJoin(bankAccountModel, eq(purchaseModel.bankAccountId, bankAccountModel.bankAccountId)) // bankAccount can be null
    .execute()

  return purchases
}

// Get By Id
export const getPurchaseById = async (purchaseId: number) => {
  const item = await db
    .select()
    .from(purchaseModel)
    .where(eq(purchaseModel.purchaseId, purchaseId))
    .limit(1)

  if (!item.length) {
    throw BadRequestError('Purchase not found')
  }

  return item[0]
}

// Update
export const editPurchase = async (
  purchaseId: number,
  purchaseData: Partial<NewPurchase>
) => {
  const [updatedItem] = await db
    .update(purchaseModel)
    .set(purchaseData)
    .where(eq(purchaseModel.purchaseId, purchaseId))

  if (!updatedItem) {
    throw BadRequestError('Purchase not found')
  }

  return updatedItem
}
