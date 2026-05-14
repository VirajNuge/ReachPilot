import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the auth and user model modules used by the route
vi.mock('@/lib/auth', () => ({
  getAuthFromRequest: vi.fn(),
}));
vi.mock('@/lib/models/user', () => ({
  updateUserPassword: vi.fn(),
}));

import { getAuthFromRequest } from '@/lib/auth';
import { updateUserPassword } from '@/lib/models/user';

// Import the route handler after mocks
import * as route from '@/app/api/auth/change-password/route';

describe('POST /api/auth/change-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (getAuthFromRequest as unknown as jest.Mock) = getAuthFromRequest as any;
    (getAuthFromRequest as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ password: 'newpassword' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await route.POST(req as any);
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
    expect((updateUserPassword as any).mock.calls.length).toBe(0);
  });

  it('returns 400 for invalid password', async () => {
    (getAuthFromRequest as any).mockResolvedValue({ userId: 'u1' });

    const req = new Request('http://localhost/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ password: '123' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await route.POST(req as any);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe('Invalid password');
    expect((updateUserPassword as any).mock.calls.length).toBe(0);
  });

  it('updates password when authenticated and valid', async () => {
    (getAuthFromRequest as any).mockResolvedValue({ userId: 'u1' });
    (updateUserPassword as any).mockResolvedValue(undefined);

    const req = new Request('http://localhost/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ password: 'validpassword' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await route.POST(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect((updateUserPassword as any).mock.calls.length).toBe(1);
    expect((updateUserPassword as any).mock.calls[0][0]).toBe('u1');
    expect((updateUserPassword as any).mock.calls[0][1]).toBe('validpassword');
  });
});
