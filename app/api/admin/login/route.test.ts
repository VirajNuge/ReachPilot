import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock adminAuth module
vi.mock('../../../../lib/adminAuth', () => ({
  ADMIN_CREDENTIALS: {
    username: 'virajnuge',
    passwordHash: 'test-hash',
  },
  hasConfiguredAdminCredentials: vi.fn(() => true),
  verifyAdminCredentials: vi.fn(async (username: unknown, password: unknown) =>
    username === 'virajnuge' && password === 'password-password123'
  ),
  signAdminToken: vi.fn(),
  setAdminAuthCookie: vi.fn(),
}))

import { POST } from './route'
import { signAdminToken, setAdminAuthCookie, ADMIN_CREDENTIALS } from '../../../../lib/adminAuth'

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 for invalid username', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'wronguser',
        password: 'password-password123',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe('Invalid credentials')
    expect((signAdminToken as any)).not.toHaveBeenCalled()
  })

  it('returns 401 for invalid password', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'virajnuge',
        password: 'wrongpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe('Invalid credentials')
    expect((signAdminToken as any)).not.toHaveBeenCalled()
  })

  it('returns 401 for missing credentials', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe('Invalid credentials')
  })

  it('returns token and sets cookie for valid credentials', async () => {
    const testToken = 'admin-jwt-token-xyz'
    const cookieOpts = {
      name: 'rp_admin_token',
      value: testToken,
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 8,
    }

    ;(signAdminToken as any).mockResolvedValue(testToken)
    ;(setAdminAuthCookie as any).mockReturnValue(cookieOpts)

    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'virajnuge',
        password: 'password-password123',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.username).toBe('virajnuge')
    expect((signAdminToken as any)).toHaveBeenCalledWith('virajnuge')
    expect((setAdminAuthCookie as any)).toHaveBeenCalledWith(testToken)
  })

  it('handles JSON parse errors gracefully', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: 'invalid-json',
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Internal server error')
  })

  it('signs token with correct username', async () => {
    const testToken = 'admin-jwt-token-xyz'
    const cookieOpts = {
      name: 'rp_admin_token',
      value: testToken,
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 8,
    }

    ;(signAdminToken as any).mockResolvedValue(testToken)
    ;(setAdminAuthCookie as any).mockReturnValue(cookieOpts)

    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        username: ADMIN_CREDENTIALS.username,
        password: 'password-password123',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    await POST(req)

    expect((signAdminToken as any)).toHaveBeenCalledWith(ADMIN_CREDENTIALS.username)
  })

  it('sets admin auth cookie with correct options', async () => {
    const testToken = 'admin-jwt-token-xyz'
    const cookieOpts = {
      name: 'rp_admin_token',
      value: testToken,
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 8,
    }

    ;(signAdminToken as any).mockResolvedValue(testToken)
    ;(setAdminAuthCookie as any).mockReturnValue(cookieOpts)

    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'virajnuge',
        password: 'password-password123',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    await POST(req)

    expect((setAdminAuthCookie as any)).toHaveBeenCalledWith(testToken)
  })
})
