import { z } from 'zod'

export const createSupplierSchema = z
    .object({
        name: z.string().min(1),
        contact_person: z.string().min(1),
        phone: z.string().min(1),
        email: z.string().email(),
        address: z.string().min(1)
    })
    .strict()

export const updateSupplierSchema = z
    .object({
        name: z.string().min(1).optional(),
        contact_person: z.string().min(1).optional(),
        phone: z.string().min(1).optional(),
        email: z.string().email().optional(),
        address: z.string().min(1).optional()
    })
    .strict()

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>