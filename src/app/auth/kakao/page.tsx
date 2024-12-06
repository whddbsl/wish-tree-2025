'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

// KakaoAuthComponent를 별도로 만들어서 useSearchParams를 사용하는 로직을 분리
function KakaoAuthComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleKakaoAuth = async () => {
    const code = searchParams.get('code');
    if (!code) {
      console.error('Authorization code not found');
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/auth/kakao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with Kakao');
      }

      router.push('/my-tree');
    } catch (error) {
      console.error('Error during Kakao authentication:', error);
      router.push('/login');
    }
  };

  useEffect(() => {
    handleKakaoAuth();
  }, [handleKakaoAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5E1]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4B4B] mx-auto mb-4"></div>
        <p className="text-gray-600">카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
}


// 메인 페이지 컴포넌트
export default function KakaoPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFF5E1]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4B4B] mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <KakaoAuthComponent />
    </Suspense>
  );
} 