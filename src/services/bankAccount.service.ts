import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { bankAccountModel, NewBankAccount } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createBankAccount = async (
  bankAccountData: Omit<NewBankAccount, 'itemId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newItem] = await db.insert(bankAccountModel).values({
      ...bankAccountData,
      createdAt: new Date(),
    })

    return newItem
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllBankAccounts = async () => {
  return await db.select().from(bankAccountModel)
}

// Get By Id
export const getBankAccountById = async (bankAccountId: number) => {
  const item = await db
    .select()
    .from(bankAccountModel)
    .where(eq(bankAccountModel.bankAccountId, bankAccountId))
    .limit(1)

  if (!item.length) {
    throw BadRequestError('BankAccount not found')
  }

  return item[0]
}

// Update
export const editBankAccount = async (
  bankAccountId: number,
  bankAccountData: Partial<NewBankAccount>
) => {
  const [updatedItem] = await db
    .update(bankAccountModel)
    .set(bankAccountData)
    .where(eq(bankAccountModel.bankAccountId, bankAccountId))

  if (!updatedItem) {
    throw BadRequestError('BankAccount not found')
  }

  return updatedItem
}
