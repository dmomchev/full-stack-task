import client from './client'
import type { CarSpec, UserCar, PaginatedResponse, PaginationParams } from '../types'

export const getMyCars = async (params: PaginationParams = {}): Promise<PaginatedResponse<CarSpec>> => {
  const response = await client.get<PaginatedResponse<CarSpec>>('/my-cars', { params })
  return response.data
}

export const addToMyCars = async (carSpecId: number): Promise<UserCar> => {
  const response = await client.post<UserCar>(`/my-cars/${carSpecId}`)
  return response.data
}

export const removeFromMyCars = async (carSpecId: number): Promise<void> => {
  await client.delete(`/my-cars/${carSpecId}`)
}

