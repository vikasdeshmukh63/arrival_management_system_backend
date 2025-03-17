import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import database from '../models'
import { WhereOptions, Op } from 'sequelize'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'
import { CreateConditionRequest, DeleteManyConditionsRequest } from '../types/types'
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination'

export default {
    // ! get all conditions
    getAllConditions: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get order param
            const orderParam = req.query.order as string | undefined
            const orderDirection = orderParam?.toLocaleLowerCase() === 'desc' ? 'DESC' : 'ASC'

            // get search query
            const searchQuery = typeof req.query.search === 'string' ? req.query.search : ''

            // get where options
            const where: WhereOptions = {}
            if (searchQuery) {
                where.name = {
                    [Op.iLike]: `%${searchQuery}%`
                }
            }

            // get find all options
            const findAllOptions = {
                order: [['name', orderDirection]] as [string, string][]
            }

            // get paginated response
            const paginatedResponse = await getPaginatedResponse(
                database.Condition,
                where,
                findAllOptions,
                getPaginationParams(req)
            )

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, paginatedResponse)
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! create condition
    createCondition: async (req: Request<ParamsDictionary, unknown, CreateConditionRequest>, res: Response, next: NextFunction) => {
        try {
            // get body
            const { name, description } = req.body

            // check if condition already exists
                const isAlreadyExist = await database.Condition.findOne({ where: { name } })

            // if condition already exists
            if (isAlreadyExist) {
                return httpError(next, new Error(responseMessage.ALREADY_EXIST('condition')), req, 409)
            }

            // create condition
            const condition = await database.Condition.create({ name, description })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, condition)
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! delete condition
    deleteCondition: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get condition id
            const conditionId = Number(req.params.id)
            const deletedCondition = await database.Condition.destroy({
                where: { condition_id: conditionId }
            })

            // if condition is not found
            if (!deletedCondition) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('condition')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { conditionId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! delete many conditions
    deleteManyConditions: async (req: Request<Record<string, never>, unknown, DeleteManyConditionsRequest>, res: Response, next: NextFunction) => {
        try {
            // get condition ids
            const conditionIds = req.body.ids

            // delete conditions
            await database.Condition.destroy({
                where: { condition_id: conditionIds }
            })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { conditionIds })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! update condition
    updateCondition: async (req: Request<Record<string, never>, unknown, Partial<CreateConditionRequest>>, res: Response, next: NextFunction) => {
        try {
            // get condition id
            const conditionId = Number(req.params.id)

            // update condition
            const updatedCondition = await database.Condition.update({...req.body}, { where: { condition_id: conditionId } })

            // if condition is not found
            if (!updatedCondition) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('condition')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { conditionId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    }
}

