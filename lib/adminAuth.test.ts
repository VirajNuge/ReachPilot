import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  verifyAdminToken,
  ADMIN_CREDENTIALS,
  setAdminAuthCookie,
  clearAdminAuthCookie,
} from '../lib/adminAuth'

describe('Admin Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ADMIN_CREDENTIALS', () => {
    it('has username defined', () => {
      expect(ADMIN_CREDENTIALS.username).toBeDefined()
      expect(typeof ADMIN_CREDENTIALS.username).toBe('string')
      expect(ADMIN_CREDENTIALS.username.length).toBeGreaterThan(0)
    })

    it('has password defined', () => {
      expect(ADMIN_CREDENTIALS.password).toBeDefined()
      expect(typeof ADMIN_CREDENTIALS.password).toBe('string')
      expect(ADMIN_CREDENTIALS.password.length).toBeGreaterThan(0)
    })

    it('username is virajnuge', () => {
      expect(ADMIN_CREDENTIALS.username).toBe('virajnuge')
    })

    it('password meets minimum security requirements', () => {
      expect(ADMIN_CREDENTIALS.password.length).toBeGreaterThanOrEqual(8)
    })
  })

  describe('verifyAdminToken', () => {
    it('returns null for invalid token', async () => {
      const verified = await verifyAdminToken('invalid-token-xyz')
      expect(verified).toBeNull()
    })

    it('returns null for empty token', async () => {
      const verified = await verifyAdminToken('')
      expect(verified).toBeNull()
    })

    it('returns null for malformed token', async () => {
      const verified = await verifyAdminToken('not.a.jwt')
      expect(verified).toBeNull()
    })

    it('returns null for tampered token', async () => {
      const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0.tampered'
      const verified = await verifyAdminToken(tamperedToken)
      expect(verified).toBeNull()
    })
  })

  describe('setAdminAuthCookie', () => {
    it('returns cookie object with correct structure', () => {
      const cookie = setAdminAuthCookie('test-token')
      expect(cookie).toHaveProperty('name')
      expect(cookie).toHaveProperty('value')
      expect(cookie).toHaveProperty('httpOnly')
      expect(cookie).toHaveProperty('secure')
      expect(cookie).toHaveProperty('sameSite')
      expect(cookie).toHaveProperty('path')
      expect(cookie).toHaveProperty('maxAge')
    })

    it('sets correct cookie name', () => {
      const cookie = setAdminAuthCookie('test-token')
      expect(cookie.name).toBe('rp_admin_token')
    })

    it('sets provided token as value', () => {
      const testToken = 'my-test-token-123'
      const cookie = setAdminAuthCookie(testToken)
      expect(cookie.value).toBe(testToken)
    })

    it('sets httpOnly to true', () => {
      const cookie = setAdminAuthCookie('test-token')
      expect(cookie.httpOnly).toBe(true)
    })

    it('sets sameSite to lax', () => {
      const cookie = setAdminAuthCookie('test-token')
      expect(cookie.sameSite).toBe('lax')
    })

    it('sets path to root', () => {
      const cookie = setAdminAuthCookie('test-token')
      expect(cookie.path).toBe('/')
    })

    it('sets maxAge to 8 hours in seconds', () => {
      const cookie = setAdminAuthCookie('test-token')
      expect(cookie.maxAge).toBe(60 * 60 * 8)
    })

    it('generates unique cookies for different tokens', () => {
      const cookie1 = setAdminAuthCookie('token-1')
      const cookie2 = setAdminAuthCookie('token-2')
      expect(cookie1.value).not.toBe(cookie2.value)
    })
  })

  describe('clearAdminAuthCookie', () => {
    it('returns cookie object for clearing', () => {
      const cookie = clearAdminAuthCookie()
      expect(cookie).toHaveProperty('name')
      expect(cookie).toHaveProperty('value')
      expect(cookie).toHaveProperty('maxAge')
    })

    it('sets correct cookie name', () => {
      const cookie = clearAdminAuthCookie()
      expect(cookie.name).toBe('rp_admin_token')
    })

    it('sets empty value', () => {
      const cookie = clearAdminAuthCookie()
      expect(cookie.value).toBe('')
    })

    it('sets maxAge to 0 to expire cookie', () => {
      const cookie = clearAdminAuthCookie()
      expect(cookie.maxAge).toBe(0)
    })
  })

  describe('Admin authentication flow', () => {
    it('validates correct credentials structure', () => {
      const { username, password } = ADMIN_CREDENTIALS
      expect(username).toBe('virajnuge')
      expect(password).toBe('password-password123')
    })

    it('cookie lifecycle: create -> verify -> clear', () => {
      const testToken = 'lifecycle-test-token'
      
      // Create
      const createCookie = setAdminAuthCookie(testToken)
      expect(createCookie.value).toBe(testToken)
      expect(createCookie.maxAge).toBe(60 * 60 * 8)
      
      // Verify structure
      expect(createCookie.name).toBe('rp_admin_token')
      expect(createCookie.httpOnly).toBe(true)
      
      // Clear
      const clearCookie = clearAdminAuthCookie()
      expect(clearCookie.value).toBe('')
      expect(clearCookie.maxAge).toBe(0)
    })

    it('admin cookie is secure in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      const cookie = setAdminAuthCookie('test-token')
      expect(cookie.secure).toBe(true)
      
      process.env.NODE_ENV = originalEnv
    })

    it('admin cookie is not secure in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const cookie = setAdminAuthCookie('test-token')
      expect(cookie.secure).toBe(false)
      
      process.env.NODE_ENV = originalEnv
    })
  })
})
