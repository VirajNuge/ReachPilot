import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthFromCookies } from '@/lib/auth';
import { getAccountById } from '@/lib/models/account';

const ACTIVE_ACCOUNT_COOKIE = 'rp_active_account';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const activeAccountId = cookieStore.get(ACTIVE_ACCOUNT_COOKIE)?.value;

    return NextResponse.json({ accountId: activeAccountId || null });
  } catch (error) {
    console.error('Error fetching active account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }

    // Verify the account belongs to the user
    const account = await getAccountById(accountId);
    if (!account || account.userId !== auth.userId) {
      return NextResponse.json({ error: 'Account not found or unauthorized' }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set({
      name: ACTIVE_ACCOUNT_COOKIE,
      value: accountId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true, accountId });
  } catch (error) {
    console.error('Error setting active account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
