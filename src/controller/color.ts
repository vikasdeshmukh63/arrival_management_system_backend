import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import database from '../models'
import { WhereOptions, Op } from 'sequelize'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination'

export default {
    // ! get all colors
    getAllColors: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get search query
            const searchQuery = typeof req.query.search === 'string' ? req.query.search : ''

            // get order param
            const orderParam = req.query.order as string | undefined
            const orderDirection = orderParam?.toLowerCase() === 'desc' ? 'DESC' : 'ASC'

            // get where options
            const where: WhereOptions = {}

            // if search query is provided
            if (searchQuery) {
                where[Op.or as keyof WhereOptions] = [{ name: { [Op.iLike]: `%${searchQuery}%` } }]
            }

            // get find all options
            const findAllOptions = {
                order: [['name', orderDirection]] as [string, string][]
            }

            // get paginated response
            const paginatedResponse = await getPaginatedResponse(database.Color, where, findAllOptions, getPaginationParams(req))

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, paginatedResponse)
        } catch (err) {
            // return error
            const error = err instanceof Error ? err : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, error, req, 500)
        }
    },

    // ! create color
    createColor: async (req: Request<ParamsDictionary, unknown, { name: string }>, res: Response, next: NextFunction) => {
        try {
            // get body
            const { name } = req.body

            // check if color already exists
            const isAlreadyExist = await database.Color.findOne({ where: { name } })

            // if color already exists
            if (isAlreadyExist) {
                return httpError(next, new Error(responseMessage.ALREADY_EXIST('color')), req, 409)
            }

            // create color
            const color = await database.Color.create({ name })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, color)
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! delete color
    deleteColor: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get color id
            const colorId = Number(req.params.id)

            // delete color
            const deletedColor = await database.Color.destroy({
                where: { color_id: colorId }
            })

            // if color is not found
            if (!deletedColor) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('color')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { colorId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! delete many colors
    deleteManyColors: async (req: Request<Record<string, never>, unknown, { ids: number[] }>, res: Response, next: NextFunction) => {
        try {
            // get color ids
            const colorIds = req.body.ids

            // delete colors
            await database.Color.destroy({
                where: { color_id: colorIds }
            })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { colorIds })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! update color
    updateColor: async (req: Request<Record<string, never>, unknown, { name: string }>, res: Response, next: NextFunction) => {
        try {
            // get color id
            const colorId = Number(req.params.id)

            // update color
            const updatedColor = await database.Color.update({ name: req.body.name }, { where: { color_id: colorId } })

            // if color is not found
            if (!updatedColor) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('color')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { colorId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    }
}
