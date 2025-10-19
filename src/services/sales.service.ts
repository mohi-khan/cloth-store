import { eq, inArray } from "drizzle-orm"
import { db } from "../config/database"
import { salesMasterModel, salesDetailsModel, storeTransactionModel } from "../schemas"
import { BadRequestError } from "./utils/errors.utils"

// Create Sale (Master + Details)
export const createSale = async (data: {
  salesMaster: Omit<
    typeof salesMasterModel.$inferInsert,
    'saleMasterId' | 'updatedAt' | 'updatedBy' | 'createdAt'
  >;
  saleDetails: Array<
    Omit<
      typeof salesDetailsModel.$inferInsert,
      'saleDetailsId' | 'saleMasterId' | 'createdAt' | 'updatedAt' | 'updatedBy'
    >
  >;
}) => {
  const trx = await db.transaction(async (tx) => {
    try {
      const { salesMaster, saleDetails } = data;

      // 1️⃣ Insert into sales_master table
      const [newSaleMaster] = await tx
        .insert(salesMasterModel)
        .values({
          ...salesMaster,
          createdAt: new Date(),
        })
        .$returningId(); // returns inserted { saleMasterId }

      const saleMasterId = newSaleMaster.saleMasterId;

      // 2️⃣ Loop through each item in saleDetails
      for (const item of saleDetails) {
        // Insert into sales_details table
        await tx.insert(salesDetailsModel).values({
          saleMasterId,
          itemId: item.itemId,
          quantity: item.quantity,
          amount: item.amount,
          unitPrice: item.unitPrice,
          createdBy: salesMaster.createdBy,
          createdAt: new Date(),
        });

        // 3️⃣ Insert into store_transaction (with negative quantity)
        await tx.insert(storeTransactionModel).values({
          itemId: item.itemId,
          quantity: String(`-${item.quantity}`),
          transactionDate: salesMaster.saleDate,
          reference: String(saleMasterId),
          referenceType: 'sales',
          createdBy: salesMaster.createdBy,
          createdAt: new Date(),
        });
      }

      // ✅ Return inserted master ID for reference
      return { saleMasterId };
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  });

  return trx;
};

// Get Sale by ID (with details)
export const getSaleById = async (saleMasterId: number) => {
  const master = await db
    .select()
    .from(salesMasterModel)
    .where(eq(salesMasterModel.saleMasterId, saleMasterId))
    .limit(1)

  if (!master.length) throw BadRequestError("Sale not found")

  const details = await db
    .select()
    .from(salesDetailsModel)
    .where(eq(salesDetailsModel.saleMasterId, saleMasterId))

  return { ...master[0], details }
}

// Get All Sales (with details)
export const getAllSales = async () => {
    const masters = await db.select().from(salesMasterModel)
  
    if (masters.length === 0) return []
  
    const saleIds = masters.map((m) => m.saleMasterId)
  
    const details = await db
      .select()
      .from(salesDetailsModel)
      .where(inArray(salesDetailsModel.saleMasterId, saleIds))
  
    const grouped = masters.map((m) => ({
      ...m,
      details: details.filter((d) => d.saleMasterId === m.saleMasterId),
    }))
  
    return grouped
  }
// Update Sale (Master + Details)
export const editSale = async (
  saleMasterId: number,
  masterData: Partial<typeof salesMasterModel.$inferInsert>,
  detailsData?: Omit<typeof salesDetailsModel.$inferInsert, "saleItemId" | "saleMasterId">[]
) => {
  return await db.transaction(async (tx) => {
    // Update master
    await tx
      .update(salesMasterModel)
      .set({ ...masterData, updatedAt: new Date() })
      .where(eq(salesMasterModel.saleMasterId, saleMasterId))

    if (detailsData) {
      // Clear old details
      await tx.delete(salesDetailsModel).where(eq(salesDetailsModel.saleMasterId, saleMasterId))

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
