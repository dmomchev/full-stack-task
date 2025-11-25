import client from './client'
import type {
  Brand,
  BrandCreate,
  Model,
  ModelCreate,
  Submodel,
  SubmodelCreate,
  Generation,
  GenerationCreate,
  CarSpec,
  CarSpecCreate,
  PaginatedResponse,
  PaginationParams,
} from '../types'

// Brands
export const getBrands = async (params: PaginationParams = {}): Promise<PaginatedResponse<Brand>> => {
  const response = await client.get<PaginatedResponse<Brand>>('/brands', { params })
  return response.data
}

export const getBrand = async (brandId: number): Promise<Brand> => {
  const response = await client.get<Brand>(`/brands/${brandId}`)
  return response.data
}

export const createBrand = async (data: BrandCreate): Promise<Brand> => {
  const response = await client.post<Brand>('/brands', data)
  return response.data
}

export const updateBrand = async (brandId: number, data: Partial<BrandCreate>): Promise<Brand> => {
  const response = await client.put<Brand>(`/brands/${brandId}`, data)
  return response.data
}

export const deleteBrand = async (brandId: number): Promise<void> => {
  await client.delete(`/brands/${brandId}`)
}

// Models
export const getModels = async (brandId: number, params: PaginationParams = {}): Promise<PaginatedResponse<Model>> => {
  const response = await client.get<PaginatedResponse<Model>>(`/brands/${brandId}/models`, { params })
  return response.data
}

export const getModel = async (brandId: number, modelId: number): Promise<Model> => {
  const response = await client.get<Model>(`/brands/${brandId}/models/${modelId}`)
  return response.data
}

export const createModel = async (brandId: number, data: ModelCreate): Promise<Model> => {
  const response = await client.post<Model>(`/brands/${brandId}/models`, data)
  return response.data
}

export const updateModel = async (brandId: number, modelId: number, data: Partial<ModelCreate>): Promise<Model> => {
  const response = await client.put<Model>(`/brands/${brandId}/models/${modelId}`, data)
  return response.data
}

export const deleteModel = async (brandId: number, modelId: number): Promise<void> => {
  await client.delete(`/brands/${brandId}/models/${modelId}`)
}

// Submodels
export const getSubmodels = async (modelId: number, params: PaginationParams = {}): Promise<PaginatedResponse<Submodel>> => {
  const response = await client.get<PaginatedResponse<Submodel>>(`/models/${modelId}/submodels`, { params })
  return response.data
}

export const getSubmodel = async (modelId: number, submodelId: number): Promise<Submodel> => {
  const response = await client.get<Submodel>(`/models/${modelId}/submodels/${submodelId}`)
  return response.data
}

export const createSubmodel = async (modelId: number, data: SubmodelCreate): Promise<Submodel> => {
  const response = await client.post<Submodel>(`/models/${modelId}/submodels`, data)
  return response.data
}

export const updateSubmodel = async (modelId: number, submodelId: number, data: Partial<SubmodelCreate>): Promise<Submodel> => {
  const response = await client.put<Submodel>(`/models/${modelId}/submodels/${submodelId}`, data)
  return response.data
}

export const deleteSubmodel = async (modelId: number, submodelId: number): Promise<void> => {
  await client.delete(`/models/${modelId}/submodels/${submodelId}`)
}

// Generations
export const getGenerations = async (submodelId: number, params: PaginationParams = {}): Promise<PaginatedResponse<Generation>> => {
  const response = await client.get<PaginatedResponse<Generation>>(`/submodels/${submodelId}/generations`, { params })
  return response.data
}

export const getGeneration = async (submodelId: number, generationId: number): Promise<Generation> => {
  const response = await client.get<Generation>(`/submodels/${submodelId}/generations/${generationId}`)
  return response.data
}

export const createGeneration = async (submodelId: number, data: GenerationCreate): Promise<Generation> => {
  const response = await client.post<Generation>(`/submodels/${submodelId}/generations`, data)
  return response.data
}

export const updateGeneration = async (submodelId: number, generationId: number, data: Partial<GenerationCreate>): Promise<Generation> => {
  const response = await client.put<Generation>(`/submodels/${submodelId}/generations/${generationId}`, data)
  return response.data
}

export const deleteGeneration = async (submodelId: number, generationId: number): Promise<void> => {
  await client.delete(`/submodels/${submodelId}/generations/${generationId}`)
}

// Car Specs
export const getCarSpecs = async (generationId: number, params: PaginationParams = {}): Promise<PaginatedResponse<CarSpec>> => {
  const response = await client.get<PaginatedResponse<CarSpec>>(`/generations/${generationId}/specs`, { params })
  return response.data
}

export const getCarSpec = async (specId: number): Promise<CarSpec> => {
  const response = await client.get<CarSpec>(`/specs/${specId}`)
  return response.data
}

export const createCarSpec = async (generationId: number, data: CarSpecCreate): Promise<CarSpec> => {
  const response = await client.post<CarSpec>(`/generations/${generationId}/specs`, data)
  return response.data
}

export const updateCarSpec = async (generationId: number, specId: number, data: Partial<CarSpecCreate>): Promise<CarSpec> => {
  const response = await client.put<CarSpec>(`/generations/${generationId}/specs/${specId}`, data)
  return response.data
}

export const deleteCarSpec = async (generationId: number, specId: number): Promise<void> => {
  await client.delete(`/generations/${generationId}/specs/${specId}`)
}

