import { Router } from "express";
import authRoutes from "./auth.routes";
import itemRoutes from "./item.routes"
import customerRoutes from "./customer.routes"
import vendorRoutes from "./vendor.routes"
import bankAccountRoutes from "./bankAccount.routes"
import expenseRoutes from "./expense.routes"
import salesRoutes from "./sales.routes"
import purchaseRoutes from "./purchase.routes"
import sortingRoutes from "./sorting.routes"

const router=Router()

router.use('/auth',authRoutes)
router.use('/item',itemRoutes)
router.use('/customer',customerRoutes)
router.use('/vendor',vendorRoutes)
router.use('/bank-account',bankAccountRoutes)
router.use('/expense', expenseRoutes)
router.use('/sales', salesRoutes)
router.use('/purchase', purchaseRoutes)
router.use('/sorting', sortingRoutes)

export default router;