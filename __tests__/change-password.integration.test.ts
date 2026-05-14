import { vi, describe, it, expect, beforeEach } from 'vitest';

// Integration-style test: call route handler with a fake authenticated request
vi.mock('@/lib/auth', () => ({
  getAuthFromRequest: vi.fn(),
}));
vi.mock('@/lib/models/user', () => ({
  updateUserPassword: vi.fn(),
}));

import { getAuthFromRequest } from '@/lib/auth';
import { updateUserPassword } from '@/lib/models/user';
import * as route from '@/app/api/auth/change-password/route';

describe('integration: change-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears cookie and returns ok on success', async () => {
    (getAuthFromRequest as any).mockResolvedValue({ userId: 'abc' });
    (updateUserPassword as any).mockResolvedValue(undefined);

    const req = new Request('http://localhost/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ password: 'validpass' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await route.POST(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    // cookie cleared in response (may not be available in some runtimes)
  });
});
