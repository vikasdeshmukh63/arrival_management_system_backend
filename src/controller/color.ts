import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import database from '../models'
import { WhereOptions, Op } from 'sequelize'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination'

export default {
    getAllColors: async (req: Request, res: Response, next: NextFunction) => {
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
                database.Color,
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

    createColor: async (req: Request<ParamsDictionary, unknown, { name: string }>, res: Response, next: NextFunction) => {
        try {
            const { name } = req.body
            const isAlreadyExist = await database.Color.findOne({ where: { name } })

            if (isAlreadyExist) {
                return httpError(next, new Error(responseMessage.ALREADY_EXIST('color')), req, 409)
            }

            const color = await database.Color.create({ name })
            return httpResponse(req, res, 200, responseMessage.SUCCESS, color)
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    deleteColor: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const colorId = Number(req.params.id)
            const deletedColor = await database.Color.destroy({
                where: { color_id: colorId }
            })

            if (!deletedColor) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('color')), req, 404)
            }

            return httpResponse(req, res, 200, responseMessage.SUCCESS, { colorId })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    deleteManyColors: async (req: Request<Record<string, never>, unknown, { ids: number[] }>, res: Response, next: NextFunction) => {
        try {
            const colorIds = req.body.ids
            await database.Color.destroy({
                where: { color_id: colorIds }
            })

            return httpResponse(req, res, 200, responseMessage.SUCCESS, { colorIds })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    updateColor: async (req: Request<Record<string, never>, unknown, { name: string }>, res: Response, next: NextFunction) => {
        try {
            const colorId = Number(req.params.id)
            const updatedColor = await database.Color.update({ name: req.body.name }, { where: { color_id: colorId } })

            if (!updatedColor) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('color')), req, 404)
            }

            return httpResponse(req, res, 200, responseMessage.SUCCESS, { colorId })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    }
}

