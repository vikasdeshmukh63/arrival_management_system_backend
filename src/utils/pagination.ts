import { Request } from 'express'
import { Model, ModelStatic, WhereOptions, FindOptions } from 'sequelize'

// pagination params
export interface PaginationParams {
    page: number
    itemsPerPage: number
    offset: number
}

// pagination metadata
export interface PaginationMetadata {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

// paginated response
export interface PaginatedResponse<T> {
    items: T[]
    pagination: PaginationMetadata
}

// get pagination params
export const getPaginationParams = (req: Request): PaginationParams => {
    // get page
    const page = Math.max(1, parseInt(req.query.page as string) || 1)

    // get items per page
    const itemsPerPage = Math.max(1, Math.min(100, parseInt(req.query.itemsPerPage as string) || 10))

    // get offset
    const offset = (page - 1) * itemsPerPage

    return {
        page,
        itemsPerPage,
        offset
    }
}

export const getPaginatedResponse = async <T extends Model>(
    model: ModelStatic<T>,
    where: WhereOptions,
    findAllOptions: Omit<FindOptions<T>, 'where' | 'limit' | 'offset'>,
    paginationParams: PaginationParams,
    excludeFields: string[] = []
): Promise<PaginatedResponse<T>> => {
    // get pagination params
    const { page, itemsPerPage, offset } = paginationParams

    // get total count for pagination
    const totalCount = await model.count({ where })

    // get items with pagination
    const items = await model.findAll({
        ...findAllOptions,
        where,
        limit: itemsPerPage,
        offset,
        attributes: {
            exclude: excludeFields
        }
    })

    // calculate pagination metadata
    const totalPages = Math.ceil(totalCount / itemsPerPage)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return {
        items,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalCount,
            itemsPerPage,
            hasNextPage,
            hasPreviousPage
        }
    }
}
