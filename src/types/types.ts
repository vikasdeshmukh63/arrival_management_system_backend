import { EArrivalStatus, EUserRole } from '../constants/application'
import { Model } from 'sequelize'

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

// start processing request
export interface StartProcessingRequest {
    received_pallets?: number
    received_boxes: number
    received_kilograms?: number
    received_pieces?: number
}

// update arrival request
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

// start processing request
export interface StartProcessingRequest {
    actualPallets: number
    actualBoxes: number
    actualPieces: number
}

// scan arrival request
export interface ScanArrivalRequest {
    barcode?: string
    condition_id: number
    received_quantity: number
    product_id: number
}

// add products to arrival request
export interface AddProductsToArrivalRequest {
    product_id: number
    expected_quantity: number
    condition_id: number
}

// product discrepancy
export interface ProductDiscrepancy {
    product_id: number
    product_name: string | null
    product_sku: string | null
    expected_quantity: number
    received_quantity: number
    difference: number
}

// box discrepancy
export interface BoxDiscrepancy {
    expected_boxes: number
    received_boxes: number
    difference: number
}

// discrepancy response
export interface DiscrepancyResponse {
    arrival_number: string
    status: string
    has_discrepancies: boolean
    discrepancies: {
        products: ProductDiscrepancy[] | null
        boxes: BoxDiscrepancy | null
    }
}

// arrival attributes
export interface ArrivalAttributes {
    arrival_id: number
    arrival_number: string
    title: string
    supplier_id: number
    expected_date: Date
    started_date: Date | null
    finished_date: Date | null
    status:
        | EArrivalStatus.NOT_INITIATED
        | EArrivalStatus.UPCOMING
        | EArrivalStatus.IN_PROGRESS
        | EArrivalStatus.FINISHED
        | EArrivalStatus.COMPLETED_WITH_DISCREPANCY
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

// arrival product
export interface IArrivalProduct {
    arrival_id: number
    product_id: number
    expected_quantity: number
    received_quantity?: number
    condition_id?: number
}

// delete multiple arrivals request
export interface DeleteMultipleArrivalsRequest {
    arrivalNumbers: string[]
}

// brands type
export interface CreateBrandRequest {
    name: string
}

// delete many brands request
export interface DeleteManyBrandsRequest {
    ids: number[]
}

// category type
export interface CreateCategoryRequest {
    name: string
    description: string
}

// delete many categories request
export interface DeleteManyCategoriesRequest {
    ids: number[]
}

// condition type
export interface CreateConditionRequest {
    name: string
    description: string
}

// delete many conditions request
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

// delete many suppliers request
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

// delete many products request
export interface DeleteManyProductsRequest {
    tsku: string[]
}

// user type
export interface IUser extends Model {
    user_id: number
    name: string
    email: string
    password: string
    role: EUserRole
}
