import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import database from '../models'
import { WhereOptions, Op } from 'sequelize'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'

export default {
    getAllStyles: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orderParam = req.query.order as string | undefined
            const orderDirection = orderParam?.toLocaleLowerCase() === 'desc' ? 'DESC' : 'ASC'
            const searchQuery = typeof req.query.search === 'string' ? req.query.search : ''

            const where: WhereOptions = {}
            if (searchQuery) {
                where.name = {
                    [Op.iLike]: `%${searchQuery}%`
                }
            }

            const styles = await database.Style.findAll({
                where,
                order: [['name', orderDirection]]
            })

            return httpResponse(req, res, 200, responseMessage.SUCCESS, styles)
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    createStyle: async (req: Request<ParamsDictionary, unknown, { name: string }>, res: Response, next: NextFunction) => {
        try {
            const { name } = req.body
            const isAlreadyExist = await database.Style.findOne({ where: { name } })

            if (isAlreadyExist) {
                return httpError(next, new Error(responseMessage.ALREADY_EXIST('style')), req, 409)
            }

            const style = await database.Style.create({ name })
            return httpResponse(req, res, 200, responseMessage.SUCCESS, style)
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    deleteStyle: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const styleId = Number(req.params.id)
            const deletedStyle = await database.Style.destroy({
                where: { style_id: styleId }
            })

            if (!deletedStyle) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('style')), req, 404)
            }

            return httpResponse(req, res, 200, responseMessage.SUCCESS, { styleId })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    deleteManyStyles: async (req: Request<Record<string, never>, unknown, { ids: number[] }>, res: Response, next: NextFunction) => {
        try {
            const styleIds = req.body.ids
            await database.Style.destroy({
                where: { style_id: styleIds }
            })

            return httpResponse(req, res, 200, responseMessage.SUCCESS, { styleIds })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    updateStyle: async (req: Request<Record<string, never>, unknown, { name: string }>, res: Response, next: NextFunction) => {
        try {
            const styleId = Number(req.params.id)
            const updatedStyle = await database.Style.update({ name: req.body.name }, { where: { style_id: styleId } })

            if (!updatedStyle) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('style')), req, 404)
            }

            return httpResponse(req, res, 200, responseMessage.SUCCESS, { styleId })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    }
}

