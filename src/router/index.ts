import express from 'express'
import arrivalRouter from '../router/arrival'
import healthRouter from '../router/health'
import brandRouter from '../router/brand'
import categoryRouter from '../router/category'
import colorRouter from '../router/color'
import conditionRouter from '../router/condition'
import sizeRouter from '../router/size'
import styleRouter from '../router/style'
import supplierRouter from '../router/supplier'
import productRouter from '../router/product'
import authRouter from '../router/auth'
import statisticsRouter from '../router/statistics'

const router = express.Router()

router.use('/api/arrivals', arrivalRouter)
router.use('/api/health', healthRouter)
router.use('/api/brands', brandRouter)
router.use('/api/categories', categoryRouter)
router.use('/api/colors', colorRouter)
router.use('/api/conditions', conditionRouter)
router.use('/api/sizes', sizeRouter)
router.use('/api/styles', styleRouter)
router.use('/api/suppliers', supplierRouter)
router.use('/api/products', productRouter)
router.use('/api/auth', authRouter)
router.use('/api/statistics', statisticsRouter)

export default router
