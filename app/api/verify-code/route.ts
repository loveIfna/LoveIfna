// app/api/verify-code/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const secretCode = process.env.PRIVATE_ACCESS_CODE;

    if (!secretCode) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (code === secretCode) {
      return NextResponse.json({ valid: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { valid: false, error: 'Invalid code' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}