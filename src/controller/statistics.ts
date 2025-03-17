import { NextFunction, Request, Response } from 'express'
import { EArrivalStatus } from '../constants/application'
import database from '../models/index'
import httpError from '../utils/httpError'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'

export default {
    // ! get arrival statistics
    getArrivalStats: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // getting total arrivals
            const totalArrivals = await database.Arrival.count()

            // getting upcoming arrivals
            const upcomingArrivals = await database.Arrival.count({
                where: { status: EArrivalStatus.UPCOMING }
            })

            // getting in progress arrivals
            const inProgressArrivals = await database.Arrival.count({
                where: { status: EArrivalStatus.IN_PROGRESS }
            })

            // getting finished arrivals
            const finishedArrivals = await database.Arrival.count({
                where: { status: EArrivalStatus.FINISHED }
            })

            // getting discrepancy arrivals
            const discrepancyArrivals = await database.Arrival.count({
                where: { status: EArrivalStatus.COMPLETED_WITH_DISCREPANCY }
            })

            // return response
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

    // ! get entity counts
    getEntityCounts: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // getting count
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

            // return response
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
            // return error
            return httpError(next, error instanceof Error ? error : new Error('Unknown error occurred'), req)
        }
    }
} 