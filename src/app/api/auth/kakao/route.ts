import { NextResponse } from 'next/server';
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    console.log('카카오 인증 코드:', code);

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

    const tokenData = await tokenResponse.json();
    console.log('카카오 토큰 데이터:', tokenData);

    // 카카오 사용자 정보 받기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    console.log('카카오 사용자 정보:', userData);
    // 여기서 userData에 다음과 같은 정보가 포함됩니다:
    // - id: 카카오 계정 고유 ID
    // - properties: 닉네임, 프로필 이미지 등
    // - kakao_account: 이메일, 성별, 연령대 등 (동의 항목에 따라 다름)

    // Firebase Custom Token 생성
    const uid = `kakao:${userData.id}`;
    const customToken = await adminAuth.createCustomToken(uid, {
      email: userData.kakao_account?.email,
      displayName: userData.properties?.nickname,
      photoURL: userData.properties?.profile_image,
      provider: 'kakao'
    });

    console.log('Firebase Custom Token 생성 완료');
    return NextResponse.json({ token: customToken });

  } catch (error) {
    console.error('카카오 인증 에러:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
} 