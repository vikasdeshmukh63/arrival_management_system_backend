import { NextFunction, Request, Response } from 'express'
import { Op, WhereOptions } from 'sequelize'
import responseMessage from '../constants/responseMessage'
import database from '../models/index'
import { CreateSupplierRequest, DeleteManySuppliersRequest } from '../types/types'
import httpError from '../utils/httpError'
import httpResponse from '../utils/httpResponse'
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination'

export default {
    // ! get all suppliers
    getAllSuppliers: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // getting search query
            const searchQuery = typeof req.query.search === 'string' ? req.query.search : ''

            // getting order param
            const orderParam = req.query.order as string | undefined
            const orderDirection = orderParam?.toLowerCase() === 'desc' ? 'DESC' : 'ASC'

            // getting where options
            const where: WhereOptions = {}

            // checking if search query is provided
            if (searchQuery) {
                where[Op.or as keyof WhereOptions] = [
                    { name: { [Op.iLike]: `%${searchQuery}%` } },
                    { email: { [Op.iLike]: `%${searchQuery}%` } },
                    { phone: { [Op.iLike]: `%${searchQuery}%` } }
                ]
            }

            // getting find all options
            const findAllOptions = {
                order: [['name', orderDirection]] as [string, string][]
            }

            // getting paginated response
            const paginatedResponse = await getPaginatedResponse(database.Supplier, where, findAllOptions, getPaginationParams(req))

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, paginatedResponse)
        } catch (err) {
            // return error
            const error = err instanceof Error ? err : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, error, req, 500)
        }
    },

    // ! create supplier
    createSupplier: async (req: Request<Record<string, never>, unknown, CreateSupplierRequest>, res: Response, next: NextFunction) => {
        try {
            // getting request body
            const { name, contact_person, phone, email, address } = req.body

            // creating supplier
            const supplier = await database.Supplier.create({
                name,
                contact_person,
                phone,
                email,
                address
            })

            // return response
            return httpResponse(req, res, 201, responseMessage.CREATED, supplier)
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error('Something went wrong')
            return httpError(next, err, req, 500)
        }
    },

    // ! update supplier
    updateSupplier: async (req: Request<Record<string, never>, unknown, Partial<CreateSupplierRequest>>, res: Response, next: NextFunction) => {
        try {
            // getting request params
            const supplierId = Number(req.params.id)

            // updating supplier
            const updatedSupplier = await database.Supplier.update({ ...req.body }, { where: { supplier_id: supplierId } })

            // checking if supplier is not found
            if (!updatedSupplier) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Supplier')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { supplierId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error('Something went wrong')
            return httpError(next, err, req, 500)
        }
    },

    // ! delete supplier
    deleteSupplier: async (req: Request<Record<string, never>, unknown, { id: number }>, res: Response, next: NextFunction) => {
        try {
            // getting request params
            const supplierId = Number(req.params.id)

            // deleting supplier
            const deletedSupplier = await database.Supplier.destroy({ where: { supplier_id: supplierId } })

            // checking if supplier is not found
            if (!deletedSupplier) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Supplier')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { supplierId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error('Something went wrong')
            return httpError(next, err, req, 500)
        }
    },

    // ! delete many suppliers
    deleteManySuppliers: async (req: Request<Record<string, never>, unknown, DeleteManySuppliersRequest>, res: Response, next: NextFunction) => {
        try {
            // getting request body
            const { ids } = req.body

            // deleting suppliers
            const deletedSuppliers = await database.Supplier.destroy({ where: { supplier_id: ids } })

            // checking if suppliers are not found
            if (!deletedSuppliers) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Supplier')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { ids })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error('Something went wrong')
            return httpError(next, err, req, 500)
        }
    }
}

