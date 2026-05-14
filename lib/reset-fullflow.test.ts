import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as userModel from './models/user'
import * as auth from './auth'
import * as mailer from './mailer'
import { POST as forgotPOST } from '../app/api/auth/forgot/route'
import { POST as resetPOST } from '../app/api/auth/reset/route'

describe('reset full flow (unit-level)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    vi.clearAllMocks()
  })

  it('generates a token and resets the password (mocked DB)', async () => {
    // Arrange: mock all dependencies
    const mockUser = { id: 'u-1', username: 'tester', email: 'tester@example.com', firstName: 'T' }
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1LTEiLCJpYXQiOjE2Mjc0MzkyNDUsImV4cCI6MTYyNzQ0Mjg0NX0.test'
    
    vi.spyOn(userModel, 'getUserByEmail').mockResolvedValue(mockUser as any)
    vi.spyOn(userModel, 'updateUserPassword').mockResolvedValue(undefined as any)
    vi.spyOn(auth, 'signResetToken').mockResolvedValue(mockToken)
    vi.spyOn(auth, 'verifyToken').mockResolvedValue({ userId: mockUser.id } as any)
    vi.spyOn(mailer, 'sendEmail').mockResolvedValue(undefined as any)

    // Act: call forgot route
    const forgotReq: any = {
      json: async () => ({ email: mockUser.email }),
      headers: new Headers(),
    }
    const forgotRes: any = await forgotPOST(forgotReq)

    // Assert forgot response
    expect(forgotRes).toHaveProperty('success', true)
    expect(forgotRes).toHaveProperty('resetLink')
    const link: string = forgotRes.resetLink
    const url = new URL(link)
    const token = url.searchParams.get('token')
    expect(token).toBeTruthy()
    expect(token).toBe(mockToken)

    // Act: call reset route with the token and new password
    const newPassword = 'new-password-123'
    const resetReq: any = {
      json: async () => ({ token, password: newPassword }),
      headers: new Headers(),
    }
    const resetRes: any = await resetPOST(resetReq)

    // Assert reset response and verify DB update was called
    expect(resetRes).toHaveProperty('success', true)
    expect(userModel.updateUserPassword).toHaveBeenCalledWith(mockUser.id, newPassword)
  })
})
