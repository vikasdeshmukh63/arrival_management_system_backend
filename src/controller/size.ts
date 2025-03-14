import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import database from '../models'
import { WhereOptions, Op } from 'sequelize'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination'

export default {
    getAllSizes: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const searchQuery = typeof req.query.search === 'string' ? req.query.search : ''
            const orderParam = req.query.order as string | undefined
            const orderDirection = orderParam?.toLowerCase() === 'desc' ? 'DESC' : 'ASC'

            const where: WhereOptions = {}
            if (searchQuery) {
                where[Op.or as keyof WhereOptions] = [
                    { name: { [Op.iLike]: `%${searchQuery}%` } }
                ]
            }

            const findAllOptions = {
                order: [['name', orderDirection]] as [string, string][]
            }

            const paginatedResponse = await getPaginatedResponse(
                database.Size,
                where,
                findAllOptions,
                getPaginationParams(req)
            )

            return httpResponse(req, res, 200, responseMessage.SUCCESS, paginatedResponse)
        } catch (err) {
            const error = err instanceof Error ? err : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, error, req, 500)
        }
    },

    createSize: async (req: Request<ParamsDictionary, unknown, { name: string }>, res: Response, next: NextFunction) => {
        try {
            const { name } = req.body
            const isAlreadyExist = await database.Size.findOne({ where: { name } })

            if (isAlreadyExist) {
                return httpError(next, new Error(responseMessage.ALREADY_EXIST('size')), req, 409)
            }

            const size = await database.Size.create({ name })
           return httpResponse(req, res, 200, responseMessage.SUCCESS, size)
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
           return httpError(next, err, req, 500)
        }
    },

    deleteSize: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sizeId = Number(req.params.id)
            const deletedSize = await database.Size.destroy({
                where: { size_id: sizeId }
            })

            if (!deletedSize) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('size')), req, 404)
            }

           return httpResponse(req, res, 200, responseMessage.SUCCESS, { sizeId })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
           return httpError(next, err, req, 500)
        }
    },

    deleteManySizes: async (req: Request<Record<string, never>, unknown, { ids: number[] }>, res: Response, next: NextFunction) => {
        try {
            const sizeIds = req.body.ids
            await database.Size.destroy({
                where: { size_id: sizeIds }
            })

           return httpResponse(req, res, 200, responseMessage.SUCCESS, { sizeIds })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
           return httpError(next, err, req, 500)
        }
    },

    updateSize: async (req: Request<Record<string, never>, unknown, { name: string }>, res: Response, next: NextFunction) => {
        try {
            const sizeId = Number(req.params.id)
            const updatedSize = await database.Size.update(
                { name: req.body.name },
                { where: { size_id: sizeId } }
            )

            if (!updatedSize) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('size')), req, 404)
            }

          return httpResponse(req, res, 200, responseMessage.SUCCESS, { sizeId })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
           return httpError(next, err, req, 500)
        }
    }
}
