import { NextFunction, Request, Response } from 'express'
import { Model, Op, WhereOptions, Includeable } from 'sequelize'
import { EArrivalStatus } from '../constants/application'
import responseMessage from '../constants/responseMessage'
import database from '../models/index'
import {
    ArrivalAttributes,
    BoxDiscrepancy,
    CreateArrivalRequest,
    DeleteMultipleArrivalsRequest,
    DiscrepancyResponse,
    ProductDiscrepancy,
    ScanArrivalRequest,
    StartProcessingRequest,
    UpdateArrivalRequest
} from '../types/types'
import httpError from '../utils/httpError'
import httpResponse from '../utils/httpResponse'

export default {
    // ! get all arrivals with filters
    getAllArrivals: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // if order query is not provided, default to descending order
            const orderParam = req.query.order as string | undefined
            const orderDirection = orderParam?.toLowerCase() === 'desc' ? 'DESC' : 'ASC'
            // if search query is not provided, default to empty string
            const searchQuery = typeof req.query.search === 'string' ? req.query.search : ''
            const status = req.query.status as string | undefined
            const ne = req.query.ne === 'true'

            // search obj
            const where: WhereOptions = {}

            // if status is available then checking the ne condtions
            if (status) {
                where.status = ne ? { [Op.ne]: status } : status
            }

            // if search query is provided, add to search obj
            if (searchQuery) {
                where[Op.or as keyof WhereOptions] = [
                    { arrival_number: { [Op.iLike]: `%${searchQuery}%` } },
                    { title: { [Op.iLike]: `%${searchQuery}%` } },
                    { supplier_id: { [Op.eq]: parseInt(searchQuery) || 0 } }
                ]
            }

            // get all arrivals
            const arrivals = await database.Arrival.findAll({
                where,
                include: [
                    {
                        model: database.Product,
                        through: {
                            attributes: ['expected_quantity', 'received_quantity', 'condition_id']
                        },
                        include: [
                            {
                                model: database.Category,
                                attributes: ['category_id', 'name']
                            },
                            {
                                model: database.Style,
                                attributes: ['style_id', 'name']
                            },
                            {
                                model: database.Brand,
                                attributes: ['brand_id', 'name']
                            },
                            {
                                model: database.Color,
                                attributes: ['color_id', 'name']
                            },
                            {
                                model: database.Size,
                                attributes: ['size_id', 'name']
                            }
                        ] as Includeable[]
                    },
                    {
                        model: database.Supplier,
                        attributes: ['supplier_id', 'name']
                    }
                ],
                order: [['expected_date', orderDirection]]
            })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, arrivals)
        } catch (err) {
            // return error
            const error = err instanceof Error ? err : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, error, req, 500)
        }
    },

    // ! get arrival by arrival id
    getArrivalByArrivalId: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // arrival id
            const arrivalId = req.params.arrivalId

            // get arrival by arrival id
            const arrival = await database.Arrival.findOne({
                where: {
                    arrival_number: arrivalId
                },
                include: [
                    {
                        model: database.Product,
                        through: {
                            attributes: ['expected_quantity', 'received_quantity', 'condition_id']
                        },
                        include: [
                            {
                                model: database.Category,
                                attributes: ['category_id', 'name']
                            },
                            {
                                model: database.Style,
                                attributes: ['style_id', 'name']
                            },
                            {
                                model: database.Brand,
                                attributes: ['brand_id', 'name']
                            },
                            {
                                model: database.Color,
                                attributes: ['color_id', 'name']
                            },
                            {
                                model: database.Size,
                                attributes: ['size_id', 'name']
                            }
                        ] as Includeable[]
                    },
                    {
                        model: database.Supplier,
                        attributes: ['supplier_id', 'name']
                    }
                ]
            })

            // if arrival is not found, return error
            if (!arrival) {
                return httpError(next, new Error('Arrival not found'), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, arrival)
        } catch (err) {
            // return error
            const error = err instanceof Error ? err : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, error, req, 500)
        }
    },
    // ! create arrival
    createArrival: async (req: Request<Record<string, never>, unknown, CreateArrivalRequest>, res: Response, next: NextFunction) => {
        try {
            const { title, supplier_id, expected_boxes, expected_pallets, expected_pieces, expected_date, notes, expected_kilograms } = req.body

            // Start a transaction
            const t = await database.sequelize.transaction()

            try {
                // Generate a unique arrival number
                let arrivalNumber
                let isUnique = false

                do {
                    // Combination of timestamp and random 4-digit number
                    const randomPart = Math.floor(1000 + Math.random() * 9000) // random 4-digit number
                    arrivalNumber = `ARR${Date.now()}${randomPart}`

                    // Check if the generated arrival number already exists
                    const existingArrival = await database.Arrival.findOne({
                        where: { arrival_number: arrivalNumber },
                        transaction: t
                    })

                    if (!existingArrival) {
                        isUnique = true
                    }
                } while (!isUnique)

                // Create arrival with required fields
                const arrivalData: Omit<
                    ArrivalAttributes,
                    | 'arrival_id'
                    | 'createdAt'
                    | 'updatedAt'
                    | 'started_date'
                    | 'finished_date'
                    | 'received_pallets'
                    | 'received_boxes'
                    | 'received_pieces'
                > = {
                    arrival_number: arrivalNumber,
                    title,
                    supplier_id,
                    expected_boxes,
                    expected_pallets,
                    expected_pieces,
                    expected_date: new Date(expected_date),
                    notes: notes || null,
                    status: EArrivalStatus.UPCOMING,
                    expected_kilograms,
                    received_kilograms: null
                }

                await database.Arrival.create(arrivalData, { transaction: t })

                // Commit transaction
                await t.commit()

                return httpResponse(req, res, 201, responseMessage.CREATED, { arrival_number: arrivalNumber })
            } catch (error) {
                // Rollback transaction on error
                await t.rollback()
                throw error instanceof Error ? error : new Error('Unknown error occurred')
            }
        } catch (error) {
            return httpError(next, error instanceof Error ? error : new Error('Unknown error occurred'), req)
        }
    },
    // ! delete arrival (single)
    deleteArrival: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const arrivalId = req.params.arrivalId

            // Start a transaction
            const t = await database.sequelize.transaction()

            try {
                const arrival = await database.Arrival.findOne<Model<ArrivalAttributes>>({
                    where: {
                        arrival_number: arrivalId
                    }
                })

                if (!arrival) {
                    return httpError(next, new Error('Arrival not found'), req, 404)
                }

                // Delete associated arrival products first
                await database.ArrivalProduct.destroy({
                    where: { arrival_id: arrival.getDataValue('arrival_id') },
                    transaction: t
                })

                // Then delete the arrival
                await arrival.destroy({ transaction: t })

                // Commit transaction
                await t.commit()

                return httpResponse(req, res, 200, responseMessage.SUCCESS, { arrival_number: arrivalId })
            } catch (error) {
                // Rollback transaction on error
                await t.rollback()
                throw error instanceof Error ? error : new Error('Unknown error occurred')
            }
        } catch (error) {
            return httpError(next, error instanceof Error ? error : new Error('Unknown error occurred'), req)
        }
    },

    // ! delete arrival (multiple)
    deleteMultipleArrival: async (req: Request<Record<string, never>, unknown, DeleteMultipleArrivalsRequest>, res: Response, next: NextFunction) => {
        try {
            const { arrivalNumbers } = req.body

            // Start a transaction
            const t = await database.sequelize.transaction()

            try {
                // First get all arrival IDs
                const arrivals = await database.Arrival.findAll<Model<ArrivalAttributes>>({
                    where: {
                        arrival_number: {
                            [Op.in]: arrivalNumbers
                        }
                    }
                })

                if (!arrivals.length) {
                    return httpError(next, new Error('No arrivals found'), req, 404)
                }

                const arrivalIds = arrivals.map((arrival) => arrival.getDataValue('arrival_id'))

                // Delete associated arrival products first
                await database.ArrivalProduct.destroy({
                    where: {
                        arrival_id: {
                            [Op.in]: arrivalIds
                        }
                    },
                    transaction: t
                })

                // Then delete the arrivals
                await database.Arrival.destroy({
                    where: {
                        arrival_number: {
                            [Op.in]: arrivalNumbers
                        }
                    },
                    transaction: t
                })

                // Commit transaction
                await t.commit()

                return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                    deleted_arrivals: arrivalNumbers,
                    count: arrivalNumbers.length
                })
            } catch (error) {
                // Rollback transaction on error
                await t.rollback()
                throw error instanceof Error ? error : new Error('Unknown error occurred')
            }
        } catch (error) {
            return httpError(next, error instanceof Error ? error : new Error('Unknown error occurred'), req)
        }
    },
    // ! edit arrival
    updateArrival: async (req: Request<{ arrivalId: string }, unknown, UpdateArrivalRequest>, res: Response, next: NextFunction) => {
        try {
            // getting arrival id from params
            const arrivalId = req.params.arrivalId

            // finding respectie arrival
            const foundArrival = await database.Arrival.findOne<Model<ArrivalAttributes>>({
                where: {
                    arrival_number: arrivalId
                }
            })

            // if arrival not found
            if (!foundArrival) {
                return httpError(next, new Error('Arrival not found'), req, 404)
            }

            // if found but status is other than upcoming
            if (foundArrival.getDataValue('status') !== EArrivalStatus.UPCOMING) {
                return httpError(next, new Error('you can only edit the upcoming arrivals'), req, 403)
            }

            const updateData = req.body

            // Start a transaction to ensure data consistency
            const t = await database.sequelize.transaction()

            try {
                // Update arrival details - only include defined fields
                const updateFields: Partial<ArrivalAttributes> = {}

                if (updateData.title !== undefined) updateFields.title = updateData.title
                if (updateData.supplier_id !== undefined) updateFields.supplier_id = updateData.supplier_id
                if (updateData.expected_boxes !== undefined) updateFields.expected_boxes = updateData.expected_boxes
                if (updateData.expected_pallets !== undefined) updateFields.expected_pallets = updateData.expected_pallets
                if (updateData.expected_pieces !== undefined) updateFields.expected_pieces = updateData.expected_pieces
                if (updateData.expected_date !== undefined) updateFields.expected_date = new Date(updateData.expected_date)
                if (updateData.notes !== undefined) updateFields.notes = updateData.notes
                if (updateData.expected_kilograms !== undefined) updateFields.expected_kilograms = updateData.expected_kilograms

                await foundArrival.update(updateFields, { transaction: t })

                // Commit transaction
                await t.commit()

                return httpResponse(req, res, 200, responseMessage.SUCCESS, { arrival_number: arrivalId })
            } catch (error) {
                // Rollback transaction on error
                await t.rollback()
                throw error instanceof Error ? error : new Error('Unknown error occurred')
            }
        } catch (error) {
            return httpError(next, error instanceof Error ? error : new Error('Unknown error occurred'), req)
        }
    },
    // ! start processing arrival
    startProcessing: async (req: Request<Record<string, never>, unknown, StartProcessingRequest>, res: Response, next: NextFunction) => {
        try {
            const arrivalId = req.params.arrivalId
            const { received_pallets = 0, received_boxes, received_kilograms = 0, received_pieces = 0 } = req.body

            // start a transaction
            const t = await database.sequelize.transaction()

            try {
                // find the arrival
                const arrival = await database.Arrival.findOne({
                    where: {
                        arrival_number: arrivalId
                    },
                    transaction: t
                })

                if (!arrival) {
                    await t.rollback()
                    return httpError(next, new Error('Arrival not found'), req, 404)
                }

                // check if arrival is in UPCOMING status
                if (arrival.getDataValue('status') !== EArrivalStatus.UPCOMING) {
                    await t.rollback()
                    return httpError(next, new Error('Only upcoming arrivals can be processed'), req, 403)
                }

                // update arrival with received quantities and status
                await arrival.update(
                    {
                        received_pallets,
                        received_boxes,
                        received_kilograms,
                        received_pieces,
                        status: EArrivalStatus.IN_PROGRESS,
                        started_date: new Date()
                    },
                    { transaction: t }
                )

                // commit transaction
                await t.commit()

                return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                    arrival_number: arrivalId,
                    status: EArrivalStatus.IN_PROGRESS
                })
            } catch (error) {
                // rollback transaction on error
                await t.rollback()
                throw error instanceof Error ? error : new Error('Unknown error occurred')
            }
        } catch (error) {
            return httpError(next, error instanceof Error ? error : new Error('Unknown error occurred'), req)
        }
    },
    // ! scan arrival
    scanArrival: async (req: Request<Record<string, never>, unknown, ScanArrivalRequest>, res: Response, next: NextFunction) => {
        try {
            const arrivalId = req.params.arrivalId
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { condition_id, received_quantity, product_id } = req.body

            // start a transaction
            const t = await database.sequelize.transaction()

            try {
                // find the arrival
                const arrival = await database.Arrival.findOne({
                    where: {
                        arrival_number: arrivalId
                    },
                    transaction: t
                })

                if (!arrival) {
                    await t.rollback()
                    return httpError(next, new Error('Arrival not found'), req, 404)
                }

                // check if arrival is in IN_PROGRESS status
                if (arrival.getDataValue('status') !== EArrivalStatus.IN_PROGRESS) {
                    await t.rollback()
                    return httpError(next, new Error('Only in progress arrivals can be scanned'), req, 403)
                }

                await database.ArrivalProduct.update(
                    {
                        condition_id,
                        received_quantity
                    },
                    {
                        where: {
                            arrival_id: await arrival.getDataValue('arrival_id'),
                            product_id: product_id
                        },
                        transaction: t
                    }
                )

                // commit transaction
                await t.commit()

                // return response
                return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                    arrival_number: arrivalId,
                    status: EArrivalStatus.IN_PROGRESS
                })
            } catch (error) {
                // rollback transaction on error
                await t.rollback()
                throw error instanceof Error ? error : new Error('Unknown error occurred')
            }
        } catch (error) {
            // return error
            return httpError(next, error instanceof Error ? error : new Error('Unknown error occurred'), req)
        }
    },
    finishProcessing: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const arrivalId = req.params.arrivalId

            // start a transaction
            const t = await database.sequelize.transaction()

            try {
                // find the arrival
                const arrival = await database.Arrival.findOne({
                    where: {
                        arrival_number: arrivalId
                    },
                    transaction: t
                })

                if (!arrival) {
                    await t.rollback()
                    return httpError(next, new Error('Arrival not found'), req, 404)
                }

                // check if arrival is in IN_PROGRESS status
                if (arrival.getDataValue('status') !== EArrivalStatus.IN_PROGRESS) {
                    await t.rollback()
                    return httpError(next, new Error('Only in progress arrivals can be finished'), req, 403)
                }

                // Get all arrival products for this arrival to check for discrepancies
                const arrivalProducts = await database.ArrivalProduct.findAll({
                    where: {
                        arrival_id: await arrival.getDataValue('arrival_id')
                    },
                    include: [
                        {
                            model: database.Product,
                            attributes: ['product_id', 'name', 'tsku']
                        }
                    ],
                    transaction: t
                })

                // Check for discrepancies and collect details
                let hasDiscrepancy = false

                const productDiscrepancies: ProductDiscrepancy[] = []

                for (const product of arrivalProducts) {
                    const expectedQty = Number(product.getDataValue('expected_quantity'))
                    const receivedQty = Number(product.getDataValue('received_quantity'))

                    if (expectedQty !== receivedQty) {
                        hasDiscrepancy = true
                        const productData = product.get('Product') as { product_id: number; name: string; tsku: string } | null

                        productDiscrepancies.push({
                            product_id: Number(product.getDataValue('product_id')),
                            product_name: productData?.name ?? null,
                            product_sku: productData?.tsku ?? null,
                            expected_quantity: expectedQty,
                            received_quantity: receivedQty,
                            difference: receivedQty - expectedQty
                        })
                    }
                }

                // Check for box discrepancy
                const expectedBoxes = Number(arrival.getDataValue('expected_boxes'))
                const receivedBoxes = Number(arrival.getDataValue('received_boxes'))

                const boxDiscrepancy: BoxDiscrepancy | null =
                    expectedBoxes !== receivedBoxes
                        ? {
                              expected_boxes: expectedBoxes,
                              received_boxes: receivedBoxes,
                              difference: receivedBoxes - expectedBoxes
                          }
                        : null

                // Set appropriate status based on any discrepancy
                const status = hasDiscrepancy || boxDiscrepancy ? EArrivalStatus.COMPLETED_WITH_DISCREPANCY : EArrivalStatus.FINISHED

                // update arrival with finished date and status
                await arrival.update(
                    {
                        finished_date: new Date(),
                        status: status
                    },
                    { transaction: t }
                )

                // commit transaction
                await t.commit()

                // Prepare response with discrepancy details
                const response: DiscrepancyResponse = {
                    arrival_number: arrivalId,
                    status: status,
                    has_discrepancies: hasDiscrepancy || boxDiscrepancy !== null,
                    discrepancies: {
                        products: productDiscrepancies.length > 0 ? productDiscrepancies : null,
                        boxes: boxDiscrepancy
                    }
                }

                // Return success response with discrepancy details
                return httpResponse(req, res, 200, responseMessage.SUCCESS, response)
            } catch (error) {
                return httpError(next, error instanceof Error ? error : new Error('Unknown error occurred'), req)
            }
        } catch (error) {
            return httpError(next, error instanceof Error ? error : new Error('Unknown error occurred'), req)
        }
    },
    
}

