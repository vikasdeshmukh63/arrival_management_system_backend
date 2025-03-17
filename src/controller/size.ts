import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import database from '../models'
import { WhereOptions, Op } from 'sequelize'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination'

export default {
    // ! get all sizes
    getAllSizes: async (req: Request, res: Response, next: NextFunction) => {
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
                where[Op.or as keyof WhereOptions] = [{ name: { [Op.iLike]: `%${searchQuery}%` } }]
            }

            // getting find all options
            const findAllOptions = {
                order: [['name', orderDirection]] as [string, string][]
            }

            // getting paginated response
            const paginatedResponse = await getPaginatedResponse(database.Size, where, findAllOptions, getPaginationParams(req))

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, paginatedResponse)
        } catch (err) {
            // return error
            const error = err instanceof Error ? err : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, error, req, 500)
        }
    },

    // ! create size
    createSize: async (req: Request<ParamsDictionary, unknown, { name: string }>, res: Response, next: NextFunction) => {
        try {
            // getting request body
            const { name } = req.body

            // checking if size already exists
            const isAlreadyExist = await database.Size.findOne({ where: { name } })

            // if size already exists
            if (isAlreadyExist) {
                return httpError(next, new Error(responseMessage.ALREADY_EXIST('size')), req, 409)
            }

            // creating size
            const size = await database.Size.create({ name })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, size)
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! delete size
    deleteSize: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // getting request params
            const sizeId = Number(req.params.id)

            // deleting size
            const deletedSize = await database.Size.destroy({
                where: { size_id: sizeId }
            })

            // checking if size is not found
            if (!deletedSize) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('size')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { sizeId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! delete many sizes
    deleteManySizes: async (req: Request<Record<string, never>, unknown, { ids: number[] }>, res: Response, next: NextFunction) => {
        try {
            // getting request body
            const sizeIds = req.body.ids

            // deleting sizes
            await database.Size.destroy({
                where: { size_id: sizeIds }
            })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { sizeIds })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! update size
    updateSize: async (req: Request<Record<string, never>, unknown, { name: string }>, res: Response, next: NextFunction) => {
        try {
            // getting request params
            const sizeId = Number(req.params.id)

            // updating size
            const updatedSize = await database.Size.update({ name: req.body.name }, { where: { size_id: sizeId } })

            // checking if size is not found
            if (!updatedSize) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('size')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { sizeId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    }
}
