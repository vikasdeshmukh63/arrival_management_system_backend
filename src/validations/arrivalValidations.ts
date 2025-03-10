import { z } from 'zod'

export const createArrivalSchema = z
    .object({
        title: z.string().min(1),
        supplier_id: z.number().int().positive(),
        expected_boxes: z.number().int().positive(),
        expected_pallets: z.number().int().positive(),
        expected_pieces: z.number().int().positive(),
        expected_kilograms: z.number().positive(),
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
        actualPallets: z.number().int().min(0),
        actualBoxes: z.number().int().min(0),
        actualPieces: z.number().int().min(0),
        actualKilograms: z.number().min(0)
    })
    .strict()

export type CreateArrivalInput = z.infer<typeof createArrivalSchema>
export type UpdateArrivalInput = z.infer<typeof updateArrivalSchema>
export type StartProcessingInput = z.infer<typeof startProcessingSchema>