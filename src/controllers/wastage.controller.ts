import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { wastageModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createWastage,
  editWastage,
  getAllWastages,
  getWastageById,
} from '../services/wastage.service'
import { z } from 'zod'

const dateStringToDate = z.preprocess(
  (arg) =>
    typeof arg === 'string' || arg instanceof Date ? new Date(arg) : undefined,
  z.date()
)

// Schema validation
const createWastageSchema = createInsertSchema(wastageModel).omit({
  wastageId: true,
  createdAt: true,
}).extend({
  wastageDate: dateStringToDate
})

const editWastageSchema = createWastageSchema.partial()

export const createWastageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_wastage')
    const wastageData = createWastageSchema.parse(req.body)
    const wastage = await createWastage(wastageData)

    res.status(201).json({
      status: 'success',
      data: wastage,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllWastagesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_wastage')
    const wastages = await getAllWastages()

    res.status(200).json(wastages)
  } catch (error) {
    next(error)
  }
}

export const getWastageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_wastage')
    const id = Number(req.params.id)
    const wastage = await getWastageById(id)

    res.status(200).json(wastage)
  } catch (error) {
    next(error)
  }
}

export const editWastageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_wastage')
    const id = Number(req.params.id)
    const wastageData = editWastageSchema.parse(req.body)
    const wastage = await editWastage(id, wastageData)

    res.status(200).json(wastage)
  } catch (error) {
    next(error)
  }
}