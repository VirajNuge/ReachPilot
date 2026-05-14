import { describe, it, expect } from 'vitest'
import { signResetToken, verifyToken } from '../lib/auth'

describe('auth tokens (sign/verify)', () => {
  it('signs and verifies a reset token payload', async () => {
    const payload = { userId: 'test-user-1' }
    const token = await signResetToken(payload)
    expect(typeof token).toBe('string')

    const verified = await verifyToken(token)
    // jose returns payload values as strings or numbers depending on claims; our custom payload preserved
    expect((verified as any).userId).toBe(payload.userId)
  })
})
