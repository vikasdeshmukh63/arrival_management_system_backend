import { NextFunction, Request, Response } from 'express'
import { EArrivalStatus } from '../constants/application'
import database from '../models/index'
import httpError from '../utils/httpError'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'

export default {
    // Get arrival statistics
    getArrivalStats: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const totalArrivals = await database.Arrival.count()
            
            const upcomingArrivals = await database.Arrival.count({
                where: { status: EArrivalStatus.UPCOMING }
            })
            
            const inProgressArrivals = await database.Arrival.count({
                where: { status: EArrivalStatus.IN_PROGRESS }
            })
            
            const finishedArrivals = await database.Arrival.count({
                where: { status: EArrivalStatus.FINISHED }
            })
            
            const discrepancyArrivals = await database.Arrival.count({
                where: { status: EArrivalStatus.COMPLETED_WITH_DISCREPANCY }
            })

            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                total: totalArrivals,
                upcoming: upcomingArrivals,
                in_progress: inProgressArrivals,
                finished: finishedArrivals,
                with_discrepancy: discrepancyArrivals
            })
        } catch (error) {
            return httpError(next, error instanceof Error ? error : new Error('Unknown error occurred'), req)
        }
    },

    // Get entity counts
    getEntityCounts: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const [
                brandCount,
                categoryCount,
                colorCount,
                conditionCount,
                productCount,
                sizeCount,
                styleCount,
                supplierCount
            ] = await Promise.all([
                database.Brand.count(),
                database.Category.count(),
                database.Color.count(),
                database.Condition.count(),
                database.Product.count(),
                database.Size.count(),
                database.Style.count(),
                database.Supplier.count()
            ])

            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                brands: brandCount,
                categories: categoryCount,
                colors: colorCount,
                conditions: conditionCount,
                products: productCount,
                sizes: sizeCount,
                styles: styleCount,
                suppliers: supplierCount
            })
        } catch (error) {
            return httpError(next, error instanceof Error ? error : new Error('Unknown error occurred'), req)
        }
    }
} 