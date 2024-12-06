'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleKakaoCallback } from '@/lib/firebase/kakaoAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function KakaoCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    console.log('Received Kakao code:', code);
    
    if (code) {
      handleKakaoCallback(code)
        .then((user) => {
          console.log('Login successful:', user);
          router.push('/my-tree');
        })
        .catch((error) => {
          console.error('Login failed:', error);
          router.push('/login');
        });
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#FFF5E1] flex flex-col items-center justify-center p-4">
      <div className="bg-white/50 backdrop-blur-sm p-8 rounded-lg border border-[#FFD1D1] flex flex-col items-center space-y-4">
        <LoadingSpinner />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-800">
            카카오톡 로그인 중
          </h2>
          <p className="text-sm text-gray-600">
            잠시만 기다려주세요...
          </p>
        </div>
      </div>
    </div>
  );
} 