import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const userCreateSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const userUpdateSchema = z.object({
  username: z.string().min(1, 'Username is required').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
})

export const brandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

export const modelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

export const submodelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

export const generationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  year_start: z.number().min(1900).max(2100),
  year_end: z.number().min(1900).max(2100),
})

export const carSpecSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  engine: z.string().min(1, 'Engine is required').max(100),
  horsepower: z.number().min(1, 'Horsepower is required'),
  torque: z.number().min(1, 'Torque is required'),
  fuel_type: z.string().min(1, 'Fuel type is required').max(50),
  year: z.number().min(1900).max(2100),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type UserCreateFormData = z.infer<typeof userCreateSchema>
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>
export type BrandFormData = z.infer<typeof brandSchema>
export type ModelFormData = z.infer<typeof modelSchema>
export type SubmodelFormData = z.infer<typeof submodelSchema>
export type GenerationFormData = z.infer<typeof generationSchema>
export type CarSpecFormData = z.infer<typeof carSpecSchema>

