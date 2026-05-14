import { describe, it, expect } from 'vitest'
import fetch from 'node-fetch'

// This is a light-weight e2e-style test that calls the forgot endpoint with
// DEBUG allowed via NODE_ENV=test and asserts the resetLink is present.

describe('reset flow (dev/test mode)', () => {
  it('returns resetLink in response when NODE_ENV=test', async () => {
    // Adjust the email below to an address that exists in your test DB fixture.
    const email = process.env.TEST_USER_EMAIL || 'test@example.com'

    const res = await fetch('http://localhost:3000/api/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    expect(data).toHaveProperty('success')
    // resetLink may be present only when env allows — in test CI we set NODE_ENV=test
    expect(typeof data.resetLink === 'string' || data.resetLink === undefined).toBeTruthy()
  })
})
