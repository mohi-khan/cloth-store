import { Router } from "express";
import authRoutes from "./auth.routes";
import clothItemRoutes from "./clothItem.routes"
import customerRoutes from "./customer.routes"
import vendorRoutes from "./vendor.routes"
import bankAccountRoutes from "./bankAccount.routes"

const router=Router()

router.use('/auth',authRoutes)
router.use('/cloth-item',clothItemRoutes)
router.use('/customer',customerRoutes)
router.use('/vendor',vendorRoutes)
router.use('/bank-account',bankAccountRoutes)

export default router;