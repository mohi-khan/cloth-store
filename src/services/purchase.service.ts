import { eq, inArray } from "drizzle-orm"
import { db } from "../config/database"
import { purchaseMasterModel, purchaseDetailsModel } from "../schemas"
import { BadRequestError } from "./utils/errors.utils"

// Create Purchase (Master + Details)
export const createPurchase = async (
  masterData: Omit<typeof purchaseMasterModel.$inferInsert, "purchaseId" | "updatedAt" | "updatedBy">,
  detailsData: Omit<typeof purchaseDetailsModel.$inferInsert, "purchaseItemId" | "purchaseId" | "updatedAt" | "updatedBy">[]
) => {
  return await db.transaction(async (tx) => {
    // Insert into Master
    const [newPurchase] = await tx.insert(purchaseMasterModel).values({
      ...masterData,
      createdAt: new Date(),
    })

    if (!newPurchase?.insertId) throw BadRequestError("Failed to create purchase master record")

    const purchaseId = Number(newPurchase.insertId)

    // Insert Purchase Items
    await tx.insert(purchaseDetailsModel).values(
      detailsData.map((d) => ({
        ...d,
        purchaseId,
        createdAt: new Date(),
      }))
    )

    return { purchaseId, ...masterData, details: detailsData }
  })
}

// Get Purchase by ID (with details)
export const getPurchaseById = async (purchaseId: number) => {
  const master = await db
    .select()
    .from(purchaseMasterModel)
    .where(eq(purchaseMasterModel.purchaseId, purchaseId))
    .limit(1)

  if (!master.length) throw BadRequestError("Purchase not found")

  const details = await db
    .select()
    .from(purchaseDetailsModel)
    .where(eq(purchaseDetailsModel.purchaseId, purchaseId))

  return { ...master[0], details }
}

// Get All Purchase (with details)
export const getAllPurchase = async () => {
    const masters = await db.select().from(purchaseMasterModel)
  
    if (masters.length === 0) return []
  
    const purchaseIds = masters.map((m) => m.purchaseId)
  
    const details = await db
      .select()
      .from(purchaseDetailsModel)
      .where(inArray(purchaseDetailsModel.purchaseId, purchaseIds))
  
    const grouped = masters.map((m) => ({
      ...m,
      details: details.filter((d) => d.purchaseId === m.purchaseId),
    }))
  
    return grouped
  }
// Update Purchase (Master + Details)
export const editPurchase = async (
  purchaseId: number,
  masterData: Partial<typeof purchaseMasterModel.$inferInsert>,
  detailsData?: Omit<typeof purchaseDetailsModel.$inferInsert, "purchaseItemId" | "purchaseId">[]
) => {
  return await db.transaction(async (tx) => {
    // Update master
    await tx
      .update(purchaseMasterModel)
      .set({ ...masterData, updatedAt: new Date() })
      .where(eq(purchaseMasterModel.purchaseId, purchaseId))

    if (detailsData) {
      // Clear old details
      await tx.delete(purchaseDetailsModel).where(eq(purchaseDetailsModel.purchaseId, purchaseId))

      // Insert new details
      await tx.insert(purchaseDetailsModel).values(
        detailsData.map((d) => ({
          ...d,
          purchaseId,
          createdAt: new Date(),
        }))
      )
    }

    return await getPurchaseById(purchaseId)
  })
}
