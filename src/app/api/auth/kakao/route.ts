import { NextResponse } from 'next/server';
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    console.log('Processing Kakao authentication...', code);

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
      throw new Error(`Failed to get Kakao token: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Kakao token received');

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
    console.log('Kakao user data:', userData);

    // Firebase Custom Token 생성
    const uid = `kakao:${userData.id}`;
    const customToken = await adminAuth.createCustomToken(uid, {
      email: userData.kakao_account?.email,
      displayName: userData.properties?.nickname,
      photoURL: userData.properties?.profile_image,
      provider: 'kakao'
    });

    // Firebase에 사용자 생성 또는 업데이트
    try {
      await adminAuth.getUser(uid);
    } catch (error) {
      // 사용자가 없으면 생성
      await adminAuth.createUser({
        uid,
        email: userData.kakao_account?.email,
        displayName: userData.properties?.nickname,
        photoURL: userData.properties?.profile_image,
      });
    }

    console.log('Firebase custom token created');
    return NextResponse.json({ token: customToken });

  } catch (error) {
    console.error('Detailed Kakao auth error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
} 