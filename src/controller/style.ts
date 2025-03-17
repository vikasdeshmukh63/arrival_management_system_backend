import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import database from '../models'
import { WhereOptions, Op } from 'sequelize'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination'

export default {
    // ! get all styles
    getAllStyles: async (req: Request, res: Response, next: NextFunction) => {
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
            const paginatedResponse = await getPaginatedResponse(database.Style, where, findAllOptions, getPaginationParams(req))

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, paginatedResponse)
        } catch (err) {
            // return error
            const error = err instanceof Error ? err : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, error, req, 500)
        }
    },

    // ! create style
    createStyle: async (req: Request<ParamsDictionary, unknown, { name: string }>, res: Response, next: NextFunction) => {
        try {
            // getting request body
            const { name } = req.body

            // checking if style already exists
            const isAlreadyExist = await database.Style.findOne({ where: { name } })

            // if style already exists
            if (isAlreadyExist) {
                return httpError(next, new Error(responseMessage.ALREADY_EXIST('style')), req, 409)
            }

            // creating style
            const style = await database.Style.create({ name })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, style)
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! delete style
    deleteStyle: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // getting request params
            const styleId = Number(req.params.id)

            // deleting style
            const deletedStyle = await database.Style.destroy({
                where: { style_id: styleId }
            })

            if (!deletedStyle) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('style')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { styleId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! delete many styles
    deleteManyStyles: async (req: Request<Record<string, never>, unknown, { ids: number[] }>, res: Response, next: NextFunction) => {
        try {
            // getting request body
            const styleIds = req.body.ids

            // deleting styles
            await database.Style.destroy({
                where: { style_id: styleIds }
            })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { styleIds })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! update style
    updateStyle: async (req: Request<Record<string, never>, unknown, { name: string }>, res: Response, next: NextFunction) => {
        try {
            // getting request params
            const styleId = Number(req.params.id)

            // updating style
            const updatedStyle = await database.Style.update({ name: req.body.name }, { where: { style_id: styleId } })

            // checking if style is not found
            if (!updatedStyle) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('style')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { styleId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    }
}

