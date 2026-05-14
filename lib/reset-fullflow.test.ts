import { describe, it, expect, vi } from 'vitest'
import * as userModel from './models/user'
import { POST as forgotPOST } from '../app/api/auth/forgot/route'
import { POST as resetPOST } from '../app/api/auth/reset/route'
import { signResetToken } from './auth'

describe('reset full flow (unit-level)', () => {
  it('generates a token and resets the password (mocked DB)', async () => {
    // Arrange: mock getUserByEmail to return a user and updateUserPassword to capture call
    const mockUser = { id: 'u-1', username: 'tester', email: 'tester@example.com', firstName: 'T' }
    const getUserSpy = vi.spyOn(userModel, 'getUserByEmail').mockResolvedValue(mockUser as any)
    const updateSpy = vi.spyOn(userModel, 'updateUserPassword').mockResolvedValue(undefined as any)

    process.env.NODE_ENV = 'test'

    // Act: call forgot route
    const forgotReq: any = { json: async () => ({ email: mockUser.email }) }
    const forgotRes: any = await forgotPOST(forgotReq)

    expect(forgotRes).toHaveProperty('success', true)
    expect(forgotRes).toHaveProperty('resetLink')
    const link: string = forgotRes.resetLink
    const url = new URL(link)
    const token = url.searchParams.get('token')
    expect(token).toBeTruthy()

    // Now call reset route with the token and new password
    const newPassword = 'new-password-123'
    const resetReq: any = { json: async () => ({ token, password: newPassword }) }
    const resetRes: any = await resetPOST(resetReq)

    expect(resetRes).toHaveProperty('success', true)
    // verify updateUserPassword called with correct user id
    expect(updateSpy).toHaveBeenCalledWith(mockUser.id, newPassword)

    // cleanup
    getUserSpy.mockRestore()
    updateSpy.mockRestore()
  })
})
