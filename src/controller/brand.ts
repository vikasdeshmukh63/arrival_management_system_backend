import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import database from '../models'
import { WhereOptions, Op } from 'sequelize'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'
import { CreateBrandRequest, DeleteManyBrandsRequest } from '../types/types'
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination'

export default {
    // ! get all brands
    getAllBrands: async (req: Request, res: Response, next: NextFunction) => {
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
                database.Brand,
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
    // ! create brands
    createBrand: async (req: Request<ParamsDictionary, unknown, CreateBrandRequest>, res: Response, next: NextFunction) => {
        try {
            // extracting data from body
            const { name } = req.body

            // checking if brand already exists
            const isAlreadyExist = await database.Brand.findOne({ where: { name } })

            // if brand already exist
            if (isAlreadyExist) {
                return httpError(next, new Error(responseMessage.ALREADY_EXIST('brand')), req, 409)
            }

            // create brand
            const brand = await database.Brand.create({ name })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, brand)
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },
    // ! delete single brand
    deleteBrand: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // extracting brand id
            const brandId = Number(req.params.id)

            // delete brand
            const deletedBrand = await database.Brand.destroy({
                where: {
                    brand_id: brandId
                }
            })

            // if brand is not found
            if (!deletedBrand) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('brand')), req, 404)
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { brandId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },
    // ! delete many brands
    deleteManyBrands: async (req: Request<Record<string, never>, unknown, DeleteManyBrandsRequest>, res: Response, next: NextFunction) => {
        try {
            // extracting brand ids
            const brandIds = req.body.ids

            // delete brands
            await database.Brand.destroy({
                where: {
                    brand_id: brandIds
                }
            })

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { brandIds })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 500)
        }
    },
    // ! update brand
    updateBrand: async (req: Request<Record<string, never>, unknown, CreateBrandRequest>, res: Response, next: NextFunction) => {
        try {
            // extracting brand id
            const brandId = Number(req.params.id)

            // update brand
            const updatedBrand = await database.Brand.update(
                { name: req.body.name },
                {
                    where: {
                        brand_id: brandId
                    }
                }
            )

            // if brand is not found
            if (!updatedBrand) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('brand')), req, 404)
            }

            // return response
            httpResponse(req, res, 200, responseMessage.SUCCESS, { brandId })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            httpError(next, err, req, 500)
        }
    }
}

