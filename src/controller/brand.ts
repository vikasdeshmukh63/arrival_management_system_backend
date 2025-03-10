import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import database from '../models'
import { WhereOptions, Op } from 'sequelize'
import httpResponse from '../utils/httpResponse'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'
import { CreateBrandRequest, DeleteManyBrandsRequest } from '../types/types'

export default {
    // ! get all brands
    getAllBrands: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // if order query is not provided, default to descending order
            const orderParam = req.query.order as string | undefined
            const orderDirection = orderParam?.toLocaleLowerCase() === 'desc' ? 'DESC' : 'ASC'
            // if search query is not provided, default to empty stirng
            const searchQuery = typeof req.query.search === 'string' ? req.query.search : ''

            // search obj
            const where: WhereOptions = {}

            // if search query is provided, add to serach obj
            if (searchQuery) {
                where.name = {
                    [Op.iLike]: `%${searchQuery}%`
                }
            }

            // get all brands
            const brands = await database.Brand.findAll({
                where,
                order: [['name', orderDirection]]
            })

            // return response
           return httpResponse(req, res, 200, responseMessage.SUCCESS, brands)
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            httpError(next, err, req, 500)
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

