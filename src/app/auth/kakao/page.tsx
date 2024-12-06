'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleKakaoCallback } from '@/lib/firebase/kakaoAuth';

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    console.log('Received Kakao code:', code); // 코드 확인용 로그
    
    if (code) {
      handleKakaoCallback(code)
        .then((user) => {
          console.log('Login successful:', user); // 성공 시 로그
          router.push('/my-tree');
        })
        .catch((error) => {
          console.error('Login failed:', error); // 실패 시 로그
          router.push('/login');
        });
    }
  }, [searchParams, router]);

  return <div>카카오 로그인 처리 중...</div>;
}