import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');

    if (!userCookie) {
      return NextResponse.json(
        { success: false, error: 'Not logged in' },
        { status: 401 }
      );
    }

    const userData = JSON.parse(userCookie.value);

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Error getting user data:', error);
    return NextResponse.json(
      { success: false, error: 'Error getting user data' },
      { status: 500 }
    );
  }
} 