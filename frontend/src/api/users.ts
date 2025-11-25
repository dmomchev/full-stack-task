import client from './client'
import type { User, UserCreate, UserUpdate, PaginatedResponse, PaginationParams, Role } from '../types'

export const getUsers = async (params: PaginationParams = {}): Promise<PaginatedResponse<User>> => {
  const response = await client.get<PaginatedResponse<User>>('/users', { params })
  return response.data
}

export const getUser = async (userId: number): Promise<User> => {
  const response = await client.get<User>(`/users/${userId}`)
  return response.data
}

export const createUser = async (data: UserCreate): Promise<User> => {
  const response = await client.post<User>('/users', data)
  return response.data
}

export const updateUser = async (userId: number, data: UserUpdate): Promise<User> => {
  const response = await client.put<User>(`/users/${userId}`, data)
  return response.data
}

export const deleteUser = async (userId: number): Promise<void> => {
  await client.delete(`/users/${userId}`)
}

export const getUserRoles = async (userId: number): Promise<Role[]> => {
  const response = await client.get<Role[]>(`/users/${userId}/roles`)
  return response.data
}

export const assignRole = async (userId: number, roleName: string): Promise<void> => {
  await client.post(`/users/${userId}/role`, null, { params: { role_name: roleName } })
}

export const removeRole = async (userId: number, roleName: string): Promise<void> => {
  await client.delete(`/users/${userId}/roles/${roleName}`)
}

