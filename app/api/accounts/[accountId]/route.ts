import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import { getAccountById, updateAccount, deleteAccount, getAccountsByUserId } from '@/lib/models/account';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountId } = await params;
    const account = await getAccountById(accountId);

    if (!account || account.userId !== auth.userId) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountId } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const updatedAccount = await updateAccount(accountId, auth.userId, { name: name.trim() });

    if (!updatedAccount) {
      return NextResponse.json({ error: 'Account not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ account: updatedAccount });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountId } = await params;
    
    // Check if it's the last account
    const accounts = await getAccountsByUserId(auth.userId);
    if (accounts.length <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last account' }, { status: 400 });
    }

    const success = await deleteAccount(accountId, auth.userId);

    if (!success) {
      return NextResponse.json({ error: 'Account not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
