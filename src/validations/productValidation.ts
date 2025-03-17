import { z } from 'zod'

export const createProductSchema = z
    .object({
        name: z.string().min(1),
        brand_id: z.number().int().positive(),
        category_id: z.number().int().positive(),
        size_id: z.number().int().positive(),
        color_id: z.number().int().positive(),
        style_id: z.number().int().positive()
    })
    .strict()

export const updateProductSchema = z
    .object({
        name: z.string().min(1).optional(),
        brand_id: z.number().int().positive().optional(),
        category_id: z.number().int().positive().optional(),
        size_id: z.number().int().positive().optional(),
        color_id: z.number().int().positive().optional(),
        style_id: z.number().int().positive().optional()
    })
    .strict()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
