import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin 초기화 시 에러 확인을 위한 로깅 추가
try {
  if (!getApps().length) {
    console.log('Firebase Admin SDK 초기화 시작');
    console.log('Project ID:', process.env.FIREBASE_ADMIN_PROJECT_ID);
    console.log('Client Email:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
    // Private Key는 보안상 전체를 로깅하지 않습니다
    console.log('Private Key exists:', !!process.env.FIREBASE_ADMIN_PRIVATE_KEY);

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK 초기화 완료');
  }
} catch (error) {
  console.error('Firebase Admin SDK 초기화 에러:', error);
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

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

    // 카카오 사용자 정보 받기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    
    // 프로필 이미지 URL 유효성 검사
    const photoURL = userData.properties?.profile_image;
    const isValidPhotoURL = photoURL && 
      (photoURL.startsWith('http://') || photoURL.startsWith('https://'));
    
    // 사용자 정보 준비
    const userInfo = {
      uid: `kakao:${userData.id}`,
      email: userData.kakao_account?.email || `${userData.id}@kakao.user`,
      displayName: userData.properties?.nickname || '사용자',
      // photoURL은 유효한 경우에만 포함
      ...(isValidPhotoURL && { photoURL })
    };

    console.log('Creating user with info:', userInfo);

    // 기존 사용자 확인 또는 생성
    try {
      await getAuth().getUser(userInfo.uid);
    } catch (error) {
      // 사용자가 없으면 생성
      await getAuth().createUser(userInfo);
    }

    // 사용자 정보 업데이트 (photoURL 제외하고 업데이트)
    await getAuth().updateUser(userInfo.uid, {
      email: userInfo.email,
      displayName: userInfo.displayName,
    });

    // Custom Claims 설정
    await getAuth().setCustomUserClaims(userInfo.uid, {
      provider: 'kakao',
      kakaoId: userData.id
    });

    // Custom Token 생성
    const firebaseToken = await getAuth().createCustomToken(userInfo.uid);

    return NextResponse.json({ firebaseToken, userInfo });

  } catch (error) {
    console.error('카카오 인증 처리 중 에러:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
} 