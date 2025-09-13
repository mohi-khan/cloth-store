import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { expenseModel, NewExpense } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createExpense = async (
  expenseData: Omit<NewExpense, 'itemId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newItem] = await db.insert(expenseModel).values({
      ...expenseData,
      createdAt: new Date(),
    })

    return newItem
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllExpenses = async () => {
  return await db.select().from(expenseModel)
}

// Get By Id
export const getExpenseById = async (expenseId: number) => {
  const item = await db
    .select()
    .from(expenseModel)
    .where(eq(expenseModel.expenseId, expenseId))
    .limit(1)

  if (!item.length) {
    throw BadRequestError('Expense not found')
  }

  return item[0]
}

// Update
export const editExpense = async (
  expenseId: number,
  expenseData: Partial<NewExpense>
) => {
  const [updatedItem] = await db
    .update(expenseModel)
    .set(expenseData)
    .where(eq(expenseModel.expenseId, expenseId))

  if (!updatedItem) {
    throw BadRequestError('Expense not found')
  }

  return updatedItem
}
