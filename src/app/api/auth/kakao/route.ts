import { NextResponse } from 'next/server';
import { auth as adminAuth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    console.log('Received code:', code);

    const params = {
      grant_type: 'authorization_code',
      client_id: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!,
      redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!,
      code,
      ...(process.env.KAKAO_CLIENT_SECRET && {
        client_secret: process.env.KAKAO_CLIENT_SECRET
      })
    };

    // 카카오 토큰 받기
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token response error:', errorData);
      throw new Error(`Failed to get Kakao token: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token data received');

    // 카카오 사용자 정보 받기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('User info error:', errorData);
      throw new Error(`Failed to get Kakao user info: ${errorData}`);
    }

    const userData = await userResponse.json();
    console.log('User data received:', userData);

    // Firebase Custom Token 생성
    const customToken = await adminAuth.createCustomToken(`kakao:${userData.id}`);
    console.log('Custom token created');

    return NextResponse.json({ token: customToken });
  } catch (error) {
    console.error('Detailed Kakao auth error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
} 