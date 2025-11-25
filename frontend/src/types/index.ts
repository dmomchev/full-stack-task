// Auth types
export interface LoginRequest {
  username: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface TokenPayload {
  sub: string
  exp: number
  role: string | null
}

export interface AuthUser {
  id: number
  role: string | null
}

// User types
export interface User {
  id: number
  username: string
  is_active: boolean
}

export interface UserCreate {
  username: string
  password: string
}

export interface UserUpdate {
  username?: string
  password?: string
}

// Role types
export interface Permission {
  id: number
  name: string
  description: string | null
}

export interface Role {
  id: number
  name: string
  description: string | null
  permissions: Permission[]
}

// Car types
export interface Brand {
  id: number
  name: string
  created_by: number
}

export interface BrandCreate {
  name: string
}

export interface Model {
  id: number
  name: string
  brand_id: number
  created_by: number
}

export interface ModelCreate {
  name: string
}

export interface Submodel {
  id: number
  name: string
  model_id: number
  created_by: number
}

export interface SubmodelCreate {
  name: string
}

export interface Generation {
  id: number
  name: string
  year_start: number
  year_end: number
  submodel_id: number
  created_by: number
}

export interface GenerationCreate {
  name: string
  year_start: number
  year_end: number
}

export interface CarSpec {
  id: number
  name: string
  engine: string
  horsepower: number
  torque: number
  fuel_type: string
  year: number
  generation_id: number
  created_by: number
}

export interface CarSpecCreate {
  name: string
  engine: string
  horsepower: number
  torque: number
  fuel_type: string
  year: number
}

export interface UserCar {
  id: number
  user_id: number
  car_spec_id: number
}

// Pagination types
export interface PageMeta {
  page: number
  per_page: number
  total_items: number
  total_pages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PageMeta
}

export interface PaginationParams {
  page?: number
  per_page?: number
  sort_by?: string
  filters?: string
}

