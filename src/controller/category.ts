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
    // ! get all categories
    getAllCategories: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get search query
            const searchQuery = typeof req.query.search === 'string' ? req.query.search : ''

            // get order param
            const orderParam = req.query.order as string | undefined

            // get order direction
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
            const paginatedResponse = await getPaginatedResponse(database.Category, where, findAllOptions, getPaginationParams(req))

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, paginatedResponse)
        } catch (err) {
            // return error
            const error = err instanceof Error ? err : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, error, req, 500)
        }
    },

    // ! create category
    createCategory: async (req: Request<ParamsDictionary, unknown, CreateCategoryRequest>, res: Response, next: NextFunction) => {
        try {
            // get body
            const { name, description } = req.body

            // check if category already exists
            const isAlreadyExist = await database.Category.findOne({ where: { name } })

            // if category already exists
            if (isAlreadyExist) {
                return httpError(next, new Error(responseMessage.ALREADY_EXIST('category')), req, 409)
            }

            // create category
            const category = await database.Category.create({ name, description })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, category)
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! delete category
    deleteCategory: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get category id
            const categoryId = Number(req.params.id)

            // delete category
            const deletedCategory = await database.Category.destroy({
                where: { category_id: categoryId }
            })

            // if category is not found
            if (!deletedCategory) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('category')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { categoryId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! delete many categories
    deleteManyCategories: async (req: Request<Record<string, never>, unknown, DeleteManyBrandsRequest>, res: Response, next: NextFunction) => {
        try {
            // get category ids
            const categoryIds = req.body.ids

            // delete categories
            await database.Category.destroy({
                where: { category_id: categoryIds }
            })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { categoryIds })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },

    // ! update category
    updateCategory: async (req: Request<Record<string, never>, unknown, Partial<CreateCategoryRequest>>, res: Response, next: NextFunction) => {
        try {
            // get category id
            const categoryId = Number(req.params.id)

            // update category
            const updatedCategory = await database.Category.update(req.body, { where: { category_id: categoryId } })

            // if category is not found
            if (updatedCategory[0] === 0) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('category')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { categoryId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    }
}
