import { NextFunction, Request, Response } from 'express'
import { Op, WhereOptions } from 'sequelize'
import responseMessage from '../constants/responseMessage'
import database from '../models/index'
import { CreateProductRequest, DeleteManyProductsRequest } from '../types/types'
import { generateBarcode, generateTSKU } from '../utils/helperFunction'
import httpError from '../utils/httpError'
import httpResponse from '../utils/httpResponse'
import { getPaginatedResponse, getPaginationParams } from '../utils/pagination'

export default {
    getAllProducts: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const searchQuery = typeof req.query.search === 'string' ? req.query.search : ''
            const orderParam = req.query.order as string | undefined
            const orderDirection = orderParam?.toLowerCase() === 'desc' ? 'DESC' : 'ASC'

            const where: WhereOptions = {}

              // Handle numeric filters
              const numericFilters = {
                category: 'category_id',
                brand: 'brand_id',
                color: 'color_id',
                size: 'size_id',
                style: 'style_id'
            }

            Object.entries(numericFilters).forEach(([queryKey, whereKey]) => {
                const value = req.query[queryKey]
                if (typeof value === 'string') {
                    where[whereKey] = parseInt(value)
                }
            })
            
            if (searchQuery) {
                where[Op.or as keyof WhereOptions] = [
                    { name: { [Op.iLike]: `%${searchQuery}%` } },
                    { tsku: { [Op.iLike]: `%${searchQuery}%` } },
                    { barcode: { [Op.iLike]: `%${searchQuery}%` } }
                ]
            }

            const findAllOptions = {
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
                ],
                order: [['name', orderDirection]] as [string, string][]
            }

            const excludeFields = ['brand_id', 'category_id', 'size_id', 'color_id', 'style_id']

            const paginatedResponse = await getPaginatedResponse(database.Product, where, findAllOptions, getPaginationParams(req), excludeFields)

            return httpResponse(req, res, 200, responseMessage.SUCCESS, paginatedResponse)
        } catch (err) {
            const error = err instanceof Error ? err : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, error, req, 500)
        }
    },
    createProduct: async (req: Request<Record<string, never>, unknown, CreateProductRequest>, res: Response, next: NextFunction) => {
        try {
            // getting request body
            const { name, brand_id, category_id, size_id, color_id, style_id } = req.body

            // generating tsku and barcode
            const tsku = await generateTSKU(brand_id, category_id)
            const barcode = generateBarcode()

            // creating product
            const product = await database.Product.create({
                name,
                tsku,
                barcode,
                brand_id,
                category_id,
                size_id,
                color_id,
                style_id
            })

            // returning response
            return httpResponse(req, res, 201, responseMessage.CREATED, product)
        } catch (error) {
            // returning error
            const errorMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
            return httpError(next, new Error(errorMessage), req, 500)
        }
    },
    updateProduct: async (req: Request<Record<string, never>, unknown, Partial<CreateProductRequest>>, res: Response, next: NextFunction) => {
        try {
            // getting request params
            const { tsku } = req.params

            // updating product
            const product = await database.Product.update(
                {
                    ...req.body
                },
                {
                    where: { tsku }
                }
            )

            // checking if product is found
            if (!product[0]) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('product')), req, 404)
            }

            // returning response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, product)
        } catch (error) {
            // returning error
            const errorMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
            return httpError(next, new Error(errorMessage), req, 500)
        }
    },
    deleteProduct: async (req: Request<{ tsku: string }, unknown, DeleteManyProductsRequest>, res: Response, next: NextFunction) => {
        try {
            // extracting barcode
            const { tsku } = req.params

            // deleting product
            const deletedProducts = await database.Product.destroy({
                where: { tsku }
            })
            // checking if products are found
            if (!deletedProducts) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('product')), req, 404)
            }

            // returning response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, tsku)
        } catch (error) {
            // returning error
            const errorMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
            return httpError(next, new Error(errorMessage), req, 500)
        }
    },
    deleteManyProducts: async (req: Request<Record<string, never>, unknown, DeleteManyProductsRequest>, res: Response, next: NextFunction) => {
        try {
            // getting request body
            const { tsku } = req.body

            // deleting products
            const deletedProducts = await database.Product.destroy({
                where: { tsku: { [Op.in]: tsku } }
            })

            // checking if products are found
            if (!deletedProducts) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('product')), req, 404)
            }

            // returning response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, tsku)
        } catch (error) {
            // returning error
            const errorMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
            return httpError(next, new Error(errorMessage), req, 500)
        }
    },
    getProductsWithDiscrepancyAndWithoutDiscrepancy: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const arrivalId = req.params.arrivalId

            const arrival = await database.Arrival.findOne({
                where: {
                    arrival_number: arrivalId
                }
            })

            if (!arrival) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('arrival')), req, 404)
            }

            const arrivalProducts = await database.ArrivalProduct.findAll({
                where: {
                    arrival_id: await arrival.getDataValue('arrival_id')
                },
                include: [
                    {
                        model: database.Product,
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
                        ]
                    }
                ]
            })

            // Separate products with and without discrepancy
            const productsWithDiscrepancy = []
            const productsWithoutDiscrepancy = []

            for (const arrivalProduct of arrivalProducts) {
                const expectedQuantity = Number(arrivalProduct.getDataValue('expected_quantity'))
                const receivedQuantity = Number(arrivalProduct.getDataValue('received_quantity'))

                if (expectedQuantity !== receivedQuantity) {
                    productsWithDiscrepancy.push(arrivalProduct)
                } else {
                    productsWithoutDiscrepancy.push(arrivalProduct)
                }
            }

            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                productsWithDiscrepancy,
                productsWithoutDiscrepancy
            })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
            return httpError(next, new Error(errorMessage), req, 500)
        }
    }
}

