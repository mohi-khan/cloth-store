import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { vendorModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createVendor,
  editVendor,
  getAllVendors,
  getVendorById,
} from '../services/vendor.service'

// Schema validation
const createVendorSchema = createInsertSchema(vendorModel).omit({
  vendorId: true,
  createdAt: true,
})

const editVendorSchema = createVendorSchema.partial()

export const createVendorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_vendor')
    const vendorData = createVendorSchema.parse(req.body)
    const item = await createVendor(vendorData)

    res.status(201).json({
      status: 'success',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllVendorsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_vendor')
    const items = await getAllVendors()

    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getVendorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_vendor')
    const id = Number(req.params.id)
    const item = await getVendorById(id)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const editVendorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_vendor')
    const id = Number(req.params.id)
    const vendorData = editVendorSchema.parse(req.body)
    const item = await editVendor(id, vendorData)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}
