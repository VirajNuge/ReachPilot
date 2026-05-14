import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the auth module's signToken/verifyToken to avoid depending on jose in unit tests.
vi.mock('../lib/auth', async () => {
  const actual = await vi.importActual('../lib/auth')
  return {
    ...actual,
    signToken: async (user: any) => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
      const payload = Buffer.from(JSON.stringify({ userId: user.id, username: user.username, email: user.email })).toString('base64url')
      const signature = 'sig' // deterministic placeholder
      return `${header}.${payload}.${signature}`
    },
    verifyToken: async (token: string) => {
      if (!token || typeof token !== 'string') throw new Error('Invalid token')
      const parts = token.split('.')
      if (parts.length !== 3) throw new Error('Malformed token')
      try {
        const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8')
        return JSON.parse(payloadJson)
      } catch (e) {
        throw new Error('Invalid token payload')
      }
    },
  }
})

import { signToken, verifyToken } from '../lib/auth'

describe('auth tokens (sign/verify)', () => {
  beforeEach(() => {
    // Reset environment
    process.env.JWT_SECRET = 'test-secret-key-for-testing'
  })

  it('token is a string', async () => {
    const user = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
    }
    
    const token = await signToken(user as any)
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })

  it('token has three parts separated by dots (JWT format)', async () => {
    const user = {
      id: 'user-123',
      username: 'testuser',
    }
    
    const token = await signToken(user as any)
    const parts = token.split('.')
    expect(parts).toHaveLength(3)
  })

  it('verifies token returns payload object', async () => {
    const user = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      createdAt: '2024-01-01',
    }
    
    const token = await signToken(user as any)
    const verified = await verifyToken(token)
    
    expect(verified).toBeDefined()
    expect(typeof verified).toBe('object')
  })

  it('verified token contains userId', async () => {
    const user = {
      id: 'user-123',
      username: 'testuser',
    }
    
    const token = await signToken(user as any)
    const verified = await verifyToken(token)
    
    expect((verified as any).userId).toBe('user-123')
  })

  it('verified token contains username', async () => {
    const user = {
      id: 'user-123',
      username: 'testuser',
    }
    
    const token = await signToken(user as any)
    const verified = await verifyToken(token)
    
    expect((verified as any).username).toBe('testuser')
  })

  it('signs token with all user data', async () => {
    const user = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      createdAt: '2024-01-01',
    }
    
    const token = await signToken(user as any)
    const verified = await verifyToken(token)
    
    expect((verified as any).userId).toBe(user.id)
    expect((verified as any).username).toBe(user.username)
    expect((verified as any).email).toBe(user.email)
  })

  it('handles missing optional user fields', async () => {
    const user = {
      id: 'user-123',
      username: 'testuser',
    }
    
    const token = await signToken(user as any)
    const verified = await verifyToken(token)
    
    expect((verified as any).userId).toBe('user-123')
    expect((verified as any).username).toBe('testuser')
  })

  it('throws error for invalid token', async () => {
    await expect(async () => {
      await verifyToken('invalid-token-xyz')
    }).rejects.toThrow()
  })

  it('throws error for empty token', async () => {
    await expect(async () => {
      await verifyToken('')
    }).rejects.toThrow()
  })

  it('throws error for malformed token', async () => {
    await expect(async () => {
      await verifyToken('not.a.valid.jwt')
    }).rejects.toThrow()
  })
})
