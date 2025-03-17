import { z } from 'zod'

export const createArrivalSchema = z
    .object({
        title: z.string().min(1),
        supplier_id: z.number().int().positive(),
        expected_boxes: z.number().int().positive(),
        expected_pallets: z.number().int().positive().optional(),
        expected_pieces: z.number().int().positive().optional(),
        expected_kilograms: z.number().positive().optional(),
        expected_date: z.string().datetime(),
        notes: z.string().optional()
    })
    .strict()

export const updateArrivalSchema = z
    .object({
        title: z.string().min(1).optional(),
        supplier_id: z.number().int().positive().optional(),
        expected_boxes: z.number().int().positive().optional(),
        expected_pallets: z.number().int().positive().optional(),
        expected_pieces: z.number().int().positive().optional(),
        expected_kilograms: z.number().positive().optional(),
        expected_date: z.string().datetime().optional(),
        notes: z.string().optional()
    })
    .strict()

export const startProcessingSchema = z
    .object({
        received_pallets: z.number().int().min(0).optional(),
        received_boxes: z.number().int().min(0),
        received_pieces: z.number().int().min(0).optional(),
        received_kilograms: z.number().min(0).optional()
    })
    .strict()

export const scanArrivalSchema = z
    .object({
        barcode: z.string().min(1).optional(),
        condition_id: z.number().int().positive(),
        received_quantity: z.number().int().positive(),
        product_id: z.number().int().positive()
    })
    .strict()

export type CreateArrivalInput = z.infer<typeof createArrivalSchema>
export type UpdateArrivalInput = z.infer<typeof updateArrivalSchema>
export type StartProcessingInput = z.infer<typeof startProcessingSchema>
export type ScanArrivalInput = z.infer<typeof scanArrivalSchema>
