'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithCustomToken, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export default function KakaoAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      handleKakaoAuth(code);
    }
  }, [searchParams]);

  const handleKakaoAuth = async (code: string) => {
    try {
      const response = await fetch('/api/auth/kakao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) throw new Error('카카오 로그인 실패');

      const { firebaseToken, userInfo } = await response.json();

      // Firebase 로그인
      const userCredential = await signInWithCustomToken(auth, firebaseToken);
      
      // 프로필 정보 업데이트
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: userInfo.displayName,
          photoURL: userInfo.photoURL,
        });
      }

      router.push('/my-tree');
    } catch (error) {
      console.error('카카오 로그인 에러:', error);
      router.push('/register?error=kakao-auth-failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A]">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        카카오 로그인 처리중...
      </div>
    </div>
  );
} 