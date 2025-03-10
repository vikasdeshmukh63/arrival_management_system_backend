import { NextFunction, Request, Response } from 'express'
import { Op, WhereOptions } from 'sequelize'
import responseMessage from '../constants/responseMessage'
import database from '../models/index'
import { CreateSupplierRequest, DeleteManySuppliersRequest } from '../types/types'
import httpError from '../utils/httpError'
import httpResponse from '../utils/httpResponse'

export default {
    getAllSuppliers: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // if order query is not provided, default to descending order
            const orderParam = req.query.order as string | undefined
            const orderDirection = orderParam?.toLocaleLowerCase() === 'desc' ? 'DESC' : 'ASC'
            // if search query is not provided, default to empty string
            const searchQuery = typeof req.query.search === 'string' ? req.query.search : ''

            // Initialize where clause
            const where: WhereOptions = {}

            // search obj
            if (searchQuery) {
                where[Op.or as keyof WhereOptions] = [
                    { name: { [Op.iLike]: `%${searchQuery}%` } },
                    { email: { [Op.iLike]: `%${searchQuery}%` } },
                    { phone: { [Op.iLike]: `%${searchQuery}%` } },
                    { contact_person: { [Op.iLike]: `%${searchQuery}%` } },
                    { address: { [Op.iLike]: `%${searchQuery}%` } }
                ]
            }

            // Get suppliers with search and order
            const suppliers = await database.Supplier.findAll({
                where,
                order: [['name', orderDirection]]
            })

            // return response
           return httpResponse(req, res, 200, responseMessage.SUCCESS, suppliers)
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Something went wrong')
           return httpError(next, err, req, 500)
        }
    },
    createSupplier: async (req: Request<Record<string, never>, unknown, CreateSupplierRequest>, res: Response, next: NextFunction) => {
        try {
            const { name, contact_person, phone, email, address } = req.body

            // Create supplier
            const supplier = await database.Supplier.create({
                name,
                contact_person,
                phone,
                email,
                address
            })

            // Return response
           return httpResponse(req, res, 201, responseMessage.CREATED, supplier)
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Something went wrong')
          return  httpError(next, err, req, 500)
        }
    },
    updateSupplier: async (req: Request<Record<string, never>, unknown, Partial<CreateSupplierRequest>>, res: Response, next: NextFunction) => {
        try {
            const supplierId = Number(req.params.id)
            const updatedSupplier = await database.Supplier.update({ ...req.body }, { where: { supplier_id: supplierId } })

            if (!updatedSupplier) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Supplier')), req, 404)
            }

          return  httpResponse(req, res, 200, responseMessage.SUCCESS, { supplierId })
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Something went wrong')
           return httpError(next, err, req, 500)
        }
    },
    deleteSupplier: async (req: Request<Record<string, never>, unknown, { id: number }>, res: Response, next: NextFunction) => {
        try {
            const supplierId = Number(req.params.id)
            const deletedSupplier = await database.Supplier.destroy({ where: { supplier_id: supplierId } })

            if (!deletedSupplier) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Supplier')), req, 404)
            }

            return  httpResponse(req, res, 200, responseMessage.SUCCESS, { supplierId })
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Something went wrong')
            return httpError(next, err, req, 500)
        }
    },
    deleteManySuppliers: async (req: Request<Record<string, never>, unknown, DeleteManySuppliersRequest>, res: Response, next: NextFunction) => {
        try {
            const { ids } = req.body
            const deletedSuppliers = await database.Supplier.destroy({ where: { supplier_id: ids } })

            if (!deletedSuppliers) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Supplier')), req, 404)
            }

          return  httpResponse(req, res, 200, responseMessage.SUCCESS, { ids })
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Something went wrong')
           return httpError(next, err, req, 500)
        }
    }
}

