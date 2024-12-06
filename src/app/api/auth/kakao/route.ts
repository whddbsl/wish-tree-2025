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

    // Firebase Custom Token 생성
    const uid = `kakao:${userData.id}`;
    
    try {
      // 먼저 사용자 생성 시도
      await adminAuth.createUser({
        uid: uid,
        displayName: userData.properties?.nickname || '',
      });
      console.log('새 사용자 생성됨');
    } catch (createError: any) {
      // 이미 존재하는 사용자인 경우 정보 업데이트
      if (createError.code === 'auth/uid-already-exists') {
        await adminAuth.updateUser(uid, {
          displayName: userData.properties?.nickname || '',
        });
        console.log('기존 사용자 정보 업데이트됨');
      } else {
        console.error('사용자 생성/업데이트 에러:', createError);
        throw createError;
      }
    }

    // Custom Token 생성
    const customToken = await adminAuth.createCustomToken(uid);
    console.log('Custom Token 생성 완료');

    return NextResponse.json({ token: customToken });

  } catch (error) {
    console.error('카카오 인증 에러:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
}