import { NextFunction, Request, Response } from 'express'
import { Model, Op, WhereOptions, Includeable } from 'sequelize'
import { EArrivalStatus } from '../constants/application'
import responseMessage from '../constants/responseMessage'
import database from '../models/index'
import { ArrivalAttributes, CreateArrivalRequest, DeleteMultipleArrivalsRequest, UpdateArrivalRequest } from '../types/types'
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
                order: [['expected_date', orderDirection]],
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
                ],
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
    }
}

