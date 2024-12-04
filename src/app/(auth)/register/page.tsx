'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { signInWithKakao } from '@/lib/firebase/kakaoAuth';


export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 기본 유효성 검사
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      setLoading(false);
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    // 비밀번호 길이 검사
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      console.log('회원가입 성공:', userCredential.user);
      router.push('/my-tree');
    } catch (err) {
      console.error('회원가입 에러:', err); // 에러 로깅
      
      if (err instanceof Error) {
        // Firebase 에러 코드에 따른 메시지
        const errorCode = (err as any).code; // Firebase 에러 코드 추출
        switch (errorCode) {
          case 'auth/email-already-in-use':
            setError('이미 사용 중인 이메일입니다.');
            break;
          case 'auth/invalid-email':
            setError('유효하지 않은 이메일 형식입니다.');
            break;
          case 'auth/operation-not-allowed':
            setError('이메일/비밀번호 로그인이 비활성화되어 있습니다.');
            break;
          case 'auth/weak-password':
            setError('비밀번호가 너무 약합니다.');
            break;
          default:
            setError(`회원가입 중 오류가 발생했습니다: ${errorCode}`);
        }
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-black/30 rounded-2xl">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-[#FF4B4B] hover:text-[#FF6B6B]">
              로그인하기
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <button
              type="button"
              onClick={signInWithKakao}
              className="w-full flex items-center justify-center px-4 py-2 space-x-2 bg-[#FEE500] text-[#000000] rounded-lg hover:bg-[#FEE500]/90 focus:outline-none focus:ring-2 focus:ring-[#FEE500] focus:ring-offset-2"
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 18 18" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M9 0.5625C4.03125 0.5625 0 3.75 0 7.65625C0 10.1562 1.67188 12.3750 4.21875 13.6875L3.14062 17.2188C3.09375 17.3438 3.14062 17.4688 3.23438 17.5312C3.32812 17.6250 3.51562 17.6250 3.60938 17.5312L7.875 14.7188C8.25 14.7812 8.625 14.7812 9 14.7812C13.9688 14.7812 18 11.5938 18 7.65625C18 3.75 13.9688 0.5625 9 0.5625Z" 
                  fill="currentColor"
                />
              </svg>
              <span>카카오로 시작하기</span>
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1A1A1A] text-gray-400">또는</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-black/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4B4B] focus:border-transparent"
                  placeholder="이메일"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-black/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4B4B] focus:border-transparent"
                  placeholder="비밀번호 (6자 이상)"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-black/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4B4B] focus:border-transparent"
                  placeholder="비밀번호 확인"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#FF4B4B] hover:bg-[#FF6B6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4B4B] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리중...' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
} 