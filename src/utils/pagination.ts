import { Request } from 'express'
import { Model, ModelStatic, WhereOptions, FindOptions } from 'sequelize'

export interface PaginationParams {
    page: number
    itemsPerPage: number
    offset: number
}

export interface PaginationMetadata {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
    items: T[]
    pagination: PaginationMetadata
}

export const getPaginationParams = (req: Request): PaginationParams => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const itemsPerPage = Math.max(1, Math.min(100, parseInt(req.query.itemsPerPage as string) || 10))
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
): Promise<PaginatedResponse<T>> => {
    const { page, itemsPerPage, offset } = paginationParams

    // Get total count for pagination
    const totalCount = await model.count({ where })

    // Get items with pagination
    const items = await model.findAll({
        ...findAllOptions,
        where,
        limit: itemsPerPage,
        offset
    })

    // Calculate pagination metadata
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