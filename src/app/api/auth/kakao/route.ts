import { NextResponse } from 'next/server';
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    console.log('Processing Kakao authentication...');

    // 카카오 토큰 받기
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!,
        redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Kakao token error:', errorData);
      throw new Error(`Kakao token error: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();

    // 카카오 사용자 정보 받기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get Kakao user info');
    }

    const userData = await userResponse.json();
    
    try {
      // Firebase Custom Token 생성
      const customToken = await adminAuth.createCustomToken(String(userData.id), {
        provider: 'kakao',
        email: userData.kakao_account?.email,
      });
      
      return NextResponse.json({ token: customToken });
    } catch (firebaseError) {
      console.error('Firebase token creation error:', firebaseError);
      throw new Error('Failed to create Firebase token');
    }

  } catch (error) {
    console.error('Kakao auth error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
} 