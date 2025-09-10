import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { clothItemModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createClothItem,
  editClothItem,
  getAllClothItems,
  getClothItemById,
} from '../services/clothItem.service'

// Schema validation
const createClothItemSchema = createInsertSchema(clothItemModel).omit({
  itemId: true,
  createdAt: true,
})

const editClothItemSchema = createClothItemSchema.partial()

export const createClothItemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_cloth_item')
    const clothItemData = createClothItemSchema.parse(req.body)
    const item = await createClothItem(clothItemData)

    res.status(201).json({
      status: 'success',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllClothItemsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_cloth_item')
    const items = await getAllClothItems()

    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getClothItemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_cloth_item')
    const id = Number(req.params.id)
    const item = await getClothItemById(id)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const editClothItemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_cloth_item')
    const id = Number(req.params.id)
    const clothItemData = editClothItemSchema.parse(req.body)
    const item = await editClothItem(id, clothItemData)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}
