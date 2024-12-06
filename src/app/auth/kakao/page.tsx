'use client';

import { Suspense } from 'react';
import KakaoCallbackHandler from './KakaoCallbackHandler';
import LoadingSpinner from '@/components/LoadingSpinner';

function LoadingScreen() {
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

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <KakaoCallbackHandler />
    </Suspense>
  );
}