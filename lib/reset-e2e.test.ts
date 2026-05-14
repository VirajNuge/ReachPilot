import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as userModel from './models/user'
import * as auth from './auth'
import * as mailer from './mailer'
import { POST } from '../app/api/auth/forgot/route'

describe('reset flow (unit e2e simulation)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    vi.clearAllMocks()
  })

  it('returns resetLink in response when user exists and NODE_ENV=test', async () => {
    // Arrange: mock dependencies
    const mockUser = { id: 'test-user-1', username: 'tester', email: 'tester@example.com', firstName: 'Tester' }
    const mockToken = 'test-jwt-token-xyz'
    
    vi.spyOn(userModel, 'getUserByEmail').mockResolvedValue(mockUser as any)
    vi.spyOn(auth, 'signResetToken').mockResolvedValue(mockToken)
    vi.spyOn(mailer, 'sendEmail').mockResolvedValue(undefined as any)

    // Act: create a fake request with a json() method
    const req: any = {
      json: async () => ({ email: mockUser.email }),
      headers: new Headers(),
    }

    const result: any = await POST(req as any)

    // Assert
    expect(result).toHaveProperty('success', true)
    expect(result).toHaveProperty('resetLink')
    expect(typeof result.resetLink).toBe('string')
    expect(result.resetLink).toContain('token=test-jwt-token-xyz')
  })
})
