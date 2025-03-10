import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import database from '../models'
import { WhereOptions, Op } from 'sequelize'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'
import { CreateConditionRequest, DeleteManyConditionsRequest } from '../types/types'

export default {
    getAllConditions: async (req: Request, res: Response, next: NextFunction) => {
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

            const conditions = await database.Condition.findAll({
                where,
                order: [['name', orderDirection]]
            })

           return httpResponse(req, res, 200, responseMessage.SUCCESS, conditions)
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
           return httpError(next, err, req, 500)
        }
    },

    createCondition: async (req: Request<ParamsDictionary, unknown, CreateConditionRequest>, res: Response, next: NextFunction) => {
        try {
            const { name, description } = req.body
            const isAlreadyExist = await database.Condition.findOne({ where: { name } })

            if (isAlreadyExist) {
                return httpError(next, new Error(responseMessage.ALREADY_EXIST('condition')), req, 409)
            }

            const condition = await database.Condition.create({ name, description })
           return httpResponse(req, res, 200, responseMessage.SUCCESS, condition)
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
           return httpError(next, err, req, 500)
        }
    },

    deleteCondition: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const conditionId = Number(req.params.id)
            const deletedCondition = await database.Condition.destroy({
                where: { condition_id: conditionId }
            })

            if (!deletedCondition) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('condition')), req, 404)
            }

           return httpResponse(req, res, 200, responseMessage.SUCCESS, { conditionId })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
           return httpError(next, err, req, 500)
        }
    },

    deleteManyConditions: async (req: Request<Record<string, never>, unknown, DeleteManyConditionsRequest>, res: Response, next: NextFunction) => {
        try {
            const conditionIds = req.body.ids
            await database.Condition.destroy({
                where: { condition_id: conditionIds }
            })

           return httpResponse(req, res, 200, responseMessage.SUCCESS, { conditionIds })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
           return httpError(next, err, req, 500)
        }
    },

    updateCondition: async (req: Request<Record<string, never>, unknown, Partial<CreateConditionRequest>>, res: Response, next: NextFunction) => {
        try {
            const conditionId = Number(req.params.id)
            const updatedCondition = await database.Condition.update({...req.body}, { where: { condition_id: conditionId } })

            if (!updatedCondition) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('condition')), req, 404)
            }

          return  httpResponse(req, res, 200, responseMessage.SUCCESS, { conditionId })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
           return httpError(next, err, req, 500)
        }
    }
}

