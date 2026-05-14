import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('../../../../lib/auth', () => ({
  getAuthFromRequest: vi.fn(),
}))

vi.mock('../../../../lib/models/user', () => ({
  getUserById: vi.fn(),
}))

import { getAuthFromRequest } from '../../../../lib/auth'
import { getUserById } from '../../../../lib/models/user'
import { GET } from './route'

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    ;(getAuthFromRequest as any).mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/auth/me', {
      method: 'GET',
    })

    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.user).toBeNull()
  })

  it('returns user data from auth token when available', async () => {
    const authPayload = {
      userId: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      createdAt: '2024-01-01',
    }

    ;(getAuthFromRequest as any).mockResolvedValue(authPayload)

    const req = new NextRequest('http://localhost/api/auth/me', {
      method: 'GET',
    })

    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.user).toEqual({
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      createdAt: '2024-01-01',
    })
    expect((getUserById as any)).not.toHaveBeenCalled()
  })

  it('fetches from database when auth token incomplete', async () => {
    const authPayload = {
      userId: 'user-123',
      username: 'testuser',
      email: null,
      firstName: null,
      lastName: null,
      createdAt: null,
    }

    const dbUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      createdAt: '2024-01-01',
    }

    ;(getAuthFromRequest as any).mockResolvedValue(authPayload)
    ;(getUserById as any).mockResolvedValue(dbUser)

    const req = new NextRequest('http://localhost/api/auth/me', {
      method: 'GET',
    })

    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.user).toEqual(dbUser)
    expect((getUserById as any)).toHaveBeenCalledWith('user-123')
  })

  it('returns 401 when user not found in database', async () => {
    const authPayload = {
      userId: 'user-123',
      username: 'testuser',
    }

    ;(getAuthFromRequest as any).mockResolvedValue(authPayload)
    ;(getUserById as any).mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/auth/me', {
      method: 'GET',
    })

    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.user).toBeNull()
  })

  it('handles unexpected errors gracefully', async () => {
    ;(getAuthFromRequest as any).mockRejectedValue(new Error('Database error'))

    const req = new NextRequest('http://localhost/api/auth/me', {
      method: 'GET',
    })

    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.user).toBeNull()
  })
})
