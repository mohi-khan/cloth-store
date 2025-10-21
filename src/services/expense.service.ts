import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { accountHeadModel, bankAccountModel, expenseModel, NewExpense, vendorModel } from '../schemas'
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
    console.log("🚀 ~ createExpense ~ expenseData:", expenseData)

    return newItem
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllExpenses = async () => {
  return await db
    .select({
      expenseId: expenseModel.expenseId,
      accountHeadId: expenseModel.accountHeadId,
      accountHeadName: accountHeadModel.name,
      vendorId: expenseModel.accountHeadId,
      vendorName: vendorModel.name,
      amount: expenseModel.amount,
      expenseDate: expenseModel.expenseDate,
      remarks: expenseModel.remarks,
      paymentType: expenseModel.paymentType,
      bankAccountId: expenseModel.bankAccountId,
      bankName: bankAccountModel.bankName,
      branch: bankAccountModel.branch,
      accountNumber: bankAccountModel.accountNumber,
      createdBy: expenseModel.createdBy,
      createdAt: expenseModel.createdAt,
      updatedBy: expenseModel.updatedBy,
      updatedAt: expenseModel.updatedAt,
    })
    .from(expenseModel)
    .innerJoin(
      accountHeadModel,
      eq(expenseModel.accountHeadId, accountHeadModel.accountHeadId)
    )
    .leftJoin(
      vendorModel,
      eq(expenseModel.vendorId, vendorModel.vendorId)
    )
    .leftJoin(
      bankAccountModel,
      eq(expenseModel.bankAccountId, bankAccountModel.bankAccountId)
    );
};

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
