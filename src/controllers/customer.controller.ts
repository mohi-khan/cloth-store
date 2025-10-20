import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { customerModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createCustomer,
  editCustomer,
  getAllCustomers,
  getCustomerById,
} from '../services/customer.service'

// Schema validation
const createCustomerSchema = createInsertSchema(customerModel).omit({
  customerId: true,
  createdAt: true,
})

const editCustomerSchema = createCustomerSchema.partial()

export const createCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'create_customer')
    const customerData = createCustomerSchema.parse(req.body)
    const item = await createCustomer(customerData)

    res.status(201).json({
      status: 'success',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllCustomersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_customer')
    const items = await getAllCustomers()

    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_customer')
    const id = Number(req.params.id)
    const item = await getCustomerById(id)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const editCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'edit_customer')
    const id = Number(req.params.id)
    const customerData = editCustomerSchema.parse(req.body)
    const item = await editCustomer(id, customerData)

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}
