import { describe, it, expect, vi } from 'vitest'
import * as userModel from './models/user'
import { POST } from '../app/api/auth/forgot/route'

describe('reset flow (unit e2e simulation)', () => {
  it('returns resetLink in response when user exists and NODE_ENV=test', async () => {
    // Arrange: mock getUserByEmail to return a user
    const mockUser = { id: 'test-user-1', username: 'tester', email: 'tester@example.com', firstName: 'Tester' }
    vi.spyOn(userModel, 'getUserByEmail').mockResolvedValue(mockUser as any)

    // Act: create a fake request with a json() method both the route expects
    const req: any = {
      json: async () => ({ email: mockUser.email }),
    }

    // Ensure test mode
    process.env.NODE_ENV = 'test'

    const result: any = await POST(req as any)

    // Assert
    expect(result).toHaveProperty('success', true)
    expect(result).toHaveProperty('resetLink')
    expect(typeof result.resetLink).toBe('string')
    // cleanup
    ;(userModel.getUserByEmail as any).mockRestore?.()
  })
})
