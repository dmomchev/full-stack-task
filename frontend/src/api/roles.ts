import client from './client'
import type { Role, Permission } from '../types'

export const getRoles = async (): Promise<Role[]> => {
  const response = await client.get<Role[]>('/roles')
  return response.data
}

export const getRolePermissions = async (roleId: number): Promise<Permission[]> => {
  const response = await client.get<Permission[]>(`/roles/${roleId}/permissions`)
  return response.data
}

