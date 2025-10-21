import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { accountHeadModel, NewAccountHead } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createAccountHead = async (
  accountHeadData: Omit<NewAccountHead, 'accountHeadId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newAccountHead] = await db.insert(accountHeadModel).values({
      ...accountHeadData,
      createdAt: new Date(),
    })

    return newAccountHead
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllAccountHeads = async () => {
  return await db.select().from(accountHeadModel)
}

// Get By Id
export const getAccountHeadById = async (accountHeadId: number) => {
  const accountHead = await db
    .select()
    .from(accountHeadModel)
    .where(eq(accountHeadModel.accountHeadId, accountHeadId))
    .limit(1)

  if (!accountHead.length) {
    throw BadRequestError('Cloth accountHead not found')
  }

  return accountHead[0]
}

// Update
export const editAccountHead = async (
  accountHeadId: number,
  accountHeadData: Partial<NewAccountHead>
) => {
  const [updatedAccountHead] = await db
    .update(accountHeadModel)
    .set(accountHeadData)
    .where(eq(accountHeadModel.accountHeadId, accountHeadId))

  if (!updatedAccountHead) {
    throw BadRequestError('Cloth accountHead not found')
  }

  return updatedAccountHead
}
