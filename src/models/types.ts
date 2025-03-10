import { Model } from 'sequelize'

export interface IBrand extends Model {
    brand_id: number
    name: string
}

export interface ICategory extends Model {
    category_id: number
    name: string
    description?: string
}

export interface ISize extends Model {
    size_id: number
    name: string
}

export interface IColor extends Model {
    color_id: number
    name: string
}

export interface IStyle extends Model {
    style_id: number
    name: string
}

export interface ICondition extends Model {
    condition_id: number
    name: string
    description?: string
}

export interface ISupplier extends Model {
    supplier_id: number
    name: string
    contact_person?: string
    phone?: string
    email?: string
    address?: string
}

export interface IProduct extends Model {
    product_id: number
    tsku: string
    barcode?: string
    brand_id?: number
    category_id: number
    size_id?: number
    color_id?: number
    style_id?: number
}

export interface IArrival extends Model {
    arrival_id: number
    arrival_number: string
    title: string
    supplier_id: number
    expected_date: Date
    started_date?: Date
    finished_date?: Date
    status: 'upcoming' | 'in_progress' | 'finished'
    expected_pallets?: number
    expected_boxes?: number
    expected_kilograms?: number
    expected_pieces?: number
    received_pallets?: number
    received_boxes?: number
    received_kilograms?: number
    received_pieces?: number
    notes?: string
}

export interface IArrivalProduct extends Model {
    arrival_product_id: number
    arrival_id: number
    product_id: number
    condition_id?: number
    expected_quantity: number
    received_quantity?: number
}
