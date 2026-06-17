import axios from 'axios'
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth'

// Auth calls use a bare axios instance to avoid circular deps with the
// main api.ts (which reads the token from localStorage for the interceptor).
const authAxios = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await authAxios.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await authAxios.post<AuthResponse>('/auth/register', payload)
  return data
}
