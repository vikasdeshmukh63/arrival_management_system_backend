import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import database from '../models'
import { WhereOptions, Op } from 'sequelize'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'
import { CreateCategoryRequest, DeleteManyBrandsRequest } from '../types/types'
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination'

export default {
    getAllCategories: async (req: Request, res: Response, next: NextFunction) => {
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
                database.Category,
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

    createCategory: async (req: Request<ParamsDictionary, unknown, CreateCategoryRequest>, res: Response, next: NextFunction) => {
        try {
            const { name, description } = req.body
            const isAlreadyExist = await database.Category.findOne({ where: { name } })

            if (isAlreadyExist) {
                return httpError(next, new Error(responseMessage.ALREADY_EXIST('category')), req, 409)
            }

            const category = await database.Category.create({ name, description })
            return httpResponse(req, res, 200, responseMessage.SUCCESS, category)
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    deleteCategory: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categoryId = Number(req.params.id)
            const deletedCategory = await database.Category.destroy({
                where: { category_id: categoryId }
            })

            if (!deletedCategory) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('category')), req, 404)
            }

            return httpResponse(req, res, 200, responseMessage.SUCCESS, { categoryId })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    deleteManyCategories: async (req: Request<Record<string, never>, unknown, DeleteManyBrandsRequest>, res: Response, next: NextFunction) => {
        try {
            const categoryIds = req.body.ids
            await database.Category.destroy({
                where: { category_id: categoryIds }
            })

            return httpResponse(req, res, 200, responseMessage.SUCCESS, { categoryIds })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    updateCategory: async (req: Request<Record<string, never>, unknown, Partial<CreateCategoryRequest>>, res: Response, next: NextFunction) => {
        try {
            const categoryId = Number(req.params.id)
            const updatedCategory = await database.Category.update(req.body, { where: { category_id: categoryId } })

            if (updatedCategory[0] === 0) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('category')), req, 404)
            }

           return httpResponse(req, res, 200, responseMessage.SUCCESS, { categoryId })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
          return httpError(next, err, req, 500)
        }
    }
}


