import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { itemModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createItem,
  editItem,
  getAllItems,
  getItemById,
  getItemTotalQuantity,
} from '../services/item.service'

// Schema validation
const createItemSchema = createInsertSchema(itemModel).omit({
  itemId: true,
  createdAt: true,
})

const editItemSchema = createItemSchema.partial()

export const createItemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'create_item')
    const itemData = createItemSchema.parse(req.body)
    const item = await createItem(itemData)

    res.status(201).json({
      status: 'success',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllItemsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_item')
    const items = await getAllItems()

    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getItemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_item')
    const id = Number(req.params.id)
    const item = await getItemById(id)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const editItemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'edit_item')
    const id = Number(req.params.id)
    const itemData = editItemSchema.parse(req.body)
    const item = await editItem(id, itemData)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const getItemQuantityController = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      res.status(400).json({ message: "itemId is required" });
    }

    const result = await getItemTotalQuantity(Number(itemId));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching item quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};