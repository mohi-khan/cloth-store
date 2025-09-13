import { eq, inArray } from "drizzle-orm"
import { db } from "../config/database"
import { salesMasterModel, salesDetailsModel } from "../schemas"
import { BadRequestError } from "./utils/errors.utils"

// Create Sale (Master + Details)
export const createSale = async (
  masterData: Omit<typeof salesMasterModel.$inferInsert, "saleId" | "updatedAt" | "updatedBy">,
  detailsData: Omit<typeof salesDetailsModel.$inferInsert, "saleItemId" | "saleId" | "updatedAt" | "updatedBy">[]
) => {
  return await db.transaction(async (tx) => {
    // Insert into Master
    const [newSale] = await tx.insert(salesMasterModel).values({
      ...masterData,
      createdAt: new Date(),
    })

    if (!newSale?.insertId) throw BadRequestError("Failed to create sale master record")

    const saleId = Number(newSale.insertId)

    // Insert Sale Items
    await tx.insert(salesDetailsModel).values(
      detailsData.map((d) => ({
        ...d,
        saleId,
        createdAt: new Date(),
      }))
    )

    return { saleId, ...masterData, details: detailsData }
  })
}

// Get Sale by ID (with details)
export const getSaleById = async (saleId: number) => {
  const master = await db
    .select()
    .from(salesMasterModel)
    .where(eq(salesMasterModel.saleId, saleId))
    .limit(1)

  if (!master.length) throw BadRequestError("Sale not found")

  const details = await db
    .select()
    .from(salesDetailsModel)
    .where(eq(salesDetailsModel.saleId, saleId))

  return { ...master[0], details }
}

// Get All Sales (with details)
export const getAllSales = async () => {
    const masters = await db.select().from(salesMasterModel)
  
    if (masters.length === 0) return []
  
    const saleIds = masters.map((m) => m.saleId)
  
    const details = await db
      .select()
      .from(salesDetailsModel)
      .where(inArray(salesDetailsModel.saleId, saleIds))
  
    const grouped = masters.map((m) => ({
      ...m,
      details: details.filter((d) => d.saleId === m.saleId),
    }))
  
    return grouped
  }
// Update Sale (Master + Details)
export const editSale = async (
  saleId: number,
  masterData: Partial<typeof salesMasterModel.$inferInsert>,
  detailsData?: Omit<typeof salesDetailsModel.$inferInsert, "saleItemId" | "saleId">[]
) => {
  return await db.transaction(async (tx) => {
    // Update master
    await tx
      .update(salesMasterModel)
      .set({ ...masterData, updatedAt: new Date() })
      .where(eq(salesMasterModel.saleId, saleId))

    if (detailsData) {
      // Clear old details
      await tx.delete(salesDetailsModel).where(eq(salesDetailsModel.saleId, saleId))

      // Insert new details
      await tx.insert(salesDetailsModel).values(
        detailsData.map((d) => ({
          ...d,
          saleId,
          createdAt: new Date(),
        }))
      )
    }

    return await getSaleById(saleId)
  })
}
