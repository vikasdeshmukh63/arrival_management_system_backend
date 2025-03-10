import { EArrivalStatus } from '../constants/application'

// success response type
export type THttpResponse = {
    success: boolean
    statusCode: number
    request: {
        ip?: string | null
        method: string
        url: string
    }
    message: string
    data: unknown
}

// error response type
export type THttpError = {
    success: boolean
    statusCode: number
    request: {
        ip?: string | null
        method: string
        url: string
    }
    message: string
    data: unknown
    trace?: object | null
}

// arrival types
export interface CreateArrivalRequest {
    title: string
    supplier_id: number
    expected_boxes: number
    expected_pallets: number
    expected_pieces: number
    expected_kilograms: number
    expected_date: string
    notes?: string
}

export interface UpdateArrivalRequest {
    title?: string
    supplier_id?: number
    expected_boxes?: number
    expected_pallets?: number
    expected_pieces?: number
    expected_kilograms?: number
    expected_date?: string
    notes?: string
}

export interface StartProcessingRequest {
    actualPallets: number
    actualBoxes: number
    actualPieces: number
}

export interface ArrivalAttributes {
    arrival_id: number
    arrival_number: string
    title: string
    supplier_id: number
    expected_date: Date
    started_date: Date | null
    finished_date: Date | null
    status: EArrivalStatus.UPCOMING | EArrivalStatus.IN_PROGRESS | EArrivalStatus.FINISHED | EArrivalStatus.COMPLETED_WITH_DISCREPANCY
    expected_pallets: number | null
    expected_boxes: number
    expected_kilograms: number
    expected_pieces: number | null
    received_pallets: number | null
    received_boxes: number | null
    received_kilograms: number | null
    received_pieces: number | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
}

export interface IArrivalProduct {
    arrival_id: number
    product_id: number
    expected_quantity: number
    received_quantity?: number
    condition_id?: number
}

export interface DeleteMultipleArrivalsRequest {
    arrivalNumbers: string[]
}

// brands type
export interface CreateBrandRequest {
    name: string
}

export interface DeleteManyBrandsRequest {
    ids: number[]
}

// category type
export interface CreateCategoryRequest {
    name: string
    description: string
}

export interface DeleteManyCategoriesRequest {
    ids: number[]
}

// condition type
export interface CreateConditionRequest {
    name: string
    description: string
}

export interface DeleteManyConditionsRequest {
    ids: number[]
}

// supplier type
export interface CreateSupplierRequest {
    name: string
    contact_person: string
    phone: string
    email: string
    address: string
}

export interface DeleteManySuppliersRequest {
    ids: number[]
}

// product type
export interface CreateProductRequest {
    name: string
    brand_id: number
    category_id: number
    size_id: number
    color_id: number
    style_id: number
}

export interface DeleteManyProductsRequest {
    barcodes: string[]
}

