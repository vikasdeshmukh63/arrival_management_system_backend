import { NextFunction, Request, Response } from 'express'
import { Model, Op, WhereOptions, Includeable } from 'sequelize'
import { EArrivalStatus } from '../constants/application'
import responseMessage from '../constants/responseMessage'
import database from '../models/index'
import {
    AddProductsToArrivalRequest,
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
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination'

export default {
    // ! get all arrivals with filters
    getAllArrivals: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get order param
            const orderParam = req.query.order as string | undefined

            // get order direction
            const orderDirection = orderParam?.toLowerCase() === 'desc' ? 'DESC' : 'ASC'

            // get search query
            const searchQuery = typeof req.query.search === 'string' ? req.query.search : ''

            // get status
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

            // find all options
            const findAllOptions = {
                include: [
                    {
                        model: database.Product,
                        through: {
                            attributes: ['expected_quantity', 'received_quantity', 'condition_id']
                        },
                        attributes: {
                            exclude: ['brand_id', 'category_id', 'size_id', 'color_id', 'style_id']
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
                order: [['expected_date', orderDirection]] as [string, string][]
            }

            // exclude fields
            const excludeFields = ['supplier_id']

            // get paginated response
            const paginatedResponse = await getPaginatedResponse(database.Arrival, where, findAllOptions, getPaginationParams(req), excludeFields)

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, paginatedResponse)
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
                        attributes: {
                            exclude: ['brand_id', 'category_id', 'size_id', 'color_id', 'style_id']
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
                attributes: {
                    exclude: ['supplier_id']
                }
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
            // get body
            const { title, supplier_id, expected_boxes, expected_pallets, expected_pieces, expected_date, notes, expected_kilograms } = req.body

            // start a transaction
            const t = await database.sequelize.transaction()

            try {
                // generate a unique arrival number
                let arrivalNumber
                let isUnique = false

                do {
                    // combination of timestamp and random 4-digit number
                    const randomPart = Math.floor(1000 + Math.random() * 9000) // random 4-digit number
                    arrivalNumber = `ARR${Date.now()}${randomPart}`

                    // check if the generated arrival number already exists
                    const existingArrival = await database.Arrival.findOne({
                        where: { arrival_number: arrivalNumber },
                        transaction: t
                    })

                    // if the generated arrival number is unique
                    if (!existingArrival) {
                        isUnique = true
                    }
                } while (!isUnique)

                // create arrival with required fields
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
                    status: EArrivalStatus.NOT_INITIATED,
                    expected_kilograms,
                    received_kilograms: null
                }

                await database.Arrival.create(arrivalData, { transaction: t })

                // commit transaction
                await t.commit()

                // return response
                return httpResponse(req, res, 201, responseMessage.CREATED, { arrival_number: arrivalNumber })
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
    // ! delete arrival (single)
    deleteArrival: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get arrival id
            const arrivalId = req.params.arrivalId

            // start a transaction
            const t = await database.sequelize.transaction()

            try {
                // get arrival
                const arrival = await database.Arrival.findOne<Model<ArrivalAttributes>>({
                    where: {
                        arrival_number: arrivalId
                    }
                })

                // if arrival not found
                if (!arrival) {
                    return httpError(next, new Error('Arrival not found'), req, 404)
                }

                // delete associated arrival products first
                await database.ArrivalProduct.destroy({
                    where: { arrival_id: arrival.getDataValue('arrival_id') },
                    transaction: t
                })

                // delete the arrival
                await arrival.destroy({ transaction: t })

                // commit transaction
                await t.commit()

                // return response
                return httpResponse(req, res, 200, responseMessage.SUCCESS, { arrival_number: arrivalId })
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

    // ! delete arrival (multiple)
    deleteMultipleArrival: async (req: Request<Record<string, never>, unknown, DeleteMultipleArrivalsRequest>, res: Response, next: NextFunction) => {
        try {
            // get body
            const { arrivalNumbers } = req.body

            // start a transaction
            const t = await database.sequelize.transaction()

            try {
                // get all arrival ids
                const arrivals = await database.Arrival.findAll<Model<ArrivalAttributes>>({
                    where: {
                        arrival_number: {
                            [Op.in]: arrivalNumbers
                        }
                    }
                })

                // if no arrivals found
                if (!arrivals.length) {
                    return httpError(next, new Error('No arrivals found'), req, 404)
                }

                const arrivalIds = arrivals.map((arrival) => arrival.getDataValue('arrival_id'))

                // delete associated arrival products first
                await database.ArrivalProduct.destroy({
                    where: {
                        arrival_id: {
                            [Op.in]: arrivalIds
                        }
                    },
                    transaction: t
                })

                // delete the arrivals
                await database.Arrival.destroy({
                    where: {
                        arrival_number: {
                            [Op.in]: arrivalNumbers
                        }
                    },
                    transaction: t
                })

                // commit transaction
                await t.commit()

                // return response
                return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                    deleted_arrivals: arrivalNumbers,
                    count: arrivalNumbers.length
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
            if (
                foundArrival.getDataValue('status') !== EArrivalStatus.UPCOMING &&
                foundArrival.getDataValue('status') !== EArrivalStatus.NOT_INITIATED
            ) {
                return httpError(next, new Error('you can only edit the upcoming arrivals'), req, 403)
            }

            const updateData = req.body

            // start a transaction
            const t = await database.sequelize.transaction()

            try {
                // update arrival details - only include defined fields
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

                // commit transaction
                await t.commit()

                // return response
                return httpResponse(req, res, 200, responseMessage.SUCCESS, { arrival_number: arrivalId })
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
    // ! start processing arrival
    startProcessing: async (req: Request<Record<string, never>, unknown, StartProcessingRequest>, res: Response, next: NextFunction) => {
        try {
            // get arrival id
            const arrivalId = req.params.arrivalId

            // get body
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

                // if arrival not found
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
    // ! scan arrival
    scanArrival: async (req: Request<Record<string, never>, unknown, ScanArrivalRequest>, res: Response, next: NextFunction) => {
        try {
            // get arrival id
            const arrivalId = req.params.arrivalId

            // get body
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

                // if arrival not found
                if (!arrival) {
                    await t.rollback()
                    return httpError(next, new Error('Arrival not found'), req, 404)
                }

                // check if arrival is in IN_PROGRESS status
                if (arrival.getDataValue('status') !== EArrivalStatus.IN_PROGRESS) {
                    await t.rollback()
                    return httpError(next, new Error('Only in progress arrivals can be scanned'), req, 403)
                }

                // get the current arrival product record
                const arrivalProduct = await database.ArrivalProduct.findOne({
                    where: {
                        arrival_id: await arrival.getDataValue('arrival_id'),
                        product_id: product_id
                    },
                    transaction: t
                })

                // if product not found in this arrival
                if (!arrivalProduct) {
                    await t.rollback()
                    return httpError(next, new Error('Product not found in this arrival'), req, 404)
                }

                // get current quantities
                const currentReceivedQuantity = Number(arrivalProduct.getDataValue('received_quantity')) || 0
                const expectedQuantity = Number(arrivalProduct.getDataValue('expected_quantity'))
                const updatedReceivedQuantity = currentReceivedQuantity + Number(received_quantity)

                // only check if adding would exceed expected quantity
                if (updatedReceivedQuantity > expectedQuantity) {
                    await t.rollback()
                    return httpError(next, new Error('Cannot add quantity - would exceed expected quantity'), req, 400)
                }

                // update arrival product
                await database.ArrivalProduct.update(
                    {
                        condition_id,
                        received_quantity: updatedReceivedQuantity
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
    // ! finish processing
    finishProcessing: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get arrival id
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

                // if arrival not found
                if (!arrival) {
                    await t.rollback()
                    return httpError(next, new Error('Arrival not found'), req, 404)
                }

                // check if arrival is in IN_PROGRESS status
                if (arrival.getDataValue('status') !== EArrivalStatus.IN_PROGRESS) {
                    await t.rollback()
                    return httpError(next, new Error('Only in progress arrivals can be finished'), req, 403)
                }

                // get all arrival products for this arrival to check for discrepancies
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

                // check for discrepancies and collect details
                let hasDiscrepancy = false

                // product discrepancies
                const productDiscrepancies: ProductDiscrepancy[] = []

                // loop through arrival products
                for (const product of arrivalProducts) {
                    // get expected and received quantities
                    const expectedQty = Number(product.getDataValue('expected_quantity'))
                    const receivedQty = Number(product.getDataValue('received_quantity'))

                    // if there is a discrepancy
                    if (expectedQty !== receivedQty) {
                        hasDiscrepancy = true

                        // get product data
                        const productData = product.get('Product') as { product_id: number; name: string; tsku: string } | null

                        // add product discrepancy
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

                // check for box discrepancy
                const expectedBoxes = Number(arrival.getDataValue('expected_boxes'))
                const receivedBoxes = Number(arrival.getDataValue('received_boxes'))

                // box discrepancy
                const boxDiscrepancy: BoxDiscrepancy | null =
                    expectedBoxes !== receivedBoxes
                        ? {
                              expected_boxes: expectedBoxes,
                              received_boxes: receivedBoxes,
                              difference: receivedBoxes - expectedBoxes
                          }
                        : null

                // set appropriate status based on any discrepancy
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

                // prepare response with discrepancy details
                const response: DiscrepancyResponse = {
                    arrival_number: arrivalId,
                    status: status,
                    has_discrepancies: hasDiscrepancy || boxDiscrepancy !== null,
                    discrepancies: {
                        products: productDiscrepancies.length > 0 ? productDiscrepancies : null,
                        boxes: boxDiscrepancy
                    }
                }

                // return success response with discrepancy details
                return httpResponse(req, res, 200, responseMessage.SUCCESS, response)
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
    // ! add products to arrival
    addProductsToArrival: async (
        req: Request<Record<string, never>, unknown, { arrival_products: AddProductsToArrivalRequest[] }>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            // get arrival id
            const arrivalId = req.params.arrivalId

            // get body
            const { arrival_products }: { arrival_products: AddProductsToArrivalRequest[] } = req.body

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

                // if arrival not found
                if (!arrival) {
                    await t.rollback()
                    return httpError(next, new Error('Arrival not found'), req, 404)
                }

                // check if arrival is in UPCOMING or NOT_INITIATED status
                if (arrival.getDataValue('status') !== EArrivalStatus.UPCOMING && arrival.getDataValue('status') !== EArrivalStatus.NOT_INITIATED) {
                    await t.rollback()
                    return httpError(next, new Error('Only upcoming or not initiated arrivals can be edited'), req, 403)
                }

                // removing the existing products from arrival products table
                await database.ArrivalProduct.destroy({
                    where: {
                        arrival_id: await arrival.getDataValue('arrival_id')
                    },
                    transaction: t
                })

                // adding the new products to arrival products table
                await database.ArrivalProduct.bulkCreate(
                    arrival_products.map((product) => ({
                        arrival_id: arrival.getDataValue('arrival_id') as number,
                        product_id: product.product_id,
                        expected_quantity: product.expected_quantity,
                        received_quantity: 0,
                        condition_id: product.condition_id
                    })),
                    { transaction: t }
                )

                // update arrival status
                await arrival.update({ status: EArrivalStatus.UPCOMING }, { transaction: t })

                // commit transaction
                await t.commit()

                // return response
                return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                    arrival_number: arrivalId,
                    status: EArrivalStatus.UPCOMING
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
    }
}
