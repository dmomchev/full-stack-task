import client from './client'
import type { LoginRequest, TokenResponse } from '../types'

export const login = async (data: LoginRequest): Promise<TokenResponse> => {
  const response = await client.post<TokenResponse>('/login/access-token', data)
  return response.data
}

