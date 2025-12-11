import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { sortingModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import { z } from 'zod'
import {
  createSorting,
  deleteSortingService,
  editSorting,
  getAllSortings,
  getSortingById,
} from '../services/sorting.service'

const dateStringToDate = z.preprocess(
  (arg) =>
    typeof arg === 'string' || arg instanceof Date ? new Date(arg) : undefined,
  z.date()
)

// Schema validation
const createSortingSchema = createInsertSchema(sortingModel)
  .omit({
    sortingId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    sortingDate: dateStringToDate,
  })

const editSortingSchema = createSortingSchema.partial()

export const createSortingController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_sorting')

    const purchaseId = Number(req.params.purchaseId)
    if (isNaN(purchaseId)) {
      throw new Error('Invalid purchase ID')
    }

    // Expecting an array of sorting items in req.body
    const sortingDataArray = createSortingSchema.array().parse(req.body)

    const result = await createSorting(purchaseId, sortingDataArray)

    res.status(201).json({
      status: 'success',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllSortingsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_sorting')
    const items = await getAllSortings()

    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getSortingController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_sorting')
    const id = Number(req.params.id)
    const item = await getSortingById(id)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const editSortingController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_sorting')
    const sortingDataArray = req.body;

    if (!Array.isArray(sortingDataArray)) {
      throw new Error("Request body must be an array of sorting records");
    }

    const result = await editSorting(sortingDataArray);

    res.status(200).json({
      status: "success",
      message: "Sorting records updated/created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSortingController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const userId = Number(req.params.userId) // Usually comes from auth middleware

    if (!id || isNaN(id)) {
      res.status(400).json({ error: 'Invalid sorting ID' })
    }

    if (!userId) {
      res.status(400).json({ error: 'Missing user ID' })
    }

    const result = await deleteSortingService(id, userId)
    res.status(200).json(result)
  } catch (error: any) {
    console.error('Error deleting sorting:', error)
    res.status(500).json({ error: error.message || 'Failed to delete sorting' })
  }
}