import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  openingBalanceModel,
  NewOpeningBalance,
  bankAccountModel,
  salesTransactionModel,
  customerModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'
import { MySqlTableWithColumns, MySqlColumn } from 'drizzle-orm/mysql-core'

// Create
export const createOpeningBalance = async (
  openingBalanceData: Omit<
    NewOpeningBalance,
    'itemId' | 'updatedAt' | 'updatedBy'
  >
) => {
  try {
    const [newItem] = await db.insert(openingBalanceModel).values({
      ...openingBalanceData,
      createdAt: new Date(),
    })

    // await db.insert(salesTransactionModel).values({
    //   saleMasterId: null,
    //   customerId: openingBalanceData.customerId,
    //   amount: String(
    //     `${openingBalanceData.type === 'debit' ? '+' : '-'}${openingBalanceData.openingAmount}`
    //   ),
    //   transactionDate: new Date(),
    //   referenceType: 'opening balance',
    //   createdBy: openingBalanceData.createdBy,
    //   createdAt: new Date(),
    // })

    return newItem
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllOpeningBalances = async () => {
  const result = await db
    .select({
      openingBalanceId: openingBalanceModel.openingBalanceId,
      openingAmount: openingBalanceModel.openingAmount,
      isParty: openingBalanceModel.isParty,
      customerId: openingBalanceModel.customerId,
      bankAccountId: openingBalanceModel.bankAccountId,
      type: openingBalanceModel.type,
      createdBy: openingBalanceModel.createdBy,
      createdAt: openingBalanceModel.createdAt,
      updatedBy: openingBalanceModel.updatedBy,
      updatedAt: openingBalanceModel.updatedAt,

      // Joined fields
      customerName: customerModel.name,
      bankName: bankAccountModel.bankName,
      branch: bankAccountModel.branch,
      accountNumber: bankAccountModel.accountNumber,
    })
    .from(openingBalanceModel)
    .leftJoin(
      customerModel,
      eq(openingBalanceModel.customerId, customerModel.customerId)
    )
    .leftJoin(
      bankAccountModel,
      eq(openingBalanceModel.bankAccountId, bankAccountModel.bankAccountId)
    )

  return result
}

// Get By Id
export const getOpeningBalanceById = async (openingBalanceId: number) => {
  const item = await db
    .select()
    .from(openingBalanceModel)
    .where(eq(openingBalanceModel.openingBalanceId, openingBalanceId))
    .limit(1)

  if (!item.length) {
    throw BadRequestError('OpeningBalance not found')
  }

  return item[0]
}

// Update
export const editOpeningBalance = async (
  openingBalanceId: number,
  openingBalanceData: Partial<NewOpeningBalance>
) => {
  const [updatedItem] = await db
    .update(openingBalanceModel)
    .set(openingBalanceData)
    .where(eq(openingBalanceModel.openingBalanceId, openingBalanceId))

  if (!updatedItem) {
    throw BadRequestError('OpeningBalance not found')
  }

  return updatedItem
}
