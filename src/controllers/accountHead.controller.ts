import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { accountHeadModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createAccountHead,
  editAccountHead,
  getAllAccountHeads,
  getAccountHeadById,
} from '../services/accountHead.service'

// Schema validation
const createAccountHeadSchema = createInsertSchema(accountHeadModel).omit({
  accountHeadId: true,
  createdAt: true,
})

const editAccountHeadSchema = createAccountHeadSchema.partial()

export const createAccountHeadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_account_head')
    const accountHeadData = createAccountHeadSchema.parse(req.body)
    const accountHead = await createAccountHead(accountHeadData)

    res.status(201).json({
      status: 'success',
      data: accountHead,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllAccountHeadsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_account_head')
    const accountHeads = await getAllAccountHeads()

    res.status(200).json(accountHeads)
  } catch (error) {
    next(error)
  }
}

export const getAccountHeadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_account_head')
    const id = Number(req.params.id)
    const accountHead = await getAccountHeadById(id)

    res.status(200).json(accountHead)
  } catch (error) {
    next(error)
  }
}

export const editAccountHeadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_account_head')
    const id = Number(req.params.id)
    const accountHeadData = editAccountHeadSchema.parse(req.body)
    const accountHead = await editAccountHead(id, accountHeadData)

    res.status(200).json(accountHead)
  } catch (error) {
    next(error)
  }
}
